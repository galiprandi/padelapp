import { prisma } from "@/lib/prisma";

/**
 * Get a user's padel contacts — players they shared a confirmed match with
 * within the last 12 months. Includes both teammates and opponents.
 */
export async function getPadelContacts(
  userId: string,
  options?: { monthsBack?: number }
): Promise<
  Array<{
    id: string;
    displayName: string;
    alias: string | null;
    image: string | null;
    level: number;
    lastMatchAt: Date;
    matchesTogether: number;
  }>
> {
  const monthsBack = options?.monthsBack ?? 12;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - monthsBack);

  // Find all confirmed matches where this user played, within the cutoff
  const matches = await prisma.match.findMany({
    where: {
      status: "CONFIRMED",
      date: { gte: cutoff },
      players: { some: { userId } },
    },
    include: {
      players: {
        include: {
          user: {
            select: {
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
    orderBy: { date: "desc" },
  });

  // Build a map of contactId -> contact info
  const contactsMap = new Map<
    string,
    {
      id: string;
      displayName: string;
      alias: string | null;
      image: string | null;
      level: number;
      lastMatchAt: Date;
      matchesTogether: number;
    }
  >();

  for (const match of matches) {
    for (const player of match.players) {
      // Skip the user themselves and unlinked slots
      if (!player.user || player.user.id === userId) continue;

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

  // Sort by most recent match first
  return Array.from(contactsMap.values()).sort(
    (a, b) => b.lastMatchAt.getTime() - a.lastMatchAt.getTime()
  );
}

/**
 * Get the combined padel network for all enrolled players in a turn.
 * Used for "Open to my network" — notifies contacts of ALL enrollees,
 * not just the organizer. Excludes already-enrolled users.
 *
 * Uses a single bulk query instead of N per-enrolled-player queries.
 */
export async function getTurnNetworkContacts(turnId: string): Promise<
  Array<{
    id: string;
    displayName: string;
    alias: string | null;
    image: string | null;
    level: number;
    lastMatchAt: Date;
    matchesTogether: number;
  }>
> {
  const turn = await prisma.turn.findUnique({
    where: { id: turnId },
    include: {
      players: { select: { userId: true } },
    },
  });

  if (!turn) return [];

  const enrolledUserIds = new Set(turn.players.map((p) => p.userId));
  const enrolledArray = Array.from(enrolledUserIds);
  const monthsBack = 12;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - monthsBack);

  // Single bulk query: all confirmed matches where ANY enrolled player participated
  const matches = await prisma.match.findMany({
    where: {
      status: "CONFIRMED",
      date: { gte: cutoff },
      players: { some: { userId: { in: enrolledArray } } },
    },
    include: {
      players: {
        include: {
          user: {
            select: {
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
    orderBy: { date: "desc" },
  });

  // Build contact map from all matches
  const contactsMap = new Map<
    string,
    {
      id: string;
      displayName: string;
      alias: string | null;
      image: string | null;
      level: number;
      lastMatchAt: Date;
      matchesTogether: number;
    }
  >();

  for (const match of matches) {
    for (const player of match.players) {
      if (!player.user || enrolledUserIds.has(player.user.id)) continue;

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
