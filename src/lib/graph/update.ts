import { db } from "@/db";
import { playerEdges } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getMatchWinner } from "@/lib/utils";
import type { ConfirmedMatchInfo } from "./engine";

function edgeKey(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function updateEdgesForMatch(match: ConfirmedMatchInfo): Promise<void> {
  const players = match.players.filter((p) => p.userId !== null);
  if (players.length < 2) return;

  const winner = getMatchWinner(match.score);
  const matchDate = match.date;

  const totalPlayers = players.length;
  const teamOf = (pos: number) =>
    totalPlayers <= 2 ? (pos === 0 ? "A" : "B") : pos < 2 ? "A" : "B";

  const teamA = players.filter((p) => teamOf(p.position) === "A");
  const teamB = players.filter((p) => teamOf(p.position) === "B");

  const teamAWon = winner === "A";
  const teamBWon = winner === "B";

  const updates: Array<{
    playerAId: string;
    playerBId: string;
    rivalDelta: number;
    partnerDelta: number;
    winsADelta: number;
    winsBDelta: number;
    winsTogetherDelta: number;
    lossesTogetherDelta: number;
  }> = [];

  for (const a of teamA) {
    for (const b of teamB) {
      const [min, max] = edgeKey(a.userId!, b.userId!);
      const isMinA = min === a.userId!;
      updates.push({
        playerAId: min,
        playerBId: max,
        rivalDelta: 1,
        partnerDelta: 0,
        winsADelta: isMinA ? (teamAWon ? 1 : 0) : (teamBWon ? 1 : 0),
        winsBDelta: isMinA ? (teamBWon ? 1 : 0) : (teamAWon ? 1 : 0),
        winsTogetherDelta: 0,
        lossesTogetherDelta: 0,
      });
    }
  }

  for (const team of [teamA, teamB]) {
    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        const [min, max] = edgeKey(team[i].userId!, team[j].userId!);
        const teamWon = team === teamA ? teamAWon : teamBWon;
        updates.push({
          playerAId: min,
          playerBId: max,
          rivalDelta: 0,
          partnerDelta: 1,
          winsADelta: 0,
          winsBDelta: 0,
          winsTogetherDelta: teamWon ? 1 : 0,
          lossesTogetherDelta: teamWon ? 0 : 1,
        });
      }
    }
  }

  for (const u of updates) {
    const existing = await db
      .select()
      .from(playerEdges)
      .where(
        and(
          eq(playerEdges.playerAId, u.playerAId),
          eq(playerEdges.playerBId, u.playerBId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(playerEdges)
        .set({
          matchesAsRivals: sql`${playerEdges.matchesAsRivals} + ${u.rivalDelta}`,
          matchesAsPartners: sql`${playerEdges.matchesAsPartners} + ${u.partnerDelta}`,
          winsA: sql`${playerEdges.winsA} + ${u.winsADelta}`,
          winsB: sql`${playerEdges.winsB} + ${u.winsBDelta}`,
          winsTogether: sql`${playerEdges.winsTogether} + ${u.winsTogetherDelta}`,
          lossesTogether: sql`${playerEdges.lossesTogether} + ${u.lossesTogetherDelta}`,
          lastMatchAt: matchDate,
          updatedAt: new Date(),
        })
        .where(eq(playerEdges.id, existing[0].id));
    } else {
      await db.insert(playerEdges).values({
        playerAId: u.playerAId,
        playerBId: u.playerBId,
        matchesAsRivals: u.rivalDelta,
        matchesAsPartners: u.partnerDelta,
        winsA: u.winsADelta,
        winsB: u.winsBDelta,
        winsTogether: u.winsTogetherDelta,
        lossesTogether: u.lossesTogetherDelta,
        lastMatchAt: matchDate,
      });
    }
  }
}
