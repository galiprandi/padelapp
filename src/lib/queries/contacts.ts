import { db } from "@/db";
import {
  matches as matchesTable,
  turns as turnsTable,
  users,
  playerEdges,
  playerGraphStats,
  matchPlayerFeedback,
} from "@/db/schema";
import { eq, and, gte, desc, inArray, or } from "drizzle-orm";
import { userInMatch } from "./helpers";
import { cacheLife, cacheTag } from "next/cache";
import { calculateTurnRescueProximity } from "@/app/network/graph-utils";
import type { GraphLink } from "@/app/network/actions";

export interface PadelContact {
  id: string;
  displayName: string;
  alias: string | null;
  image: string | null;
  lastMatchAt: Date;
  matchesTogether: number;
  proximityTier?: string;
  proximitySummary?: string;
  badgeStyle?: string;
}

/**
 * Pure helper: calculates the priority score for a candidate network contact
 * based on direct matches, turns together, and recency of last interaction.
 */
export function calculateNetworkContactPriorityScore(
  matchesAsRivals: number,
  matchesAsPartners: number,
  turnsTogether: number,
  lastInteraction: Date | null
): number {
  const matchStrength = matchesAsRivals + matchesAsPartners;
  let edgeScore = matchStrength * 10;

  // Add co-inscription signal (turnsTogether)
  edgeScore += turnsTogether * 5;

  if (lastInteraction) {
    const daysSince = (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 30) edgeScore += 50;
    else if (daysSince < 60) edgeScore += 30;
    else if (daysSince < 120) edgeScore += 15;
  }

  return edgeScore;
}

/**
 * Pure helper: checks if a candidate has an extreme rival outcome ratio (>85% or <15%)
 * against an enrolled player for at least 2 rival matches.
 */
export function isExtremeRivalOutcome(
  candidateWins: number,
  rivalMatches: number
): boolean {
  if (rivalMatches < 2) return false;
  const outcome = candidateWins / rivalMatches;
  return outcome > 0.85 || outcome < 0.15;
}

/**
 * Pure helper: determines which court side is needed for an open turn based on
 * enrolled player court side counts.
 */
export function determineTurnNeededCourtSide(
  rightCount: number,
  leftCount: number
): "RIGHT" | "LEFT" | null {
  if (rightCount > leftCount) return "LEFT";
  if (leftCount > rightCount) return "RIGHT";
  return null;
}

/**
 * Pure helper: calculates the proximity bonus score for a candidate based on skill score difference
 * and court side preference alignment with the open turn's needed side.
 */
export function calculateCandidateProximityBonus(
  candScore: number,
  avgEnrolledSkillScore: number,
  preferredSide: string | null | undefined,
  neededSide: "RIGHT" | "LEFT" | null
): number {
  const skillDiff = Math.abs(candScore - avgEnrolledSkillScore);

  let proximityScore = 0;
  if (skillDiff <= 100) proximityScore += 60;
  else if (skillDiff <= 200) proximityScore += 30;
  else if (skillDiff > 350) proximityScore -= 50;

  let sideScore = 0;
  if (neededSide && preferredSide === neededSide) {
    sideScore += 40;
  }

  return proximityScore + sideScore;
}

export interface CandidateFeedbackAdjustmentResult {
  scoreAdjustments: Map<string, number>;
  excludedUserIds: Set<string>;
}

/**
 * Pure helper: aggregates post-match feedback given by enrolled turn participants,
 * calculates candidate score penalties for net negative feedback, and flags candidates
 * with severe net negative feedback (>= 2) for exclusion.
 */
export function calculateCandidateFeedbackAdjustment(
  feedbackRows: Array<{ playerId: string; feedback: string }>,
  participantUserIds: Set<string>
): CandidateFeedbackAdjustmentResult {
  const candidateFeedbackMap = new Map<string, { weakerCount: number; strongerCount: number }>();
  for (const f of feedbackRows) {
    if (participantUserIds.has(f.playerId)) continue;
    const stats = candidateFeedbackMap.get(f.playerId) ?? { weakerCount: 0, strongerCount: 0 };
    if (f.feedback === "WEAKER") stats.weakerCount++;
    if (f.feedback === "STRONGER") stats.strongerCount++;
    candidateFeedbackMap.set(f.playerId, stats);
  }

  const scoreAdjustments = new Map<string, number>();
  const excludedUserIds = new Set<string>();

  for (const [candidateId, fb] of candidateFeedbackMap.entries()) {
    if (fb.weakerCount > 0) {
      const netNegative = fb.weakerCount - fb.strongerCount;
      if (netNegative > 0) {
        scoreAdjustments.set(candidateId, -netNegative * 150);
        if (netNegative >= 2) {
          excludedUserIds.add(candidateId);
        }
      }
    }
  }

  return { scoreAdjustments, excludedUserIds };
}

/**
 * Pure helper: converts raw database playerEdges into GraphLink structures.
 */
export function convertEdgesToGraphLinks(
  edges: Array<typeof playerEdges.$inferSelect>
): GraphLink[] {
  return edges.map((e) => ({
    source: e.playerAId,
    target: e.playerBId,
    rivalMatches: e.matchesAsRivals,
    partnerMatches: e.matchesAsPartners,
    winsA: e.winsA,
    winsB: e.winsB,
    winsTogether: e.winsTogether,
    lossesTogether: e.lossesTogether,
    turnsTogether: e.turnsTogether,
    strength: e.matchesAsRivals + e.matchesAsPartners + e.turnsTogether,
  }));
}

/**
 * Pure helper: formats raw playerGraphStats rows for enrolled turn players
 * into structured proximity calculation inputs.
 */
export function formatEnrolledPlayersInput(
  enrolledStats: Array<typeof playerGraphStats.$inferSelect>
): Array<{
  id: string;
  skillScore: number | null;
  preferredSide: "RIGHT" | "LEFT" | "BOTH" | null | string;
  community: number | null;
}> {
  return enrolledStats.map((s) => ({
    id: s.userId,
    skillScore: s.skillScore,
    preferredSide: s.preferredSide,
    community: s.community,
  }));
}

/**
 * Pure helper: maps candidate users, candidate scores, direct match stats, and proximity calculations
 * into a sorted PadelContact list ordered by recommendation score descending.
 */
export function buildTurnNetworkContactsList(
  candidatesData: Array<{
    id: string;
    displayName: string;
    alias: string | null;
    image: string | null;
  }>,
  candidateScores: Map<string, number>,
  candidateDirectMatches: Map<string, { lastMatchAt: Date; matchesTogether: number }>,
  candidateStatsMap: Map<string, typeof playerGraphStats.$inferSelect>,
  enrolledPlayersInput: Array<{
    id: string;
    skillScore: number | null;
    preferredSide: "RIGHT" | "LEFT" | "BOTH" | null | string;
    community: number | null;
  }>,
  graphLinks: GraphLink[]
): PadelContact[] {
  const mappedContacts: Array<PadelContact & { score: number }> = candidatesData.map((u) => {
    const directInfo = candidateDirectMatches.get(u.id);
    const score = candidateScores.get(u.id) ?? 0;
    const stats = candidateStatsMap.get(u.id);

    const proximity = calculateTurnRescueProximity(
      {
        id: u.id,
        skillScore: stats?.skillScore ?? 1000,
        preferredSide: stats?.preferredSide ?? null,
        community: stats?.community ?? null,
      },
      enrolledPlayersInput,
      graphLinks
    );

    return {
      id: u.id,
      displayName: u.displayName,
      alias: u.alias,
      image: u.image,
      lastMatchAt: directInfo?.lastMatchAt ?? new Date(0),
      matchesTogether: directInfo?.matchesTogether ?? 0,
      proximityTier: proximity.proximityTier,
      proximitySummary: proximity.formattedSummary,
      badgeStyle: proximity.badgeStyle,
      score,
    };
  });

  mappedContacts.sort((a, b) => b.score - a.score);

  return mappedContacts.map((contact) => {
    const { score, ...rest } = contact;
    void score;
    return rest;
  });
}

export interface NetworkContactSummary {
  matchCountText: string;
  recencyText: string;
  badgeText: string;
  ariaLabel: string;
}

/**
 * Pure helper: returns standardized solid MDS badge text for a network contact based on match frequency.
 */
export function getNetworkContactBadgeText(matchesTogether: number): string {
  if (matchesTogether >= 10) return "Dupla habitual 🏆";
  if (matchesTogether >= 5) return "Frecuente 🤝";
  if (matchesTogether >= 1) return "Contacto de red 🎾";
  return "Nuevo contacto 🌱";
}

/**
 * Pure helper: returns standardized solid MDS badge style classes for a network contact based on match frequency.
 */
export function getNetworkContactBadgeStyle(matchesTogether: number): string {
  if (matchesTogether >= 10) {
    return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800";
  }
  if (matchesTogether >= 5) {
    return "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800";
  }
  if (matchesTogether >= 1) {
    return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800";
  }
  return "bg-muted text-muted-foreground border-border";
}

/**
 * Pure helper: returns formatted match count text for network contact summary.
 */
export function getNetworkContactMatchCountText(matchesTogether: number): string {
  return matchesTogether === 1 ? "1 partido" : `${matchesTogether} partidos`;
}

/**
 * Pure helper: formats last match date in Argentine locale format (es-AR).
 */
export function getNetworkContactFormattedDate(
  date: Date | string | number | null | undefined
): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime()) || d.getTime() === 0) return "";
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

/**
 * Pure helper: formats padel contact information into standardized UI texts
 * (match count, recency, solid MDS badge text, and accessible ARIA label).
 */
export function formatNetworkContactSummary(
  contact: PadelContact
): NetworkContactSummary {
  const matchCountText = getNetworkContactMatchCountText(contact.matchesTogether);
  const badgeText = getNetworkContactBadgeText(contact.matchesTogether);
  const recencyText = getNetworkContactFormattedDate(contact.lastMatchAt);
  const ariaLabel = calculatePadelContactAriaLabel(contact);

  return {
    matchCountText,
    recencyText,
    badgeText,
    ariaLabel,
  };
}

/**
 * Calculates a descriptive, accessible Argentine Spanish ARIA label for a padel contact card,
 * including name/alias, shared matches count, and formatted date of last match.
 */
export function calculatePadelContactAriaLabel(contact: PadelContact): string {
  const name = contact.alias || contact.displayName || "Jugador";
  const matchText =
    contact.matchesTogether === 1
      ? "1 partido compartido"
      : `${contact.matchesTogether} partidos compartidos`;

  // Coerce: payloads crossing a serialization boundary may arrive as ISO strings.
  const lastMatchAt = contact.lastMatchAt ? new Date(contact.lastMatchAt) : null;
  const dateStr =
    lastMatchAt && lastMatchAt.getTime() > 0
      ? ` Último partido el ${lastMatchAt.toLocaleDateString("es-AR", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
          timeZone: "America/Argentina/Buenos_Aires",
        })}.`
      : "";

  const proximityText =
    contact.proximityTier && contact.proximitySummary
      ? ` Compatibilidad de salvataje: ${contact.proximityTier}. ${contact.proximitySummary}.`
      : contact.proximityTier
        ? ` Compatibilidad de salvataje: ${contact.proximityTier}.`
        : "";

  return `${name}: ${matchText}.${dateStr}${proximityText}`;
}

/**
 * Get a user's padel contacts — players they shared a confirmed match with
 * within the last 12 months. Includes both teammates and opponents.
 */
export async function getPadelContacts(
  userId: string,
  options?: { monthsBack?: number }
): Promise<PadelContact[]> {
  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    return [
      {
        id: "p-02",
        displayName: "Fernando Belasteguín",
        alias: "Bela",
        image: null,
        lastMatchAt: new Date(),
        matchesTogether: 12,
      },
      {
        id: "p-03",
        displayName: "Diego Morales",
        alias: "Gero",
        image: null,
        lastMatchAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        matchesTogether: 8,
      },
      {
        id: "p-04",
        displayName: "Facundo Lopez",
        alias: "Facu",
        image: null,
        lastMatchAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        matchesTogether: 6,
      },
    ];
  }
  const monthsBack = options?.monthsBack ?? 12;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - monthsBack);

  // Find all confirmed matches where this user played, within the cutoff
  const matches = await db.query.matches.findMany({
    where: and(
      eq(matchesTable.status, "CONFIRMED"),
      gte(matchesTable.date, cutoff),
      userInMatch(userId),
    ),
    with: {
      players: {
        with: {
          user: {
            columns: {
              id: true,
              displayName: true,
              alias: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: desc(matchesTable.date),
  });

  return buildContactsMap(matches, userId);
}

/**
 * Get the combined padel network for all enrolled players in a turn.
 * Used for "Open to my network" — notifies contacts of ALL enrollees,
 * not just the organizer. Excludes already-enrolled users.
 *
 * Uses the player graph to prioritize contacts:
 * 1. Direct contacts (distance 1 in the graph)
 * 2. Same community cluster (cercanía de nivel)
 * 3. Prioritized by connection strength (frequency) and recency
 * 4. Exclude rivals with extreme outcome (>85% or <15%)
 */
export async function getTurnNetworkContacts(turnId: string): Promise<PadelContact[]> {
  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    return [
      {
        id: "p-03",
        displayName: "Diego Morales",
        alias: "Gero",
        image: null,
        lastMatchAt: new Date(),
        matchesTogether: 5,
        proximityTier: "Ideal 🎯",
        proximitySummary: "Score cercano (dif. 50) · Equilibra posición en cancha",
        badgeStyle:
          "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
      },
      {
        id: "p-04",
        displayName: "Facundo Lopez",
        alias: "Facu",
        image: null,
        lastMatchAt: new Date(),
        matchesTogether: 3,
        proximityTier: "Buena opción 👍",
        proximitySummary: "Score cercano (dif. 20) · Posición abierta",
        badgeStyle:
          "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800",
      },
    ];
  }

  const [turn] = await db.query.turns.findMany({
    where: eq(turnsTable.id, turnId),
    with: {
      players: {
        columns: {
          userId: true,
        },
      },
      substitutes: {
        columns: {
          userId: true,
        },
      },
    },
    limit: 1,
  });

  if (!turn || turn.players.length === 0) return [];

  const enrolledUserIds = new Set(turn.players.map((p) => p.userId));
  const substituteUserIds = new Set(turn.substitutes?.map((s) => s.userId) ?? []);
  const participantUserIds = new Set([...enrolledUserIds, ...substituteUserIds]);
  const enrolledArray = Array.from(enrolledUserIds);

  // 1. Get graph stats for enrolled players (to find their communities)
  const enrolledStats = await db
    .select()
    .from(playerGraphStats)
    .where(inArray(playerGraphStats.userId, enrolledArray));

  const enrolledCommunities = Array.from(
    new Set(
      enrolledStats
        .map((s) => s.community)
        .filter((c): c is number => c !== null)
    )
  );

  // 2. Fetch all edges involving any of the enrolled players
  const edges = await db
    .select()
    .from(playerEdges)
    .where(
      or(
        inArray(playerEdges.playerAId, enrolledArray),
        inArray(playerEdges.playerBId, enrolledArray)
      )
    );

  // 3. Fetch stats of players in the same community (community players)
  let communityPlayersStats: typeof playerGraphStats.$inferSelect[] = [];
  if (enrolledCommunities.length > 0) {
    communityPlayersStats = await db
      .select()
      .from(playerGraphStats)
      .where(inArray(playerGraphStats.community, enrolledCommunities));
  }

  // Fetch feedback signal given by enrolled turn participants
  const feedbackRows = enrolledArray.length > 0
    ? await db
        .select()
        .from(matchPlayerFeedback)
        .where(inArray(matchPlayerFeedback.feedbackBy, enrolledArray))
    : [];

  // 4. Score and filter candidates
  const candidateScores = new Map<string, number>();
  const candidateDirectMatches = new Map<string, { lastMatchAt: Date; matchesTogether: number }>();
  const validConnectionsForCandidate = new Map<string, Set<string>>(); // candidateId -> enrolledPlayerIds where connection is valid
  const excludedUserIds = new Set<string>(); // candidateIds that have an extreme outcome against ANY enrolled player

  // Process direct contacts (edges)
  for (const edge of edges) {
    const isPlayerAEnrolled = enrolledUserIds.has(edge.playerAId);
    const isPlayerBEnrolled = enrolledUserIds.has(edge.playerBId);

    // If both are enrolled, skip
    if (isPlayerAEnrolled && isPlayerBEnrolled) continue;

    const enrolledId = isPlayerAEnrolled ? edge.playerAId : edge.playerBId;
    const candidateId = isPlayerAEnrolled ? edge.playerBId : edge.playerAId;

    // Skip if candidate is already part of the turn (either as player or substitute)
    if (participantUserIds.has(candidateId)) continue;

    // Check extreme outcome exclusion
    const candidateWins = candidateId === edge.playerAId ? edge.winsA : edge.winsB;
    if (isExtremeRivalOutcome(candidateWins, edge.matchesAsRivals)) {
      excludedUserIds.add(candidateId);
      continue;
    }

    // Mark as valid connection
    if (!validConnectionsForCandidate.has(candidateId)) {
      validConnectionsForCandidate.set(candidateId, new Set());
    }
    validConnectionsForCandidate.get(candidateId)!.add(enrolledId);

    const lastInteraction = edge.lastTurnAt && edge.lastMatchAt
      ? (edge.lastTurnAt > edge.lastMatchAt ? edge.lastTurnAt : edge.lastMatchAt)
      : (edge.lastTurnAt ?? edge.lastMatchAt);

    const edgeScore = calculateNetworkContactPriorityScore(
      edge.matchesAsRivals,
      edge.matchesAsPartners,
      edge.turnsTogether,
      lastInteraction
    );

    const currentScore = candidateScores.get(candidateId) ?? 0;
    candidateScores.set(candidateId, currentScore + edgeScore);

    // Keep track of total connections (matches + turns) and last interaction date
    const totalStrength = edge.matchesAsRivals + edge.matchesAsPartners + edge.turnsTogether;
    const existingDirect = candidateDirectMatches.get(candidateId);
    const edgeLastDate = lastInteraction ? new Date(lastInteraction) : new Date(0);
    if (existingDirect) {
      existingDirect.matchesTogether += totalStrength;
      if (edgeLastDate > existingDirect.lastMatchAt) {
        existingDirect.lastMatchAt = edgeLastDate;
      }
    } else {
      candidateDirectMatches.set(candidateId, {
        lastMatchAt: edgeLastDate,
        matchesTogether: totalStrength,
      });
    }
  }

  // Process same community players
  for (const stats of communityPlayersStats) {
    const candidateId = stats.userId;
    if (participantUserIds.has(candidateId)) continue;
    if (excludedUserIds.has(candidateId)) continue;

    // Community bonus
    const currentScore = candidateScores.get(candidateId) ?? 0;
    candidateScores.set(candidateId, currentScore + 100);
  }

  // Process feedback signal given by enrolled turn participants
  const feedbackAdjustment = calculateCandidateFeedbackAdjustment(feedbackRows, participantUserIds);
  for (const [candidateId, penalty] of feedbackAdjustment.scoreAdjustments.entries()) {
    const currentScore = candidateScores.get(candidateId) ?? 0;
    candidateScores.set(candidateId, currentScore + penalty);
  }
  for (const excludedId of feedbackAdjustment.excludedUserIds) {
    excludedUserIds.add(excludedId);
  }

  // Process Skill Proximity & Side Preference Synergy
  const activeCandidateIds = Array.from(candidateScores.keys()).filter(
    (id) => !excludedUserIds.has(id)
  );

  if (activeCandidateIds.length > 0) {
    const candidateStatsRows = await db
      .select()
      .from(playerGraphStats)
      .where(inArray(playerGraphStats.userId, activeCandidateIds));

    const candidateStatsMap = new Map(candidateStatsRows.map((s) => [s.userId, s]));

    const validEnrolledScores = enrolledStats
      .map((s) => s.skillScore)
      .filter((s): s is number => s !== null);

    const avgEnrolledSkillScore =
      validEnrolledScores.length > 0
        ? validEnrolledScores.reduce((sum, val) => sum + val, 0) / validEnrolledScores.length
        : 1000;

    let rightCount = 0;
    let leftCount = 0;
    for (const s of enrolledStats) {
      if (s.preferredSide === "RIGHT") rightCount++;
      if (s.preferredSide === "LEFT") leftCount++;
    }

    const neededSide = determineTurnNeededCourtSide(rightCount, leftCount);

    for (const candidateId of activeCandidateIds) {
      const stats = candidateStatsMap.get(candidateId);
      const candScore = stats?.skillScore ?? 1000;
      const proximityBonus = calculateCandidateProximityBonus(
        candScore,
        avgEnrolledSkillScore,
        stats?.preferredSide,
        neededSide
      );

      const currentScore = candidateScores.get(candidateId) ?? 0;
      candidateScores.set(candidateId, currentScore + proximityBonus);
    }
  }

  // We keep candidates that have either:
  // - A valid connection with at least one enrolled player (not excluded due to extreme outcome)
  // - Or are in the same community (even if no direct edge exists yet)
  // Filter out any candidates that have an extreme outcome against ANY enrolled player
  const finalCandidateIds = Array.from(candidateScores.keys()).filter(
    (id) => !excludedUserIds.has(id)
  );

  if (finalCandidateIds.length === 0) return [];

  // Convert edges to GraphLink structure for proximity calculation
  const graphLinks = convertEdgesToGraphLinks(edges);
  const enrolledPlayersInput = formatEnrolledPlayersInput(enrolledStats);

  // Fetch candidate stats for proximity calculation
  const candidateStatsRows = await db
    .select()
    .from(playerGraphStats)
    .where(inArray(playerGraphStats.userId, finalCandidateIds));

  const candidateStatsMap = new Map(candidateStatsRows.map((s) => [s.userId, s]));

  // 5. Fetch user profile data for all candidates
  const candidatesData = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      alias: users.alias,
      image: users.image,
    })
    .from(users)
    .where(inArray(users.id, finalCandidateIds));

  // 6. Map to PadelContact and sort by score
  return buildTurnNetworkContactsList(
    candidatesData,
    candidateScores,
    candidateDirectMatches,
    candidateStatsMap,
    enrolledPlayersInput,
    graphLinks
  );
}

type ContactMatchPlayer = {
  user: {
    id: string;
    displayName: string;
    alias: string | null;
    image: string | null;
  } | null;
};

type ContactMatch = {
  date: Date;
  players: ContactMatchPlayer[];
};

/**
 * Shared helper: builds a sorted contacts map from a list of matches.
 * Excludes the user themselves (single-user mode) or all enrolled users (turn mode).
 */
export function buildContactsMap(
  matches: ContactMatch[],
  excludeIds: string | Set<string>,
): PadelContact[] {
  const excludeSet = typeof excludeIds === "string" ? new Set([excludeIds]) : excludeIds;

  const contactsMap = new Map<string, PadelContact>();

  for (const match of matches) {
    for (const player of match.players) {
      if (!player.user || excludeSet.has(player.user.id)) continue;

      const existing = contactsMap.get(player.user.id);
      if (existing) {
        existing.matchesTogether++;
        if (match.date > existing.lastMatchAt) {
          existing.lastMatchAt = match.date;
        }
      } else {
        contactsMap.set(player.user.id, {
          id: player.user.id,
          displayName: player.user.displayName,
          alias: player.user.alias,
          image: player.user.image,
          lastMatchAt: match.date,
          matchesTogether: 1,
        });
      }
    }
  }

  return Array.from(contactsMap.values()).sort(
    (a, b) => b.lastMatchAt.getTime() - a.lastMatchAt.getTime()
  );
}

/**
 * Cached version of getPadelContacts.
 * Keyed by userId and monthsBack. Invalidated by revalidateTag("matches").
 * Fallback revalidate: 60s.
 */
export async function getCachedPadelContacts(userId: string, options?: { monthsBack?: number }) {
  "use cache";
  cacheTag("matches");
  cacheLife({ revalidate: 60 });
  return getPadelContacts(userId, options);
}

/**
 * Cached version of getTurnNetworkContacts.
 * Keyed by turnId. Invalidated by revalidateTag("turns").
 * Fallback revalidate: 30s.
 */
export async function getCachedTurnNetworkContacts(turnId: string) {
  "use cache";
  cacheTag("turns");
  cacheLife({ revalidate: 30 });
  return getTurnNetworkContacts(turnId);
}
