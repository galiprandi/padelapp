"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getMatchWinner } from "@/lib/utils";

/**
 * Recalculates the ranking for all users based on confirmed matches and attendance.
 * Formula from specs/ranking.md:
 * score = 1000 + (wins * 15) + (streak * 5) + (setsWonBonus)
 * Bonus: +2 per set won in victory, +1 per set won in loss.
 * Attendance: Ratio of confirmed results vs total matches played.
 * Time attenuation: >60 days factor 0.5, >120 days factor 0.25.
 */
export async function recalculateRankingAction() {
  try {
    // 1. Get all users
    const users = await prisma.user.findMany();

    // 2. Get all match players to calculate stats and attendance
    // We include all matches where the user was a player to calculate attendanceScore
    const allMatchPlayers = await prisma.matchPlayer.findMany({
      where: {
        userId: { not: null },
      },
      include: {
        match: true,
      },
      orderBy: {
        match: {
          date: "asc",
        },
      },
    });

    const userStats = new Map<
      string,
      {
        wins: number;
        losses: number;
        streak: number;
        matchesPlayed: number;
        lastMatchAt: Date | null;
        setsWonBonus: number;
        confirmedMatchesCount: number;
        totalMatchesCount: number;
      }
    >();

    // Initialize stats for all users
    users.forEach((user) => {
      userStats.set(user.id, {
        wins: 0,
        losses: 0,
        streak: 0,
        matchesPlayed: 0,
        lastMatchAt: null,
        setsWonBonus: 0,
        confirmedMatchesCount: 0,
        totalMatchesCount: 0,
      });
    });

    // 3. Process match players
    allMatchPlayers.forEach((mp) => {
      if (!mp.userId) return;
      const stats = userStats.get(mp.userId);
      if (!stats) return;

      const match = mp.match;

      // Attendance tracking: any match they were part of and has a score/is confirmed
      // or simply any match they joined.
      stats.totalMatchesCount++;
      if (mp.resultConfirmed) {
        stats.confirmedMatchesCount++;
      }

      // Competitive stats only for CONFIRMED matches
      if (match.status === "CONFIRMED" && match.score) {
        stats.matchesPlayed++;
        if (!stats.lastMatchAt || match.date > stats.lastMatchAt) {
          stats.lastMatchAt = match.date;
        }

        const winningTeam = getMatchWinner(match.score);
        if (winningTeam) {
          const playerTeam = mp.position < 2 ? "A" : "B";
          const isWinner = playerTeam === winningTeam;

          // Parse sets for bonus
          const sets = match.score
            .split(",")
            .map((s) => s.trim().split("-").map(Number));
          let setsWon = 0;
          sets.forEach(([scoreA, scoreB]) => {
            if (playerTeam === "A" && scoreA > scoreB) setsWon++;
            if (playerTeam === "B" && scoreB > scoreA) setsWon++;
          });

          if (isWinner) {
            stats.wins++;
            stats.streak = stats.streak > 0 ? stats.streak + 1 : 1;
            stats.setsWonBonus += setsWon * 2;
          } else {
            stats.losses++;
            stats.streak = stats.streak < 0 ? stats.streak - 1 : -1;
            stats.setsWonBonus += setsWon * 1;
          }
        }
      }
    });

    // 4. Calculate final scores and apply tie-breaking
    const now = new Date();
    const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;
    const ONE_HUNDRED_TWENTY_DAYS = 120 * 24 * 60 * 60 * 1000;

    const ranking = Array.from(userStats.entries()).map(([userId, stats]) => {
      let score =
        1000 + stats.wins * 15 + stats.streak * 5 + stats.setsWonBonus;

      // Time attenuation based on lastMatchAt
      if (stats.lastMatchAt) {
        const diff = now.getTime() - stats.lastMatchAt.getTime();
        if (diff > ONE_HUNDRED_TWENTY_DAYS) {
          score *= 0.25;
        } else if (diff > SIXTY_DAYS) {
          score *= 0.5;
        }
      }

      const attendanceScore =
        stats.totalMatchesCount > 0
          ? stats.confirmedMatchesCount / stats.totalMatchesCount
          : 1.0;

      return {
        userId,
        score,
        attendanceScore,
        wins: stats.wins,
        lastMatchAt: stats.lastMatchAt,
        stats,
      };
    });

    // 5. Sort based on tie-breaking hierarchy:
    // 1) score (desc)
    // 2) attendanceScore (desc)
    // 3) wins (desc)
    // 4) lastMatchAt (desc)
    ranking.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.attendanceScore !== a.attendanceScore)
        return b.attendanceScore - a.attendanceScore;
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (!a.lastMatchAt) return 1;
      if (!b.lastMatchAt) return -1;
      return b.lastMatchAt.getTime() - a.lastMatchAt.getTime();
    });

    // 6. Update database
    await prisma.$transaction(
      ranking.map((item, index) => {
        const user = users.find((u) => u.id === item.userId);
        const oldPosition = user?.rankingPosition;
        const newPosition = index + 1;

        // If it's a new user (no oldPosition) or first time ranking, delta is 0
        // Otherwise calculate change. Note: position 1 is better than 5, so old - new.
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
            attendanceScore: item.attendanceScore,
          },
        });
      }),
    );

    revalidatePath("/ranking");
    revalidatePath("/me");
    revalidateTag("ranking", "default");

    return { status: "ok" };
  } catch (error) {
    console.error("recalculateRankingAction failed", error);
    return { status: "error", message: "No se pudo recalcular el ranking." };
  }
}
