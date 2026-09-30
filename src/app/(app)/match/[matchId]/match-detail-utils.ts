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
