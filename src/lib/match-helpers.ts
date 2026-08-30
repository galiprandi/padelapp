export type TeamKey = "A" | "B";

export type MatchFormat = "DOUBLES" | "SINGLES";

const MATCH_TYPE = {
  FRIENDLY: "FRIENDLY",
  LOCAL_TOURNAMENT: "LOCAL_TOURNAMENT",
} as const;

export type MatchType = (typeof MATCH_TYPE)[keyof typeof MATCH_TYPE];

export function isValidMatchType(value: string): value is MatchType {
  return Object.values(MATCH_TYPE).includes(value as MatchType);
}

export function defaultTeamLabel(team: TeamKey, format: MatchFormat): string {
  if (format === "SINGLES") {
    return team === "A" ? "Jugador A" : "Jugador B";
  }
  return team === "A" ? "Pareja A" : "Pareja B";
}

export function sanitizeTeamLabel(
  value: string | undefined,
  team: TeamKey,
  format: MatchFormat,
): string {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length === 0) {
    return defaultTeamLabel(team, format);
  }
  return trimmed;
}

export function teamForPosition(position: number, totalPlayers: number): TeamKey {
  if (totalPlayers <= 2) {
    return position === 0 ? "A" : "B";
  }
  return position < 2 ? "A" : "B";
}

export function getNextRadioIndex(
  currentIndex: number,
  totalButtons: number,
  key: "ArrowRight" | "ArrowLeft" | "ArrowDown" | "ArrowUp",
): number {
  if (totalButtons <= 0) return 0;
  if (key === "ArrowRight" || key === "ArrowDown") {
    return currentIndex < totalButtons - 1 ? currentIndex + 1 : 0;
  }
  return currentIndex > 0 ? currentIndex - 1 : totalButtons - 1;
}
