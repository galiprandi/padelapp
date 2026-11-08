import { cn } from "@/lib/utils";

export const MATCH_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DISPUTED: "DISPUTED",
  CANCELLED: "CANCELLED",
} as const;

export type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

export function formatStatus(status: MatchStatus): string {
  switch (status) {
    case MATCH_STATUS.CONFIRMED:
      return "Confirmado";
    case MATCH_STATUS.DISPUTED:
      return "En disputa";
    case MATCH_STATUS.CANCELLED:
      return "Cancelado";
    case MATCH_STATUS.PENDING:
    default:
      return "Pendiente";
  }
}

export function teamKeyForPosition(position: number, totalPlayers: number): "A" | "B" {
  if (totalPlayers <= 2) {
    return position === 0 ? "A" : "B";
  }
  return position < 2 ? "A" : "B";
}

export function defaultTeamLabel(teamKey: "A" | "B", totalPlayers: number): string {
  if (totalPlayers <= 2) {
    return teamKey === "A" ? "Jugador A" : "Jugador B";
  }
  return teamKey === "A" ? "Pareja A" : "Pareja B";
}

export function formatJoinSlotInvitationMessage(
  creatorName: string | null | undefined,
  teamLabel: string
): string {
  const trimmedCreator = creatorName?.trim();
  if (trimmedCreator) {
    return `${trimmedCreator} te invitó a sumarte como ${teamLabel}.`;
  }
  return `Te invitaron a sumarte como ${teamLabel}.`;
}

export interface GetJoinSlotHelperMessageOptions {
  slotTaken: boolean;
  slotTakenByViewer: boolean;
  matchClosed: boolean;
  viewerAlreadyInMatch: boolean;
}

/**
 * Determines helper/warning message text for slot join status.
 */
export function getJoinSlotHelperMessage({
  slotTaken,
  slotTakenByViewer,
  matchClosed,
  viewerAlreadyInMatch,
}: GetJoinSlotHelperMessageOptions): string | null {
  if (slotTaken && !slotTakenByViewer) {
    return "Cupo ocupado, hablá con el organizador del partido.";
  }
  if (matchClosed) {
    return "El partido ya no admite nuevas confirmaciones.";
  }
  if (viewerAlreadyInMatch && !slotTakenByViewer) {
    return "Ya estás inscripto en otro cupo para este partido.";
  }
  return null;
}

export interface MinimalSlotItem {
  position: number;
}

/**
 * Groups match slots into team A and team B groups.
 */
export function groupMatchSlotsByTeam<T extends MinimalSlotItem>(
  slots: T[],
  totalPlayers: number
): Record<"A" | "B", T[]> {
  const teamGroups: Record<"A" | "B", T[]> = { A: [], B: [] };
  for (const slot of slots) {
    const key = teamKeyForPosition(slot.position, totalPlayers);
    teamGroups[key].push(slot);
  }
  return teamGroups;
}

export type JoinSlotRegionKind =
  | "header"
  | "invitation"
  | "match-detail"
  | "formation"
  | "footer";

/**
 * Generates Argentine Spanish ARIA landmark labels for Join Slot sections.
 */
export function getJoinSlotRegionAriaLabel(kind: JoinSlotRegionKind): string {
  switch (kind) {
    case "header":
      return "Encabezado de invitación";
    case "invitation":
      return "Mensaje de invitación";
    case "match-detail":
      return "Detalle del partido";
    case "formation":
      return "Formación de los equipos";
    case "footer":
      return "Confirmación de inscripción";
  }
}

/**
 * Returns badge text and styling variant classes for player confirmation status.
 */
export function getSlotStatusBadgeProps(resultConfirmed: boolean) {
  return {
    text: resultConfirmed ? "Confirmado" : "Pendiente",
    className: resultConfirmed
      ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800"
      : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  };
}

/**
 * Returns accessible ARIA label for JoinSlotButton during pending and default states.
 */
export function getJoinSlotButtonAriaLabel(isPending: boolean): string {
  return isPending
    ? "Confirmando lugar en el partido..."
    : "Confirmar mi lugar en el partido";
}

/**
 * Returns button text label for JoinSlotButton.
 */
export function getJoinSlotButtonText(isPending: boolean): string {
  return isPending ? "Confirmando..." : "Confirmar mi lugar";
}

/**
 * Returns toast message when joining a match slot succeeds.
 */
export function getJoinSlotSuccessToast(): string {
  return "Te sumaste al partido.";
}

/**
 * Returns toast error message when joining a match slot fails.
 */
export function getJoinSlotErrorToast(message?: string): string {
  return message ?? "No pudimos sumarte al partido.";
}

/**
 * Returns accessible ARIA region label for the join slot skeleton loading container.
 */
export function getJoinSlotSkeletonAriaLabel(): string {
  return "Cargando detalles de la invitación al partido...";
}

export function getJoinSlotHeaderTitle(): string {
  return "Invitación a jugar";
}

export function getJoinSlotHeaderSubtitle(): string {
  return "Invitación directa para partido de pádel";
}

export function getJoinSlotBackAriaLabel(): string {
  return "Volver";
}

export function getJoinSlotInvitationLabel(): string {
  return "Invitación enviada";
}

export function getJoinSlotMatchDetailTitle(): string {
  return "Detalle del partido";
}

export function getJoinSlotClubSubtext(): string {
  return "Sede del encuentro";
}

export function getJoinSlotCourtText(courtNumber: string | null): string {
  return courtNumber ? `(Cancha ${courtNumber})` : "";
}

export function getJoinSlotFormationTitle(): string {
  return "Formación actual";
}

export function getJoinSlotJoiningAsLabel(): string {
  return "Te unirás como";
}

export function getJoinSlotAlreadyJoinedButtonText(): string {
  return "Ya estás unido · Ver partido";
}

export function getJoinSlotViewMatchDetailsText(): string {
  return "Ver todos los detalles del encuentro";
}

export function formatSlotPositionText(position: number): string {
  return `Jugador ${position + 1}`;
}

export function getSignInFormLabelForMatch(club: string | null): string {
  return `Iniciá sesión para unirte a ${club ?? "el partido"}`;
}

export function getJoinSlotMainClasses(): string {
  return "mx-auto min-h-screen w-full max-w-md flex flex-col gap-6 px-6 py-10 pb-48";
}

export function getJoinSlotHeaderClasses(): string {
  return "flex items-center gap-4";
}

export function getJoinSlotBackButtonClasses(): string {
  return "flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

export function getJoinSlotInvitationCardClasses(): string {
  return "rounded-xl border border-border bg-card p-4 shadow-xs";
}

export function getJoinSlotMatchCardClasses(): string {
  return "rounded-xl border-border bg-card overflow-hidden shadow-xs";
}

export function getJoinSlotSlotItemClasses(isViewer: boolean): string {
  return cn(
    "flex items-center gap-3 rounded-xl p-3 border",
    isViewer
      ? "bg-card border-primary font-semibold shadow-xs"
      : "bg-card border-border shadow-xs"
  );
}

export function getJoinSlotSlotNameClasses(isOccupied: boolean): string {
  return cn(
    "text-sm font-bold truncate leading-tight",
    isOccupied ? "text-foreground" : "text-muted-foreground italic"
  );
}

export function getJoinSlotHelperWarningClasses(): string {
  return "flex items-center gap-3 rounded-lg bg-card p-3 text-destructive border border-destructive shadow-xs";
}

export function getJoinSlotFooterContainerClasses(): string {
  return "fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border z-50";
}

export function getJoinSlotFooterIconBadgeClasses(): string {
  return "h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-xs";
}

export function getJoinSlotAlreadyJoinedButtonClasses(): string {
  return "w-full h-12 rounded-lg text-base font-bold active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

export function getJoinSlotDetailLinkClasses(): string {
  return "block text-center text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-sm";
}

export function getJoinSlotModalidadLabel(): string {
  return "Modalidad";
}

export function getJoinSlotEstadoLabel(): string {
  return "Estado";
}

export function formatMatchSetsText(sets: number): string {
  return `${sets} sets`;
}

export function getJoinSlotOrganizerFallbackName(): string {
  return "Organizador";
}

export function formatFallbackSlotName(position: number): string {
  return `Cupo ${position + 1}`;
}

export function getJoinSlotInvitationCardInnerClasses(customClassName?: string): string {
  return cn("flex items-center gap-3", customClassName);
}

export function getJoinSlotInvitationAvatarClasses(customClassName?: string): string {
  return cn("border border-border shrink-0", customClassName);
}

export function getJoinSlotInvitationTextContainerClasses(customClassName?: string): string {
  return cn("flex-1 min-w-0", customClassName);
}

export function getJoinSlotInvitationTitleClasses(customClassName?: string): string {
  return cn("text-xs font-bold text-muted-foreground", customClassName);
}

export function getJoinSlotInvitationMessageClasses(customClassName?: string): string {
  return cn("text-sm font-semibold text-foreground leading-snug", customClassName);
}

export function getJoinSlotMatchCardHeaderClasses(customClassName?: string): string {
  return cn("pb-4 pt-6 border-b border-border bg-muted", customClassName);
}

export function getJoinSlotMatchCardTitleClasses(customClassName?: string): string {
  return cn("text-xs font-bold text-muted-foreground", customClassName);
}

export function getJoinSlotMatchCardContentClasses(customClassName?: string): string {
  return cn("grid grid-cols-2 gap-px bg-border p-0", customClassName);
}

export function getJoinSlotMatchCardMetricCellClasses(customClassName?: string): string {
  return cn("bg-card p-4 flex flex-col gap-1", customClassName);
}

export function getJoinSlotMatchCardMetricHeaderClasses(customClassName?: string): string {
  return cn("flex items-center gap-2 text-muted-foreground", customClassName);
}

export function getJoinSlotMatchCardMetricTitleClasses(customClassName?: string): string {
  return cn("text-xs font-semibold", customClassName);
}

export function getJoinSlotMatchCardMetricValueClasses(customClassName?: string): string {
  return cn("text-lg font-bold", customClassName);
}

export function getJoinSlotMatchCardBadgeContainerClasses(customClassName?: string): string {
  return cn("flex items-center pt-1", customClassName);
}

export function getJoinSlotMatchCardStatusBadgeClasses(customClassName?: string): string {
  return cn("text-xs font-bold px-2 py-0.5 rounded border-border", customClassName);
}

export function getJoinSlotMatchCardClubRowClasses(customClassName?: string): string {
  return cn("col-span-2 bg-card p-4 flex items-center gap-4 border-t border-border", customClassName);
}

export function getJoinSlotMatchCardClubIconContainerClasses(customClassName?: string): string {
  return cn("flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground border border-border shrink-0", customClassName);
}

export function getJoinSlotMatchCardClubIconClasses(customClassName?: string): string {
  return cn("h-5 w-5", customClassName);
}

export function getJoinSlotMatchCardClubInfoClasses(customClassName?: string): string {
  return cn("min-w-0", customClassName);
}

export function getJoinSlotMatchCardClubTitleClasses(customClassName?: string): string {
  return cn("text-sm font-bold truncate", customClassName);
}

export function getJoinSlotMatchCardClubSubtitleClasses(customClassName?: string): string {
  return cn("text-xs text-muted-foreground", customClassName);
}

export function getJoinSlotFormationSectionClasses(customClassName?: string): string {
  return cn("space-y-4", customClassName);
}

export function getJoinSlotFormationHeaderClasses(customClassName?: string): string {
  return cn("flex items-center justify-between", customClassName);
}

export function getJoinSlotFormationTitleClasses(customClassName?: string): string {
  return cn("text-sm font-bold text-foreground", customClassName);
}

export function getJoinSlotFormationIconClasses(customClassName?: string): string {
  return cn("h-4 w-4 text-muted-foreground", customClassName);
}

export function getJoinSlotFormationGridClasses(customClassName?: string): string {
  return cn("grid gap-6", customClassName);
}

export function getJoinSlotFormationTeamGroupClasses(customClassName?: string): string {
  return cn("space-y-3", customClassName);
}

export function getJoinSlotFormationTeamHeaderClasses(customClassName?: string): string {
  return cn("flex items-center gap-2", customClassName);
}

export function getJoinSlotFormationTeamLabelClasses(customClassName?: string): string {
  return cn("text-xs font-bold text-muted-foreground", customClassName);
}

export function getJoinSlotFormationTeamDividerClasses(customClassName?: string): string {
  return cn("h-px flex-1 bg-border", customClassName);
}

export function getJoinSlotFormationTeamSlotsGridClasses(customClassName?: string): string {
  return cn("grid gap-2", customClassName);
}

export function getJoinSlotFormationSlotAvatarClasses(isOccupied: boolean, customClassName?: string): string {
  return cn("border border-border shrink-0", !isOccupied && "opacity-50", customClassName);
}

export function getJoinSlotFormationSlotInfoClasses(customClassName?: string): string {
  return cn("flex-1 min-w-0", customClassName);
}

export function getJoinSlotFormationSlotPositionClasses(customClassName?: string): string {
  return cn("text-xs text-muted-foreground mt-0.5", customClassName);
}

export function getJoinSlotFormationSlotBadgeClasses(customClassName?: string): string {
  return cn("text-xs font-bold px-2 py-0.5 rounded", customClassName);
}

export function getJoinSlotFooterContentClasses(customClassName?: string): string {
  return cn("max-w-md mx-auto", customClassName);
}

export function getJoinSlotFooterLayoutClasses(customClassName?: string): string {
  return cn("flex flex-col gap-4", customClassName);
}

export function getJoinSlotFooterUserBadgeRowClasses(customClassName?: string): string {
  return cn("flex items-center gap-4", customClassName);
}

export function getJoinSlotFooterIconClasses(customClassName?: string): string {
  return cn("h-6 w-6", customClassName);
}

export function getJoinSlotFooterUserBadgeInfoClasses(customClassName?: string): string {
  return cn("flex-1 min-w-0", customClassName);
}

export function getJoinSlotFooterUserBadgeTitleClasses(customClassName?: string): string {
  return cn("text-xs font-bold text-muted-foreground leading-none mb-1", customClassName);
}

export function getJoinSlotFooterUserBadgeTeamClasses(customClassName?: string): string {
  return cn("text-xl font-bold text-foreground truncate", customClassName);
}

export function getJoinSlotFooterWarningIconClasses(customClassName?: string): string {
  return cn("h-4 w-4 shrink-0", customClassName);
}

export function getJoinSlotFooterWarningTextClasses(customClassName?: string): string {
  return cn("text-xs font-bold", customClassName);
}

export function getJoinSlotFooterActionStackClasses(customClassName?: string): string {
  return cn("space-y-3", customClassName);
}

export function getJoinSlotSignInFormClasses(customClassName?: string): string {
  return cn("w-full h-12 rounded-lg text-base font-bold", customClassName);
}

export function getJoinSlotSkeletonCardClasses(customClassName?: string): string {
  return cn("rounded-xl border border-border bg-card overflow-hidden", customClassName);
}

export function getJoinSlotSkeletonCardHeaderClasses(customClassName?: string): string {
  return cn("h-10 bg-muted border-b border-border flex items-center px-4", customClassName);
}

export function getJoinSlotSkeletonCardContentClasses(customClassName?: string): string {
  return cn("grid grid-cols-2 gap-px bg-border", customClassName);
}

export function getJoinSlotSkeletonCardCellClasses(customClassName?: string): string {
  return cn("bg-card p-4 space-y-2", customClassName);
}

export function getJoinSlotSkeletonFormationClasses(customClassName?: string): string {
  return cn("space-y-4", customClassName);
}

export function getJoinSlotSkeletonFormationHeaderClasses(customClassName?: string): string {
  return cn("flex items-center justify-between", customClassName);
}

export function getJoinSlotSkeletonFormationGroupClasses(customClassName?: string): string {
  return cn("space-y-4", customClassName);
}

export function getJoinSlotSkeletonFormationTeamClasses(customClassName?: string): string {
  return cn("space-y-2", customClassName);
}

export function getJoinSlotSkeletonFormationSlotsGridClasses(customClassName?: string): string {
  return cn("grid gap-2", customClassName);
}
