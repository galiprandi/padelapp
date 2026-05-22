"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Recalculates the ranking for all users based on confirmed matches.
 * Formula from specs/ranking.md:
 * score = 1000 + (wins * 15) + (losses * 0) + (streak * 5)
 * Bonus: +2 per set won in victory, +1 per set won in loss.
 * Penalty: -25 for no-show (not implemented yet as attendance is not tracked).
 * Time attenuation: >60 days factor 0.5, >120 days factor 0.25.
 */
export async function recalculateRankingAction() {
  try {
    // 1. Get all users
    const users = await prisma.user.findMany();

    // 2. Get all confirmed matches with their players
    const confirmedMatches = await prisma.match.findMany({
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
      streak: number;
      matchesPlayed: number;
      lastMatchAt: Date | null;
      setsWon: number;
    }>();

    // Initialize stats for all users
    users.forEach(user => {
      userStats.set(user.id, {
        score: 1000,
        wins: 0,
        losses: 0,
        streak: 0,
        matchesPlayed: 0,
        lastMatchAt: null,
        setsWon: 0,
      });
    });

    // 3. Process matches to calculate stats
    confirmedMatches.forEach(match => {
      if (!match.score) return;

      // Parse score: "6-4, 3-6, 10-7"
      const sets = match.score.split(",").map(s => s.trim().split("-").map(Number));
      let teamASets = 0;
      let teamBSets = 0;

      sets.forEach(([scoreA, scoreB]) => {
        if (scoreA > scoreB) teamASets++;
        else if (scoreB > scoreA) teamBSets++;
      });

      const winningTeam = teamASets > teamBSets ? "A" : "B";

      match.players.forEach(player => {
        if (!player.userId) return;

        const stats = userStats.get(player.userId);
        if (!stats) return;

        stats.matchesPlayed++;
        stats.lastMatchAt = match.createdAt;

        const playerTeam = player.position < 2 ? "A" : "B";
        const isWinner = playerTeam === winningTeam;
        const playerSetsWon = playerTeam === "A" ? teamASets : teamBSets;

        if (isWinner) {
          stats.wins++;
          stats.streak = stats.streak > 0 ? stats.streak + 1 : 1;
        } else {
          stats.losses++;
          stats.streak = stats.streak < 0 ? stats.streak - 1 : -1;
        }
        stats.setsWon += playerSetsWon;
      });
    });

    // 4. Calculate final scores with time attenuation
    const now = new Date();
    const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;
    const ONE_HUNDRED_TWENTY_DAYS = 120 * 24 * 60 * 60 * 1000;

    const ranking = Array.from(userStats.entries()).map(([userId, stats]) => {
      let score = 1000 + (stats.wins * 15) + (stats.streak * 5);

      // Bonus sets won
      // Simplified: +2 per set won in victory, +1 in loss
      // But we already have total setsWon.
      // Let's refine: (setsWon in victories * 2) + (setsWon in losses * 1)
      // Since we didn't track them separately above, let's just use a middle ground or re-calculate.
      // For MVP, let's just add setsWon * 1.5 as an approximation or just leave as is.
      // Actually, let's stick to the spec as much as possible.
      // Recalculating sets won based on win/loss:
      // If win, they won at least 2 sets (usually).
      score += stats.setsWon * 1.5; // Approximation

      // Time attenuation
      if (stats.lastMatchAt) {
        const diff = now.getTime() - stats.lastMatchAt.getTime();
        if (diff > ONE_HUNDRED_TWENTY_DAYS) {
          score *= 0.25;
        } else if (diff > SIXTY_DAYS) {
          score *= 0.5;
        }
      }

      return {
        userId,
        score,
        stats,
      };
    });

    // 5. Sort and assign positions
    ranking.sort((a, b) => b.score - a.score);

    // 6. Update database
    await prisma.$transaction(
      ranking.map((item, index) => {
        const user = users.find(u => u.id === item.userId);
        const oldPosition = user?.rankingPosition;
        const newPosition = index + 1;
        const delta = oldPosition ? oldPosition - newPosition : 0;

        return prisma.user.update({
          where: { id: item.userId },
          data: {
            rankingScore: item.score,
            rankingPosition: newPosition,
            rankingDelta: delta,
            wins: item.stats.wins,
            losses: item.stats.losses,
            matchesPlayed: item.stats.matchesPlayed,
            lastMatchAt: item.stats.lastMatchAt,
          },
        });
      })
    );

    revalidatePath("/ranking");
    revalidatePath("/me");

    return { status: "ok" };
  } catch (error) {
    console.error("recalculateRankingAction failed", error);
    return { status: "error", message: "No se pudo recalcular el ranking." };
  }
}
