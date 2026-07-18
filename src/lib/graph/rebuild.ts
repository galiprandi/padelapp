import { db } from "@/db";
import { playerEdges, playerGraphStats, matches, matchPlayers } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import {
  computeSkillScores,
  computeCommunities,
  computePlayerSideStats,
  computeNetworkSize,
  applyFeedbackToScore,
  type ConfirmedMatchInfo,
} from "./engine";
import { updateEdgesForMatch } from "./update";

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

  // 3. Recompute all stats
  await recomputeAllStats();
}

// ---------------------------------------------------------------------------
// Recompute all player graph stats (scores, communities, side, network)
// ---------------------------------------------------------------------------

export async function recomputeAllStats(): Promise<void> {
  const scores = await computeSkillScores();
  const communities = await computeCommunities();

  const allPlayers = new Set<string>([...scores.keys(), ...communities.keys()]);

  for (const userId of allPlayers) {
    const baseScore = scores.get(userId) ?? 1000;
    const adjustedScore = await applyFeedbackToScore(userId, baseScore);
    const community = communities.get(userId) ?? null;
    const { preferredSide, winRateRight, winRateLeft } = await computePlayerSideStats(userId);
    const networkSize = await computeNetworkSize(userId);

    const existing = await db
      .select()
      .from(playerGraphStats)
      .where(eq(playerGraphStats.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(playerGraphStats)
        .set({
          skillScore: adjustedScore,
          community,
          networkSize,
          preferredSide,
          winRateRight,
          winRateLeft,
          updatedAt: new Date(),
        })
        .where(eq(playerGraphStats.userId, userId));
    } else {
      await db.insert(playerGraphStats).values({
        userId,
        skillScore: adjustedScore,
        community,
        networkSize,
        preferredSide,
        winRateRight,
        winRateLeft,
      });
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

  const existing = await db
    .select()
    .from(playerGraphStats)
    .where(eq(playerGraphStats.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(playerGraphStats)
      .set({
        skillScore: adjustedScore,
        networkSize,
        preferredSide,
        winRateRight,
        winRateLeft,
        updatedAt: new Date(),
      })
      .where(eq(playerGraphStats.userId, userId));
  } else {
    await db.insert(playerGraphStats).values({
      userId,
      skillScore: adjustedScore,
      networkSize,
      preferredSide,
      winRateRight,
      winRateLeft,
    });
  }
}
