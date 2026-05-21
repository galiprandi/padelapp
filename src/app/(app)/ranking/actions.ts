"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface RankingEntry {
  userId: string;
  displayName: string;
  score: number;
  position: number;
  positionChange: number;
  level: number;
  attendanceScore: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  lastMatchAt: Date | null;
}

export async function getRankingAction() {
  const session = await auth();

  const users = await prisma.user.findMany({
    orderBy: [
      { rankingScore: "desc" },
      { attendanceScore: "desc" },
      { wins: "desc" },
      { lastMatchAt: "desc" },
    ],
  });

  const ranking: RankingEntry[] = users.map((user, index) => ({
    userId: user.id,
    displayName: user.alias || user.displayName,
    score: user.rankingScore,
    position: index + 1,
    positionChange: user.rankingDelta,
    level: user.level,
    attendanceScore: user.attendanceScore * 100,
    wins: user.wins,
    losses: user.losses,
    matchesPlayed: user.matchesPlayed,
    lastMatchAt: user.lastMatchAt,
  }));

  const currentUserRanking = session?.user?.id
    ? ranking.find((r) => r.userId === session.user.id)
    : null;

  return {
    ranking,
    currentUserRanking,
  };
}

/**
 * Recalculates ranking based on confirmed matches.
 * Formula: score = 1000 + (wins * 15) + (losses * 0) + (streak * 5)
 * Bonus: +2 per set won in victory, +1 per set won in defeat.
 * Penalty: -25 per registered no-show (not fully implemented in models yet, but kept in mind).
 * Decays and time attenuation are not applied in this MVP version but planned.
 */
export async function recalculateRankingAction() {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  // Fetch all confirmed matches with players and their results
  const matches = await prisma.match.findMany({
    where: { status: "CONFIRMED" },
    include: {
      players: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const userStats = new Map<string, {
    score: number;
    wins: number;
    losses: number;
    matchesPlayed: number;
    lastMatchAt: Date | null;
    streak: number;
    confirmedCount: number;
    attendanceCount: number;
  }>();

  // Helper to get or init user stats
  const getStats = (userId: string) => {
    if (!userStats.has(userId)) {
      userStats.set(userId, {
        score: 1000,
        wins: 0,
        losses: 0,
        matchesPlayed: 0,
        lastMatchAt: null,
        streak: 0,
        confirmedCount: 0,
        attendanceCount: 0,
      });
    }
    return userStats.get(userId)!;
  };

  for (const match of matches) {
    if (!match.score) continue;

    const sets = match.score.split(",").map(s => s.trim().split("-").map(Number));
    let setsWonA = 0;
    let setsWonB = 0;

    sets.forEach(([a, b]) => {
      if (a > b) setsWonA++;
      else if (b > a) setsWonB++;
    });

    const matchWinner = setsWonA > setsWonB ? "A" : "B";

    match.players.forEach(player => {
      if (!player.userId) return;

      const stats = getStats(player.userId);
      stats.matchesPlayed++;
      stats.lastMatchAt = match.createdAt;
      stats.confirmedCount++;
      stats.attendanceCount++; // MVP: Assume presence if match is confirmed

      const isTeamA = player.position < 2;
      const playerTeam = isTeamA ? "A" : "B";
      const isWinner = playerTeam === matchWinner;
      const setsWon = isTeamA ? setsWonA : setsWonB;

      if (isWinner) {
        stats.wins++;
        stats.streak = stats.streak > 0 ? stats.streak + 1 : 1;
        stats.score += 15 + (stats.streak * 5) + (setsWon * 2);
      } else {
        stats.losses++;
        stats.streak = stats.streak < 0 ? stats.streak - 1 : -1;
        stats.score += (setsWon * 1);
      }
    });
  }

  // Update users in database
  const sortedUsers = Array.from(userStats.entries()).sort((a, b) => b[1].score - a[1].score);

  await prisma.$transaction(
    sortedUsers.map(([userId, stats], index) => {
      const newPosition = index + 1;
      // We don't have the previous position easily available here without fetching users first,
      // but we can calculate delta if we fetch them. For MVP simplicity, we might just store the current one.
      return prisma.user.update({
        where: { id: userId },
        data: {
          rankingScore: stats.score,
          matchesPlayed: stats.matchesPlayed,
          wins: stats.wins,
          losses: stats.losses,
          lastMatchAt: stats.lastMatchAt,
          attendanceScore: stats.attendanceCount / (stats.confirmedCount || 1),
          // rankingPosition and rankingDelta will be updated in a second pass or simpler logic
        },
      });
    })
  );

  // Update positions and deltas
  const allUsers = await prisma.user.findMany({
    orderBy: { rankingScore: "desc" }
  });

  await prisma.$transaction(
    allUsers.map((user, index) => {
      const newPosition = index + 1;
      const oldPosition = user.rankingPosition || newPosition;
      return prisma.user.update({
        where: { id: user.id },
        data: {
          rankingPosition: newPosition,
          rankingDelta: oldPosition - newPosition,
        }
      });
    })
  );

  revalidatePath("/ranking");
  revalidatePath("/me");
}
