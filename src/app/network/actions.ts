"use server";

import { db } from "@/db";
import {
  playerEdges,
  playerGraphStats,
  users,
  turns,
  matches,
  sessions,
  turnPlayers,
} from "@/db/schema";
import { unstable_cache, revalidateTag } from "next/cache";
import { inArray, count, gte, lt, and, eq, sql } from "drizzle-orm";

export interface GraphNode {
  id: string;
  name: string;
  alias: string | null;
  image: string | null;
  skillScore: number;
  community: number | null;
  networkSize: number;
  matchesPlayed: number;
  preferredSide: "RIGHT" | "LEFT" | null;
}

export interface GraphLink {
  source: string | { id: string };
  target: string | { id: string };
  rivalMatches: number;
  partnerMatches: number;
  winsA: number;
  winsB: number;
  winsTogether: number;
  lossesTogether: number;
  strength: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  generatedAt: number;
}

const CACHE_TAG = "player-graph-viz";
const CACHE_REVALIDATE = 300; // 5 minutes

async function fetchGraphDataRaw(): Promise<GraphData> {
  const edges = await db.select().from(playerEdges);
  const stats = await db.select().from(playerGraphStats);

  const statsMap = new Map(stats.map((s) => [s.userId, s]));
  const playerIds = new Set<string>();
  for (const e of edges) {
    playerIds.add(e.playerAId);
    playerIds.add(e.playerBId);
  }

  const playerIdsArray = Array.from(playerIds);
  if (playerIdsArray.length === 0) {
    return { nodes: [], links: [], generatedAt: Date.now() };
  }

  const players = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      alias: users.alias,
      image: users.image,
      matchesPlayed: users.matchesPlayed,
    })
    .from(users)
    .where(inArray(users.id, playerIdsArray));

  const playerMap = new Map(players.map((p) => [p.id, p]));

  const nodes: GraphNode[] = playerIdsArray.map((id) => {
    const p = playerMap.get(id);
    const s = statsMap.get(id);
    return {
      id,
      name: p?.displayName ?? "Unknown",
      alias: p?.alias ?? null,
      image: p?.image ?? null,
      skillScore: s?.skillScore ?? 1000,
      community: s?.community ?? null,
      networkSize: s?.networkSize ?? 0,
      matchesPlayed: p?.matchesPlayed ?? 0,
      preferredSide: (s?.preferredSide as "RIGHT" | "LEFT" | null) ?? null,
    };
  });

  const links: GraphLink[] = edges
    .filter((e) => e.matchesAsRivals + e.matchesAsPartners > 0)
    .map((e) => {
      const totalMatches = e.matchesAsRivals + e.matchesAsPartners;
      return {
        source: e.playerAId,
        target: e.playerBId,
        rivalMatches: e.matchesAsRivals,
        partnerMatches: e.matchesAsPartners,
        winsA: e.winsA,
        winsB: e.winsB,
        winsTogether: e.winsTogether,
        lossesTogether: e.lossesTogether,
        strength: totalMatches,
      };
    });

  return { nodes, links, generatedAt: Date.now() };
}

export const getGraphData = unstable_cache(fetchGraphDataRaw, [CACHE_TAG], {
  revalidate: CACHE_REVALIDATE,
  tags: [CACHE_TAG],
});

export async function refreshGraphCache() {
  revalidateTag(CACHE_TAG, "default");
}

// ---------------------------------------------------------------------------
// Adoption metrics
// ---------------------------------------------------------------------------

export interface AdoptionMetrics {
  totalUsers: number;
  totalTurns: number;
  totalMatches: number;
  confirmedMatches: number;
  totalEnrollments: number;
  activeSessions: number;
  pushEnabled: number;
  // Last 7 days
  newUsers7d: number;
  newTurns7d: number;
  newMatches7d: number;
  // Last 30 days
  newUsers30d: number;
  newTurns30d: number;
  newMatches30d: number;
  // Growth rate
  userGrowthRate: number;
  turnGrowthRate: number;
  matchGrowthRate: number;
  // Network density
  networkDensity: number;
  avgConnectionsPerPlayer: number;
  // Top communities
  communities: { id: number; size: number }[];
  // Most connected players
  topPlayers: {
    id: string;
    name: string;
    alias: string | null;
    image: string | null;
    matchesPlayed: number;
    networkSize: number;
  }[];
}

const METRICS_TAG = "adoption-metrics";

async function fetchAdoptionMetricsRaw(): Promise<AdoptionMetrics> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Total counts
  const [totalUsersRow] = await db.select({ value: count() }).from(users);
  const [totalTurnsRow] = await db.select({ value: count() }).from(turns);
  const [totalMatchesRow] = await db.select({ value: count() }).from(matches);
  const [confirmedMatchesRow] = await db
    .select({ value: count() })
    .from(matches)
    .where(eq(matches.status, "CONFIRMED"));
  const [totalEnrollmentsRow] = await db
    .select({ value: count() })
    .from(turnPlayers);

  // Active sessions (not expired)
  const [activeSessionsRow] = await db
    .select({ value: count() })
    .from(sessions)
    .where(gte(sessions.expires, now));

  // Push-enabled users (those with at least one session in last 30 days as proxy)
  const [pushEnabledRow] = await db
    .select({ value: count() })
    .from(
      db
        .select({ userId: sessions.userId })
        .from(sessions)
        .where(gte(sessions.expires, thirtyDaysAgo))
        .groupBy(sessions.userId)
        .as("active_users"),
    );

  // Last 7 days
  const [newUsers7dRow] = await db
    .select({ value: count() })
    .from(users)
    .where(gte(users.createdAt, sevenDaysAgo));
  const [newTurns7dRow] = await db
    .select({ value: count() })
    .from(turns)
    .where(gte(turns.createdAt, sevenDaysAgo));
  const [newMatches7dRow] = await db
    .select({ value: count() })
    .from(matches)
    .where(gte(matches.createdAt, sevenDaysAgo));

  // Last 30 days
  const [newUsers30dRow] = await db
    .select({ value: count() })
    .from(users)
    .where(gte(users.createdAt, thirtyDaysAgo));
  const [newTurns30dRow] = await db
    .select({ value: count() })
    .from(turns)
    .where(gte(turns.createdAt, thirtyDaysAgo));
  const [newMatches30dRow] = await db
    .select({ value: count() })
    .from(matches)
    .where(gte(matches.createdAt, thirtyDaysAgo));

  // Previous 30 days (30-60 days ago) for growth rate
  const [prevUsers30dRow] = await db
    .select({ value: count() })
    .from(users)
    .where(and(gte(users.createdAt, sixtyDaysAgo), lt(users.createdAt, thirtyDaysAgo)));
  const [prevTurns30dRow] = await db
    .select({ value: count() })
    .from(turns)
    .where(and(gte(turns.createdAt, sixtyDaysAgo), lt(turns.createdAt, thirtyDaysAgo)));
  const [prevMatches30dRow] = await db
    .select({ value: count() })
    .from(matches)
    .where(and(gte(matches.createdAt, sixtyDaysAgo), lt(matches.createdAt, thirtyDaysAgo)));

  // Network density and avg connections
  const edges = await db.select().from(playerEdges);
  const stats = await db.select().from(playerGraphStats);
  const totalEdges = edges.length;
  const totalNodes = new Set([...edges.map((e) => e.playerAId), ...edges.map((e) => e.playerBId)]).size;
  const maxPossibleEdges = totalNodes > 1 ? (totalNodes * (totalNodes - 1)) / 2 : 0;
  const networkDensity = maxPossibleEdges > 0 ? totalEdges / maxPossibleEdges : 0;
  const avgConnections =
    stats.length > 0
      ? stats.reduce((sum, s) => sum + (s.networkSize ?? 0), 0) / stats.length
      : 0;

  // Communities
  const communityMap = new Map<number, number>();
  for (const s of stats) {
    if (s.community != null) {
      communityMap.set(s.community, (communityMap.get(s.community) ?? 0) + 1);
    }
  }
  const communities = Array.from(communityMap.entries())
    .map(([id, size]) => ({ id, size }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  // Top players by network size
  const topStats = stats
    .filter((s) => s.networkSize != null && s.networkSize > 0)
    .sort((a, b) => (b.networkSize ?? 0) - (a.networkSize ?? 0))
    .slice(0, 5);
  const topPlayerIds = topStats.map((s) => s.userId);
  const topPlayersData =
    topPlayerIds.length > 0
      ? await db
          .select({
            id: users.id,
            displayName: users.displayName,
            alias: users.alias,
            image: users.image,
            matchesPlayed: users.matchesPlayed,
          })
          .from(users)
          .where(inArray(users.id, topPlayerIds))
      : [];
  const topPlayerMap = new Map(topPlayersData.map((p) => [p.id, p]));
  const topPlayers = topStats.map((s) => {
    const p = topPlayerMap.get(s.userId);
    return {
      id: s.userId,
      name: p?.displayName ?? "Unknown",
      alias: p?.alias ?? null,
      image: p?.image ?? null,
      matchesPlayed: p?.matchesPlayed ?? 0,
      networkSize: s.networkSize ?? 0,
    };
  });

  const prevU = prevUsers30dRow.value;
  const prevT = prevTurns30dRow.value;
  const prevM = prevMatches30dRow.value;

  return {
    totalUsers: totalUsersRow.value,
    totalTurns: totalTurnsRow.value,
    totalMatches: totalMatchesRow.value,
    confirmedMatches: confirmedMatchesRow.value,
    totalEnrollments: totalEnrollmentsRow.value,
    activeSessions: activeSessionsRow.value,
    pushEnabled: pushEnabledRow.value,
    newUsers7d: newUsers7dRow.value,
    newTurns7d: newTurns7dRow.value,
    newMatches7d: newMatches7dRow.value,
    newUsers30d: newUsers30dRow.value,
    newTurns30d: newTurns30dRow.value,
    newMatches30d: newMatches30dRow.value,
    userGrowthRate: prevU > 0 ? ((newUsers30dRow.value - prevU) / prevU) * 100 : 0,
    turnGrowthRate: prevT > 0 ? ((newTurns30dRow.value - prevT) / prevT) * 100 : 0,
    matchGrowthRate: prevM > 0 ? ((newMatches30dRow.value - prevM) / prevM) * 100 : 0,
    networkDensity,
    avgConnectionsPerPlayer: avgConnections,
    communities,
    topPlayers,
  };
}

export const getAdoptionMetrics = unstable_cache(
  fetchAdoptionMetricsRaw,
  [METRICS_TAG],
  {
    revalidate: CACHE_REVALIDATE,
    tags: [METRICS_TAG],
  },
);
