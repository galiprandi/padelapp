"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/db";
import { users, matches, matchPlayers } from "@/db/schema";
import { eq, and, inArray, isNotNull, exists } from "drizzle-orm";
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
      const matchPlayersData = await db.query.matchPlayers.findMany({
        where: inArray(matchPlayers.userId, affectedUserIds),
        with: { match: { columns: { status: true, score: true, date: true } } },
      });
      // orderBy by match.date is not supported in nested relations — sort in JS.
      matchPlayersData.sort(
        (a, b) => a.match.date.getTime() - b.match.date.getTime(),
      );
      const userStats = computeStatsForUsers(matchPlayersData);
      userScores = new Map();
      for (const [userId, stats] of userStats) {
        userScores.set(userId, {
          score: computeScore(stats),
          attendanceScore: computeAttendanceScore(stats),
          stats,
        });
      }
    } else {
      const allMatchPlayers = await db.query.matchPlayers.findMany({
        where: isNotNull(matchPlayers.userId),
        with: { match: { columns: { status: true, score: true, date: true } } },
      });
      // orderBy by match.date is not supported in nested relations — sort in JS.
      allMatchPlayers.sort(
        (a, b) => a.match.date.getTime() - b.match.date.getTime(),
      );
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
    const usersData = await db.select({
      id: users.id,
      rankingPosition: users.rankingPosition,
      rankingScore: users.rankingScore,
      rankingDelta: users.rankingDelta,
      wins: users.wins,
      losses: users.losses,
      matchesPlayed: users.matchesPlayed,
      lastMatchAt: users.lastMatchAt,
      attendanceScore: users.attendanceScore,
    }).from(users);

    // 3. Merge computed scores with existing user data
    const ranking = usersData.map((user) => {
      const isUserAffected = !isIncremental || affectedUserIds.includes(user.id);
      const computed = userScores.get(user.id);

      // If the user is affected, but there are no computed stats, they have 0 active matches.
      // Reset their statistics to default values to prevent stale/ghost rankings.
      const score = computed
        ? computed.score
        : isUserAffected
          ? 1000
          : (user.rankingScore ?? 1000);

      const attendanceScore = computed
        ? computed.attendanceScore
        : isUserAffected
          ? 1.0
          : (user.attendanceScore ?? 1.0);

      const wins = computed
        ? computed.stats.wins
        : isUserAffected
          ? 0
          : user.wins;

      const losses = computed
        ? computed.stats.losses
        : isUserAffected
          ? 0
          : user.losses;

      const matchesPlayed = computed
        ? computed.stats.matchesPlayed
        : isUserAffected
          ? 0
          : user.matchesPlayed;

      const lastMatchAt = computed
        ? computed.stats.lastMatchAt
        : isUserAffected
          ? null
          : user.lastMatchAt;

      return {
        userId: user.id,
        score,
        attendanceScore,
        wins,
        losses,
        matchesPlayed,
        lastMatchAt,
        oldPosition: user.rankingPosition,
        oldDelta: user.rankingDelta,
        isUserAffected,
      };
    });

    // 4. Sort by tie-breaking hierarchy
    ranking.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.attendanceScore !== a.attendanceScore)
        return b.attendanceScore - a.attendanceScore;
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (!a.lastMatchAt && !b.lastMatchAt) return 0;
      if (!a.lastMatchAt) return 1;
      if (!b.lastMatchAt) return -1;
      return b.lastMatchAt.getTime() - a.lastMatchAt.getTime();
    });

    // 5. Update only changed users
    const toUpdate = ranking
      .map((item, index) => {
        const newPosition = index + 1;
        const delta = item.oldPosition ? item.oldPosition - newPosition : 0;

        // For incremental mode: only update if the user's stats were recomputed,
        // OR if their relative position or delta changed.
        if (isIncremental && !item.isUserAffected) {
          const positionChanged = item.oldPosition !== newPosition;
          const deltaChanged = item.oldDelta !== delta;
          if (!positionChanged && !deltaChanged) {
            return null;
          }
        }

        return {
          userId: item.userId,
          data: {
            rankingScore: item.score,
            rankingPosition: newPosition,
            rankingDelta: delta,
            ...(item.isUserAffected ? {
              wins: item.wins,
              losses: item.losses,
              matchesPlayed: item.matchesPlayed,
              lastMatchAt: item.lastMatchAt,
              attendanceScore: item.attendanceScore,
            } : {}),
          },
        };
      })
      .filter((u): u is NonNullable<typeof u> => u !== null);

    if (toUpdate.length > 0) {
      await db.transaction(async (tx) => {
        for (const item of toUpdate) {
          await tx.update(users).set(item.data).where(eq(users.id, item.userId));
        }
      });
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
