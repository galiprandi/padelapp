import { db } from "@/db";
import {
  matches as matchesTable,
  turns as turnsTable,
  users,
  playerEdges,
  playerGraphStats,
} from "@/db/schema";
import { eq, and, gte, desc, inArray, or } from "drizzle-orm";
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
 * Uses the player graph to prioritize contacts:
 * 1. Direct contacts (distance 1 in the graph)
 * 2. Same community cluster (cercanía de nivel)
 * 3. Prioritized by connection strength (frequency) and recency
 * 4. Exclude rivals with extreme outcome (>85% or <15%)
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

  if (!turn || turn.players.length === 0) return [];

  const enrolledUserIds = new Set(turn.players.map((p) => p.userId));
  const enrolledArray = Array.from(enrolledUserIds);

  // 1. Get graph stats for enrolled players (to find their communities)
  const enrolledStats = await db
    .select()
    .from(playerGraphStats)
    .where(inArray(playerGraphStats.userId, enrolledArray));

  const enrolledCommunities = enrolledStats
    .map((s) => s.community)
    .filter((c): c is number => c !== null);

  // 2. Fetch all edges involving any of the enrolled players
  const edges = await db
    .select()
    .from(playerEdges)
    .where(
      or(
        inArray(playerEdges.playerAId, enrolledArray),
        inArray(playerEdges.playerBId, enrolledArray)
      )
    );

  // 3. Fetch stats of players in the same community (community players)
  let communityPlayersStats: typeof playerGraphStats.$inferSelect[] = [];
  if (enrolledCommunities.length > 0) {
    communityPlayersStats = await db
      .select()
      .from(playerGraphStats)
      .where(inArray(playerGraphStats.community, enrolledCommunities));
  }

  // 4. Score and filter candidates
  const candidateScores = new Map<string, number>();
  const candidateDirectMatches = new Map<string, { lastMatchAt: Date; matchesTogether: number }>();
  const validConnectionsForCandidate = new Map<string, Set<string>>(); // candidateId -> enrolledPlayerIds where connection is valid

  // Process direct contacts (edges)
  for (const edge of edges) {
    const isPlayerAEnrolled = enrolledUserIds.has(edge.playerAId);
    const isPlayerBEnrolled = enrolledUserIds.has(edge.playerBId);

    // If both are enrolled, skip
    if (isPlayerAEnrolled && isPlayerBEnrolled) continue;

    const enrolledId = isPlayerAEnrolled ? edge.playerAId : edge.playerBId;
    const candidateId = isPlayerAEnrolled ? edge.playerBId : edge.playerAId;

    // Check extreme outcome exclusion
    // Exclude rivals with outcome extreme (>85% or <15%)
    let isExtreme = false;
    if (edge.matchesAsRivals >= 2) {
      const candidateWins = candidateId === edge.playerAId ? edge.winsA : edge.winsB;
      const outcome = candidateWins / edge.matchesAsRivals;
      if (outcome > 0.85 || outcome < 0.15) {
        isExtreme = true;
      }
    }

    if (isExtreme) {
      continue;
    }

    // Mark as valid connection
    if (!validConnectionsForCandidate.has(candidateId)) {
      validConnectionsForCandidate.set(candidateId, new Set());
    }
    validConnectionsForCandidate.get(candidateId)!.add(enrolledId);

    // Calculate score
    const strength = edge.matchesAsRivals + edge.matchesAsPartners;
    let edgeScore = strength * 10;

    if (edge.lastMatchAt) {
      const daysSince = (Date.now() - edge.lastMatchAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) edgeScore += 50;
      else if (daysSince < 60) edgeScore += 30;
      else if (daysSince < 120) edgeScore += 15;
    }

    const currentScore = candidateScores.get(candidateId) ?? 0;
    candidateScores.set(candidateId, currentScore + edgeScore);

    // Keep track of matches together and last match date
    const existingDirect = candidateDirectMatches.get(candidateId);
    const edgeLastMatchDate = edge.lastMatchAt ? new Date(edge.lastMatchAt) : new Date(0);
    if (existingDirect) {
      existingDirect.matchesTogether += strength;
      if (edgeLastMatchDate > existingDirect.lastMatchAt) {
        existingDirect.lastMatchAt = edgeLastMatchDate;
      }
    } else {
      candidateDirectMatches.set(candidateId, {
        lastMatchAt: edgeLastMatchDate,
        matchesTogether: strength,
      });
    }
  }

  // Process same community players
  for (const stats of communityPlayersStats) {
    const candidateId = stats.userId;
    if (enrolledUserIds.has(candidateId)) continue;

    // Community bonus
    const currentScore = candidateScores.get(candidateId) ?? 0;
    candidateScores.set(candidateId, currentScore + 100);
  }

  // We keep candidates that have either:
  // - A valid connection with at least one enrolled player (not excluded due to extreme outcome)
  // - Or are in the same community (even if no direct edge exists yet)
  const finalCandidateIds = Array.from(candidateScores.keys());

  if (finalCandidateIds.length === 0) return [];

  // 5. Fetch user profile data for all candidates
  const candidatesData = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      alias: users.alias,
      image: users.image,
      level: users.level,
    })
    .from(users)
    .where(inArray(users.id, finalCandidateIds));

  // 6. Map to PadelContact and sort by score
  const mappedContacts: Array<PadelContact & { score: number }> = candidatesData.map((u) => {
    const directInfo = candidateDirectMatches.get(u.id);
    const score = candidateScores.get(u.id) ?? 0;
    return {
      id: u.id,
      displayName: u.displayName,
      alias: u.alias,
      image: u.image,
      level: u.level,
      lastMatchAt: directInfo?.lastMatchAt ?? new Date(0),
      matchesTogether: directInfo?.matchesTogether ?? 0,
      score,
    };
  });

  // Sort by recommendation score descending
  mappedContacts.sort((a, b) => b.score - a.score);

  // Return the sorted contacts without the score field
  return mappedContacts.map(({ score, ...contact }) => contact);
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
