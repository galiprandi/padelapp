import { getMatchWinner, calculateWinRate } from "@/lib/utils";

export type TeamKey = "A" | "B";

export interface MinimalMatchPlayer {
  position: number;
  user?: {
    id: string;
    displayName: string | null;
  } | null;
}

export interface MinimalMatchForSummary {
  date?: Date | string;
  createdAt?: Date | string;
  score?: string | null;
  players: MinimalMatchPlayer[];
}

export interface PlayerSummaryRelation {
  id: string;
  name: string;
  count: number;
}

export interface MatchSummaryStats {
  totalMatches: number;
  wins: number;
  winRate: number;
  currentStreak: number;
  bestPartner?: PlayerSummaryRelation;
  nemesis?: PlayerSummaryRelation;
}

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

/**
 * Calculates the decay factor (0.5 for >60 days, 0.25 for >120 days) based on last match date.
 */
export function calculateDecayFactor(
  lastMatchAt: Date | string | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!lastMatchAt) return null;
  const lastMatchDate =
    typeof lastMatchAt === "string" ? new Date(lastMatchAt) : lastMatchAt;
  if (isNaN(lastMatchDate.getTime())) return null;
  const diffTime = now.getTime() - lastMatchDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  if (diffDays > 120) return 0.25;
  if (diffDays > 60) return 0.5;
  return null;
}

/**
 * Returns localized Argentine Spanish description for decay factor.
 */
export function getDecayFactorText(decayFactor: number | null | undefined): string | null {
  if (decayFactor === 0.25) {
    return "Puntos reducidos al 25% por inactividad (más de 120 días)";
  }
  if (decayFactor === 0.5) {
    return "Puntos reducidos al 50% por inactividad (más de 60 días)";
  }
  return null;
}

/**
 * Returns localized Argentine Spanish text for ranking delta position changes.
 */
export function getRankingDeltaText(delta: number | null | undefined): string {
  if (!delta || delta === 0) return "Posición sin cambios";
  if (delta > 0) return `Subió ${delta} ${delta === 1 ? "posición" : "posiciones"}`;
  return `Bajó ${Math.abs(delta)} ${Math.abs(delta) === 1 ? "posición" : "posiciones"}`;
}

/**
 * Parses raw match score string (e.g. "6-4, 4-6, 7-6" or "[6-4],[4-6]") into numerical set pairs.
 */
export function parseScoreSets(score?: string | null): Array<[number, number]> {
  if (!score) {
    return [];
  }

  return score
    .split(",")
    .map((segment) => segment.trim())
    .map((segment) => segment.replace(/[\[\]]/g, ""))
    .map((segment) => {
      const match = segment.match(/(\d+)[^\d]+(\d+)/);
      if (!match) {
        return null;
      }
      return [Number(match[1]), Number(match[2])];
    })
    .filter((value): value is [number, number] => Array.isArray(value));
}

/**
 * Calculates set wins per team and winning team index (0 for Team A, 1 for Team B, undefined for draw/incomplete).
 */
export function calculateMatchSetWins(parsedSets: Array<[number, number]>): {
  setWins: [number, number];
  winnerIndex: number | undefined;
} {
  const setWins: [number, number] = [0, 0];

  parsedSets.forEach(([teamAScore, teamBScore]) => {
    if (teamAScore > teamBScore) {
      setWins[0] += 1;
    } else if (teamBScore > teamAScore) {
      setWins[1] += 1;
    }
  });

  const winnerIndex =
    setWins[0] === setWins[1] ? undefined : setWins[0] > setWins[1] ? 0 : 1;

  return { setWins, winnerIndex };
}

/**
 * Calculates match statistics (total matches, wins, win rate, active streak, best partner, nemesis) for a user.
 */
export function calculateMatchSummaryStats<T extends MinimalMatchForSummary>(
  matches: T[],
  viewerId?: string | null,
): MatchSummaryStats {
  if (!viewerId || matches.length === 0) {
    return {
      totalMatches: 0,
      wins: 0,
      winRate: 0,
      currentStreak: 0,
    };
  }

  const totalMatches = matches.length;

  const matchResults = matches.map((match) => {
    const winner = getMatchWinner(match.score ?? null);
    if (!winner) return "L";
    const player = match.players.find((p) => p.user?.id === viewerId);
    const playerTeam = (player?.position ?? 0) < 2 ? "A" : "B";
    return winner === playerTeam ? "W" : "L";
  });

  const wins = matchResults.filter((r) => r === "W").length;
  const winRate = calculateWinRate(wins, totalMatches);

  let currentStreak = 0;
  for (let i = 0; i < matchResults.length; i++) {
    if (matchResults[i] === "W") currentStreak++;
    else break;
  }

  const partnersWins: Record<string, { id: string; name: string; wins: number }> = {};
  const rivalsLosses: Record<string, { id: string; name: string; losses: number }> = {};

  matches.forEach((match, idx) => {
    const viewer = match.players.find((p) => p.user?.id === viewerId);
    if (!viewer) return;
    const viewerTeamIdx = viewer.position < 2 ? 0 : 1;

    if (matchResults[idx] === "W") {
      const partner = match.players.find(
        (p) =>
          p.user?.id !== viewerId &&
          (viewerTeamIdx === 0 ? p.position < 2 : p.position >= 2),
      );
      if (partner && partner.user) {
        const pId = partner.user.id;
        const pName = partner.user.displayName || "Compañero";
        if (!partnersWins[pId]) partnersWins[pId] = { id: pId, name: pName, wins: 0 };
        partnersWins[pId].wins += 1;
      }
    } else if (matchResults[idx] === "L") {
      const rivals = match.players.filter(
        (p) =>
          p.user?.id !== viewerId &&
          (viewerTeamIdx === 0 ? p.position >= 2 : p.position < 2),
      );
      rivals.forEach((rival) => {
        if (rival.user) {
          const rId = rival.user.id;
          const rName = rival.user.displayName || "Rival";
          if (!rivalsLosses[rId]) rivalsLosses[rId] = { id: rId, name: rName, losses: 0 };
          rivalsLosses[rId].losses += 1;
        }
      });
    }
  });

  const bestPartnerRaw = Object.values(partnersWins).sort(
    (a, b) => b.wins - a.wins,
  )[0];

  const nemesisRaw = Object.values(rivalsLosses).sort(
    (a, b) => b.losses - a.losses,
  )[0];

  const bestPartner = bestPartnerRaw
    ? { id: bestPartnerRaw.id, name: bestPartnerRaw.name, count: bestPartnerRaw.wins }
    : undefined;

  const nemesis = nemesisRaw
    ? { id: nemesisRaw.id, name: nemesisRaw.name, count: nemesisRaw.losses }
    : undefined;

  return {
    totalMatches,
    wins,
    winRate,
    currentStreak,
    bestPartner,
    nemesis,
  };
}

/**
 * Groups matches by Argentine Spanish month and year ("mes año", e.g. "septiembre 2026").
 */
export function groupMatchesByMonth<
  T extends { date?: Date | string; createdAt?: Date | string },
>(matches: T[]): Record<string, T[]> {
  return matches.reduce((groups: Record<string, T[]>, match: T) => {
    const rawDate = match.date || match.createdAt;
    const date = rawDate ? new Date(rawDate) : new Date();
    const month = date.toLocaleString("es-AR", { month: "long" });
    const year = date.getFullYear();
    const key = `${month} ${year}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(match);
    return groups;
  }, {});
}
