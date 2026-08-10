import { db } from "@/db";
import { turns as turnsTable } from "@/db/schema";
import { eq, and, gte, inArray, asc } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { userInTurn, userNotInTurn, userIsSubstitute } from "./helpers";

/**
 * Get turns where the user is enrolled, upcoming (date >= now),
 * status OPEN or FULL. Used by dashboard "Mi Agenda".
 */
export async function getMyUpcomingTurns(userId: string, limit = 3) {
  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    return [];
  }
  const now = new Date();
  return db.query.turns.findMany({
    where: and(
      gte(turnsTable.date, now),
      inArray(turnsTable.status, ["OPEN", "FULL"]),
      userInTurn(userId),
    ),
    with: {
      players: {
        with: {
          user: {
            columns: {
              id: true,
              displayName: true,
              alias: true,
              image: true,
            },
          },
        },
      },
      substitutes: {
        with: {
          user: {
            columns: {
              id: true,
              displayName: true,
              alias: true,
              image: true,
            },
          },
        },
      },
      creator: true,
    },
    orderBy: asc(turnsTable.date),
    limit,
  });
}

/**
 * Cached version of getMyUpcomingTurns.
 * Keyed by userId and limit. Invalidated by revalidateTag("turns").
 * Fallback revalidate: 30s.
 */
export const getCachedMyUpcomingTurns = (userId: string, limit = 3) =>
  unstable_cache(
    async () => getMyUpcomingTurns(userId, limit),
    ["my-upcoming-turns", userId, String(limit)],
    { tags: ["turns"], revalidate: 30 }
  )();

/**
 * Cached version of getMySubstituteTurns.
 * Keyed by userId and limit. Invalidated by revalidateTag("turns").
 * Fallback revalidate: 30s.
 */
export const getCachedMySubstituteTurns = (userId: string, limit = 3) =>
  unstable_cache(
    async () => getMySubstituteTurns(userId, limit),
    ["my-substitute-turns", userId, String(limit)],
    { tags: ["turns"], revalidate: 30 }
  )();

/**
 * Cached version of getRecommendedTurns.
 * Keyed by userId and limit. Invalidated by revalidateTag("turns").
 * Fallback revalidate: 30s.
 */
export const getCachedRecommendedTurns = (userId: string, limit = 3) =>
  unstable_cache(
    async () => getRecommendedTurns(userId, limit),
    ["recommended-turns", userId, String(limit)],
    { tags: ["turns"], revalidate: 30 }
  )();

/**
 * Get recommended turns: OPEN status, user NOT enrolled, upcoming.
 * Used by dashboard "Turnos recomendados".
 */
export async function getRecommendedTurns(userId: string, limit = 3) {
  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    return [];
  }
  const now = new Date();
  return db.query.turns.findMany({
    where: and(
      gte(turnsTable.date, now),
      eq(turnsTable.status, "OPEN"),
      userNotInTurn(userId),
    ),
    with: {
      players: {
        with: {
          user: {
            columns: {
              id: true,
              displayName: true,
              alias: true,
              image: true,
            },
          },
        },
      },
      substitutes: {
        with: {
          user: {
            columns: {
              id: true,
              displayName: true,
              alias: true,
              image: true,
            },
          },
        },
      },
      creator: true,
    },
    orderBy: asc(turnsTable.date),
    limit,
  });
}

/**
 * Cached open turns list.
 * Invalidated by revalidateTag("turns") — called after turn create/join/leave/cancel.
 * Fallback revalidate: 30s (turns change more frequently than ranking).
 */
export const getCachedOpenTurns = unstable_cache(
  async () => {
    return db.query.turns.findMany({
      where: and(
        gte(turnsTable.date, new Date()),
        inArray(turnsTable.status, ["OPEN", "FULL"]),
      ),
      with: {
        players: {
          with: {
            user: {
              columns: {
                id: true,
                displayName: true,
                alias: true,
                image: true,
              },
            },
          },
        },
        substitutes: {
          with: {
            user: {
              columns: {
                id: true,
                displayName: true,
                alias: true,
                image: true,
              },
            },
          },
        },
        creator: true,
      },
      orderBy: asc(turnsTable.date),
      limit: 20,
    });
  },
  ["open-turns"],
  { tags: ["turns"], revalidate: 30 },
);

/**
 * Get turns where the user is a substitute, upcoming (date >= now),
 * status OPEN or FULL. Used by dashboard to show substitute commitments.
 */
export async function getMySubstituteTurns(userId: string, limit = 3) {
  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    return [];
  }
  const now = new Date();
  return db.query.turns.findMany({
    where: and(
      gte(turnsTable.date, now),
      inArray(turnsTable.status, ["OPEN", "FULL"]),
      userIsSubstitute(userId),
    ),
    with: {
      players: {
        with: {
          user: {
            columns: {
              id: true,
              displayName: true,
              alias: true,
              image: true,
            },
          },
        },
      },
      substitutes: {
        with: {
          user: {
            columns: {
              id: true,
              displayName: true,
              alias: true,
              image: true,
            },
          },
        },
      },
      creator: true,
    },
    orderBy: asc(turnsTable.date),
    limit,
  });
}
