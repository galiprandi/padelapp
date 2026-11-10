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

/**
 * Returns CSS classes for match detail skeleton container.
 */
export function getMatchDetailSkeletonContainerClasses(): string {
  return "flex flex-col gap-6";
}

/**
 * Returns CSS classes for not found state container.
 */
export function getMatchDetailNotFoundContainerClasses(): string {
  return "flex flex-col gap-4";
}

/**
 * Returns CSS classes for cancelled state container.
 */
export function getMatchDetailCancelledContainerClasses(): string {
  return "flex flex-col gap-4";
}

/**
 * Returns CSS classes for main match detail container.
 */
export function getMatchDetailMainContainerClasses(userNeedsToConfirm?: boolean): string {
  return userNeedsToConfirm ? "flex flex-col gap-6 pb-32" : "flex flex-col gap-6";
}

/**
 * Returns CSS classes for match status badge.
 */
export function getMatchStatusBadgeClasses(status?: string | null): string {
  if (status === "CONFIRMED") {
    return "rounded-md px-2 py-0.5 text-xs font-bold shadow-xs bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800";
  }
  return "rounded-md px-2 py-0.5 text-xs font-bold shadow-xs bg-muted text-muted-foreground border border-border";
}

/**
 * Returns CSS classes for match info section.
 */
export function getMatchDetailInfoSectionClasses(): string {
  return "space-y-2";
}

/**
 * Returns CSS classes for club detail card.
 */
export function getMatchDetailClubCardClasses(): string {
  return "flex items-center gap-2 rounded-xl border border-border bg-card shadow-xs p-3";
}

/**
 * Returns CSS classes for organizer card (link or static).
 */
export function getMatchDetailOrganizerCardClasses(isLink: boolean = false): string {
  if (isLink) {
    return "flex items-center gap-2 rounded-xl border border-border bg-card shadow-xs p-3 transition-all hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
  }
  return "flex items-center gap-2 rounded-xl border border-border bg-card shadow-xs p-3";
}

/**
 * Returns CSS classes for actions section container.
 */
export function getMatchDetailActionsSectionClasses(): string {
  return "flex flex-col gap-2";
}

/**
 * Returns CSS classes for primary enter score button.
 */
export function getMatchDetailPrimaryActionButtonClasses(): string {
  return "w-full h-12 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Returns CSS classes for secondary outline action buttons (edit/share).
 */
export function getMatchDetailSecondaryActionButtonClasses(): string {
  return "flex-1 h-10 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Returns CSS classes for final score summary card.
 */
export function getMatchDetailScoreSummaryCardClasses(): string {
  return "flex flex-col items-center justify-center text-center py-10 rounded-xl border border-border bg-card shadow-xs";
}

/**
 * Returns CSS classes for score sets grid.
 */
export function getMatchDetailScoreSetsGridClasses(): string {
  return "flex flex-wrap items-center justify-center gap-x-8 gap-y-4 px-4";
}

/**
 * Returns CSS classes for each score set item.
 */
export function getMatchDetailScoreSetItemClasses(): string {
  return "text-5xl font-bold text-foreground leading-none";
}

/**
 * Returns CSS classes for player avatar overlay in summary.
 */
export function getMatchDetailPlayerAvatarOverlayClasses(): string {
  return "border-2 border-card transition-all hover:opacity-80 active:scale-[0.95]";
}

/**
 * Returns CSS classes for player avatar link in summary.
 */
export function getMatchDetailPlayerAvatarLinkClasses(): string {
  return "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-full z-10 hover:z-20 relative";
}

/**
 * Returns CSS classes for confirmations section card.
 */
export function getMatchDetailConfirmationsCardClasses(): string {
  return "space-y-4 rounded-xl border border-border bg-card shadow-xs p-4";
}

/**
 * Returns CSS classes for player confirmation item card.
 */
export function getMatchDetailPlayerConfirmationItemClasses(isConfirmed: boolean): string {
  return isConfirmed
    ? "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all shadow-xs bg-card border-primary font-semibold"
    : "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all shadow-xs bg-muted/50 border-border opacity-70";
}

/**
 * Returns CSS classes for player confirmation name text.
 */
export function getMatchDetailPlayerConfirmationNameClasses(isConfirmed: boolean): string {
  return isConfirmed
    ? "text-xs font-bold truncate w-full group-hover:text-primary transition-colors text-foreground"
    : "text-xs font-bold truncate w-full group-hover:text-primary transition-colors text-muted-foreground";
}

/**
 * Returns CSS classes for player confirmation status text.
 */
export function getMatchDetailPlayerConfirmationStatusClasses(isConfirmed: boolean): string {
  return isConfirmed ? "text-xs font-semibold text-primary" : "text-xs font-semibold text-muted-foreground/60";
}

/**
 * Returns CSS classes for sticky confirmation banner container.
 */
export function getMatchDetailStickyBannerContainerClasses(): string {
  return "fixed bottom-20 left-0 right-0 z-30 px-5 pb-4";
}

/**
 * Returns CSS classes for sticky confirmation banner card.
 */
export function getMatchDetailStickyBannerCardClasses(): string {
  return "mx-auto max-w-md rounded-xl border border-primary/20 bg-card p-4 shadow-sm";
}

/**
 * Returns CSS classes for sticky confirmation banner icon badge.
 */
export function getMatchDetailStickyBannerIconBadgeClasses(): string {
  return "flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs";
}

/**
 * Returns CSS classes for processed notice badge.
 */
export function getMatchDetailProcessedNoticeClasses(): string {
  return "inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-bold shadow-xs";
}

/**
 * Returns CSS classes for attendance card.
 */
export function getMatchDetailAttendanceCardClasses(): string {
  return "space-y-3 rounded-xl border border-border bg-card shadow-xs p-4";
}

/**
 * Returns CSS classes for organizer notes card.
 */
export function getMatchDetailNotesCardClasses(): string {
  return "rounded-xl border border-border bg-card shadow-xs p-4";
}
