"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getMatchWinner } from "@/lib/utils";

interface UserStats {
  wins: number;
  losses: number;
  streak: number;
  matchesPlayed: number;
  lastMatchAt: Date | null;
  setsWonBonus: number;
  confirmedMatchesCount: number;
  totalMatchesCount: number;
  noShowPenalty: number;
  latePenalty: number;
  attendedCount: number;
  noShowCount: number;
  lateCount: number;
}

function computeScore(stats: UserStats): number {
  let score = 1000 + stats.wins * 15 + stats.streak * 5 + stats.setsWonBonus;
  score -= stats.noShowPenalty + stats.latePenalty;

  const now = new Date();
  const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;
  const ONE_HUNDRED_TWENTY_DAYS = 120 * 24 * 60 * 60 * 1000;

  if (stats.lastMatchAt) {
    const diff = now.getTime() - stats.lastMatchAt.getTime();
    if (diff > ONE_HUNDRED_TWENTY_DAYS) {
      score *= 0.25;
    } else if (diff > SIXTY_DAYS) {
      score *= 0.5;
    }
  }

  return score;
}

function computeAttendanceScore(stats: UserStats): number {
  const totalAttendanceTracked =
    stats.attendedCount + stats.lateCount + stats.noShowCount;
  return totalAttendanceTracked > 0
    ? (stats.attendedCount + stats.lateCount) / totalAttendanceTracked
    : stats.totalMatchesCount > 0
      ? stats.confirmedMatchesCount / stats.totalMatchesCount
      : 1.0;
}

function computeStatsForUsers(matchPlayers: Array<{
  userId: string | null;
  position: number;
  resultConfirmed: boolean;
  attendance: string | null;
  match: { status: string; score: string | null; date: Date };
}>) {
  const userStats = new Map<string, UserStats>();

  for (const mp of matchPlayers) {
    if (!mp.userId) continue;
    let stats = userStats.get(mp.userId);
    if (!stats) {
      stats = {
        wins: 0, losses: 0, streak: 0, matchesPlayed: 0,
        lastMatchAt: null, setsWonBonus: 0, confirmedMatchesCount: 0,
        totalMatchesCount: 0, noShowPenalty: 0, latePenalty: 0,
        attendedCount: 0, noShowCount: 0, lateCount: 0,
      };
      userStats.set(mp.userId, stats);
    }

    stats.totalMatchesCount++;
    if (mp.resultConfirmed) stats.confirmedMatchesCount++;

    if (mp.attendance === "ATTENDED") stats.attendedCount++;
    else if (mp.attendance === "NO_SHOW") { stats.noShowCount++; stats.noShowPenalty += 25; }
    else if (mp.attendance === "LATE") { stats.lateCount++; stats.latePenalty += 10; }

    if (mp.match.status === "CONFIRMED" && mp.match.score) {
      stats.matchesPlayed++;
      if (!stats.lastMatchAt || mp.match.date > stats.lastMatchAt) {
        stats.lastMatchAt = mp.match.date;
      }

      const winningTeam = getMatchWinner(mp.match.score);
      if (winningTeam) {
        const playerTeam = mp.position < 2 ? "A" : "B";
        const isWinner = playerTeam === winningTeam;
        const sets = mp.match.score.split(",").map((s) => s.trim().split("-").map(Number));
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
  }

  return userStats;
}

/**
 * Recalculates the ranking. When `affectedUserIds` is provided, only those
 * users' scores are recomputed (incremental). Positions are always updated
 * for all users since they are relative.
 */
export async function recalculateRankingAction(affectedUserIds?: string[]) {
  try {
    const isIncremental = affectedUserIds && affectedUserIds.length > 0;

    // 1. Compute scores for affected users (or all if full recalc)
    let userScores: Map<string, { score: number; attendanceScore: number; stats: UserStats }>;

    if (isIncremental) {
      const matchPlayers = await prisma.matchPlayer.findMany({
        where: { userId: { in: affectedUserIds } },
        include: { match: { select: { status: true, score: true, date: true } } },
        orderBy: { match: { date: "asc" } },
      });
      const userStats = computeStatsForUsers(matchPlayers);
      userScores = new Map();
      for (const [userId, stats] of userStats) {
        userScores.set(userId, {
          score: computeScore(stats),
          attendanceScore: computeAttendanceScore(stats),
          stats,
        });
      }
    } else {
      const allMatchPlayers = await prisma.matchPlayer.findMany({
        where: { userId: { not: null } },
        include: { match: { select: { status: true, score: true, date: true } } },
        orderBy: { match: { date: "asc" } },
      });
      const userStats = computeStatsForUsers(allMatchPlayers);
      userScores = new Map();
      for (const [userId, stats] of userStats) {
        userScores.set(userId, {
          score: computeScore(stats),
          attendanceScore: computeAttendanceScore(stats),
          stats,
        });
      }
    }

    // 2. Read all users for position calculation (lightweight — no match data)
    const users = await prisma.user.findMany({
      select: { id: true, rankingPosition: true, rankingScore: true, wins: true, losses: true, matchesPlayed: true, lastMatchAt: true, attendanceScore: true },
    });

    // 3. Merge computed scores with existing user data
    const ranking = users.map((user) => {
      const computed = userScores.get(user.id);
      return {
        userId: user.id,
        score: computed?.score ?? user.rankingScore ?? 1000,
        attendanceScore: computed?.attendanceScore ?? user.attendanceScore ?? 1.0,
        wins: computed?.stats.wins ?? user.wins,
        oldPosition: user.rankingPosition,
        lastMatchAt: computed?.stats.lastMatchAt ?? user.lastMatchAt,
        stats: computed?.stats,
      };
    });

    // 4. Sort by tie-breaking hierarchy
    ranking.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.attendanceScore !== a.attendanceScore)
        return b.attendanceScore - a.attendanceScore;
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (!a.lastMatchAt) return 1;
      if (!b.lastMatchAt) return -1;
      return b.lastMatchAt.getTime() - a.lastMatchAt.getTime();
    });

    // 5. Update only changed users
    const updates = ranking
      .map((item, index) => {
        const newPosition = index + 1;
        const delta = item.oldPosition ? item.oldPosition - newPosition : 0;
        const computed = userScores.get(item.userId);

        // Skip users whose score didn't change (incremental mode only)
        if (isIncremental && !computed) return null;

        return prisma.user.update({
          where: { id: item.userId },
          data: {
            rankingScore: item.score,
            rankingPosition: newPosition,
            rankingDelta: delta,
            ...(computed ? {
              wins: computed.stats.wins,
              losses: computed.stats.losses,
              matchesPlayed: computed.stats.matchesPlayed,
              lastMatchAt: computed.stats.lastMatchAt,
              attendanceScore: item.attendanceScore,
            } : {}),
          },
        });
      })
      .filter((u): u is NonNullable<typeof u> => u !== null);

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    revalidatePath("/ranking");
    revalidatePath("/me");
    revalidateTag("ranking", "default");

    return { status: "ok" };
  } catch (error) {
    console.error("recalculateRankingAction failed", error);
    return { status: "error", message: "No se pudo recalcular el ranking." };
  }
}
