import { db } from "@/db";
import {
  playerEdges,
  playerGraphStats,
  matchPlayerFeedback,
} from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { getMatchWinner } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MatchPlayerInfo {
  userId: string | null;
  position: number;
  teamId: string | null;
  side: "RIGHT" | "LEFT" | null;
}

export interface ConfirmedMatchInfo {
  id: string;
  score: string | null;
  date: Date;
  players: MatchPlayerInfo[];
}

// ---------------------------------------------------------------------------
// Compute skill scores (iterative weighted average)
// ---------------------------------------------------------------------------

export async function computeSkillScores(): Promise<Map<string, number>> {
  const edges = await db.select().from(playerEdges);

  const neighbors = new Map<
    string,
    Array<{ id: string; weight: number; outcome: number }>
  >();

  for (const edge of edges) {
    const totalRival = edge.matchesAsRivals;
    if (totalRival === 0) continue;

    const outcomeA = edge.winsA / totalRival;
    const outcomeB = edge.winsB / totalRival;

    const recencyWeight = getRecencyWeight(edge.lastMatchAt);
    const frequencyWeight = Math.min(totalRival, 10);
    const weight = recencyWeight * frequencyWeight;

    if (!neighbors.has(edge.playerAId)) neighbors.set(edge.playerAId, []);
    if (!neighbors.has(edge.playerBId)) neighbors.set(edge.playerBId, []);

    neighbors.get(edge.playerAId)!.push({
      id: edge.playerBId,
      weight,
      outcome: outcomeA,
    });
    neighbors.get(edge.playerBId)!.push({
      id: edge.playerAId,
      weight,
      outcome: outcomeB,
    });
  }

  const scores = new Map<string, number>();
  const allPlayers = new Set<string>();
  for (const edge of edges) {
    allPlayers.add(edge.playerAId);
    allPlayers.add(edge.playerBId);
  }

  for (const p of allPlayers) {
    scores.set(p, 1000);
  }

  const ITERATIONS = 10;
  for (let iter = 0; iter < ITERATIONS; iter++) {
    const newScores = new Map<string, number>();
    for (const player of allPlayers) {
      const nbrs = neighbors.get(player);
      if (!nbrs || nbrs.length === 0) {
        newScores.set(player, scores.get(player)!);
        continue;
      }

      let totalWeight = 0;
      let weightedSum = 0;
      for (const n of nbrs) {
        const nScore = scores.get(n.id) ?? 1000;
        const adjustedScore = nScore + (n.outcome - 0.5) * 200;
        totalWeight += n.weight;
        weightedSum += adjustedScore * n.weight;
      }

      const newScore = totalWeight > 0 ? weightedSum / totalWeight : 1000;
      newScores.set(player, Math.round(newScore));
    }
    for (const [k, v] of newScores) {
      scores.set(k, v);
    }
  }

  return scores;
}

function getRecencyWeight(lastMatchAt: Date | null): number {
  if (!lastMatchAt) return 0.5;
  const daysSince =
    (Date.now() - lastMatchAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince < 30) return 1.0;
  if (daysSince < 60) return 0.75;
  if (daysSince < 120) return 0.5;
  return 0.25;
}

// ---------------------------------------------------------------------------
// Community detection (simplified Louvain)
// ---------------------------------------------------------------------------

export async function computeCommunities(): Promise<Map<string, number>> {
  const edges = await db.select().from(playerEdges);
  const adjacency = new Map<string, Set<string>>();

  for (const edge of edges) {
    const totalMatches = edge.matchesAsRivals + edge.matchesAsPartners;
    if (totalMatches === 0) continue;

    if (!adjacency.has(edge.playerAId))
      adjacency.set(edge.playerAId, new Set());
    if (!adjacency.has(edge.playerBId))
      adjacency.set(edge.playerBId, new Set());

    adjacency.get(edge.playerAId)!.add(edge.playerBId);
    adjacency.get(edge.playerBId)!.add(edge.playerAId);
  }

  const communities = new Map<string, number>();
  let nextCommunity = 0;
  const visited = new Set<string>();

  for (const node of adjacency.keys()) {
    if (visited.has(node)) continue;

    const community = nextCommunity++;
    const queue = [node];
    visited.add(node);

    while (queue.length > 0) {
      const current = queue.shift()!;
      communities.set(current, community);

      const nbrs = adjacency.get(current);
      if (!nbrs) continue;

      for (const nbr of nbrs) {
        if (!visited.has(nbr)) {
          visited.add(nbr);
          queue.push(nbr);
        }
      }
    }
  }

  return communities;
}

// ---------------------------------------------------------------------------
// Compute player side preferences and win rates
// ---------------------------------------------------------------------------

export async function computePlayerSideStats(userId: string): Promise<{
  preferredSide: "RIGHT" | "LEFT" | null;
  winRateRight: number | null;
  winRateLeft: number | null;
}> {
  const { matchPlayers: mpTable, matches: matchTable } =
    await import("@/db/schema");

  const playersWithMatches = await db
    .select({
      side: mpTable.side,
      position: mpTable.position,
      matchScore: matchTable.score,
      matchStatus: matchTable.status,
    })
    .from(mpTable)
    .innerJoin(matchTable, eq(mpTable.matchId, matchTable.id))
    .where(and(eq(mpTable.userId, userId), eq(matchTable.status, "CONFIRMED")));

  const rightMatches = playersWithMatches.filter((p) => p.side === "RIGHT");
  const leftMatches = playersWithMatches.filter((p) => p.side === "LEFT");

  const totalPlayers = 4;
  const teamOf = (pos: number) => (pos < 2 ? "A" : "B");

  let rightWins = 0;
  let leftWins = 0;

  for (const p of rightMatches) {
    const winner = getMatchWinner(p.matchScore);
    const team = teamOf(p.position);
    if (winner === team) rightWins++;
  }

  for (const p of leftMatches) {
    const winner = getMatchWinner(p.matchScore);
    const team = teamOf(p.position);
    if (winner === team) leftWins++;
  }

  const preferredSide =
    rightMatches.length > leftMatches.length
      ? "RIGHT"
      : leftMatches.length > rightMatches.length
        ? "LEFT"
        : null;

  const winRateRight =
    rightMatches.length > 0 ? rightWins / rightMatches.length : null;
  const winRateLeft =
    leftMatches.length > 0 ? leftWins / leftMatches.length : null;

  return { preferredSide, winRateRight, winRateLeft };
}

// ---------------------------------------------------------------------------
// Network size
// ---------------------------------------------------------------------------

export async function computeNetworkSize(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(playerEdges)
    .where(
      sql`${playerEdges.playerAId} = ${userId} OR ${playerEdges.playerBId} = ${userId}`,
    );

  return result[0]?.count ?? 0;
}

// ---------------------------------------------------------------------------
// Apply feedback signal to skill score
// ---------------------------------------------------------------------------

export async function applyFeedbackToScore(
  userId: string,
  currentScore: number,
): Promise<number> {
  const feedbacks = await db
    .select()
    .from(matchPlayerFeedback)
    .where(eq(matchPlayerFeedback.playerId, userId));

  if (feedbacks.length === 0) return currentScore;

  const strongerCount = feedbacks.filter(
    (f) => f.feedback === "STRONGER",
  ).length;
  const weakerCount = feedbacks.filter((f) => f.feedback === "WEAKER").length;

  const totalFeedback = strongerCount + weakerCount;
  if (totalFeedback === 0) return currentScore;

  const feedbackWeight = Math.min(totalFeedback, 5) / 5;
  const feedbackSignal = (strongerCount - weakerCount) / totalFeedback;

  const adjustedScore = currentScore + feedbackSignal * 100 * feedbackWeight;
  return Math.round(adjustedScore);
}
