import { getMatchWinner } from "@/lib/utils";

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

export interface MatchPlayerWithScore {
  position: number;
  match: {
    score: string | null;
  };
}

/**
 * Derives recent match results ("W" for win, "L" for loss) for a given player based on position and match score.
 */
export function getPlayerRecentForm(
  matchPlayers: MatchPlayerWithScore[] | undefined | null,
): Array<"W" | "L"> {
  if (!matchPlayers || matchPlayers.length === 0) return [];
  return matchPlayers.map((mp) => {
    const winner = mp.match.score ? getMatchWinner(mp.match.score) : null;
    if (!winner) return "L";
    const playerTeam = mp.position < 2 ? "A" : "B";
    return winner === playerTeam ? "W" : "L";
  });
}

/**
 * Calculates the active consecutive win streak for a given player from recent match results.
 */
export function calculatePlayerStreak(
  matchPlayers: MatchPlayerWithScore[] | undefined | null,
): number {
  const recentForm = getPlayerRecentForm(matchPlayers);
  let winStreak = 0;
  for (const res of recentForm) {
    if (res === "W") {
      winStreak++;
    } else {
      break;
    }
  }
  return winStreak;
}
