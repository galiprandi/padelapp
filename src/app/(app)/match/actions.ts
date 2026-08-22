"use server";

import { and, eq, asc, count, inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { matches, matchPlayers, teams, matchPlayerFeedback, playerEdges, playerGraphStats } from "@/db/schema";
import { createMagicLink } from "@/lib/magic-link";
import { notifyUsers, getUserDisplayName } from "@/lib/notifications";
import { capitalizeName, getMatchWinner } from "@/lib/utils";
import { recalculateRankingAction } from "@/app/(app)/ranking/actions";
import {
  updateEdgesForMatch,
  recomputeStatsForPlayer,
  type ConfirmedMatchInfo,
} from "@/lib/graph";
import {
  isValidMatchType,
  defaultTeamLabel,
  sanitizeTeamLabel,
  teamForPosition,
  type TeamKey,
  type MatchFormat,
  type MatchType,
} from "@/lib/match-helpers";

const MIN_SETS = 1;
const MAX_SETS = 5;

export type SlotPayload =
  | {
      kind: "user";
      position: number;
      team: TeamKey;
      userId: string;
    }
  | {
      kind: "placeholder";
      position: number;
      team: TeamKey;
      displayName: string;
    };

const MATCH_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DISPUTED: "DISPUTED",
  CANCELLED: "CANCELLED",
} as const;

type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

export interface CreateMatchInput {
  matchId?: string;
  date?: string; // ISO string
  sets: number;
  matchType: MatchType;
  countsForRanking: boolean;
  format: MatchFormat;
  teamLabels: Record<TeamKey, string>;
  club?: string | null;
  courtNumber?: string | null;
  notes?: string | null;
  score?: string | null;
  turnId?: string | null;
  slots: SlotPayload[];
}

export interface CreateMatchResponse {
  status: "ok" | "error";
  matchId?: string;
  shareUrl?: string;
  slots?: Array<{
    playerId: string;
    position: number;
    team: TeamKey;
    teamLabel: string;
    occupied: boolean;
    displayName: string | null;
    link: string;
  }>;
  message?: string;
}

const FORMAT_POSITIONS: Record<MatchFormat, number[]> = {
  DOUBLES: [0, 1, 2, 3],
  SINGLES: [0, 1],
};

const POSITION_TEAMS: Record<MatchFormat, Record<number, TeamKey>> = {
  DOUBLES: { 0: "A", 1: "A", 2: "B", 3: "B" },
  SINGLES: { 0: "A", 1: "B" },
};

/**
 * Helper: fetch a match with its players (used inside transactions).
 */
async function getMatchWithPlayers(
  tx: Pick<typeof db, "select">,
  matchId: string,
) {
  const [match] = await tx
    .select()
    .from(matches)
    .where(eq(matches.id, matchId))
    .limit(1);
  if (!match) return null;
  const players = await tx
    .select()
    .from(matchPlayers)
    .where(eq(matchPlayers.matchId, matchId))
    .orderBy(asc(matchPlayers.position));
  return { ...match, players };
}

export async function createMatchAction(
  input: CreateMatchInput,
): Promise<CreateMatchResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "You must be signed in to create a match.",
    };
  }

  if (!isValidMatchType(input.matchType)) {
    return { status: "error", message: "Invalid match type." };
  }

  if (!Object.hasOwn(FORMAT_POSITIONS, input.format)) {
    return { status: "error", message: "Unsupported match format." };
  }

  if (
    Number.isNaN(input.sets) ||
    input.sets < MIN_SETS ||
    input.sets > MAX_SETS
  ) {
    return {
      status: "error",
      message: `Sets must be between ${MIN_SETS} and ${MAX_SETS}.`,
    };
  }

  if (typeof input.countsForRanking !== "boolean") {
    return { status: "error", message: "Ranking flag must be provided." };
  }

  const expectedPositions = FORMAT_POSITIONS[input.format];

  if (
    !Array.isArray(input.slots) ||
    input.slots.length !== expectedPositions.length
  ) {
    return {
      status: "error",
      message: "The number of slots does not match the selected format.",
    };
  }

  const allowedPositions = new Set(expectedPositions);
  const mapPositionToTeam = POSITION_TEAMS[input.format];
  const seenPositions = new Set<number>();

  const normalizedSlots: Array<{
    position: number;
    team: TeamKey;
    userId: string | null;
    displayName: string | null;
    joinedAt: Date | null;
  }> = [];

  for (const slot of input.slots) {
    if (!allowedPositions.has(slot.position)) {
      return {
        status: "error",
        message: "Slot positions must match the selected format.",
      };
    }

    if (seenPositions.has(slot.position)) {
      return { status: "error", message: "Duplicate slot positions detected." };
    }

    seenPositions.add(slot.position);

    const expectedTeam = mapPositionToTeam[slot.position];
    if (slot.team !== expectedTeam) {
      return {
        status: "error",
        message: "Slot teams do not align with the expected layout.",
      };
    }

    if (slot.kind === "user") {
      const trimmedUserId = slot.userId.trim();
      if (trimmedUserId.length === 0) {
        return {
          status: "error",
          message: "Player identifier cannot be empty.",
        };
      }

      normalizedSlots.push({
        position: slot.position,
        team: slot.team,
        userId: trimmedUserId,
        displayName: null,
        joinedAt: trimmedUserId === session.user.id ? new Date() : null,
      });
    } else {
      const trimmedName = capitalizeName(slot.displayName);
      if (trimmedName.length === 0) {
        return {
          status: "error",
          message: "Placeholder slots require a display name.",
        };
      }

      normalizedSlots.push({
        position: slot.position,
        team: slot.team,
        userId: null,
        displayName: trimmedName,
        joinedAt: null,
      });
    }
  }

  const teamLabelA = sanitizeTeamLabel(input.teamLabels?.A, "A", input.format);
  const teamLabelB = sanitizeTeamLabel(input.teamLabels?.B, "B", input.format);

  try {
    const creationResult = await db.transaction(async (tx) => {
      const [teamA] = await tx
        .insert(teams)
        .values({ label: teamLabelA })
        .returning();
      const [teamB] = await tx
        .insert(teams)
        .values({ label: teamLabelB })
        .returning();

      const teamIdByKey: Record<TeamKey, string> = {
        A: teamA.id,
        B: teamB.id,
      };

      const [match] = await tx
        .insert(matches)
        .values({
          creatorId: session.user.id,
          status: MATCH_STATUS.PENDING,
          date: input.date ? new Date(input.date) : new Date(),
          sets: input.sets,
          matchType: input.matchType,
          club: capitalizeName(input.club ?? "") || null,
          courtNumber: input.courtNumber?.trim() || null,
          notes: input.notes?.trim() || null,
          score: input.score?.trim() || null,
          turnId: input.turnId || null,
        })
        .returning();

      const playerValues = normalizedSlots.map((slot) => ({
        matchId: match.id,
        position: slot.position,
        userId: slot.userId,
        displayName: slot.displayName,
        teamId: teamIdByKey[slot.team],
        resultConfirmed: false,
        joinedAt: slot.joinedAt,
      }));
      const insertedPlayers = await tx
        .insert(matchPlayers)
        .values(playerValues)
        .returning();

      return {
        match,
        teamA,
        teamB,
        players: insertedPlayers,
      };
    });

    revalidatePath("/match");
    revalidatePath("/notifications");
    revalidatePath("/", "layout");
    revalidateTag("matches", "default");
    revalidateTag("turns", "default");

    const shareUrl = createMagicLink({
      resource: "match",
      identifier: creationResult.match.id,
    }).url;

    const teamLabelById: Record<string, { team: TeamKey; label: string }> = {
      [creationResult.teamA.id]: {
        team: "A",
        label: creationResult.teamA.label,
      },
      [creationResult.teamB.id]: {
        team: "B",
        label: creationResult.teamB.label,
      },
    };

    const slots = creationResult.players
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((player) => {
        const teamInfo = player.teamId
          ? teamLabelById[player.teamId]
          : { team: "A" as TeamKey, label: teamLabelA };
        return {
          playerId: player.id,
          position: player.position,
          team: teamInfo.team,
          teamLabel: teamInfo.label,
          occupied: Boolean(player.userId),
          displayName: player.displayName,
          link: createMagicLink({ resource: "player", identifier: player.id })
            .url,
        };
      });

    return {
      status: "ok",
      matchId: creationResult.match.id,
      shareUrl,
      slots,
    };
  } catch (error) {
    console.error("createMatchAction failed", error);
    return {
      status: "error",
      message: "We could not create the match. Please try again.",
    };
  }
}

export interface SuggestMatchPartnersInput {
  userIds: string[];
}

export interface SuggestMatchPartnersResponse {
  status: "ok" | "error";
  message?: string;
  suggestedPairings?: {
    teamA: {
      derecha: string;
      reves: string;
    };
    teamB: {
      derecha: string;
      reves: string;
    };
  };
}

export async function suggestMatchPartnersAction(
  input: SuggestMatchPartnersInput,
): Promise<SuggestMatchPartnersResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "Debes iniciar sesión para obtener sugerencias.",
    };
  }

  const userIds = input.userIds;
  if (!Array.isArray(userIds) || userIds.length !== 4) {
    return {
      status: "error",
      message: "Se necesitan exactamente 4 jugadores para sugerir parejas.",
    };
  }

  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    return {
      status: "ok",
      suggestedPairings: {
        teamA: {
          derecha: userIds[0],
          reves: userIds[1],
        },
        teamB: {
          derecha: userIds[2],
          reves: userIds[3],
        },
      },
    };
  }

  try {
    // 1. Fetch playerGraphStats for side preferences
    const stats = await db
      .select({
        userId: playerGraphStats.userId,
        preferredSide: playerGraphStats.preferredSide,
      })
      .from(playerGraphStats)
      .where(inArray(playerGraphStats.userId, userIds));

    const prefMap = new Map<string, "RIGHT" | "LEFT" | null>();
    for (const s of stats) {
      prefMap.set(s.userId, s.preferredSide);
    }

    // 2. Fetch playerEdges for partnership synergy
    const edges = await db
      .select({
        playerAId: playerEdges.playerAId,
        playerBId: playerEdges.playerBId,
        winsTogether: playerEdges.winsTogether,
        lossesTogether: playerEdges.lossesTogether,
        matchesAsPartners: playerEdges.matchesAsPartners,
        lastMatchAt: playerEdges.lastMatchAt,
      })
      .from(playerEdges)
      .where(
        and(
          inArray(playerEdges.playerAId, userIds),
          inArray(playerEdges.playerBId, userIds),
        ),
      );

    // Fetch all confirmed matches played by any of the 4 players to find recent partnerships and streaks
    const playersInConfirmedMatches = await db
      .select({
        matchId: matchPlayers.matchId,
        userId: matchPlayers.userId,
        position: matchPlayers.position,
        score: matches.score,
        date: matches.date,
      })
      .from(matchPlayers)
      .innerJoin(matches, eq(matchPlayers.matchId, matches.id))
      .where(
        and(
          eq(matches.status, "CONFIRMED"),
          inArray(matchPlayers.userId, userIds),
        ),
      )
      .orderBy(asc(matches.date));

    interface PlayerMatchParticipation {
      userId: string;
      position: number;
    }
    interface MatchDetails {
      matchId: string;
      score: string | null;
      date: Date;
      players: PlayerMatchParticipation[];
    }

    const matchMap = new Map<string, MatchDetails>();
    for (const row of playersInConfirmedMatches) {
      if (!row.userId) continue;
      if (!matchMap.has(row.matchId)) {
        matchMap.set(row.matchId, {
          matchId: row.matchId,
          score: row.score,
          date: row.date,
          players: [],
        });
      }
      matchMap.get(row.matchId)!.players.push({
        userId: row.userId,
        position: row.position,
      });
    }

    const sortedMatches = Array.from(matchMap.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    const getSynergy = (x: string, y: string): number => {
      const [min, max] = x < y ? [x, y] : [y, x];
      const edge = edges.find((e) => e.playerAId === min && e.playerBId === max);
      const winsTogether = edge ? edge.winsTogether : 0;
      const matchesAsPartners = edge ? edge.matchesAsPartners : 0;
      const rawSynergy = (winsTogether + 1) / (matchesAsPartners + 2);

      // 1. Calculate long-term synergy with temporal decay
      let recencyWeight = 1.0;
      if (edge && edge.lastMatchAt) {
        const daysSince = (Date.now() - edge.lastMatchAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > 120) recencyWeight = 0.3;
        else if (daysSince > 60) recencyWeight = 0.6;
        else if (daysSince > 30) recencyWeight = 0.8;
      }
      const rawDeviation = rawSynergy - 0.5;
      const decayedRawSynergy = 0.5 + rawDeviation * recencyWeight;

      // 2. Calculate recent partnership win rate with exponential decay
      const partnershipMatches: Array<{ won: boolean }> = [];
      for (const m of sortedMatches) {
        const px = m.players.find((p) => p.userId === x);
        const py = m.players.find((p) => p.userId === y);
        if (px && py) {
          const teamX = px.position < 2 ? "A" : "B";
          const teamY = py.position < 2 ? "A" : "B";
          if (teamX === teamY) {
            // Partners!
            const winner = getMatchWinner(m.score);
            partnershipMatches.push({ won: winner === teamX });
          }
        }
      }

      let weightedWins = 0;
      let totalWeight = 0;
      for (let i = 0; i < partnershipMatches.length; i++) {
        const weight = Math.pow(0.8, i);
        totalWeight += weight;
        if (partnershipMatches[i].won) {
          weightedWins += weight;
        }
      }

      const recentWinRate = totalWeight > 0 ? weightedWins / totalWeight : 0.5;

      // 3. Blend them: 60% weight to decayed raw synergy, 40% weight to recent win rate
      return totalWeight > 0 ? (0.6 * decayedRawSynergy + 0.4 * recentWinRate) : decayedRawSynergy;
    };

    const getOptimalSideAssignment = (
      x: string,
      y: string,
    ): { derecha: string; reves: string; penalty: number } => {
      const prefX = prefMap.get(x) ?? null;
      const prefY = prefMap.get(y) ?? null;

      // Option A: x is RIGHT, y is LEFT
      const penaltyA = (prefX === "LEFT" ? 1 : 0) + (prefY === "RIGHT" ? 1 : 0);

      // Option B: x is LEFT, y is RIGHT
      const penaltyB = (prefX === "RIGHT" ? 1 : 0) + (prefY === "LEFT" ? 1 : 0);

      if (penaltyA <= penaltyB) {
        return { derecha: x, reves: y, penalty: penaltyA };
      } else {
        return { derecha: y, reves: x, penalty: penaltyB };
      }
    };

    // 3. Generate all 3 unique pairing configurations for 4 players (p0, p1, p2, p3)
    const [p0, p1, p2, p3] = userIds;
    const configs = [
      { a1: p0, a2: p1, b1: p2, b2: p3 },
      { a1: p0, a2: p2, b1: p1, b2: p3 },
      { a1: p0, a2: p3, b1: p1, b2: p2 },
    ];

    const scoredConfigs = configs.map((config) => {
      const teamASides = getOptimalSideAssignment(config.a1, config.a2);
      const teamBSides = getOptimalSideAssignment(config.b1, config.b2);

      const totalSidePenalty = teamASides.penalty + teamBSides.penalty;

      const synergyA = getSynergy(config.a1, config.a2);
      const synergyB = getSynergy(config.b1, config.b2);
      const synergyDiff = Math.abs(synergyA - synergyB);

      return {
        config,
        teamASides,
        teamBSides,
        totalSidePenalty,
        synergyDiff,
      };
    });

    // Sort scored configurations by:
    // 1. Minimum total side penalty ascending
    // 2. Minimum synergy difference ascending
    scoredConfigs.sort((a, b) => {
      if (a.totalSidePenalty !== b.totalSidePenalty) {
        return a.totalSidePenalty - b.totalSidePenalty;
      }
      return a.synergyDiff - b.synergyDiff;
    });

    const best = scoredConfigs[0];

    return {
      status: "ok",
      suggestedPairings: {
        teamA: {
          derecha: best.teamASides.derecha,
          reves: best.teamASides.reves,
        },
        teamB: {
          derecha: best.teamBSides.derecha,
          reves: best.teamBSides.reves,
        },
      },
    };
  } catch (error) {
    console.error("suggestMatchPartnersAction failed", error);
    return {
      status: "error",
      message: "No se pudieron obtener sugerencias de parejas.",
    };
  }
}

export async function getMatchFeedbacksAction(
  matchId: string,
): Promise<{
  status: "ok" | "error";
  feedbacks?: Array<{ playerId: string; feedback: "STRONGER" | "WEAKER" }>;
  message?: string;
}> {
  const session = await auth();
  if (!session?.user) {
    return { status: "error", message: "No autorizado." };
  }

  try {
    const records = await db
      .select({
        playerId: matchPlayerFeedback.playerId,
        feedback: matchPlayerFeedback.feedback,
      })
      .from(matchPlayerFeedback)
      .where(
        and(
          eq(matchPlayerFeedback.matchId, matchId),
          eq(matchPlayerFeedback.feedbackBy, session.user.id),
        ),
      );

    return {
      status: "ok",
      feedbacks: records,
    };
  } catch (error) {
    console.error("getMatchFeedbacksAction failed", error);
    return {
      status: "error",
      message: "Error al obtener feedback.",
    };
  }
}

export interface SavePlayerFeedbackInput {
  matchId: string;
  feedbacks: Array<{
    playerId: string;
    feedback: "STRONGER" | "WEAKER" | null;
  }>;
}

export async function savePlayerFeedbackAction(
  input: SavePlayerFeedbackInput,
): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "Tenés que iniciar sesión para guardar el feedback.",
    };
  }

  if (!input.matchId || input.matchId.trim().length === 0) {
    return { status: "error", message: "Identificador de partido inválido." };
  }

  try {
    // 1. Verify the match exists and the user is the creator (organizer)
    const [match] = await db
      .select({ creatorId: matches.creatorId })
      .from(matches)
      .where(eq(matches.id, input.matchId))
      .limit(1);

    if (!match) {
      return { status: "error", message: "Partido no encontrado." };
    }

    if (match.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Solo el organizador puede guardar feedback de nivel.",
      };
    }

    // 2. Process feedback in a transaction
    await db.transaction(async (tx) => {
      for (const entry of input.feedbacks) {
        // Only allow feedback for other players, not the creator themselves
        if (entry.playerId === session.user.id) continue;

        if (entry.feedback === null) {
          // Delete feedback
          await tx
            .delete(matchPlayerFeedback)
            .where(
              and(
                eq(matchPlayerFeedback.matchId, input.matchId),
                eq(matchPlayerFeedback.playerId, entry.playerId),
                eq(matchPlayerFeedback.feedbackBy, session.user.id),
              ),
            );
        } else {
          // Upsert feedback
          await tx
            .insert(matchPlayerFeedback)
            .values({
              matchId: input.matchId,
              playerId: entry.playerId,
              feedbackBy: session.user.id,
              feedback: entry.feedback,
            })
            .onConflictDoUpdate({
              target: [
                matchPlayerFeedback.matchId,
                matchPlayerFeedback.playerId,
                matchPlayerFeedback.feedbackBy,
              ],
              set: { feedback: entry.feedback },
            });
        }
      }
    });

    // 3. Recompute stats for the affected players
    for (const entry of input.feedbacks) {
      if (entry.playerId !== session.user.id) {
        await recomputeStatsForPlayer(entry.playerId);
      }
    }

    return { status: "ok" };
  } catch (error) {
    console.error("savePlayerFeedbackAction failed", error);
    return {
      status: "error",
      message: "No se pudo guardar el feedback. Intentá nuevamente.",
    };
  }
}

export async function cancelMatchAction(
  matchId: string,
): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "Tenés que iniciar sesión para cancelar el partido.",
    };
  }

  try {
    const [match] = await db
      .select({ creatorId: matches.creatorId, status: matches.status })
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);

    if (!match) {
      return { status: "error", message: "No encontramos el partido." };
    }

    if (match.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Solo el organizador puede cancelar el partido.",
      };
    }

    if (match.status === MATCH_STATUS.CONFIRMED) {
      return {
        status: "error",
        message: "No se puede cancelar un partido ya confirmado.",
      };
    }

    await db
      .update(matches)
      .set({ status: MATCH_STATUS.CANCELLED })
      .where(eq(matches.id, matchId));

    revalidatePath("/match");
    revalidatePath(`/match/${matchId}`);
    revalidatePath("/me");
    revalidatePath("/notifications");
    revalidatePath("/", "layout");
    revalidateTag("matches", "default");

    return { status: "ok" };
  } catch (error) {
    console.error("cancelMatchAction failed", error);
    return {
      status: "error",
      message: "No pudimos cancelar el partido. Intentá nuevamente.",
    };
  }
}

interface SwapMatchPlayersInput {
  matchId: string;
  player1Id: string;
  player2Id: string;
}

export async function swapMatchPlayersAction(
  input: SwapMatchPlayersInput,
): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "Tenés que iniciar sesión para gestionar el partido.",
    };
  }

  try {
    const [match] = await db
      .select({ creatorId: matches.creatorId })
      .from(matches)
      .where(eq(matches.id, input.matchId))
      .limit(1);

    if (!match) {
      return { status: "error", message: "No encontramos el partido." };
    }

    if (match.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Solo el organizador puede intercambiar posiciones.",
      };
    }

    const [p1] = await db
      .select()
      .from(matchPlayers)
      .where(eq(matchPlayers.id, input.player1Id))
      .limit(1);
    const [p2] = await db
      .select()
      .from(matchPlayers)
      .where(eq(matchPlayers.id, input.player2Id))
      .limit(1);

    if (
      !p1 ||
      !p2 ||
      p1.matchId !== input.matchId ||
      p2.matchId !== input.matchId
    ) {
      return {
        status: "error",
        message: "Los jugadores no pertenecen a este partido.",
      };
    }

    // Atomic swap using a transaction.
    // We use a temporary position for one player to avoid unique constraint violations on (matchId, position).
    await db.transaction(async (tx) => {
      await tx
        .update(matchPlayers)
        .set({ position: -1 })
        .where(eq(matchPlayers.id, p1.id));
      await tx
        .update(matchPlayers)
        .set({ position: p1.position, teamId: p1.teamId })
        .where(eq(matchPlayers.id, p2.id));
      await tx
        .update(matchPlayers)
        .set({ position: p2.position, teamId: p2.teamId })
        .where(eq(matchPlayers.id, p1.id));
    });

    revalidatePath(`/match/${input.matchId}`);

    return { status: "ok" };
  } catch (error) {
    console.error("swapMatchPlayersAction failed", error);
    return {
      status: "error",
      message: "No pudimos intercambiar los jugadores. Intentá nuevamente.",
    };
  }
}

export interface SubmitResultInput {
  matchId: string;
  score: string;
  notes?: string | null;
}

export interface SubmitResultResponse {
  status: "ok" | "error";
  message?: string;
}

export interface MatchActionResponse {
  status: "ok" | "error";
  message?: string;
}

export async function submitMatchResultAction(
  input: SubmitResultInput,
): Promise<SubmitResultResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "You must be signed in to submit results.",
    };
  }

  if (!input.matchId || input.matchId.trim().length === 0) {
    return { status: "error", message: "Invalid match identifier." };
  }

  const score = input.score.trim();
  if (score.length === 0) {
    return { status: "error", message: "Please provide the match score." };
  }

  try {
    const updatedMatch = await db.transaction(async (tx) => {
      const [player] = await tx
        .select()
        .from(matchPlayers)
        .where(
          and(
            eq(matchPlayers.matchId, input.matchId),
            eq(matchPlayers.userId, session.user.id),
          ),
        )
        .limit(1);

      if (!player) {
        throw new Error("not-authorized");
      }

      await tx
        .update(matches)
        .set({
          score,
          notes: input.notes?.trim() || null,
        })
        .where(eq(matches.id, input.matchId));

      await tx
        .update(matchPlayers)
        .set({ resultConfirmed: true })
        .where(eq(matchPlayers.id, player.id));

      const result = await getMatchWithPlayers(tx, input.matchId);
      if (!result) throw new Error("match-update-failed");

      const totalPlayers = result.players.length;
      const teamAConfirmed = result.players.some(
        (mp) =>
          teamForPosition(mp.position, totalPlayers) === "A" &&
          mp.resultConfirmed,
      );
      const teamBConfirmed = result.players.some(
        (mp) =>
          teamForPosition(mp.position, totalPlayers) === "B" &&
          mp.resultConfirmed,
      );

      if (
        teamAConfirmed &&
        teamBConfirmed &&
        result.status !== MATCH_STATUS.CONFIRMED
      ) {
        await tx
          .update(matches)
          .set({ status: MATCH_STATUS.CONFIRMED })
          .where(eq(matches.id, input.matchId));
        return getMatchWithPlayers(tx, input.matchId);
      }

      if (
        (!teamAConfirmed || !teamBConfirmed) &&
        result.status !== MATCH_STATUS.PENDING
      ) {
        await tx
          .update(matches)
          .set({ status: MATCH_STATUS.PENDING })
          .where(eq(matches.id, input.matchId));
        return getMatchWithPlayers(tx, input.matchId);
      }

      return result;
    });

    if (!updatedMatch) {
      throw new Error("match-update-failed");
    }

    revalidatePath(`/match/${input.matchId}`);
    revalidatePath("/notifications");
    revalidatePath("/me");
    revalidatePath("/", "layout");

    // #7: Result submitted — notify opposing team players to confirm
    const submitter = updatedMatch.players.find(
      (p) => p.userId === session.user.id,
    );
    if (submitter) {
      const totalPlayers = updatedMatch.players.length;
      const submitterTeam = teamForPosition(submitter.position, totalPlayers);
      const opposingUserIds = updatedMatch.players
        .filter(
          (p) =>
            p.userId &&
            teamForPosition(p.position, totalPlayers) !== submitterTeam,
        )
        .map((p) => p.userId!)
        .filter((id) => id !== session.user.id);

      if (opposingUserIds.length > 0) {
        const submitterName = await getUserDisplayName(session.user.id);
        const matchUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/match/${input.matchId}`;
        const clubName = updatedMatch.club ?? "el partido";
        void notifyUsers(opposingUserIds, {
          title: `Resultado cargado por ${submitterName}`,
          body: `Confirmá el marcador en ${clubName}.`,
          url: matchUrl,
          actions: [{ action: "confirm", title: "Confirmar", url: `${matchUrl}?action=confirm` }],
        });
      }
    }

    return { status: "ok" };
  } catch (error) {
    if (error instanceof Error && error.message === "not-authorized") {
      return {
        status: "error",
        message: "No podés editar un partido en el que no estás.",
      };
    }
    console.error("submitMatchResultAction failed", error);
    return {
      status: "error",
      message: "No se pudo guardar el resultado. Intentá nuevamente.",
    };
  }
}

interface UpdateMatchDetailsInput {
  matchId: string;
  date?: string; // ISO string
  sets?: number;
  matchType?: MatchType;
  club?: string | null;
  courtNumber?: string | null;
  notes?: string | null;
}

export async function updateMatchDetailsAction(
  input: UpdateMatchDetailsInput,
): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "You must be signed in to update the match.",
    };
  }

  if (!input.matchId || input.matchId.trim().length === 0) {
    return { status: "error", message: "Invalid match identifier." };
  }

  try {
    const [match] = await db
      .select({ creatorId: matches.creatorId, status: matches.status })
      .from(matches)
      .where(eq(matches.id, input.matchId))
      .limit(1);

    if (!match) {
      return { status: "error", message: "Match not found." };
    }

    if (match.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Only the creator can edit the match.",
      };
    }

    if (
      match.status === MATCH_STATUS.CONFIRMED &&
      (input.sets !== undefined || input.matchType !== undefined)
    ) {
      return {
        status: "error",
        message: "No se puede editar el formato de un partido ya confirmado.",
      };
    }

    const updateData: Record<string, unknown> = {};
    if (input.date !== undefined) updateData.date = new Date(input.date);
    if (input.sets !== undefined) updateData.sets = input.sets;
    if (input.matchType !== undefined) updateData.matchType = input.matchType;
    if (input.club !== undefined) updateData.club = capitalizeName(input.club ?? "") || null;
    if (input.courtNumber !== undefined)
      updateData.courtNumber = input.courtNumber?.trim() || null;
    if (input.notes !== undefined)
      updateData.notes = input.notes?.trim() || null;

    await db
      .update(matches)
      .set(updateData)
      .where(eq(matches.id, input.matchId));

    revalidatePath("/match");
    revalidatePath(`/match/${input.matchId}`);
    revalidatePath("/me");

    return { status: "ok" };
  } catch (error) {
    console.error("updateMatchDetailsAction failed", error);
    return {
      status: "error",
      message: "We could not update the match details.",
    };
  }
}

export async function confirmMatchResultAction(
  matchId: string,
): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "You must be signed in to confirm the result.",
    };
  }

  if (!matchId || matchId.trim().length === 0) {
    return { status: "error", message: "Invalid match identifier." };
  }

  try {
    const updatedMatch = await db.transaction(async (tx) => {
      const [player] = await tx
        .select()
        .from(matchPlayers)
        .where(
          and(
            eq(matchPlayers.matchId, matchId),
            eq(matchPlayers.userId, session.user.id),
          ),
        )
        .limit(1);

      if (!player) {
        throw new Error("not-authorized");
      }

      const match = await getMatchWithPlayers(tx, matchId);

      if (!match) {
        throw new Error("match-not-found");
      }

      if (!match.score || match.score.trim().length === 0) {
        throw new Error("missing-score");
      }

      if (player.resultConfirmed) {
        return match;
      }

      await tx
        .update(matchPlayers)
        .set({ resultConfirmed: true })
        .where(eq(matchPlayers.id, player.id));

      const updated = await getMatchWithPlayers(tx, matchId);
      if (!updated) throw new Error("match-update-failed");

      const totalPlayers = updated.players.length;
      const teamAConfirmed = updated.players.some(
        (p) =>
          teamForPosition(p.position, totalPlayers) === "A" &&
          p.resultConfirmed,
      );
      const teamBConfirmed = updated.players.some(
        (p) =>
          teamForPosition(p.position, totalPlayers) === "B" &&
          p.resultConfirmed,
      );

      if (
        teamAConfirmed &&
        teamBConfirmed &&
        updated.status !== MATCH_STATUS.CONFIRMED
      ) {
        await tx
          .update(matches)
          .set({ status: MATCH_STATUS.CONFIRMED })
          .where(eq(matches.id, matchId));
        return getMatchWithPlayers(tx, matchId);
      }

      return updated;
    });

    if (updatedMatch && updatedMatch.status === MATCH_STATUS.CONFIRMED) {
      const affectedIds = updatedMatch.players
        .map((p) => p.userId)
        .filter((id): id is string => id !== null);
      await recalculateRankingAction(affectedIds);

      const matchInfo: ConfirmedMatchInfo = {
        id: updatedMatch.id,
        score: updatedMatch.score,
        date: updatedMatch.date,
        players: updatedMatch.players.map((p) => ({
          userId: p.userId,
          position: p.position,
          teamId: p.teamId,
          side: p.side,
        })),
      };
      void updateEdgesForMatch(matchInfo).then(() => {
        for (const id of affectedIds) {
          void recomputeStatsForPlayer(id);
        }
      });
    }

    revalidatePath(`/match/${matchId}`);
    revalidatePath("/notifications");
    revalidatePath("/me");
    revalidatePath("/", "layout");
    revalidateTag("matches", "default");

    return { status: "ok" };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "not-authorized") {
        return {
          status: "error",
          message: "Solo los jugadores pueden confirmar el resultado.",
        };
      }
      if (error.message === "match-not-found") {
        return { status: "error", message: "No encontramos este partido." };
      }
      if (error.message === "missing-score") {
        return {
          status: "error",
          message: "Primero cargá el resultado antes de confirmarlo.",
        };
      }
    }

    console.error("confirmMatchResultAction failed", error);
    return {
      status: "error",
      message: "No pudimos confirmar tu asistencia. Intentá de nuevo.",
    };
  }
}

export async function finalizeMatchAction(
  matchId: string,
): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "You must be signed in to finalize the match.",
    };
  }

  if (!matchId || matchId.trim().length === 0) {
    return { status: "error", message: "Invalid match identifier." };
  }

  try {
    const match = await getMatchWithPlayers(db, matchId);

    if (!match) {
      return { status: "error", message: "Match not found." };
    }

    if (match.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Only the creator can finalize the match.",
      };
    }

    if (!match.score || match.score.trim().length === 0) {
      return {
        status: "error",
        message: "Cargá el resultado antes de finalizar el partido.",
      };
    }

    const now = new Date();
    await db.transaction(async (tx) => {
      await tx
        .update(matches)
        .set({ status: MATCH_STATUS.CONFIRMED })
        .where(eq(matches.id, matchId));

      await tx
        .update(matchPlayers)
        .set({
          resultConfirmed: true,
          attendance: "ATTENDED",
          attendanceBy: session.user.id,
          attendanceAt: now,
        })
        .where(eq(matchPlayers.matchId, matchId));
    });

    // Trigger ranking recalculation
    const affectedIds = match.players
      .map((p) => p.userId)
      .filter((id): id is string => id !== null);
    await recalculateRankingAction(affectedIds);

    // Update graph edges and recompute stats for affected players
    const matchInfo: ConfirmedMatchInfo = {
      id: match.id,
      score: match.score,
      date: match.date,
      players: match.players.map((p) => ({
        userId: p.userId,
        position: p.position,
        teamId: p.teamId,
        side: p.side,
      })),
    };
    void updateEdgesForMatch(matchInfo).then(() => {
      for (const id of affectedIds) {
        void recomputeStatsForPlayer(id);
      }
    });

    revalidatePath(`/match/${matchId}`);

    return { status: "ok" };
  } catch (error) {
    console.error("finalizeMatchAction failed", error);
    return {
      status: "error",
      message: "No pudimos finalizar el partido. Intentá nuevamente.",
    };
  }
}

interface AssignUserToMatchSlotInput {
  playerId: string;
  userId: string;
}

export async function assignUserToMatchSlotAction(
  input: AssignUserToMatchSlotInput,
): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "Tenés que iniciar sesión para gestionar el partido.",
    };
  }

  if (!input.playerId || input.playerId.trim().length === 0) {
    return { status: "error", message: "Identificador de cupo inválido." };
  }

  if (!input.userId || input.userId.trim().length === 0) {
    return { status: "error", message: "Identificador de jugador inválido." };
  }

  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    return { status: "ok" };
  }

  try {
    const player = await db.query.matchPlayers.findFirst({
      where: eq(matchPlayers.id, input.playerId),
      with: { match: true },
    });

    if (!player) {
      return { status: "error", message: "No encontramos este cupo." };
    }

    if (player.match.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Solo el organizador puede asignar jugadores.",
      };
    }

    if (player.match.status !== MATCH_STATUS.PENDING) {
      return {
        status: "error",
        message: "No podés modificar cupos de un partido ya finalizado o cancelado.",
      };
    }

    const alreadyInMatch = await db
      .select()
      .from(matchPlayers)
      .where(
        and(
          eq(matchPlayers.matchId, player.matchId),
          eq(matchPlayers.userId, input.userId),
        ),
      )
      .limit(1);

    if (alreadyInMatch.length > 0 && alreadyInMatch[0].id !== input.playerId) {
      return {
        status: "error",
        message: "El jugador ya está inscripto en este partido.",
      };
    }

    await db
      .update(matchPlayers)
      .set({
        userId: input.userId,
        displayName: null,
        joinedAt: new Date(),
        resultConfirmed: false,
      })
      .where(eq(matchPlayers.id, input.playerId));

    revalidatePath(`/match/${player.matchId}`);
    revalidatePath(`/match`);
    revalidateTag("matches", "default");

    return { status: "ok" };
  } catch (error) {
    console.error("assignUserToMatchSlotAction failed", error);
    return {
      status: "error",
      message: "No pudimos asignar al jugador. Intentá nuevamente.",
    };
  }
}

interface ReleaseMatchSlotInput {
  playerId: string;
  displayName?: string | null;
}

export async function releaseMatchSlotAction(
  input: ReleaseMatchSlotInput,
): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "Tenés que iniciar sesión para gestionar el partido.",
    };
  }

  if (!input.playerId || input.playerId.trim().length === 0) {
    return { status: "error", message: "Identificador de cupo inválido." };
  }

  try {
    const player = await db.query.matchPlayers.findFirst({
      where: eq(matchPlayers.id, input.playerId),
      with: {
        match: true,
        user: {
          columns: {
            displayName: true,
          },
        },
      },
    });

    if (!player) {
      return { status: "error", message: "No encontramos ese cupo." };
    }

    if (player.match.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Solo el organizador puede liberar un cupo.",
      };
    }

    const trimmedName = input.displayName ? capitalizeName(input.displayName) : "";
    const nextDisplayName =
      trimmedName && trimmedName.length > 0
        ? trimmedName
        : (player.displayName ?? player.user?.displayName ?? null);

    await db
      .update(matchPlayers)
      .set({
        userId: null,
        displayName: nextDisplayName,
        joinedAt: null,
        resultConfirmed: false,
      })
      .where(eq(matchPlayers.id, input.playerId));

    revalidatePath(`/match/${player.matchId}`);

    return { status: "ok" };
  } catch (error) {
    console.error("releaseMatchSlotAction failed", error);
    return {
      status: "error",
      message: "No pudimos liberar el cupo. Intentá nuevamente.",
    };
  }
}

interface RenamePlaceholderInput {
  playerId: string;
  displayName: string;
}

export async function renamePlaceholderAction(
  input: RenamePlaceholderInput,
): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "Tenés que iniciar sesión para gestionar el partido.",
    };
  }

  const trimmedName = capitalizeName(input.displayName ?? "");
  if (!trimmedName || trimmedName.length === 0) {
    return { status: "error", message: "Ingresá un nombre válido." };
  }

  try {
    const player = await db.query.matchPlayers.findFirst({
      where: eq(matchPlayers.id, input.playerId),
      with: { match: true },
    });

    if (!player) {
      return { status: "error", message: "No encontramos ese cupo." };
    }

    if (player.match.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Solo el organizador puede editar los nombres.",
      };
    }

    if (player.userId) {
      return {
        status: "error",
        message: "No podés renombrar un jugador ya asignado.",
      };
    }

    await db
      .update(matchPlayers)
      .set({ displayName: trimmedName })
      .where(eq(matchPlayers.id, input.playerId));

    revalidatePath(`/match/${player.matchId}`);
    revalidatePath(`/match`);

    return { status: "ok" };
  } catch (error) {
    console.error("renamePlaceholderAction failed", error);
    return {
      status: "error",
      message: "No pudimos actualizar el nombre. Intentá nuevamente.",
    };
  }
}

interface UpdateTeamLabelInput {
  teamId: string;
  matchId: string;
  label: string;
}

export async function updateTeamLabelAction(
  input: UpdateTeamLabelInput,
): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "Tenés que iniciar sesión para gestionar el partido.",
    };
  }

  const trimmedLabel = input.label?.trim();
  if (!trimmedLabel || trimmedLabel.length === 0) {
    return {
      status: "error",
      message: "Ingresá un nombre válido para el equipo.",
    };
  }

  try {
    const [match] = await db
      .select({ id: matches.id, creatorId: matches.creatorId })
      .from(matches)
      .where(eq(matches.id, input.matchId))
      .limit(1);

    if (!match) {
      return { status: "error", message: "No encontramos el partido." };
    }

    if (match.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Solo el organizador puede renombrar equipos.",
      };
    }

    const [{ count: linkedPlayers }] = await db
      .select({ count: count() })
      .from(matchPlayers)
      .where(
        and(
          eq(matchPlayers.matchId, input.matchId),
          eq(matchPlayers.teamId, input.teamId),
        ),
      );

    if (linkedPlayers === 0) {
      return {
        status: "error",
        message: "El equipo no pertenece a este partido.",
      };
    }

    await db
      .update(teams)
      .set({ label: trimmedLabel })
      .where(eq(teams.id, input.teamId));

    revalidatePath(`/match/${input.matchId}`);

    return { status: "ok" };
  } catch (error) {
    console.error("updateTeamLabelAction failed", error);
    return {
      status: "error",
      message: "No pudimos actualizar el equipo. Intentá nuevamente.",
    };
  }
}

export interface SaveMatchResultInput {
  matchId: string;
  score: string;
  status?: string;
  sides?: Array<{ playerId: string; side: "RIGHT" | "LEFT" }>;
}

export async function saveMatchResultAction(
  input: SaveMatchResultInput,
): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "Debes iniciar sesión para guardar resultados.",
    };
  }

  if (!input.matchId || input.matchId.trim().length === 0) {
    return { status: "error", message: "Identificador de partido inválido." };
  }

  const score = input.score.trim();
  if (score.length === 0) {
    return {
      status: "error",
      message: "Por favor, ingresa el resultado del partido.",
    };
  }

  try {
    const updatedMatch = await db.transaction(async (tx) => {
      // Verify the user is part of the match
      const [player] = await tx
        .select()
        .from(matchPlayers)
        .where(
          and(
            eq(matchPlayers.matchId, input.matchId),
            eq(matchPlayers.userId, session.user.id),
          ),
        )
        .limit(1);

      if (!player) {
        throw new Error("not-authorized");
      }

      // Block edits on already-confirmed matches (both teams validated)
      const [existingMatch] = await tx
        .select({ status: matches.status })
        .from(matches)
        .where(eq(matches.id, input.matchId))
        .limit(1);

      if (existingMatch?.status === MATCH_STATUS.CONFIRMED) {
        throw new Error("already-confirmed");
      }

      // If editing an existing score, reset all confirmations (stale for the old result)
      const [prevMatch] = await tx
        .select({ score: matches.score })
        .from(matches)
        .where(eq(matches.id, input.matchId))
        .limit(1);

      if (prevMatch?.score) {
        await tx
          .update(matchPlayers)
          .set({ resultConfirmed: false })
          .where(eq(matchPlayers.matchId, input.matchId));
      }

      // Update the match score and status (PENDING until both teams confirm)
      await tx
        .update(matches)
        .set({
          score,
          status: (input.status as MatchStatus) || MATCH_STATUS.PENDING,
        })
        .where(eq(matches.id, input.matchId));

      await tx
        .update(matchPlayers)
        .set({ resultConfirmed: true })
        .where(eq(matchPlayers.id, player.id));

      // Save player sides (derecha/revés) if provided
      if (input.sides && input.sides.length > 0) {
        for (const sideInput of input.sides) {
          await tx
            .update(matchPlayers)
            .set({ side: sideInput.side })
            .where(eq(matchPlayers.id, sideInput.playerId));
        }
      }

      const baseMatch = await getMatchWithPlayers(tx, input.matchId);
      if (!baseMatch) throw new Error("match-update-failed");

      // Check if at least one player from each team has confirmed the result
      const totalPlayers = baseMatch.players.length;
      const teamAConfirmed = baseMatch.players.some(
        (p) =>
          teamForPosition(p.position, totalPlayers) === "A" &&
          p.resultConfirmed,
      );
      const teamBConfirmed = baseMatch.players.some(
        (p) =>
          teamForPosition(p.position, totalPlayers) === "B" &&
          p.resultConfirmed,
      );

      // If one from each team confirmed, update status to CONFIRMED
      if (
        teamAConfirmed &&
        teamBConfirmed &&
        baseMatch.status !== MATCH_STATUS.CONFIRMED
      ) {
        await tx
          .update(matches)
          .set({ status: MATCH_STATUS.CONFIRMED })
          .where(eq(matches.id, input.matchId));
        return getMatchWithPlayers(tx, input.matchId);
      }

      return baseMatch;
    });

    if (!updatedMatch) {
      throw new Error("match-update-failed");
    }

    if (updatedMatch.status === MATCH_STATUS.CONFIRMED) {
      const affectedIds = updatedMatch.players
        .map((p) => p.userId)
        .filter((id): id is string => id !== null);
      const matchInfo: ConfirmedMatchInfo = {
        id: updatedMatch.id,
        score: updatedMatch.score,
        date: updatedMatch.date,
        players: updatedMatch.players.map((p) => ({
          userId: p.userId,
          position: p.position,
          teamId: p.teamId,
          side: p.side,
        })),
      };
      void updateEdgesForMatch(matchInfo).then(() => {
        for (const id of affectedIds) {
          void recomputeStatsForPlayer(id);
        }
      });
      await recalculateRankingAction(affectedIds);
    }

    revalidatePath(`/match/${input.matchId}`);
    revalidatePath(`/match/${input.matchId}/result`);
    revalidatePath("/notifications");
    revalidatePath("/me");
    revalidatePath("/", "layout");
    revalidateTag("matches", "default");

    return { status: "ok" };
  } catch (error) {
    if (error instanceof Error && error.message === "not-authorized") {
      return {
        status: "error",
        message: "No puedes actualizar un partido en el que no participas.",
      };
    }
    if (error instanceof Error && error.message === "already-confirmed") {
      return {
        status: "error",
        message: "No se puede editar un partido ya confirmado por ambos equipos.",
      };
    }
    console.error("saveMatchResultAction failed", error);
    return {
      status: "error",
      message:
        "No se pudo guardar el resultado. Por favor, inténtalo de nuevo.",
    };
  }
}

export async function getMatchByIdAction(matchId: string): Promise<{
  status: "ok" | "error";
  match?: {
    id: string;
    creatorId: string;
    status: string;
    sets: number;
    matchType: string;
    club: string | null;
    courtNumber: string | null;
    notes: string | null;
    score: string | null;
    date: Date;
    createdAt: Date;
    creator?: {
      id: string;
      displayName: string | null;
      image: string | null;
      alias: string | null;
    } | null;
    players: Array<{
      id: string;
      position: number;
      userId: string | null;
      displayName: string | null;
      teamId: string | null;
      resultConfirmed: boolean;
      joinedAt: Date | null;
      attendance: string | null;
      side: "RIGHT" | "LEFT" | null;
      user?: {
        id: string;
        displayName: string | null;
        image: string | null;
        alias: string | null;
      } | null;
      team?: {
        id: string;
        label: string;
      } | null;
    }>;
  };
  message?: string;
}> {
  if (!matchId || matchId.trim().length === 0) {
    return { status: "error", message: "Invalid match identifier." };
  }

  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    return {
      status: "ok",
      match: {
        id: matchId,
        creatorId: "p-01",
        status: "CONFIRMED",
        sets: 3,
        matchType: "FRIENDLY",
        club: "Padel City",
        courtNumber: "2",
        notes: "Partidazo de fin de semana con la red de contactos.",
        score: "6-4, 6-3",
        date: new Date("2026-08-01T10:00:00.000Z"),
        createdAt: new Date("2026-08-01T10:00:00.000Z"),
        creator: {
          id: "p-01",
          displayName: "Agustín",
          image: null,
          alias: "agu",
        },
        players: [
          {
            id: "mp-01",
            position: 0,
            userId: "p-01",
            displayName: "Agustín",
            teamId: "team-a",
            resultConfirmed: true,
            joinedAt: new Date("2026-08-01T10:00:00.000Z"),
            attendance: "ATTENDED",
            side: "RIGHT",
            user: { id: "p-01", displayName: "Agustín", image: null, alias: "agu" },
            team: { id: "team-a", label: "Equipo A" }
          },
          {
            id: "mp-02",
            position: 1,
            userId: "p-02",
            displayName: "Fernando",
            teamId: "team-a",
            resultConfirmed: true,
            joinedAt: new Date("2026-08-01T10:00:00.000Z"),
            attendance: "ATTENDED",
            side: "LEFT",
            user: { id: "p-02", displayName: "Fernando", image: null, alias: "Bela" },
            team: { id: "team-a", label: "Equipo A" }
          },
          {
            id: "mp-03",
            position: 2,
            userId: "p-03",
            displayName: "Ramiro",
            teamId: "team-b",
            resultConfirmed: true,
            joinedAt: new Date("2026-08-01T10:00:00.000Z"),
            attendance: "ATTENDED",
            side: "RIGHT",
            user: { id: "p-03", displayName: "Ramiro", image: null, alias: "Ram" },
            team: { id: "team-b", label: "Equipo B" }
          },
          {
            id: "mp-04",
            position: 3,
            userId: "p-04",
            displayName: "Gero",
            teamId: "team-b",
            resultConfirmed: true,
            joinedAt: new Date("2026-08-01T10:00:00.000Z"),
            attendance: "ATTENDED",
            side: "LEFT",
            user: { id: "p-04", displayName: "Gero", image: null, alias: "Ger" },
            team: { id: "team-b", label: "Equipo B" }
          },
        ],
      },
    };
  }

  try {
    const match = await db.query.matches.findFirst({
      where: eq(matches.id, matchId),
      with: {
        creator: {
          columns: {
            id: true,
            displayName: true,
            image: true,
            alias: true,
          },
        },
        players: {
          with: {
            user: {
              columns: {
                id: true,
                displayName: true,
                image: true,
                alias: true,
              },
            },
            team: {
              columns: {
                id: true,
                label: true,
              },
            },
          },
          orderBy: asc(matchPlayers.position),
        },
      },
    });

    if (!match) {
      return { status: "error", message: "Match not found." };
    }

    return {
      status: "ok",
      match: {
        id: match.id,
        creatorId: match.creatorId,
        status: match.status,
        sets: match.sets,
        matchType: match.matchType,
        club: match.club,
        courtNumber: match.courtNumber,
        notes: match.notes,
        score: match.score,
        date: match.date,
        createdAt: match.createdAt,
        creator: match.creator,
        players: match.players,
      },
    };
  } catch (error) {
    console.error("getMatchByIdAction failed", error);
    return {
      status: "error",
      message: "Could not fetch match data. Please try again.",
    };
  }
}

export async function joinMatchPlayerAction(
  playerId: string,
): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "Necesitás iniciar sesión con Google." };
  }

  if (!playerId || playerId.trim().length === 0) {
    return { status: "error", message: "Identificador de cupo inválido." };
  }

  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    return { status: "ok" };
  }

  try {
    const player = await db.query.matchPlayers.findFirst({
      where: eq(matchPlayers.id, playerId),
      with: { match: true },
    });

    if (!player) {
      return { status: "error", message: "No encontramos este cupo." };
    }

    if (player.match.status !== MATCH_STATUS.PENDING) {
      return {
        status: "error",
        message: "El partido ya no admite nuevas confirmaciones.",
      };
    }

    if (player.userId) {
      return {
        status: "error",
        message: "Cupo ocupado, hablá con el organizador del partido.",
      };
    }

    const alreadyJoined = await db
      .select()
      .from(matchPlayers)
      .where(
        and(
          eq(matchPlayers.matchId, player.matchId),
          eq(matchPlayers.userId, session.user.id),
        ),
      )
      .limit(1);

    if (alreadyJoined.length > 0) {
      return {
        status: "error",
        message: "Ya estás inscripto en este partido.",
      };
    }

    await db
      .update(matchPlayers)
      .set({
        userId: session.user.id,
        displayName: null,
        joinedAt: new Date(),
        resultConfirmed: false,
      })
      .where(eq(matchPlayers.id, playerId));

    revalidatePath(`/match/${player.matchId}`);
    revalidatePath(`/j/${playerId}`);
    revalidateTag("matches", "default");

    return { status: "ok" };
  } catch (error) {
    console.error("joinMatchPlayerAction failed", error);
    return {
      status: "error",
      message: "No pudimos unir al jugador. Intentá nuevamente.",
    };
  }
}

export interface AttendanceEntry {
  matchPlayerId: string;
  status: "ATTENDED" | "LATE" | "NO_SHOW";
}

export async function markAttendanceAction(
  matchId: string,
  entries: AttendanceEntry[],
): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return {
      status: "error",
      message: "Tenés que iniciar sesión para marcar la asistencia.",
    };
  }

  if (!matchId || matchId.trim().length === 0) {
    return { status: "error", message: "Identificador de partido inválido." };
  }

  if (!entries || entries.length === 0) {
    return { status: "error", message: "No se enviaron datos de asistencia." };
  }

  try {
    const match = await getMatchWithPlayers(db, matchId);

    if (!match) {
      return { status: "error", message: "Partido no encontrado." };
    }

    if (match.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Solo el organizador puede marcar la asistencia.",
      };
    }

    // Only allow marking after match date + 1h
    const oneHourAfterMatch = new Date(match.date.getTime() + 60 * 60 * 1000);
    if (new Date() < oneHourAfterMatch) {
      return {
        status: "error",
        message:
          "Podés marcar la asistencia 1 hora después de la hora del partido.",
      };
    }

    // Validate all entries belong to this match
    const validPlayerIds = new Set(match.players.map((p) => p.id));
    for (const entry of entries) {
      if (!validPlayerIds.has(entry.matchPlayerId)) {
        return {
          status: "error",
          message: "Jugador no pertenece a este partido.",
        };
      }
    }

    const now = new Date();

    await db.transaction(async (tx) => {
      for (const entry of entries) {
        await tx
          .update(matchPlayers)
          .set({
            attendance: entry.status,
            attendanceBy: session.user.id,
            attendanceAt: now,
          })
          .where(eq(matchPlayers.id, entry.matchPlayerId));
      }
    });

    // If match is already CONFIRMED, recalculate ranking with new attendance data
    if (match.status === MATCH_STATUS.CONFIRMED) {
      const affectedIds = match.players
        .map((p) => p.userId)
        .filter((id): id is string => id !== null);
      await recalculateRankingAction(affectedIds);
    }

    revalidatePath(`/match/${matchId}`);
    revalidatePath("/me");
    revalidateTag("matches", "default");

    // #8: NO_SHOW marked — notify the marked player
    const noShowEntries = entries.filter((e) => e.status === "NO_SHOW");
    if (noShowEntries.length > 0) {
      const matchUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/match/${matchId}`;
      const clubName = match.club ?? "el partido";
      for (const entry of noShowEntries) {
        const player = match.players.find((p) => p.id === entry.matchPlayerId);
        if (player?.userId) {
          void notifyUsers([player.userId], {
            title: `El organizador marcó que no asististe`,
            body: `En ${clubName}. Si es incorrecto, contactá al organizador.`,
            url: matchUrl,
          });
        }
      }
    }

    return { status: "ok" };
  } catch (error) {
    console.error("markAttendanceAction failed", error);
    return {
      status: "error",
      message: "No pudimos guardar la asistencia. Intentá nuevamente.",
    };
  }
}
