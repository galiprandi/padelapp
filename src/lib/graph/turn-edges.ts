import { db } from "@/db";
import { playerEdges, turnPlayers, turnSubstitutes } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

function edgeKey(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/**
 * Update PlayerEdge.turnsTogether when a new player/substitute enrolls in a turn.
 *
 * Captures social proximity: someone shared the turn link with someone else,
 * so a relationship exists between every pair of enrollees. This signal has
 * NO outcome (no match result) and therefore does NOT feed the skill score —
 * it only feeds the salvage scoring in getTurnNetworkContacts.
 *
 * Called on every successful enrollment (join as player, join as substitute,
 * join by link, substitute promotion). Does NOT decrement on leave: the act
 * of enrolling validates the relationship even if the player later drops out.
 */
export async function updateEdgesForTurnEnrollment(
  turnId: string,
  newPlayerId: string,
): Promise<void> {
  // Fetch all existing enrollees (players + substitutes) excluding the new one
  const [players, substitutes] = await Promise.all([
    db
      .select({ userId: turnPlayers.userId })
      .from(turnPlayers)
      .where(eq(turnPlayers.turnId, turnId)),
    db
      .select({ userId: turnSubstitutes.userId })
      .from(turnSubstitutes)
      .where(eq(turnSubstitutes.turnId, turnId)),
  ]);

  const otherIds = new Set<string>();
  for (const p of players) {
    if (p.userId !== newPlayerId) otherIds.add(p.userId);
  }
  for (const s of substitutes) {
    if (s.userId !== newPlayerId) otherIds.add(s.userId);
  }

  if (otherIds.size === 0) return;

  const now = new Date();

  for (const otherId of otherIds) {
    const [min, max] = edgeKey(newPlayerId, otherId);

    const existing = await db
      .select()
      .from(playerEdges)
      .where(
        and(
          eq(playerEdges.playerAId, min),
          eq(playerEdges.playerBId, max),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(playerEdges)
        .set({
          turnsTogether: sql`${playerEdges.turnsTogether} + 1`,
          lastTurnAt: now,
          updatedAt: now,
        })
        .where(eq(playerEdges.id, existing[0].id));
    } else {
      await db.insert(playerEdges).values({
        playerAId: min,
        playerBId: max,
        turnsTogether: 1,
        lastTurnAt: now,
      });
    }
  }
}

/**
 * Rebuild all turn-based edges from historical enrollments.
 *
 * Used by rebuildEntireGraph() to reconstruct turnsTogether/lastTurnAt from
 * the full history of TurnPlayer + TurnSubstitute records. Processes every
 * turn and creates one edge per pair of enrollees (players + substitutes
 * combined), with turnsTogether = number of turns they shared.
 */
export async function rebuildTurnEdges(): Promise<void> {
  // Load all turn enrollments grouped by turnId
  const [allPlayers, allSubstitutes] = await Promise.all([
    db
      .select({
        turnId: turnPlayers.turnId,
        userId: turnPlayers.userId,
        joinedAt: turnPlayers.joinedAt,
      })
      .from(turnPlayers),
    db
      .select({
        turnId: turnSubstitutes.turnId,
        userId: turnSubstitutes.userId,
        joinedAt: turnSubstitutes.joinedAt,
      })
      .from(turnSubstitutes),
  ]);

  // Group enrollees by turnId
  const turnEnrollees = new Map<string, { userId: string; joinedAt: Date }[]>();
  for (const p of allPlayers) {
    let list = turnEnrollees.get(p.turnId);
    if (!list) {
      list = [];
      turnEnrollees.set(p.turnId, list);
    }
    list.push({ userId: p.userId, joinedAt: p.joinedAt });
  }
  for (const s of allSubstitutes) {
    let list = turnEnrollees.get(s.turnId);
    if (!list) {
      list = [];
      turnEnrollees.set(s.turnId, list);
    }
    list.push({ userId: s.userId, joinedAt: s.joinedAt });
  }

  // Aggregate edge counts and lastTurnAt per pair across all turns
  const edgeAgg = new Map<
    string,
    { playerAId: string; playerBId: string; turnsTogether: number; lastTurnAt: Date }
  >();

  for (const list of turnEnrollees.values()) {
    if (list.length < 2) continue;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const [min, max] = edgeKey(list[i].userId, list[j].userId);
        const key = `${min}|${max}`;
        const existing = edgeAgg.get(key);
        const turnDate = list[i].joinedAt > list[j].joinedAt
          ? list[i].joinedAt
          : list[j].joinedAt;
        if (existing) {
          existing.turnsTogether += 1;
          if (turnDate > existing.lastTurnAt) {
            existing.lastTurnAt = turnDate;
          }
        } else {
          edgeAgg.set(key, {
            playerAId: min,
            playerBId: max,
            turnsTogether: 1,
            lastTurnAt: turnDate,
          });
        }
      }
    }
  }

  // Upsert aggregated edges. Only touches turnsTogether/lastTurnAt — does NOT
  // zero out match-based fields (those are rebuilt separately by updateEdgesForMatch).
  for (const agg of edgeAgg.values()) {
    const existing = await db
      .select()
      .from(playerEdges)
      .where(
        and(
          eq(playerEdges.playerAId, agg.playerAId),
          eq(playerEdges.playerBId, agg.playerBId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(playerEdges)
        .set({
          turnsTogether: agg.turnsTogether,
          lastTurnAt: agg.lastTurnAt,
          updatedAt: new Date(),
        })
        .where(eq(playerEdges.id, existing[0].id));
    } else {
      await db.insert(playerEdges).values({
        playerAId: agg.playerAId,
        playerBId: agg.playerBId,
        turnsTogether: agg.turnsTogether,
        lastTurnAt: agg.lastTurnAt,
      });
    }
  }
}
