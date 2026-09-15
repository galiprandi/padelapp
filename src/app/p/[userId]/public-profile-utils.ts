import { getMatchWinner } from "@/lib/utils";

export type RecentFormResult = "W" | "L";

export interface MatchWithScoreAndPlayers {
  score: string | null;
  players: {
    userId?: string | null;
    position: number;
  }[];
}

export function calculateRecentForm(
  matches: MatchWithScoreAndPlayers[],
  userId: string,
): RecentFormResult[] {
  return matches.map((match) => {
    if (!match.score) return "L";
    const winner = getMatchWinner(match.score);
    if (!winner) return "L";

    const playerPosition =
      match.players.find((p) => p.userId === userId)?.position ?? 0;
    const playerTeam = playerPosition < 2 ? "A" : "B";

    return winner === playerTeam ? "W" : "L";
  });
}

export function getRecentFormAriaLabel(recentForm: RecentFormResult[]): string {
  if (recentForm.length === 0) {
    return "Sin partidos";
  }

  const formattedResults = recentForm
    .map((r) => (r === "W" ? "G" : "P"))
    .join(", ");

  return `Forma reciente: ${formattedResults}`;
}

export function getStreakBadgeText(streak: number): string {
  const victoriasText = streak === 1 ? "Victoria" : "Victorias";
  return `Racha: ${streak} ${victoriasText} 🔥`;
}

export function getWinRateAriaLabel(winRate: number, matchesPlayed: number): string {
  if (matchesPlayed === 0) {
    return "Efectividad: 0% en 0 partidos";
  }

  const partidosText = matchesPlayed === 1 ? "partido" : "partidos";
  return `Efectividad: ${winRate}% en ${matchesPlayed} ${partidosText}`;
}

export function getPublicProfileSideLabel(
  side: "RIGHT" | "LEFT" | "BOTH" | null,
): string {
  if (side === "RIGHT") return "Derecha";
  if (side === "LEFT") return "Revés";
  return "Alterno";
}

export function formatSideWinRateSummary(
  winRateRight: number | null,
  winRateLeft: number | null,
): string {
  const parts: string[] = [];

  if (winRateRight !== null) {
    parts.push(`Der: ${Math.round(winRateRight * 100)}% WR`);
  }

  if (winRateLeft !== null) {
    parts.push(`Rev: ${Math.round(winRateLeft * 100)}% WR`);
  }

  if (parts.length === 0) {
    return "Sin partidos";
  }

  return parts.join(" ");
}

export function calculateWinningStreak(recentForm: RecentFormResult[]): number {
  let streak = 0;
  for (const result of recentForm) {
    if (result === "W") {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function formatPartnerWinsText(wins: number): string {
  const label = wins === 1 ? "victoria" : "victorias";
  return `${wins} ${label} 🔥`;
}

export function formatRivalMatchesText(matches: number): string {
  const label = matches === 1 ? "partido" : "partidos";
  return `${matches} ${label} ⚔️`;
}
