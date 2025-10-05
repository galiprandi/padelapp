"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createMagicLink } from "@/lib/magic-link";

const MIN_SETS = 1;
const MAX_SETS = 5;

export type TeamKey = "A" | "B";

export type MatchFormat = "DOUBLES" | "SINGLES";

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
} as const;

const MATCH_TYPE = {
  FRIENDLY: "FRIENDLY",
  LOCAL_TOURNAMENT: "LOCAL_TOURNAMENT",
} as const;

type MatchType = (typeof MATCH_TYPE)[keyof typeof MATCH_TYPE];

export interface CreateMatchInput {
  matchId?: string;
  sets: number;
  matchType: MatchType;
  countsForRanking: boolean;
  format: MatchFormat;
  teamLabels: Record<TeamKey, string>;
  club?: string | null;
  courtNumber?: string | null;
  notes?: string | null;
  score?: string | null;
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

function isValidMatchType(value: string): value is MatchType {
  return Object.values(MATCH_TYPE).includes(value as MatchType);
}

const FORMAT_POSITIONS: Record<MatchFormat, number[]> = {
  DOUBLES: [0, 1, 2, 3],
  SINGLES: [0, 1],
};

const POSITION_TEAMS: Record<MatchFormat, Record<number, TeamKey>> = {
  DOUBLES: { 0: "A", 1: "A", 2: "B", 3: "B" },
  SINGLES: { 0: "A", 1: "B" },
};

function defaultTeamLabel(team: TeamKey, format: MatchFormat): string {
  if (format === "SINGLES") {
    return team === "A" ? "Jugador A" : "Jugador B";
  }
  return team === "A" ? "Pareja A" : "Pareja B";
}

function sanitizeTeamLabel(value: string | undefined, team: TeamKey, format: MatchFormat): string {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length === 0) {
    return defaultTeamLabel(team, format);
  }
  return trimmed;
}

function teamForPosition(position: number, totalPlayers: number): TeamKey {
  if (totalPlayers <= 2) {
    return position === 0 ? "A" : "B";
  }
  return position < 2 ? "A" : "B";
}

export async function createMatchAction(input: CreateMatchInput): Promise<CreateMatchResponse> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "You must be signed in to create a match." };
  }

  if (!isValidMatchType(input.matchType)) {
    return { status: "error", message: "Invalid match type." };
  }

  if (!Object.hasOwn(FORMAT_POSITIONS, input.format)) {
    return { status: "error", message: "Unsupported match format." };
  }

  if (Number.isNaN(input.sets) || input.sets < MIN_SETS || input.sets > MAX_SETS) {
    return {
      status: "error",
      message: `Sets must be between ${MIN_SETS} and ${MAX_SETS}.`,
    };
  }

  if (typeof input.countsForRanking !== "boolean") {
    return { status: "error", message: "Ranking flag must be provided." };
  }

  const expectedPositions = FORMAT_POSITIONS[input.format];

  if (!Array.isArray(input.slots) || input.slots.length !== expectedPositions.length) {
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

  let ownerOccupiesFirstSlot = false;

  for (const slot of input.slots) {
    if (!allowedPositions.has(slot.position)) {
      return { status: "error", message: "Slot positions must match the selected format." };
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
        return { status: "error", message: "Player identifier cannot be empty." };
      }

      if (slot.position === 0 && trimmedUserId === session.user.id) {
        ownerOccupiesFirstSlot = true;
      }

      normalizedSlots.push({
        position: slot.position,
        team: slot.team,
        userId: trimmedUserId,
        displayName: null,
        joinedAt: trimmedUserId === session.user.id ? new Date() : null,
      });
    } else {
      const trimmedName = slot.displayName.trim();
      if (trimmedName.length === 0) {
        return { status: "error", message: "Placeholder slots require a display name." };
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

  if (!ownerOccupiesFirstSlot) {
    return { status: "error", message: "You must occupy the first slot of Team A." };
  }

  const teamLabelA = sanitizeTeamLabel(input.teamLabels?.A, "A", input.format);
  const teamLabelB = sanitizeTeamLabel(input.teamLabels?.B, "B", input.format);

  try {
    const creationResult = await prisma.$transaction(async (tx) => {
      if (typeof (tx as { team?: typeof prisma.team }).team?.create !== "function") {
        throw new Error("prisma-client-missing-team-delegate");
      }

      const teamClient = (tx as { team: typeof prisma.team }).team;

      const teamA = await teamClient.create({ data: { label: teamLabelA } });
      const teamB = await teamClient.create({ data: { label: teamLabelB } });

      const teamIdByKey: Record<TeamKey, string> = { A: teamA.id, B: teamB.id };

      const match = await tx.match.create({
        data: {
          creatorId: session.user.id,
          status: MATCH_STATUS.PENDING,
          sets: input.sets,
          matchType: input.matchType,
          club: input.club?.trim() || null,
          courtNumber: input.courtNumber?.trim() || null,
          notes: input.notes?.trim() || null,
          score: input.score?.trim() || null,
          players: {
            create: normalizedSlots.map((slot) => ({
              position: slot.position,
              userId: slot.userId,
              displayName: slot.displayName,
              teamId: teamIdByKey[slot.team],
              resultConfirmed: false,
              joinedAt: slot.joinedAt,
            })),
          },
        },
        include: {
          players: true,
        },
      });

      return {
        match,
        teamA,
        teamB,
      };
    });

    revalidatePath("/match");

    const shareUrl = createMagicLink({ resource: "match", identifier: creationResult.match.id }).url;

    const teamLabelById: Record<string, { team: TeamKey; label: string }> = {
      [creationResult.teamA.id]: { team: "A", label: creationResult.teamA.label },
      [creationResult.teamB.id]: { team: "B", label: creationResult.teamB.label },
    };

    const slots = creationResult.match.players
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((player) => {
        const teamInfo = player.teamId ? teamLabelById[player.teamId] : { team: "A" as TeamKey, label: teamLabelA };
        return {
          playerId: player.id,
          position: player.position,
          team: teamInfo.team,
          teamLabel: teamInfo.label,
          occupied: Boolean(player.userId),
          displayName: player.displayName,
          link: createMagicLink({ resource: "player", identifier: player.id }).url,
        };
      });

    return {
      status: "ok",
      matchId: creationResult.match.id,
      shareUrl,
      slots,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "prisma-client-missing-team-delegate") {
      console.error(
        "createMatchAction error: Prisma client missing Team delegate. Run `npm run prisma:generate` and restart the dev server.",
      );
      return {
        status: "error",
        message: "Necesitamos refrescar la base. Corré `npm run prisma:generate` y reiniciá el servidor de desarrollo.",
      };
    }
    console.error("createMatchAction failed", error);
    return {
      status: "error",
      message: "We could not create the match. Please try again.",
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
    return { status: "error", message: "You must be signed in to submit results." };
  }

  if (!input.matchId || input.matchId.trim().length === 0) {
    return { status: "error", message: "Invalid match identifier." };
  }

  const score = input.score.trim();
  if (score.length === 0) {
    return { status: "error", message: "Please provide the match score." };
  }

  try {
    const updatedMatch = await prisma.$transaction(async (tx) => {
      const player = await tx.matchPlayer.findFirst({
        where: {
          matchId: input.matchId,
          userId: session.user.id,
        },
      });

      if (!player) {
        throw new Error("not-authorized");
      }

      const baseMatch = await tx.match.update({
        where: { id: input.matchId },
        data: {
          score,
          notes: input.notes?.trim() || null,
          players: {
            update: {
              where: { id: player.id },
              data: { resultConfirmed: true },
            },
          },
        },
        include: {
          players: true,
        },
      });

      const totalPlayers = baseMatch.players.length;
      const teamAConfirmed = baseMatch.players.some(
        (matchPlayer) => teamForPosition(matchPlayer.position, totalPlayers) === "A" && matchPlayer.resultConfirmed,
      );
      const teamBConfirmed = baseMatch.players.some(
        (matchPlayer) => teamForPosition(matchPlayer.position, totalPlayers) === "B" && matchPlayer.resultConfirmed,
      );

      if (teamAConfirmed && teamBConfirmed && baseMatch.status !== MATCH_STATUS.CONFIRMED) {
        return tx.match.update({
          where: { id: input.matchId },
          data: { status: MATCH_STATUS.CONFIRMED },
          include: { players: true },
        });
      }

      if ((!teamAConfirmed || !teamBConfirmed) && baseMatch.status !== MATCH_STATUS.PENDING) {
        return tx.match.update({
          where: { id: input.matchId },
          data: { status: MATCH_STATUS.PENDING },
          include: { players: true },
        });
      }

      return baseMatch;
    });

    if (!updatedMatch) {
      throw new Error("match-update-failed");
    }

    revalidatePath(`/match/${input.matchId}`);

    return { status: "ok" };
  } catch (error) {
    if (error instanceof Error && error.message === "not-authorized") {
      return { status: "error", message: "You cannot update a match you are not part of." };
    }
    console.error("submitMatchResultAction failed", error);
    return {
      status: "error",
      message: "We could not save the result. Please try again.",
    };
  }
}

interface UpdateMatchDetailsInput {
  matchId: string;
  club?: string | null;
  courtNumber?: string | null;
  notes?: string | null;
}

export async function updateMatchDetailsAction(input: UpdateMatchDetailsInput): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "You must be signed in to update the match." };
  }

  if (!input.matchId || input.matchId.trim().length === 0) {
    return { status: "error", message: "Invalid match identifier." };
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id: input.matchId },
      select: { creatorId: true },
    });

    if (!match) {
      return { status: "error", message: "Match not found." };
    }

    if (match.creatorId !== session.user.id) {
      return { status: "error", message: "Only the creator can edit the match." };
    }

    await prisma.match.update({
      where: { id: input.matchId },
      data: {
        club: input.club === undefined ? undefined : input.club?.trim() || null,
        courtNumber: input.courtNumber === undefined ? undefined : input.courtNumber?.trim() || null,
        notes: input.notes === undefined ? undefined : input.notes?.trim() || null,
      },
    });

    revalidatePath(`/match/${input.matchId}`);

    return { status: "ok" };
  } catch (error) {
    console.error("updateMatchDetailsAction failed", error);
    return {
      status: "error",
      message: "We could not update the match details.",
    };
  }
}

export async function confirmMatchResultAction(matchId: string): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "You must be signed in to confirm the result." };
  }

  if (!matchId || matchId.trim().length === 0) {
    return { status: "error", message: "Invalid match identifier." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const player = await tx.matchPlayer.findFirst({
        where: { matchId, userId: session.user.id },
      });

      if (!player) {
        throw new Error("not-authorized");
      }

      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: { players: true },
      });

      if (!match) {
        throw new Error("match-not-found");
      }

      if (!match.score || match.score.trim().length === 0) {
        throw new Error("missing-score");
      }

      if (player.resultConfirmed) {
        return match;
      }

      const updated = await tx.match.update({
        where: { id: matchId },
        data: {
          players: {
            update: {
              where: { id: player.id },
              data: { resultConfirmed: true },
            },
          },
        },
        include: { players: true },
      });

      const everyoneConfirmed = updated.players.every((current) => current.resultConfirmed);

      if (everyoneConfirmed && updated.status !== MATCH_STATUS.CONFIRMED) {
        return tx.match.update({
          where: { id: matchId },
          data: { status: MATCH_STATUS.CONFIRMED },
          include: { players: true },
        });
      }

      return updated;
    });

    revalidatePath(`/match/${matchId}`);

    return { status: "ok" };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "not-authorized") {
        return { status: "error", message: "Solo los jugadores pueden confirmar el resultado." };
      }
      if (error.message === "match-not-found") {
        return { status: "error", message: "No encontramos este partido." };
      }
      if (error.message === "missing-score") {
        return { status: "error", message: "Primero cargá el resultado antes de confirmarlo." };
      }
    }

    console.error("confirmMatchResultAction failed", error);
    return {
      status: "error",
      message: "No pudimos confirmar tu asistencia. Intentá de nuevo.",
    };
  }
}

export async function finalizeMatchAction(matchId: string): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "You must be signed in to finalize the match." };
  }

  if (!matchId || matchId.trim().length === 0) {
    return { status: "error", message: "Invalid match identifier." };
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: true },
    });

    if (!match) {
      return { status: "error", message: "Match not found." };
    }

    if (match.creatorId !== session.user.id) {
      return { status: "error", message: "Only the creator can finalize the match." };
    }

    if (!match.score || match.score.trim().length === 0) {
      return { status: "error", message: "Cargá el resultado antes de finalizar el partido." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.match.update({
        where: { id: matchId },
        data: {
          status: MATCH_STATUS.CONFIRMED,
          players: {
            updateMany: {
              where: { matchId },
              data: { resultConfirmed: true },
            },
          },
        },
      });
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

interface ReleaseMatchSlotInput {
  playerId: string;
  displayName?: string | null;
}

export async function releaseMatchSlotAction(input: ReleaseMatchSlotInput): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "Tenés que iniciar sesión para gestionar el partido." };
  }

  if (!input.playerId || input.playerId.trim().length === 0) {
    return { status: "error", message: "Identificador de cupo inválido." };
  }

  try {
    const player = await prisma.matchPlayer.findUnique({
      where: { id: input.playerId },
      include: {
        match: true,
        user: true,
      },
    });

    if (!player) {
      return { status: "error", message: "No encontramos ese cupo." };
    }

    if (player.match.creatorId !== session.user.id) {
      return { status: "error", message: "Solo el organizador puede liberar un cupo." };
    }

    const trimmedName = input.displayName?.trim();
    const nextDisplayName =
      trimmedName && trimmedName.length > 0
        ? trimmedName
        : player.displayName ?? player.user?.displayName ?? null;

    await prisma.matchPlayer.update({
      where: { id: input.playerId },
      data: {
        userId: null,
        displayName: nextDisplayName,
        joinedAt: null,
        resultConfirmed: false,
      },
    });

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

export async function renamePlaceholderAction(input: RenamePlaceholderInput): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "Tenés que iniciar sesión para gestionar el partido." };
  }

  const trimmedName = input.displayName?.trim();
  if (!trimmedName || trimmedName.length === 0) {
    return { status: "error", message: "Ingresá un nombre válido." };
  }

  try {
    const player = await prisma.matchPlayer.findUnique({
      where: { id: input.playerId },
      include: { match: true },
    });

    if (!player) {
      return { status: "error", message: "No encontramos ese cupo." };
    }

    if (player.match.creatorId !== session.user.id) {
      return { status: "error", message: "Solo el organizador puede editar los nombres." };
    }

    if (player.userId) {
      return { status: "error", message: "No podés renombrar un jugador ya asignado." };
    }

    await prisma.matchPlayer.update({
      where: { id: input.playerId },
      data: { displayName: trimmedName },
    });

    revalidatePath(`/match/${player.matchId}`);

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

export async function updateTeamLabelAction(input: UpdateTeamLabelInput): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "Tenés que iniciar sesión para gestionar el partido." };
  }

  const trimmedLabel = input.label?.trim();
  if (!trimmedLabel || trimmedLabel.length === 0) {
    return { status: "error", message: "Ingresá un nombre válido para el equipo." };
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id: input.matchId },
      select: { id: true, creatorId: true },
    });

    if (!match) {
      return { status: "error", message: "No encontramos el partido." };
    }

    if (match.creatorId !== session.user.id) {
      return { status: "error", message: "Solo el organizador puede renombrar equipos." };
    }

    const linkedPlayers = await prisma.matchPlayer.count({
      where: { matchId: input.matchId, teamId: input.teamId },
    });

    if (linkedPlayers === 0) {
      return { status: "error", message: "El equipo no pertenece a este partido." };
    }

    await prisma.team.update({
      where: { id: input.teamId },
      data: { label: trimmedLabel },
    });

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

export async function joinMatchPlayerAction(playerId: string): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "Necesitás iniciar sesión con Google." };
  }

  if (!playerId || playerId.trim().length === 0) {
    return { status: "error", message: "Identificador de cupo inválido." };
  }

  try {
    const player = await prisma.matchPlayer.findUnique({
      where: { id: playerId },
      include: { match: true },
    });

    if (!player) {
      return { status: "error", message: "No encontramos este cupo." };
    }

    if (player.match.status !== MATCH_STATUS.PENDING) {
      return { status: "error", message: "El partido ya no admite nuevas confirmaciones." };
    }

    if (player.userId) {
      return { status: "error", message: "Cupo ocupado, hablá con el organizador del partido." };
    }

    const alreadyJoined = await prisma.matchPlayer.findFirst({
      where: {
        matchId: player.matchId,
        userId: session.user.id,
      },
    });

    if (alreadyJoined) {
      return { status: "error", message: "Ya estás inscripto en este partido." };
    }

    await prisma.matchPlayer.update({
      where: { id: playerId },
      data: {
        userId: session.user.id,
        displayName: null,
        joinedAt: new Date(),
        resultConfirmed: false,
      },
    });

    revalidatePath(`/match/${player.matchId}`);
    revalidatePath(`/j/${playerId}`);

    return { status: "ok" };
  } catch (error) {
    console.error("joinMatchPlayerAction failed", error);
    return {
      status: "error",
      message: "No pudimos unir al jugador. Intentá nuevamente.",
    };
  }
}
