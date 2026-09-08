import { getMatchWinner } from "@/lib/utils";

export interface DashboardMatchPlayer {
  position: number;
  userId?: string | null;
  user?: {
    id: string;
  } | null;
}

export interface DashboardMatch {
  id: string;
  score?: string | null;
  date?: string | Date | null;
  createdAt?: string | Date | null;
  players: DashboardMatchPlayer[];
}

export interface DashboardTurn {
  id: string;
  date: string | Date;
  players: { userId: string }[];
  maxPlayers: number;
  [key: string]: unknown;
}

export interface AgendaItem<TTurn = unknown, TMatch = unknown> {
  id: string;
  type: "turn" | "match";
  date: Date;
  data: TTurn | TMatch;
}

/**
 * Calculates the recent form ("W" for win, "L" for loss) for a list of matches.
 */
export function calculateRecentForm(
  matches: DashboardMatch[],
  viewerId: string,
  limit: number = 5,
): ("W" | "L")[] {
  return matches.slice(0, limit).map((match) => {
    if (!match.score) return "L";
    const winner = getMatchWinner(match.score);
    if (!winner) return "L";

    const player = match.players.find(
      (p) => (p.user && p.user.id === viewerId) || p.userId === viewerId,
    );
    if (!player) return "L";

    const playerTeam = player.position < 2 ? "A" : "B";
    return winner === playerTeam ? "W" : "L";
  });
}

/**
 * Calculates total badge count for dashboard notifications / bottom nav indicators.
 */
export function calculateDashboardBadgeCount(
  incompleteTurnsCount: number,
  pendingActionMatchesCount: number,
  pendingAttendanceCount: number,
): number {
  return (
    Math.max(0, incompleteTurnsCount) +
    Math.max(0, pendingActionMatchesCount) +
    Math.max(0, pendingAttendanceCount)
  );
}

/**
 * Combines turns and upcoming matches into a single chronologically sorted agenda.
 */
export function getAgendaItems<TTurn extends DashboardTurn, TMatch extends DashboardMatch>(
  myTurns: TTurn[],
  upcomingMatches: TMatch[],
): AgendaItem<TTurn, TMatch>[] {
  const turnItems: AgendaItem<TTurn, TMatch>[] = myTurns.map((turn) => ({
    id: turn.id,
    type: "turn" as const,
    date: new Date(turn.date),
    data: turn,
  }));

  const matchItems: AgendaItem<TTurn, TMatch>[] = upcomingMatches.map((match) => ({
    id: match.id,
    type: "match" as const,
    date: new Date(match.date ?? match.createdAt ?? new Date()),
    data: match,
  }));

  return [...turnItems, ...matchItems].sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Finds imminent activity occurring within the next 24 hours.
 */
export function getHeroActivity<TTurn = unknown, TMatch = unknown>(
  agendaItems: AgendaItem<TTurn, TMatch>[],
  now: Date = new Date(),
): AgendaItem<TTurn, TMatch> | null {
  if (agendaItems.length === 0) return null;

  const firstItem = agendaItems[0];
  const timeDiff = firstItem.date.getTime() - now.getTime();

  // Highlight if starting within 24 hours
  if (timeDiff < 24 * 60 * 60 * 1000 && timeDiff >= -2 * 60 * 60 * 1000) {
    return firstItem;
  }

  return null;
}

/**
 * Formats user welcome subtitle based on account status.
 */
export function formatDashboardWelcomeSubtitle(isNewUser: boolean): string {
  return isNewUser
    ? "Bienvenido. Empezá creando tu primer turno."
    : "Tu actividad de pádel en un solo lugar.";
}
