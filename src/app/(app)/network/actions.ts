"use server";

import { db } from "@/db";
import { playerEdges, playerGraphStats, users } from "@/db/schema";
import { unstable_cache, revalidateTag } from "next/cache";
import { inArray } from "drizzle-orm";

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
  source: string;
  target: string;
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
