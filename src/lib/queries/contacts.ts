import { db } from "@/db";
import {
  matches as matchesTable,
  turns as turnsTable,
  users,
  playerEdges,
  playerGraphStats,
} from "@/db/schema";
import { eq, and, gte, desc, inArray, or } from "drizzle-orm";
import { userInMatch } from "./helpers";
import { unstable_cache } from "next/cache";

export interface PadelContact {
  id: string;
  displayName: string;
  alias: string | null;
  image: string | null;
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
  if (process.env.AUTH_BYPASS === "true") {
    return [];
  }
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
  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    return [
      {
        id: "p-03",
        displayName: "Diego Morales",
        alias: "Gero",
        image: null,
        lastMatchAt: new Date(),
        matchesTogether: 5,
      },
      {
        id: "p-04",
        displayName: "Facundo Lopez",
        alias: "Facu",
        image: null,
        lastMatchAt: new Date(),
        matchesTogether: 3,
      },
    ];
  }

  const [turn] = await db.query.turns.findMany({
    where: eq(turnsTable.id, turnId),
    with: {
      players: {
        columns: {
          userId: true,
        },
      },
      substitutes: {
        columns: {
          userId: true,
        },
      },
    },
    limit: 1,
  });

  if (!turn || turn.players.length === 0) return [];

  const enrolledUserIds = new Set(turn.players.map((p) => p.userId));
  const substituteUserIds = new Set(turn.substitutes?.map((s) => s.userId) ?? []);
  const participantUserIds = new Set([...enrolledUserIds, ...substituteUserIds]);
  const enrolledArray = Array.from(enrolledUserIds);

  // 1. Get graph stats for enrolled players (to find their communities)
  const enrolledStats = await db
    .select()
    .from(playerGraphStats)
    .where(inArray(playerGraphStats.userId, enrolledArray));

  const enrolledCommunities = Array.from(
    new Set(
      enrolledStats
        .map((s) => s.community)
        .filter((c): c is number => c !== null)
    )
  );

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
  const excludedUserIds = new Set<string>(); // candidateIds that have an extreme outcome against ANY enrolled player

  // Process direct contacts (edges)
  for (const edge of edges) {
    const isPlayerAEnrolled = enrolledUserIds.has(edge.playerAId);
    const isPlayerBEnrolled = enrolledUserIds.has(edge.playerBId);

    // If both are enrolled, skip
    if (isPlayerAEnrolled && isPlayerBEnrolled) continue;

    const enrolledId = isPlayerAEnrolled ? edge.playerAId : edge.playerBId;
    const candidateId = isPlayerAEnrolled ? edge.playerBId : edge.playerAId;

    // Skip if candidate is already part of the turn (either as player or substitute)
    if (participantUserIds.has(candidateId)) continue;

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
      excludedUserIds.add(candidateId);
      continue;
    }

    // Mark as valid connection
    if (!validConnectionsForCandidate.has(candidateId)) {
      validConnectionsForCandidate.set(candidateId, new Set());
    }
    validConnectionsForCandidate.get(candidateId)!.add(enrolledId);

    // Calculate score from match-based signal (rivalry + partnership)
    const matchStrength = edge.matchesAsRivals + edge.matchesAsPartners;
    let edgeScore = matchStrength * 10;

    // Add co-inscription signal (turnsTogether). Lower weight than match-based
    // signal (no outcome, no confirmed play) but still a strong proximity hint:
    // someone shared the turn link with someone else. Weight 5 vs 10.
    edgeScore += edge.turnsTogether * 5;

    // Recency bonus: use the most recent of lastMatchAt / lastTurnAt so that
    // a recent co-inscription also boosts the score even without a match.
    const lastInteraction = edge.lastTurnAt && edge.lastMatchAt
      ? (edge.lastTurnAt > edge.lastMatchAt ? edge.lastTurnAt : edge.lastMatchAt)
      : (edge.lastTurnAt ?? edge.lastMatchAt);
    if (lastInteraction) {
      const daysSince = (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) edgeScore += 50;
      else if (daysSince < 60) edgeScore += 30;
      else if (daysSince < 120) edgeScore += 15;
    }

    const currentScore = candidateScores.get(candidateId) ?? 0;
    candidateScores.set(candidateId, currentScore + edgeScore);

    // Keep track of total connections (matches + turns) and last interaction date
    const totalStrength = matchStrength + edge.turnsTogether;
    const existingDirect = candidateDirectMatches.get(candidateId);
    const edgeLastDate = lastInteraction ? new Date(lastInteraction) : new Date(0);
    if (existingDirect) {
      existingDirect.matchesTogether += totalStrength;
      if (edgeLastDate > existingDirect.lastMatchAt) {
        existingDirect.lastMatchAt = edgeLastDate;
      }
    } else {
      candidateDirectMatches.set(candidateId, {
        lastMatchAt: edgeLastDate,
        matchesTogether: totalStrength,
      });
    }
  }

  // Process same community players
  for (const stats of communityPlayersStats) {
    const candidateId = stats.userId;
    if (participantUserIds.has(candidateId)) continue;
    if (excludedUserIds.has(candidateId)) continue;

    // Community bonus
    const currentScore = candidateScores.get(candidateId) ?? 0;
    candidateScores.set(candidateId, currentScore + 100);
  }

  // We keep candidates that have either:
  // - A valid connection with at least one enrolled player (not excluded due to extreme outcome)
  // - Or are in the same community (even if no direct edge exists yet)
  // Filter out any candidates that have an extreme outcome against ANY enrolled player
  const finalCandidateIds = Array.from(candidateScores.keys()).filter(
    (id) => !excludedUserIds.has(id)
  );

  if (finalCandidateIds.length === 0) return [];

  // 5. Fetch user profile data for all candidates
  const candidatesData = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      alias: users.alias,
      image: users.image,
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
      lastMatchAt: directInfo?.lastMatchAt ?? new Date(0),
      matchesTogether: directInfo?.matchesTogether ?? 0,
      score,
    };
  });

  // Sort by recommendation score descending
  mappedContacts.sort((a, b) => b.score - a.score);

  // Return the sorted contacts without the score field
  return mappedContacts.map((contact) => {
    const { score, ...rest } = contact;
    void score;
    return rest;
  });
}

type ContactMatchPlayer = {
  user: {
    id: string;
    displayName: string;
    alias: string | null;
    image: string | null;
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
export function buildContactsMap(
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

/**
 * Cached version of getPadelContacts.
 * Keyed by userId and monthsBack. Invalidated by revalidateTag("matches").
 * Fallback revalidate: 60s.
 */
export const getCachedPadelContacts = (userId: string, options?: { monthsBack?: number }) =>
  unstable_cache(
    async () => getPadelContacts(userId, options),
    ["padel-contacts", userId, String(options?.monthsBack ?? "default")],
    { tags: ["matches"], revalidate: 60 }
  )();
