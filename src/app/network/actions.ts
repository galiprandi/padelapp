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
import { inArray, count, gte, lt, and, eq, desc, isNotNull, or, ne } from "drizzle-orm";
import { normalizeClub, pickClubDisplayName } from "@/lib/club";

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
  turnsTogether: number;
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
  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    const mockNodes: GraphNode[] = [
      {
        id: "p-01",
        name: "Agustín Aliprandi",
        alias: "agu",
        image: null,
        skillScore: 1150,
        community: 1,
        networkSize: 3,
        matchesPlayed: 15,
        preferredSide: "RIGHT",
      },
      {
        id: "p-02",
        name: "Fernando Belasteguín",
        alias: "Bela",
        image: null,
        skillScore: 1200,
        community: 1,
        networkSize: 3,
        matchesPlayed: 12,
        preferredSide: "LEFT",
      },
      {
        id: "p-03",
        name: "Diego Morales",
        alias: "Gero",
        image: null,
        skillScore: 1080,
        community: 1,
        networkSize: 3,
        matchesPlayed: 8,
        preferredSide: "RIGHT",
      },
      {
        id: "p-04",
        name: "Facundo Lopez",
        alias: "Facu",
        image: null,
        skillScore: 1020,
        community: 1,
        networkSize: 3,
        matchesPlayed: 6,
        preferredSide: "LEFT",
      },
    ];

    const mockLinks: GraphLink[] = [
      {
        source: "p-01",
        target: "p-02",
        rivalMatches: 5,
        partnerMatches: 3,
        winsA: 2,
        winsB: 3,
        winsTogether: 2,
        lossesTogether: 1,
        turnsTogether: 4,
        strength: 12,
      },
      {
        source: "p-01",
        target: "p-03",
        rivalMatches: 2,
        partnerMatches: 1,
        winsA: 1,
        winsB: 1,
        winsTogether: 1,
        lossesTogether: 0,
        turnsTogether: 2,
        strength: 5,
      },
      {
        source: "p-02",
        target: "p-04",
        rivalMatches: 3,
        partnerMatches: 2,
        winsA: 2,
        winsB: 1,
        winsTogether: 1,
        lossesTogether: 1,
        turnsTogether: 3,
        strength: 8,
      },
      {
        source: "p-03",
        target: "p-04",
        rivalMatches: 4,
        partnerMatches: 1,
        winsA: 2,
        winsB: 2,
        winsTogether: 0,
        lossesTogether: 1,
        turnsTogether: 1,
        strength: 6,
      },
    ];

    return {
      nodes: mockNodes,
      links: mockLinks,
      generatedAt: Date.now(),
    };
  }

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
    .filter((e) => e.matchesAsRivals + e.matchesAsPartners + e.turnsTogether > 0)
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
        turnsTogether: e.turnsTogether,
        strength: totalMatches + e.turnsTogether,
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
  // Latest registered users
  recentUsers: {
    id: string;
    name: string;
    alias: string | null;
    image: string | null;
    createdAt: Date;
  }[];
  // Clubs with most turns + matches
  topClubs: {
    name: string;
    turns: number;
    matches: number;
    total: number;
  }[];
}

const METRICS_TAG = "adoption-metrics";

async function fetchAdoptionMetricsRaw(): Promise<AdoptionMetrics> {
  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    return {
      totalUsers: 45,
      totalTurns: 112,
      totalMatches: 84,
      confirmedMatches: 76,
      totalEnrollments: 345,
      activeSessions: 18,
      pushEnabled: 24,
      newUsers7d: 5,
      newTurns7d: 12,
      newMatches7d: 8,
      newUsers30d: 15,
      newTurns30d: 35,
      newMatches30d: 28,
      userGrowthRate: 15.4,
      turnGrowthRate: 8.5,
      matchGrowthRate: 12.0,
      networkDensity: 0.12,
      avgConnectionsPerPlayer: 4.8,
      communities: [
        { id: 1, size: 24 },
        { id: 2, size: 15 },
        { id: 3, size: 6 },
      ],
      topPlayers: [
        {
          id: "p-01",
          name: "Agustín Aliprandi",
          alias: "agu",
          image: null,
          matchesPlayed: 15,
          networkSize: 12,
        },
        {
          id: "p-02",
          name: "Fernando Belasteguín",
          alias: "Bela",
          image: null,
          matchesPlayed: 12,
          networkSize: 10,
        },
        {
          id: "p-03",
          name: "Diego Morales",
          alias: "Gero",
          image: null,
          matchesPlayed: 8,
          networkSize: 8,
        },
      ],
      recentUsers: [
        {
          id: "p-01",
          name: "Agustín Aliprandi",
          alias: "agu",
          image: null,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          id: "p-02",
          name: "Fernando Belasteguín",
          alias: "Bela",
          image: null,
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
      ],
      topClubs: [
        { name: "Padel City", turns: 42, matches: 30, total: 72 },
        { name: "El Monasterio", turns: 25, matches: 18, total: 43 },
        { name: "Padel 360", turns: 15, matches: 12, total: 27 },
      ],
    };
  }

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

  // Latest registered users
  const recentUsers = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      alias: users.alias,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(5);

  const recentUsersMapped = recentUsers.map((u) => ({
    id: u.id,
    name: u.displayName,
    alias: u.alias,
    image: u.image,
    createdAt: u.createdAt,
  }));

  // Clubs with most activity (turns + matches), grouped by normalized name
  // to avoid "Padel City" / "padel city" / "Padel City · Cancha 3" counting
  // as separate clubs.
  const turnClubs = await db
    .select({ club: turns.club, count: count() })
    .from(turns)
    .groupBy(turns.club);

  const matchClubs = await db
    .select({ club: matches.club, count: count() })
    .from(matches)
    .where(isNotNull(matches.club))
    .groupBy(matches.club);

  // group by normalized key, keep original spellings for display
  const clubAgg = new Map<
    string,
    { turns: number; matches: number; originals: string[] }
  >();
  for (const t of turnClubs) {
    const original = (t.club ?? "").trim();
    const key = normalizeClub(original);
    if (!key) continue;
    const entry = clubAgg.get(key) ?? { turns: 0, matches: 0, originals: [] };
    entry.turns = t.count;
    if (original) entry.originals.push(original);
    clubAgg.set(key, entry);
  }
  for (const m of matchClubs) {
    const original = (m.club ?? "").trim();
    const key = normalizeClub(original);
    if (!key) continue;
    const entry = clubAgg.get(key) ?? { turns: 0, matches: 0, originals: [] };
    entry.matches = m.count;
    if (original) entry.originals.push(original);
    clubAgg.set(key, entry);
  }

  const topClubs = Array.from(clubAgg.entries())
    .map(([key, c]) => ({
      name: pickClubDisplayName(c.originals) || key,
      turns: c.turns,
      matches: c.matches,
      total: c.turns + c.matches,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

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
    recentUsers: recentUsersMapped,
    topClubs,
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

// ---------------------------------------------------------------------------
// Players Like You Recommendation
// ---------------------------------------------------------------------------

export interface RecommendedPlayer {
  id: string;
  name: string;
  alias: string | null;
  image: string | null;
  skillScore: number;
  preferredSide: "RIGHT" | "LEFT" | null;
  matchesPlayed: number;
}

async function getPlayersLikeYouRaw(
  viewerId: string
): Promise<RecommendedPlayer[]> {
  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    return [
      {
        id: "p-04",
        name: "Facundo Lopez",
        alias: "Facu",
        image: null,
        skillScore: 1020,
        preferredSide: "LEFT",
        matchesPlayed: 6,
      },
    ];
  }

  // 1. Get viewer's graph stats (to get their community & skillScore)
  const [viewerStats] = await db
    .select()
    .from(playerGraphStats)
    .where(eq(playerGraphStats.userId, viewerId))
    .limit(1);

  // 2. Find direct played contacts of the viewer to exclude them
  const directEdges = await db
    .select()
    .from(playerEdges)
    .where(
      or(
        eq(playerEdges.playerAId, viewerId),
        eq(playerEdges.playerBId, viewerId)
      )
    );

  const playedUserIds = new Set<string>();
  for (const edge of directEdges) {
    if (edge.matchesAsRivals + edge.matchesAsPartners > 0) {
      playedUserIds.add(edge.playerAId === viewerId ? edge.playerBId : edge.playerAId);
    }
  }

  const viewerCommunity = viewerStats?.community ?? null;
  const viewerScore = viewerStats?.skillScore ?? 1000;

  let candidates: typeof playerGraphStats.$inferSelect[] = [];

  // 3. Find candidates from the same community (excluding the viewer and already played contacts)
  if (viewerCommunity !== null) {
    const communityCandidates = await db
      .select()
      .from(playerGraphStats)
      .where(
        and(
          eq(playerGraphStats.community, viewerCommunity),
          ne(playerGraphStats.userId, viewerId)
        )
      );

    candidates = communityCandidates.filter((c) => !playedUserIds.has(c.userId));
  }

  // 4. If fewer than 3 candidates in same community, fetch global players as supplement
  if (candidates.length < 3) {
    const globalCandidates = await db
      .select()
      .from(playerGraphStats)
      .where(ne(playerGraphStats.userId, viewerId));

    const filteredGlobal = globalCandidates.filter(
      (c) => !playedUserIds.has(c.userId) && (viewerCommunity === null || c.community !== viewerCommunity)
    );

    candidates = [...candidates, ...filteredGlobal];
  }

  if (candidates.length === 0) return [];

  // 5. Sort candidates by absolute skill score difference to the viewer
  candidates.sort((a, b) => {
    const diffA = Math.abs(a.skillScore - viewerScore);
    const diffB = Math.abs(b.skillScore - viewerScore);
    return diffA - diffB;
  });

  // Limit to 3 recommendations
  const topCandidates = candidates.slice(0, 3);
  const candidateIds = topCandidates.map((c) => c.userId);

  // 6. Fetch user profiles
  const candidatesUsers = await db
    .select()
    .from(users)
    .where(inArray(users.id, candidateIds));

  const usersMap = new Map(candidatesUsers.map((u) => [u.id, u]));

  return topCandidates
    .map((c) => {
      const u = usersMap.get(c.userId);
      if (!u) return null;
      return {
        id: c.userId,
        name: u.displayName,
        alias: u.alias,
        image: u.image,
        skillScore: Math.round(c.skillScore),
        preferredSide: c.preferredSide as "RIGHT" | "LEFT" | null,
        matchesPlayed: u.matchesPlayed ?? 0,
      };
    })
    .filter((p): p is RecommendedPlayer => p !== null);
}

/**
 * Cached version of getPlayersLikeYouAction.
 * Keyed by viewerId. Invalidated by revalidateTag("matches").
 * Fallback revalidate: 60s.
 */
export async function getPlayersLikeYouAction(viewerId: string): Promise<RecommendedPlayer[]> {
  return unstable_cache(
    async () => getPlayersLikeYouRaw(viewerId),
    ["players-like-you", viewerId],
    { tags: ["matches"], revalidate: 60 }
  )();
}
