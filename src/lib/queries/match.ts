import { db } from "@/db";
import {
  matches as matchesTable,
  matchPlayers,
} from "@/db/schema";
import { eq, and, ne, lt, inArray, desc, asc, count } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { getMatchWinner } from "@/lib/utils";
import { userInMatch, userInMatchByRef, userHasNotConfirmed, hasPlayerWithoutAttendance } from "./helpers";

export async function getEnhancedUserMatches(
  userId: string,
  statusFilter?: "PENDING" | "CONFIRMED" | "DISPUTED" | "CANCELLED",
  limit = 20
): Promise<MatchResultCompactMatch[]> {
  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    return [
      {
        id: "m-01",
        createdAt: new Date("2026-08-01T10:00:00.000Z"),
        score: "6-4, 6-3",
        status: "CONFIRMED",
        date: new Date("2026-08-01T10:00:00.000Z"),
        players: [
          { id: "mp-01", position: 0, displayName: "Agustín", resultConfirmed: true, side: "RIGHT", user: { id: "p-01", displayName: "Agustín", alias: "agu", image: undefined } },
          { id: "mp-02", position: 1, displayName: "Fernando", resultConfirmed: true, side: "LEFT", user: { id: "p-02", displayName: "Fernando", alias: "Bela", image: undefined } },
          { id: "mp-03", position: 2, displayName: "Ramiro", resultConfirmed: true, side: "RIGHT", user: { id: "p-03", displayName: "Ramiro", alias: "Ram", image: undefined } },
          { id: "mp-04", position: 3, displayName: "Gero", resultConfirmed: true, side: "LEFT", user: { id: "p-04", displayName: "Gero", alias: "Ger", image: undefined } },
        ],
      },
      {
        id: "m-02",
        createdAt: new Date("2026-07-28T18:00:00.000Z"),
        score: "4-6, 5-7",
        status: "CONFIRMED",
        date: new Date("2026-07-28T18:00:00.000Z"),
        players: [
          { id: "mp-05", position: 0, displayName: "Agustín", resultConfirmed: true, side: "RIGHT", user: { id: "p-01", displayName: "Agustín", alias: "agu", image: undefined } },
          { id: "mp-06", position: 1, displayName: "Ramiro", resultConfirmed: true, side: "LEFT", user: { id: "p-03", displayName: "Ramiro", alias: "Ram", image: undefined } },
          { id: "mp-07", position: 2, displayName: "Fernando", resultConfirmed: true, side: "RIGHT", user: { id: "p-02", displayName: "Fernando", alias: "Bela", image: undefined } },
          { id: "mp-08", position: 3, displayName: "Gero", resultConfirmed: true, side: "LEFT", user: { id: "p-04", displayName: "Gero", alias: "Ger", image: undefined } },
        ],
      }
    ];
  }
  const result = await db.query.matches.findMany({
    where: and(
      statusFilter
        ? eq(matchesTable.status, statusFilter)
        : ne(matchesTable.status, "CANCELLED"),
      userInMatch(userId),
    ),
    with: {
      players: {
        with: {
          user: {
            columns: {
              id: true,
              displayName: true,
              image: true,
              alias: true,
            },
          },
        },
      },
    },
    orderBy: desc(matchesTable.date),
    limit,
  });

  return result.map((match) => ({
    id: match.id,
    createdAt: match.date,
    score: match.score,
    status: match.status,
    date: match.date,
    players: match.players.map((player) => {
      return {
        id: player.id,
        position: player.position,
        displayName: player.displayName,
        resultConfirmed: player.resultConfirmed,
        side: player.side,
        user: player.user
          ? {
            id: player.user.id,
            displayName: player.user.displayName ?? null,
            alias: player.user.alias ?? null,
            image: player.user.image ?? undefined,
          }
          : null,
      };
    }),
  }));
}

export async function getPendingActions(
  userId: string,
  preloadedPendingMatches?: MatchResultCompactMatch[]
) {
  const allPendingMatches =
    preloadedPendingMatches ?? (await getCachedEnhancedUserMatches(userId, "PENDING"));
  const now = new Date();

  // Filter for matches that have already happened AND the user hasn't confirmed yet
  return allPendingMatches
    .filter(m => {
      const hasPassed = new Date(m.date || m.createdAt) < now;
      const userPlayer = m.players.find(
        (p) => p.user?.id === userId
      );
      const hasConfirmed = userPlayer?.resultConfirmed === true;
      return hasPassed && !hasConfirmed;
    })
    .sort((a, b) => {
      // Prioritize those that HAVE a score (need confirmation) over those that DON'T have a score (need score upload)
      if (a.score && !b.score) return -1;
      if (!a.score && b.score) return 1;
      // Secondary: most recent first
      return new Date(b.date || b.createdAt).getTime() - new Date(a.date || b.createdAt).getTime();
    });
}

export async function getPendingActionsCount(userId: string): Promise<number> {
  if (process.env.AUTH_BYPASS === "true" || userId === "p-01") {
    return 0;
  }
  const now = new Date();
  const [{ count: total }] = await db
    .select({ count: count() })
    .from(matchesTable)
    .where(
      and(
        eq(matchesTable.status, "PENDING"),
        lt(matchesTable.date, now),
        userInMatchByRef(userId),
        userHasNotConfirmed(userId),
      ),
    );
  return total;
}

/**
 * Cached pending actions count for a user.
 * Keyed by userId. Invalidated by revalidateTag("matches").
 * Fallback revalidate: 30s.
 */
export const getCachedPendingActionsCount = (userId: string) =>
  unstable_cache(
    async () => getPendingActionsCount(userId),
    ["pending-actions-count", userId],
    { tags: ["matches"], revalidate: 30 }
  )();

export async function getPendingAttendanceActions(userId: string) {
  if (userId === "p-01") {
    return [];
  }
  // Use a stable reference/value during prerendering (dynamic APIs like headers or cookies will trigger request-time execution where Date works correctly)
  const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000);

  const matchesNeedingAttendance = await db.query.matches.findMany({
    where: and(
      eq(matchesTable.creatorId, userId),
      inArray(matchesTable.status, ["PENDING", "CONFIRMED"]),
      lt(matchesTable.date, oneHourAgo),
      hasPlayerWithoutAttendance(),
    ),
    with: {
      players: {
        with: {
          user: {
            columns: {
              id: true,
              displayName: true,
              image: true,
              alias: true,
            },
          },
        },
        orderBy: asc(matchPlayers.position),
      },
    },
    orderBy: desc(matchesTable.date),
    limit: 10,
  });

  return matchesNeedingAttendance.map((match) => ({
    id: match.id,
    date: match.date,
    club: match.club,
    score: match.score,
    status: match.status,
    playersWithoutAttendance: match.players.filter(
      (p) => p.userId !== null && p.attendance === null,
    ).length,
  }));
}

export async function getHeadToHeadStats(viewerId: string, profileId: string) {
  const sharedMatches = await db.query.matches.findMany({
    where: and(
      eq(matchesTable.status, "CONFIRMED"),
      userInMatch(viewerId),
      userInMatch(profileId),
    ),
    with: {
      players: true,
    },
    orderBy: desc(matchesTable.date),
  });

  const stats = {
    together: { wins: 0, total: 0 },
    against: { wins: 0, total: 0 },
    lastMatch: sharedMatches[0]
      ? {
          id: sharedMatches[0].id,
          date: sharedMatches[0].date,
          score: sharedMatches[0].score,
          winner: getMatchWinner(sharedMatches[0].score),
          viewerTeam: sharedMatches[0].players.find((p) => p.userId === viewerId)!.position < 2 ? "A" : "B",
        }
      : null,
  };

  sharedMatches.forEach((match) => {
    const viewerPos = match.players.find((p) => p.userId === viewerId)?.position ?? 0;
    const profilePos = match.players.find((p) => p.userId === profileId)?.position ?? 0;

    const viewerTeam = viewerPos < 2 ? "A" : "B";
    const profileTeam = profilePos < 2 ? "A" : "B";

    const winner = getMatchWinner(match.score ?? null);

    if (viewerTeam === profileTeam) {
      stats.together.total++;
      if (winner === viewerTeam) stats.together.wins++;
    } else {
      stats.against.total++;
      if (winner === viewerTeam) stats.against.wins++;
    }
  });

  return stats;
}

/**
 * Cached version of getHeadToHeadStats.
 * Keyed by viewerId and profileId. Invalidated by revalidateTag("matches").
 * Fallback revalidate: 60s.
 */
export const getCachedHeadToHeadStats = (viewerId: string, profileId: string) =>
  unstable_cache(
    async () => getHeadToHeadStats(viewerId, profileId),
    ["head-to-head-stats", viewerId, profileId],
    { tags: ["matches"], revalidate: 60 }
  )();

/**
 * Cached confirmed matches for a user.
 * Keyed by userId. Invalidated by revalidateTag("matches").
 * Fallback revalidate: 60s.
 */
export const getCachedConfirmedMatches = (userId: string) =>
  unstable_cache(
    async () => {
      if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
        return [
          {
            id: "m-01",
            score: "6-4, 6-3",
            status: "CONFIRMED",
            date: new Date("2026-08-01T10:00:00.000Z"),
            players: [
              { id: "mp-01", position: 0, displayName: "Agustín", resultConfirmed: true, side: "RIGHT", user: { id: "p-01", displayName: "Agustín", alias: "agu", image: undefined } },
              { id: "mp-02", position: 1, displayName: "Fernando", resultConfirmed: true, side: "LEFT", user: { id: "p-02", displayName: "Fernando", alias: "Bela", image: undefined } },
              { id: "mp-03", position: 2, displayName: "Ramiro", resultConfirmed: true, side: "RIGHT", user: { id: "p-03", displayName: "Ramiro", alias: "Ram", image: undefined } },
              { id: "mp-04", position: 3, displayName: "Gero", resultConfirmed: true, side: "LEFT", user: { id: "p-04", displayName: "Gero", alias: "Ger", image: undefined } },
            ],
          },
          {
            id: "m-02",
            score: "4-6, 5-7",
            status: "CONFIRMED",
            date: new Date("2026-07-28T18:00:00.000Z"),
            players: [
              { id: "mp-05", position: 0, displayName: "Agustín", resultConfirmed: true, side: "RIGHT", user: { id: "p-01", displayName: "Agustín", alias: "agu", image: undefined } },
              { id: "mp-06", position: 1, displayName: "Ramiro", resultConfirmed: true, side: "LEFT", user: { id: "p-03", displayName: "Ramiro", alias: "Ram", image: undefined } },
              { id: "mp-07", position: 2, displayName: "Fernando", resultConfirmed: true, side: "RIGHT", user: { id: "p-02", displayName: "Fernando", alias: "Bela", image: undefined } },
              { id: "mp-08", position: 3, displayName: "Gero", resultConfirmed: true, side: "LEFT", user: { id: "p-04", displayName: "Gero", alias: "Ger", image: undefined } },
            ],
          }
        ] as any;
      }
      return db.query.matches.findMany({
        where: and(
          eq(matchesTable.status, "CONFIRMED"),
          userInMatch(userId),
        ),
        with: {
          players: {
            with: {
              user: {
                columns: {
                  id: true,
                  displayName: true,
                  image: true,
                  alias: true,
                },
              },
            },
          },
        },
        orderBy: desc(matchesTable.date),
        limit: 20,
      });
    },
    ["confirmed-matches", userId],
    { tags: ["matches"], revalidate: 60 }
  )();

/**
 * Get confirmed matches for a public profile (limited to 5, with players).
 * Used by /p/[userId] page.
 */
export async function getConfirmedMatchesForProfile(userId: string, limit = 5) {
  if (process.env.AUTH_BYPASS === "true") {
    return [];
  }
  const result = await db.query.matches.findMany({
    where: and(
      eq(matchesTable.status, "CONFIRMED"),
      userInMatch(userId),
    ),
    with: {
      players: {
        with: {
          user: {
            columns: {
              id: true,
              displayName: true,
              image: true,
              alias: true,
            },
          },
        },
      },
    },
    orderBy: desc(matchesTable.date),
    limit,
  });
  return result;
}

/**
 * Cached version of getConfirmedMatchesForProfile.
 * Keyed by userId and limit. Invalidated by revalidateTag("matches").
 * Fallback revalidate: 60s.
 */
export const getCachedConfirmedMatchesForProfile = (userId: string, limit = 5) =>
  unstable_cache(
    async () => getConfirmedMatchesForProfile(userId, limit),
    ["confirmed-matches-profile", userId, String(limit)],
    { tags: ["matches"], revalidate: 60 }
  )();

/**
 * Cached version of getEnhancedUserMatches.
 * Keyed by userId, statusFilter, and limit. Invalidated by revalidateTag("matches").
 * Fallback revalidate: 60s.
 */
export const getCachedEnhancedUserMatches = (
  userId: string,
  statusFilter?: "PENDING" | "CONFIRMED" | "DISPUTED" | "CANCELLED",
  limit = 20,
) =>
  unstable_cache(
    async () => getEnhancedUserMatches(userId, statusFilter, limit),
    ["enhanced-user-matches", userId, statusFilter ?? "ALL", String(limit)],
    { tags: ["matches"], revalidate: 60 }
  )();

/**
 * Cached version of getPendingAttendanceActions.
 * Keyed by userId. Invalidated by revalidateTag("matches").
 * Fallback revalidate: 60s.
 */
export const getCachedPendingAttendanceActions = (userId: string) =>
  unstable_cache(
    async () => getPendingAttendanceActions(userId),
    ["pending-attendance-actions", userId],
    { tags: ["matches"], revalidate: 60 }
  )();
