import { cn, getMatchWinner } from "@/lib/utils";

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

export function getDashboardSkeletonAriaLabel(): string {
  return "Cargando mi perfil y panel principal de pádel";
}

export function getCreateFirstTurnAriaLabel(): string {
  return "Creá tu primer turno. Armá un turno, compartilo por WhatsApp y jugá.";
}

export function getIncompleteProfileRegionAriaLabel(): string {
  return "Perfil de jugador incompleto";
}

export function getInviteFriendsRegionAriaLabel(): string {
  return "Invitar amigos a Padel Red";
}

export function getDashboardStatsRegionAriaLabel(): string {
  return "Resumen de estadísticas personales";
}

export function getRankingStatAriaLabel(rankingPosition?: number | null): string {
  return `Ranking: posición actual #${rankingPosition ?? "sin clasificar"}. Ver clasificación.`;
}

export function getMatchesStatAriaLabel(matchesPlayed: number): string {
  return `Partidos jugados: ${matchesPlayed}. Ver historial de partidos.`;
}

export function getWinsStatAriaLabel(wins: number): string {
  return `Victorias: ${wins}. Ver tabla de posiciones.`;
}

export function getReputationStatAriaLabel(attendanceScore?: number | null): string {
  const percentage = Math.round((attendanceScore ?? 1) * 100);
  return `Reputación de asistencia: ${percentage}%. Ver ranking.`;
}

export function getHeroActivityRegionAriaLabel(isIncompleteTurn: boolean): string {
  return isIncompleteTurn ? "Próximo turno incompleto" : "Próxima actividad inminente";
}

export function formatMissingPlayersText(missingCount: number): string {
  return `Faltan ${missingCount}`;
}

export function getPendingActionsRegionAriaLabel(): string {
  return "Acciones pendientes de partidos";
}

export function getPendingActionMatchLabel(needsScore: boolean): string {
  return needsScore ? "Cargar resultado" : "Confirmación pendiente";
}

export function getPendingAttendanceRegionAriaLabel(): string {
  return "Marcar asistencia de partidos";
}

export function formatPlayersWithoutAttendanceText(count: number): string {
  return `${count} sin marcar`;
}

export function getAgendaRegionAriaLabel(): string {
  return "Agenda personal de turnos y partidos";
}

export function getSubstituteTurnsRegionAriaLabel(): string {
  return "Turnos como suplente";
}

export function getOpenSlotBadgeText(): string {
  return "Cupo libre";
}

export function getRecommendedTurnsRegionAriaLabel(): string {
  return "Turnos disponibles recomendados";
}

export function getRecentResultsRegionAriaLabel(): string {
  return "Últimos resultados de partidos";
}

export function formatRecentFormAriaLabel(results: ("W" | "L")[]): string {
  const formatted = results.map((r) => (r === "W" ? "G" : "P")).join(", ");
  return `Forma reciente: ${formatted}`;
}

export function getDashboardCreateTurnCtaClasses(): string {
  return "flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

export function getDashboardIncompleteProfileContainerClasses(): string {
  return "flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-100 dark:bg-amber-950 dark:border-amber-800 p-4 shadow-xs";
}

export function getDashboardIncompleteProfileButtonClasses(): string {
  return "w-full h-10 bg-amber-500 text-primary-foreground hover:bg-amber-600 text-xs font-bold active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

export function getDashboardInviteFriendsContainerClasses(): string {
  return "flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-xs";
}

export function getDashboardStatsCardClasses(): string {
  return "group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

export function getDashboardHeroActivityContainerClasses(isIncompleteTurn: boolean): string {
  return cn(
    "space-y-3 rounded-xl border p-4 shadow-xs",
    isIncompleteTurn ? "border-amber-500 bg-card" : "border-border bg-card",
  );
}

export function getDashboardPendingAttendanceItemClasses(): string {
  return "flex items-center justify-between gap-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-card p-3 transition-all hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background shadow-xs";
}

export function getDashboardSubstituteItemClasses(): string {
  return "flex items-center justify-between gap-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-card p-3 transition-all hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background shadow-xs";
}

export function getDashboardOpenSlotBadgeClasses(): string {
  return "rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800 px-2 py-1 text-xs font-bold shrink-0 shadow-xs";
}

export function getDashboardEmptyAgendaContainerClasses(): string {
  return "rounded-xl border border-dashed border-border p-8 flex flex-col items-center justify-center text-center";
}

export function getCreateFirstTurnTitleText(): string {
  return "Creá tu primer turno";
}

export function getCreateFirstTurnDescriptionText(): string {
  return "Armá un turno, compartilo por WhatsApp y jugá.";
}

export function getIncompleteProfileTitleText(): string {
  return "Completá tu perfil de jugador";
}

export function getIncompleteProfileDescriptionText(): string {
  return "Elegí tu alias en la cancha para que otros jugadores te reconozcan en los partidos y ranking.";
}

export function getIncompleteProfileButtonText(): string {
  return "Configurar mi perfil";
}

export function getInviteFriendsTitleText(): string {
  return "Invitar amigos";
}

export function getInviteFriendsDescriptionText(): string {
  return "Recomendá Padel Red a tu grupo de pádel. Es gratis.";
}

export function getInviteFriendsShareTitleText(): string {
  return "Padel Red";
}

export function getInviteFriendsShareText(): string {
  return "Turnos de pádel que no se cancelan. Entrá y organizá los turnos del club — es gratis: padelred.app";
}

export function getInviteFriendsShareSuccessToastText(): string {
  return "Link copiado";
}

export function getInviteFriendsShareCopyToastText(): string {
  return "Link copiado al portapapeles";
}

export function getDashboardHeroIncompleteTurnTitleText(): string {
  return "Turno incompleto";
}

export function getDashboardHeroNextActivityTitleText(): string {
  return "Próxima actividad";
}

export function getDashboardHeroMatchLabelText(): string {
  return "Partido inminente";
}

export function getDashboardOpenToNetworkButtonLabel(): string {
  return "Salvar turno: Notificar a mi red";
}

export function getDashboardPendingActionsTitleText(): string {
  return "Acciones pendientes";
}

export function getDashboardPendingAttendanceTitleText(): string {
  return "Marcar asistencia";
}

export function getDashboardAgendaTitleText(): string {
  return "Mi Agenda";
}

export function getDashboardSeeAllText(): string {
  return "Ver todos";
}

export function getDashboardSeeAllPendingAriaLabel(): string {
  return "Ver todas las acciones pendientes";
}

export function getDashboardSeeAllAgendaAriaLabel(): string {
  return "Ver todos los turnos en agenda";
}

export function getDashboardEmptyAgendaTitleText(): string {
  return "Tu agenda está vacía";
}

export function getDashboardEmptyAgendaDescriptionText(): string {
  return "Sumate a un turno abierto o creá un partido con amigos.";
}

export function getDashboardEmptyAgendaExploreButtonText(): string {
  return "Explorar turnos";
}

export function getDashboardEmptyAgendaCreateButtonText(): string {
  return "Crear un turno";
}

export function getDashboardNoMoreActivitiesText(): string {
  return "No hay más actividades programadas.";
}

export function getDashboardSubstituteTitleText(): string {
  return "Soy suplente";
}

export function getDashboardRecommendedTitleText(): string {
  return "Turnos disponibles";
}

export function getDashboardRecentResultsTitleText(): string {
  return "Últimos resultados";
}

export function getDashboardEmptyRecentResultsTitleText(): string {
  return "Sin resultados todavía";
}

export function getDashboardEmptyRecentResultsDescriptionText(): string {
  return "Cuando registres un marcador, vas a verlo acá.";
}

export function getDashboardEmptyRecentResultsButtonText(): string {
  return "Ver historial";
}
