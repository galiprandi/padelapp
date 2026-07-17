import { db } from "@/db";
import { users, matches as matchesTable } from "@/db/schema";
import { eq, or, desc, asc, ilike } from "drizzle-orm";
import { unstable_cache } from "next/cache";

/**
 * Cached ranking list (all players sorted by score).
 * Invalidated by revalidateTag("ranking") — called after every
 * match confirm/finalize/attendance mark via recalculateRankingAction.
 * Fallback revalidate: 60s (safety net in case a revalidateTag is missed).
 */
export const getCachedRanking = unstable_cache(
  async () => {
    const result = await db.query.users.findMany({
      orderBy: [
        desc(users.rankingScore),
        desc(users.attendanceScore),
        desc(users.wins),
        desc(users.lastMatchAt),
        asc(users.displayName),
      ],
      limit: 50,
      with: {
        matchPlayers: {
          limit: 50,
          with: {
            match: {
              columns: {
                score: true,
                date: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // Filter matchPlayers to only CONFIRMED matches and sort by match.date desc
    // (Drizzle can't filter or order by parent table in `with` clause)
    return result.map((user) => ({
      ...user,
      matchPlayers: user.matchPlayers
        .filter((mp) => mp.match.status === "CONFIRMED")
        .sort(
          (a, b) => new Date(b.match.date).getTime() - new Date(a.match.date).getTime(),
        )
        .slice(0, 5),
    }));
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
    const result = await db.query.users.findMany({
      where: or(
        ilike(users.displayName, `%${query}%`),
        ilike(users.alias, `%${query}%`),
      ),
      orderBy: [
        desc(users.rankingScore),
        desc(users.attendanceScore),
        desc(users.wins),
        desc(users.lastMatchAt),
        asc(users.displayName),
      ],
      limit: 20,
      with: {
        matchPlayers: {
          limit: 50,
          with: {
            match: {
              columns: {
                score: true,
                date: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // Filter and sort in JS (same as getCachedRanking)
    return result.map((user) => ({
      ...user,
      matchPlayers: user.matchPlayers
        .filter((mp) => mp.match.status === "CONFIRMED")
        .sort(
          (a, b) => new Date(b.match.date).getTime() - new Date(a.match.date).getTime(),
        )
        .slice(0, 5),
    }));
  },
  ["ranking-search"],
  { tags: ["ranking"], revalidate: 60 }
);

/**
 * Get the current user's ranking data with recent confirmed matches.
 * Used by /ranking page for the UserRankingBanner.
 */
export async function getCurrentUserRankingData(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      matchPlayers: {
        limit: 50,
        with: {
          match: {
            columns: {
              score: true,
              date: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  // Filter to CONFIRMED matches and sort by match.date desc in JS
  // (Drizzle can't filter or order by parent table in `with` clause)
  return {
    ...user,
    matchPlayers: user.matchPlayers
      .filter((mp) => mp.match.status === "CONFIRMED")
      .sort((a, b) => b.match.date.getTime() - a.match.date.getTime())
      .slice(0, 5),
  };
}
