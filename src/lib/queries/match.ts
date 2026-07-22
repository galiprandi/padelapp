import { db } from "@/db";
import {
  matches as matchesTable,
  matchPlayers,
} from "@/db/schema";
import { eq, and, ne, lt, inArray, desc, asc, count } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { getMatchWinner } from "@/lib/utils";
import { userInMatch, userInMatchByRef, hasPlayerWithoutAttendance } from "./helpers";

export async function getEnhancedUserMatches(
  userId: string,
  statusFilter?: "PENDING" | "CONFIRMED" | "DISPUTED" | "CANCELLED",
  limit = 20
): Promise<MatchResultCompactMatch[]> {
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
      const preferredName = player.user && "alias" in player.user && player.user.alias
        ? player.user.alias
        : player.user?.displayName;
      return {
        id: player.id,
        position: player.position,
        displayName: player.displayName,
        resultConfirmed: player.resultConfirmed,
        side: player.side,
        user: player.user
          ? {
            id: player.user.id,
            displayName: preferredName ?? null,
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
    preloadedPendingMatches ?? (await getEnhancedUserMatches(userId, "PENDING"));
  const now = new Date();

  // Filter for matches that have already happened
  return allPendingMatches
    .filter(m => new Date(m.date || m.createdAt) < now)
    .sort((a, b) => {
      // Prioritize those that HAVE a score (need confirmation) over those that DON'T have a score (need score upload)
      if (a.score && !b.score) return -1;
      if (!a.score && b.score) return 1;
      // Secondary: most recent first
      return new Date(b.date || b.createdAt).getTime() - new Date(a.date || b.createdAt).getTime();
    });
}

export async function getPendingActionsCount(userId: string): Promise<number> {
  const now = new Date();
  const [{ count: total }] = await db
    .select({ count: count() })
    .from(matchesTable)
    .where(
      and(
        eq(matchesTable.status, "PENDING"),
        lt(matchesTable.date, now),
        userInMatchByRef(userId),
      ),
    );
  return total;
}

export async function getPendingAttendanceActions(userId: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

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
 * Cached confirmed matches for a user.
 * Keyed by userId. Invalidated by revalidateTag("matches").
 * Fallback revalidate: 60s.
 */
export const getCachedConfirmedMatches = unstable_cache(
  async (userId: string) => {
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
  ["confirmed-matches"],
  { tags: ["matches"], revalidate: 60 }
);

/**
 * Get confirmed matches for a public profile (limited to 5, with players).
 * Used by /p/[userId] page.
 */
export async function getConfirmedMatchesForProfile(userId: string, limit = 5) {
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
