import { db } from "@/db";
import { turns as turnsTable } from "@/db/schema";
import { eq, and, gte, inArray, asc } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { userInTurn, userNotInTurn } from "./helpers";

/**
 * Get turns where the user is enrolled, upcoming (date >= now),
 * status OPEN or FULL. Used by dashboard "Mi Agenda".
 */
export async function getMyUpcomingTurns(userId: string, limit = 3) {
  const now = new Date();
  return db.query.turns.findMany({
    where: and(
      gte(turnsTable.date, now),
      inArray(turnsTable.status, ["OPEN", "FULL"]),
      userInTurn(userId),
    ),
    with: { players: true },
    orderBy: asc(turnsTable.date),
    limit,
  });
}

/**
 * Get recommended turns: OPEN status, user NOT enrolled, upcoming.
 * Used by dashboard "Turnos recomendados".
 */
export async function getRecommendedTurns(userId: string, limit = 3) {
  const now = new Date();
  return db.query.turns.findMany({
    where: and(
      gte(turnsTable.date, now),
      eq(turnsTable.status, "OPEN"),
      userNotInTurn(userId),
    ),
    with: { players: true },
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
        players: true,
        creator: true,
      },
      orderBy: asc(turnsTable.date),
      limit: 20,
    });
  },
  ["open-turns"],
  { tags: ["turns"], revalidate: 30 }
);
