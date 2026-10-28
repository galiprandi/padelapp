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

/**
 * Returns heading title text for match list page
 */
export function getMatchListHeadingTitle(): string {
  return "Partidos";
}

/**
 * Returns heading description text for match list page
 */
export function getMatchListHeadingDescription(): string {
  return "Tus partidos y resultados pendientes.";
}

/**
 * Returns accessible ARIA label for match list loading skeleton state
 */
export function getMatchListSkeletonAriaLabel(): string {
  return "Cargando partidos y resultados pendientes...";
}

/**
 * Returns accessible ARIA region landmark label for match list sections
 */
export function getMatchListSectionAriaLabel(
  section: "summary" | "pending" | "history" | "skeleton"
): string {
  switch (section) {
    case "summary":
      return "Resumen de estadísticas de partidos";
    case "pending":
      return "Resultados y acciones de partidos pendientes";
    case "history":
      return "Historial de partidos jugados";
    case "skeleton":
      return "Cargando partidos y resultados pendientes...";
  }
}

/**
 * Returns properties for match list empty state
 */
export function getMatchListEmptyStateProps(): {
  title: string;
  description: string;
  actionText: string;
} {
  return {
    title: "Sin partidos",
    description: "Todavía no participaste en ningún partido.",
    actionText: "Crear primer partido",
  };
}

/**
 * Returns prompt text when user is unauthenticated on match list page
 */
export function getMatchListAuthPromptText(): string {
  return "Iniciá sesión para ver tus partidos.";
}

/**
 * Returns heading title text for match summary section
 */
export function getMatchSummaryHeadingTitle(): string {
  return "Resumen";
}

/**
 * Returns label text for total matches metric in summary
 */
export function getMatchSummaryMatchesLabel(): string {
  return "Partidos";
}

/**
 * Returns label text for win rate metric in summary
 */
export function getMatchSummaryWinRateLabel(): string {
  return "Win Rate";
}

/**
 * Returns label text for win streak metric in summary
 */
export function getMatchSummaryStreakLabel(): string {
  return "Racha";
}

/**
 * Returns label text for total wins metric in summary
 */
export function getMatchSummaryWinsLabel(): string {
  return "Victorias";
}

/**
 * Returns label text for best partner relation in summary
 */
export function getMatchSummaryBestPartnerLabel(): string {
  return "Mejor socio:";
}

/**
 * Formats victory count text for best partner relation in summary
 */
export function formatMatchSummaryPartnerWins(count: number): string {
  return `(${count} ${count === 1 ? "victoria" : "victorias"})`;
}

/**
 * Returns label text for nemesis relation in summary
 */
export function getMatchSummaryNemesisLabel(): string {
  return "Némesis ⚔️:";
}

/**
 * Formats loss count text for nemesis relation in summary
 */
export function formatMatchSummaryNemesisLosses(count: number): string {
  return `(${count} ${count === 1 ? "derrota" : "derrotas"})`;
}

/**
 * Returns heading title text for pending matches section
 */
export function getMatchListPendingHeadingTitle(): string {
  return "Pendientes";
}

/**
 * Returns heading title text for match history section
 */
export function getMatchListHistoryHeadingTitle(): string {
  return "Historial";
}

/**
 * Returns text for create new match button in header
 */
export function getMatchListCreateButtonText(): string {
  return "Crear";
}

/**
 * Returns accessible ARIA label for create new match button in header
 */
export function getMatchListCreateButtonAriaLabel(): string {
  return "Crear nuevo partido";
}

/**
 * Returns text for see all notifications link
 */
export function getMatchListSeeAllNotificationsText(): string {
  return "Ver todas";
}

/**
 * Returns accessible ARIA label for see all notifications link
 */
export function getMatchListSeeAllNotificationsAriaLabel(count: number): string {
  return `Ver las ${count} acciones pendientes`;
}

/**
 * Returns action button label when match needs score entry
 */
export function getMatchListPendingScoreLabel(): string {
  return "Cargar resultado";
}

/**
 * Returns action button label when match needs result confirmation
 */
export function getMatchListPendingConfirmLabel(): string {
  return "Confirmar";
}

/**
 * Returns text for login button in unauthenticated prompt
 */
export function getMatchListLoginButtonText(): string {
  return "Ir al login";
}

/**
 * Returns CSS classes for the main match list layout container.
 */
export function getMatchListMainContainerClasses(): string {
  return "flex flex-col gap-6";
}

/**
 * Returns CSS classes for the match list header layout container.
 */
export function getMatchListHeaderContainerClasses(): string {
  return "flex items-center justify-between";
}

/**
 * Returns CSS classes for the match list heading title.
 */
export function getMatchListHeadingTitleClasses(): string {
  return "text-xl font-bold text-foreground";
}

/**
 * Returns CSS classes for the match list heading description.
 */
export function getMatchListHeadingDescriptionClasses(): string {
  return "text-sm text-muted-foreground";
}

/**
 * Returns CSS classes for the match summary section card container.
 */
export function getMatchListSummaryCardClasses(): string {
  return "rounded-xl border border-border bg-card p-4 shadow-xs";
}

/**
 * Returns CSS classes for the match summary metric grid layout container.
 */
export function getMatchListSummaryGridClasses(): string {
  return "grid grid-cols-3 gap-4";
}

/**
 * Returns CSS classes for match summary metric labels.
 */
export function getMatchListSummaryMetricLabelClasses(): string {
  return "text-xs text-muted-foreground";
}

/**
 * Returns CSS classes for match summary metric numerical values.
 */
export function getMatchListSummaryMetricValueClasses(isHighlight: boolean = false): string {
  return isHighlight ? "text-xl font-bold text-primary" : "text-xl font-bold text-foreground";
}

/**
 * Returns CSS classes for match summary partner/nemesis relations container.
 */
export function getMatchListSummaryRelationsContainerClasses(): string {
  return "mt-3 pt-3 border-t border-border flex flex-col gap-1.5";
}

/**
 * Returns CSS classes for match summary relation partner/nemesis profile link.
 */
export function getMatchListSummaryRelationLinkClasses(): string {
  return "text-foreground font-semibold hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-xs active:scale-[0.98]";
}

/**
 * Returns CSS classes for pending matches section header container.
 */
export function getMatchListPendingHeaderClasses(): string {
  return "flex items-center justify-between";
}

/**
 * Returns CSS classes for pending matches section title and badge group container.
 */
export function getMatchListPendingHeaderGroupClasses(): string {
  return "flex items-center gap-2";
}

/**
 * Returns CSS classes for pending matches count badge.
 */
export function getMatchListPendingBadgeClasses(): string {
  return "rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground";
}

/**
 * Returns CSS classes for see all notifications link in pending matches.
 */
export function getMatchListPendingNotificationsLinkClasses(): string {
  return "flex items-center gap-0.5 text-xs font-semibold text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-xs active:scale-[0.98] transition-all";
}

/**
 * Returns CSS classes for pending matches item list container.
 */
export function getMatchListPendingListContainerClasses(): string {
  return "flex flex-col gap-2";
}

/**
 * Returns CSS classes for history matches section layout container.
 */
export function getMatchListHistoryContainerClasses(): string {
  return "flex flex-col gap-3";
}

/**
 * Returns CSS classes for history matches list container.
 */
export function getMatchListHistoryGroupListClasses(): string {
  return "flex flex-col gap-4";
}

/**
 * Returns CSS classes for history matches month group container.
 */
export function getMatchListHistoryMonthGroupClasses(): string {
  return "flex flex-col gap-2";
}

/**
 * Returns CSS classes for history matches month title.
 */
export function getMatchListHistoryMonthTitleClasses(): string {
  return "text-xs font-semibold text-muted-foreground capitalize";
}

/**
 * Returns CSS classes for match list unauthenticated login prompt container.
 */
export function getMatchListAuthPromptContainerClasses(): string {
  return "rounded-xl border border-border bg-card p-6 text-center shadow-xs";
}

/**
 * Returns CSS classes for match list unauthenticated login prompt description text.
 */
export function getMatchListAuthPromptDescriptionClasses(): string {
  return "text-sm text-muted-foreground mb-3";
}
