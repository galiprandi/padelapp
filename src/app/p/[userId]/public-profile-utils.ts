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

export function calculateWinningStreak(recentForm: ("W" | "L")[]): number {
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
