import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or, desc, asc, ilike } from "drizzle-orm";
import { unstable_cache } from "next/cache";

/**
 * Cached ranking list (all players sorted by score).
 * Invalidated by revalidateTag("ranking") — called after every
 * match confirm/finalize/attendance mark via recalculateRankingAction.
 * Fallback revalidate: 60s (safety net in case a revalidateTag is missed).
 */
const MOCK_RANKING_USERS = [
  {
    id: "p-01",
    displayName: "Fernando",
    alias: "Bela",
    email: "bela@mock.test",
    image: null,
    level: 8,
    rankingScore: 1200,
    rankingPosition: 1,
    rankingDelta: 0,
    wins: 12,
    losses: 3,
    attendanceScore: 1.0,
    matchesPlayed: 15,
    lastMatchAt: new Date(),
    matchPlayers: [
      {
        id: "mp-1",
        matchId: "m-1",
        userId: "p-01",
        position: 0,
        resultConfirmed: true,
        displayName: "Fernando",
        teamId: "A",
        joinedAt: new Date(),
        attendance: "ATTENDED",
        attendanceBy: "p-01",
        attendanceAt: new Date(),
        side: "REVÉS",
        createdAt: new Date(),
        updatedAt: new Date(),
        match: {
          score: "6-4, 6-3",
          date: new Date(),
          status: "CONFIRMED",
        },
      }
    ],
  },
  {
    id: "p-02",
    displayName: "Agustín",
    alias: "agu",
    email: "agu@mock.test",
    image: null,
    level: 7,
    rankingScore: 1150,
    rankingPosition: 2,
    rankingDelta: 2,
    wins: 10,
    losses: 5,
    attendanceScore: 0.95,
    matchesPlayed: 15,
    lastMatchAt: new Date(),
    matchPlayers: [],
  },
  {
    id: "p-03",
    displayName: "Roby",
    alias: "Roby",
    email: "roby@mock.test",
    image: null,
    level: 6,
    rankingScore: 1080,
    rankingPosition: 3,
    rankingDelta: -1,
    wins: 3,
    losses: 2,
    attendanceScore: 0.9,
    matchesPlayed: 5,
    lastMatchAt: new Date(),
    matchPlayers: [],
  },
  {
    id: "p-04",
    displayName: "Coello",
    alias: "Coello",
    email: "coello@mock.test",
    image: null,
    level: 8,
    rankingScore: 1000,
    rankingPosition: 4,
    rankingDelta: 0,
    wins: 0,
    losses: 0,
    attendanceScore: 1.0,
    matchesPlayed: 0,
    lastMatchAt: null,
    matchPlayers: [],
  }
];

export const getCachedRanking = unstable_cache(
  async () => {
    if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
      return MOCK_RANKING_USERS;
    }
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
    if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
      const lower = query.toLowerCase();
      return MOCK_RANKING_USERS.filter(
        u =>
          (u.displayName && u.displayName.toLowerCase().includes(lower)) ||
          (u.alias && u.alias.toLowerCase().includes(lower))
      );
    }
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
  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    const mockUser = MOCK_RANKING_USERS.find(u => u.id === userId) || MOCK_RANKING_USERS[0];
    return mockUser;
  }
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

/**
 * Cached version of getCurrentUserRankingData.
 * Keyed by userId. Invalidated by revalidateTag("ranking").
 * Fallback revalidate: 60s.
 */
export const getCachedCurrentUserRankingData = unstable_cache(
  async (userId: string) => getCurrentUserRankingData(userId),
  ["user-ranking-data"],
  { tags: ["ranking"], revalidate: 60 }
);
