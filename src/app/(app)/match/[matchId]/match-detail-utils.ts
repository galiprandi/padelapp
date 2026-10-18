/**
 * Helper utilities for Match Detail page accessibility and display text formatting.
 */

export type MatchDetailRegion =
  | "header"
  | "details"
  | "actions"
  | "summary"
  | "confirmations"
  | "attendance"
  | "teams"
  | "notes"
  | "skeleton"
  | "not_found"
  | "cancelled";

/**
 * Returns accessible ARIA label for match detail skeleton loading container.
 */
export function getMatchDetailSkeletonAriaLabel(): string {
  return "Cargando detalle del partido";
}

/**
 * Returns localized match status badge label.
 */
export function getMatchStatusBadgeText(status?: string | null): string {
  if (status === "CONFIRMED") return "Confirmado";
  if (status === "PENDING") return "Pendiente";
  if (status === "CANCELLED") return "Cancelado";
  return "En disputa";
}

/**
 * Returns accessible ARIA label for match detail region landmark sections.
 */
export function getMatchDetailRegionAriaLabel(region: MatchDetailRegion): string {
  switch (region) {
    case "header":
      return "Encabezado del partido";
    case "details":
      return "Detalles e información del partido";
    case "actions":
      return "Acciones del partido";
    case "summary":
      return "Resumen de resultado del partido";
    case "confirmations":
      return "Estado de confirmaciones de jugadores";
    case "attendance":
      return "Asistencia de jugadores";
    case "teams":
      return "Formación de equipos";
    case "notes":
      return "Notas del organizador";
    case "skeleton":
      return "Cargando detalle del partido";
    case "not_found":
      return "Partido no encontrado";
    case "cancelled":
      return "Partido cancelado";
  }
}

/**
 * Returns title text when a match is not found.
 */
export function getMatchNotFoundTitle(): string {
  return "Partido no encontrado";
}

/**
 * Returns description text when a match is not found.
 */
export function getMatchNotFoundDescription(): string {
  return "El partido que buscás no existe o fue eliminado.";
}

/**
 * Returns button text when a match is not found.
 */
export function getMatchNotFoundButtonText(): string {
  return "Crear partido";
}

/**
 * Returns title text when a match is cancelled.
 */
export function getMatchCancelledTitle(): string {
  return "Partido cancelado";
}

/**
 * Returns description text when a match is cancelled.
 */
export function getMatchCancelledDescription(): string {
  return "Este partido fue cancelado por el organizador.";
}

/**
 * Returns button text to return to my matches.
 */
export function getMatchCancelledButtonText(): string {
  return "Volver a mis partidos";
}

/**
 * Safely parses comma-separated set score string into trimmed array of set scores.
 */
export function getMatchScoreSets(score?: string | null): string[] {
  if (!score || !score.trim()) return [];
  return score
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Returns accessible ARIA label for match share button.
 */
export function getMatchShareButtonAriaLabel(isClosed: boolean): string {
  return isClosed ? "Compartir resultado del partido" : "Compartir invitación al partido";
}

/**
 * Returns accessible ARIA label for player profile link.
 */
export function getPlayerProfileLinkAriaLabel(displayName?: string | null): string {
  if (!displayName || !displayName.trim()) {
    return "Ver perfil del jugador";
  }
  return `Ver perfil de ${displayName.trim()}`;
}

/**
 * Formats club name and court number into display string.
 */
export function formatMatchClubCourtText(
  club?: string | null,
  courtNumber?: string | null,
): string {
  if (!club || !club.trim()) {
    return "Sin club especificado";
  }
  const cleanClub = club.trim();
  if (courtNumber && courtNumber.trim()) {
    return `${cleanClub} · Cancha ${courtNumber.trim()}`;
  }
  return cleanClub;
}

/**
 * Returns match detail header title with match type label.
 */
export function getMatchHeaderTitle(matchTypeLabel: string): string {
  return `Partido ${matchTypeLabel}`;
}

/**
 * Returns "Club:" label text.
 */
export function getMatchClubLabel(): string {
  return "Club:";
}

/**
 * Returns "Organizador" label text.
 */
export function getMatchOrganizerLabel(): string {
  return "Organizador";
}

/**
 * Returns "Ingresar Resultado" button text.
 */
export function getMatchEnterScoreButtonText(): string {
  return "Ingresar Resultado";
}

/**
 * Returns "Editar" button text.
 */
export function getMatchEditButtonText(): string {
  return "Editar";
}

/**
 * Returns share invitation title text.
 */
export function getMatchInviteShareTitle(): string {
  return "Invitación a partido de Pádel";
}

/**
 * Returns share result title text.
 */
export function getMatchResultShareTitle(): string {
  return "Resultado de Pádel";
}

/**
 * Returns final score heading title.
 */
export function getMatchFinalScoreHeadingTitle(): string {
  return "Resultado Final";
}

/**
 * Returns match mode display label with match type.
 */
export function getMatchModeLabel(matchTypeLabel: string): string {
  return `Modalidad ${matchTypeLabel}`;
}

/**
 * Returns confirmations section heading title.
 */
export function getMatchConfirmationsHeadingTitle(): string {
  return "Confirmaciones";
}

/**
 * Returns confirmations section description text.
 */
export function getMatchConfirmationsDescription(): string {
  return "Un jugador de cada equipo debe validar el marcador.";
}

/**
 * Returns localized player result confirmation status label.
 */
export function getPlayerConfirmationStatusText(isConfirmed: boolean): string {
  return isConfirmed ? "Confirmado" : "Pendiente";
}

/**
 * Returns notice text for match creator regarding unconfirmed guest players.
 */
export function getMatchCreatorFinalizeNoticeText(): string {
  return "¿Algunos jugadores no confirman o son invitados? Como organizador podés cerrar el partido inmediatamente.";
}

/**
 * Returns title text for pending confirmation sticky banner.
 */
export function getPendingConfirmationBannerTitle(): string {
  return "Confirmación pendiente";
}

/**
 * Returns description text for pending confirmation sticky banner.
 */
export function getPendingConfirmationBannerDescription(): string {
  return "Validá el resultado para impactar el ranking.";
}

/**
 * Returns notice text when a match score has been confirmed and processed in ranking.
 */
export function getMatchProcessedNoticeText(): string {
  return "Partido procesado en el Ranking";
}

/**
 * Returns attendance section heading title.
 */
export function getMatchAttendanceHeadingTitle(): string {
  return "Asistencia";
}

/**
 * Returns team formation section heading title.
 */
export function getMatchTeamsHeadingTitle(): string {
  return "Formación de equipos";
}

/**
 * Returns organizer notes section heading title.
 */
export function getMatchOrganizerNotesHeadingTitle(): string {
  return "Notas del organizador";
}
