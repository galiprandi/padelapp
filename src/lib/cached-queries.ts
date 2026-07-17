import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Cached ranking list (all players sorted by score).
 * Invalidated by revalidateTag("ranking") — called after every
 * match confirm/finalize/attendance mark via recalculateRankingAction.
 * Fallback revalidate: 60s (safety net in case a revalidateTag is missed).
 */
export const getCachedRanking = unstable_cache(
  async () => {
    return prisma.user.findMany({
      orderBy: [
        { rankingScore: "desc" },
        { attendanceScore: "desc" },
        { wins: "desc" },
        { lastMatchAt: "desc" },
        { displayName: "asc" },
      ],
      take: 50,
      include: {
        matchPlayers: {
          where: { match: { status: "CONFIRMED" } },
          orderBy: { match: { date: "desc" } },
          take: 5,
          include: { match: { select: { score: true } } },
        },
      },
    });
  },
  ["ranking-list"],
  { tags: ["ranking"], revalidate: 60 }
);

/**
 * Cached ranking search results.
 * Keyed by query string so different searches have separate cache entries.
 * Invalidated by revalidateTag("ranking").
 */
export const getCachedRankingSearch = unstable_cache(
  async (query: string) => {
    return prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: query, mode: "insensitive" } },
          { alias: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: [
        { rankingScore: "desc" },
        { attendanceScore: "desc" },
        { wins: "desc" },
        { lastMatchAt: "desc" },
        { displayName: "asc" },
      ],
      take: 20,
      include: {
        matchPlayers: {
          where: { match: { status: "CONFIRMED" } },
          orderBy: { match: { date: "desc" } },
          take: 5,
          include: { match: { select: { score: true } } },
        },
      },
    });
  },
  ["ranking-search"],
  { tags: ["ranking"], revalidate: 60 }
);

/**
 * Cached open turns list.
 * Invalidated by revalidateTag("turns") — called after turn create/join/leave/cancel.
 * Fallback revalidate: 30s (turns change more frequently than ranking).
 */
export const getCachedOpenTurns = unstable_cache(
  async () => {
    return prisma.turn.findMany({
      where: {
        date: { gte: new Date() },
        status: { in: ["OPEN", "FULL"] },
      },
      include: { players: true, creator: true },
      orderBy: { date: "asc" },
      take: 20,
    });
  },
  ["open-turns"],
  { tags: ["turns"], revalidate: 30 }
);

/**
 * Cached confirmed matches for a user.
 * Keyed by userId. Invalidated by revalidateTag("matches").
 * Fallback revalidate: 60s.
 */
export const getCachedConfirmedMatches = unstable_cache(
  async (userId: string) => {
    return prisma.match.findMany({
      where: {
        status: "CONFIRMED",
        players: { some: { userId } },
      },
      include: {
        players: { include: { user: true } },
      },
      orderBy: { date: "desc" },
      take: 20,
    });
  },
  ["confirmed-matches"],
  { tags: ["matches"], revalidate: 60 }
);
