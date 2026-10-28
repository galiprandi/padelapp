import { db } from "@/db";
import { playerEdges, playerGraphStats, matches, matchPlayers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import {
  computeSkillScores,
  computeCommunities,
  computePlayerSideStats,
  computeNetworkSize,
  applyFeedbackToScore,
  type ConfirmedMatchInfo,
} from "./engine";
import { updateEdgesForMatch } from "./update";
import { rebuildTurnEdges } from "./turn-edges";

// ---------------------------------------------------------------------------
// Pure Helpers
// ---------------------------------------------------------------------------

/**
 * Pure helper: aggregates unique player IDs from scores and communities maps.
 */
export function getUniquePlayerIdsFromScoresAndCommunities(
  scores: Map<string, number>,
  communities: Map<string, number>,
): Set<string> {
  return new Set<string>([...scores.keys(), ...communities.keys()]);
}

export interface PlayerGraphStatsValues {
  skillScore: number;
  community: number | null;
  networkSize: number;
  preferredSide: "RIGHT" | "LEFT" | null;
  winRateRight: number | null;
  winRateLeft: number | null;
}

export interface PlayerGraphStatsUpdatePayload extends PlayerGraphStatsValues {
  updatedAt: Date;
}

export interface PlayerGraphStatsInsertPayload extends PlayerGraphStatsValues {
  userId: string;
}

export interface IncrementalPlayerGraphStatsUpdatePayload {
  skillScore: number;
  networkSize: number;
  preferredSide: "RIGHT" | "LEFT" | null;
  winRateRight: number | null;
  winRateLeft: number | null;
  updatedAt: Date;
}

/**
 * Pure helper: builds database update payload object for player graph stats.
 */
export function buildPlayerStatsUpdatePayload(
  values: PlayerGraphStatsValues,
  updatedAt: Date = new Date(),
): PlayerGraphStatsUpdatePayload {
  return {
    skillScore: values.skillScore,
    community: values.community,
    networkSize: values.networkSize,
    preferredSide: values.preferredSide,
    winRateRight: values.winRateRight,
    winRateLeft: values.winRateLeft,
    updatedAt,
  };
}

/**
 * Pure helper: builds database insert payload object for player graph stats.
 */
export function buildPlayerStatsInsertPayload(
  userId: string,
  values: PlayerGraphStatsValues,
): PlayerGraphStatsInsertPayload {
  return {
    userId,
    skillScore: values.skillScore,
    community: values.community,
    networkSize: values.networkSize,
    preferredSide: values.preferredSide,
    winRateRight: values.winRateRight,
    winRateLeft: values.winRateLeft,
  };
}

/**
 * Pure helper: builds database update payload object for incremental player graph stats.
 */
export function buildIncrementalPlayerStatsUpdatePayload(
  skillScore: number,
  networkSize: number,
  preferredSide: "RIGHT" | "LEFT" | null,
  winRateRight: number | null,
  winRateLeft: number | null,
  updatedAt: Date = new Date(),
): IncrementalPlayerGraphStatsUpdatePayload {
  return {
    skillScore,
    networkSize,
    preferredSide,
    winRateRight,
    winRateLeft,
    updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Rebuild entire graph from scratch
// ---------------------------------------------------------------------------

export async function rebuildEntireGraph(): Promise<void> {
  // 1. Clear existing edges and stats
  await db.delete(playerEdges);
  await db.delete(playerGraphStats);

  // 2. Load all confirmed matches with players
  const confirmedMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.status, "CONFIRMED"))
    .orderBy(asc(matches.date));

  for (const match of confirmedMatches) {
    const players = await db
      .select()
      .from(matchPlayers)
      .where(eq(matchPlayers.matchId, match.id))
      .orderBy(asc(matchPlayers.position));

    const matchInfo: ConfirmedMatchInfo = {
      id: match.id,
      score: match.score,
      date: match.date,
      players: players.map((p) => ({
        userId: p.userId,
        position: p.position,
        teamId: p.teamId,
        side: p.side,
      })),
    };

    await updateEdgesForMatch(matchInfo);
  }

  // 3. Rebuild turn-based co-inscription edges (turnsTogether / lastTurnAt)
  //    from historical TurnPlayer + TurnSubstitute records. This signal does
  //    NOT feed the skill score (no outcome) — only salvage scoring.
  await rebuildTurnEdges();

  // 4. Recompute all stats
  await recomputeAllStats();
}

// ---------------------------------------------------------------------------
// Recompute all player graph stats (scores, communities, side, network)
// ---------------------------------------------------------------------------

export async function recomputeAllStats(): Promise<void> {
  const scores = await computeSkillScores();
  const communities = await computeCommunities();

  const allPlayers = getUniquePlayerIdsFromScoresAndCommunities(scores, communities);

  for (const userId of allPlayers) {
    const baseScore = scores.get(userId) ?? 1000;
    const adjustedScore = await applyFeedbackToScore(userId, baseScore);
    const community = communities.get(userId) ?? null;
    const { preferredSide, winRateRight, winRateLeft } = await computePlayerSideStats(userId);
    const networkSize = await computeNetworkSize(userId);

    const statsValues: PlayerGraphStatsValues = {
      skillScore: adjustedScore,
      community,
      networkSize,
      preferredSide,
      winRateRight,
      winRateLeft,
    };

    const existing = await db
      .select()
      .from(playerGraphStats)
      .where(eq(playerGraphStats.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(playerGraphStats)
        .set(buildPlayerStatsUpdatePayload(statsValues))
        .where(eq(playerGraphStats.userId, userId));
    } else {
      await db.insert(playerGraphStats).values(buildPlayerStatsInsertPayload(userId, statsValues));
    }
  }
}

// ---------------------------------------------------------------------------
// Recompute stats for a specific player only (incremental)
// ---------------------------------------------------------------------------

export async function recomputeStatsForPlayer(userId: string): Promise<void> {
  const scores = await computeSkillScores();
  const baseScore = scores.get(userId) ?? 1000;
  const adjustedScore = await applyFeedbackToScore(userId, baseScore);
  const { preferredSide, winRateRight, winRateLeft } = await computePlayerSideStats(userId);
  const networkSize = await computeNetworkSize(userId);

  const statsValues: PlayerGraphStatsValues = {
    skillScore: adjustedScore,
    community: null,
    networkSize,
    preferredSide,
    winRateRight,
    winRateLeft,
  };

  const existing = await db
    .select()
    .from(playerGraphStats)
    .where(eq(playerGraphStats.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(playerGraphStats)
      .set(buildIncrementalPlayerStatsUpdatePayload(adjustedScore, networkSize, preferredSide, winRateRight, winRateLeft))
      .where(eq(playerGraphStats.userId, userId));
  } else {
    const existingCommunity = existing[0]?.community ?? null;
    await db.insert(playerGraphStats).values(
      buildPlayerStatsInsertPayload(userId, {
        ...statsValues,
        community: existingCommunity,
      }),
    );
  }
}
