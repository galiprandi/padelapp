import { db } from "@/db";
import {
  matches as matchesTable,
  turns as turnsTable,
} from "@/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { userInMatch, userInMatchFromList } from "./helpers";

export interface PadelContact {
  id: string;
  displayName: string;
  alias: string | null;
  image: string | null;
  level: number;
  lastMatchAt: Date;
  matchesTogether: number;
}

/**
 * Get a user's padel contacts — players they shared a confirmed match with
 * within the last 12 months. Includes both teammates and opponents.
 */
export async function getPadelContacts(
  userId: string,
  options?: { monthsBack?: number }
): Promise<PadelContact[]> {
  const monthsBack = options?.monthsBack ?? 12;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - monthsBack);

  // Find all confirmed matches where this user played, within the cutoff
  const matches = await db.query.matches.findMany({
    where: and(
      eq(matchesTable.status, "CONFIRMED"),
      gte(matchesTable.date, cutoff),
      userInMatch(userId),
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
              level: true,
            },
          },
        },
      },
    },
    orderBy: desc(matchesTable.date),
  });

  return buildContactsMap(matches, userId);
}

/**
 * Get the combined padel network for all enrolled players in a turn.
 * Used for "Open to my network" — notifies contacts of ALL enrollees,
 * not just the organizer. Excludes already-enrolled users.
 *
 * Uses a single bulk query instead of N per-enrolled-player queries.
 */
export async function getTurnNetworkContacts(turnId: string): Promise<PadelContact[]> {
  const [turn] = await db.query.turns.findMany({
    where: eq(turnsTable.id, turnId),
    with: {
      players: {
        columns: {
          userId: true,
        },
      },
    },
    limit: 1,
  });

  if (!turn) return [];

  const enrolledUserIds = new Set(turn.players.map((p) => p.userId));
  const enrolledArray = Array.from(enrolledUserIds);
  const monthsBack = 12;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - monthsBack);

  // Single bulk query: all confirmed matches where ANY enrolled player participated
  const matches = await db.query.matches.findMany({
    where: and(
      eq(matchesTable.status, "CONFIRMED"),
      gte(matchesTable.date, cutoff),
      userInMatchFromList(enrolledArray),
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
              level: true,
            },
          },
        },
      },
    },
    orderBy: desc(matchesTable.date),
  });

  return buildContactsMap(matches, enrolledUserIds);
}

type ContactMatchPlayer = {
  user: {
    id: string;
    displayName: string;
    alias: string | null;
    image: string | null;
    level: number;
  } | null;
};

type ContactMatch = {
  date: Date;
  players: ContactMatchPlayer[];
};

/**
 * Shared helper: builds a sorted contacts map from a list of matches.
 * Excludes the user themselves (single-user mode) or all enrolled users (turn mode).
 */
function buildContactsMap(
  matches: ContactMatch[],
  excludeIds: string | Set<string>,
): PadelContact[] {
  const excludeSet = typeof excludeIds === "string" ? new Set([excludeIds]) : excludeIds;

  const contactsMap = new Map<string, PadelContact>();

  for (const match of matches) {
    for (const player of match.players) {
      if (!player.user || excludeSet.has(player.user.id)) continue;

      const existing = contactsMap.get(player.user.id);
      if (existing) {
        existing.matchesTogether++;
        if (match.date > existing.lastMatchAt) {
          existing.lastMatchAt = match.date;
        }
      } else {
        contactsMap.set(player.user.id, {
          id: player.user.id,
          displayName: player.user.displayName,
          alias: player.user.alias,
          image: player.user.image,
          level: player.user.level,
          lastMatchAt: match.date,
          matchesTogether: 1,
        });
      }
    }
  }

  return Array.from(contactsMap.values()).sort(
    (a, b) => b.lastMatchAt.getTime() - a.lastMatchAt.getTime()
  );
}
