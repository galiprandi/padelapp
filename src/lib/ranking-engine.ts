import { getMatchWinner } from "@/lib/utils";

export interface UserStats {
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

export function computeScore(stats: UserStats): number {
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

export function computeAttendanceScore(stats: UserStats): number {
  const totalAttendanceTracked =
    stats.attendedCount + stats.lateCount + stats.noShowCount;
  return totalAttendanceTracked > 0
    ? (stats.attendedCount + stats.lateCount) / totalAttendanceTracked
    : stats.totalMatchesCount > 0
      ? stats.confirmedMatchesCount / stats.totalMatchesCount
      : 1.0;
}

export function computeStatsForUsers(matchPlayers: Array<{
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
