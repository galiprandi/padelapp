import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";

/**
 * Pure helper functions for MatchResultCard and MatchResultCompact components
 */

/**
 * Returns success toast message for quick match result confirmation
 */
export function getMatchQuickConfirmSuccessToast(): string {
  return "Confirmaste el resultado. 🏆";
}

/**
 * Returns error toast message for quick match result confirmation failure
 */
export function getMatchQuickConfirmErrorToast(message?: string | null): string {
  return message || "No pudimos confirmar el resultado.";
}

/**
 * Returns accessible ARIA label for quick confirm button
 */
export function getMatchQuickConfirmButtonAriaLabel(score?: string | null): string {
  return score && score.trim().length > 0
    ? `Confirmar resultado (${score}) del partido`
    : "Confirmar resultado del partido";
}

/**
 * Returns button text for quick confirm button depending on confirmation state
 */
export function getMatchQuickConfirmButtonText(isConfirming: boolean): string {
  return isConfirming ? "Confirmando..." : "Confirmar";
}

/**
 * Returns share modal title for match result
 */
export function getMatchShareTitle(): string {
  return "Resultado de Pádel";
}

/**
 * Returns accessible ARIA label for share button
 */
export function getMatchShareButtonAriaLabel(): string {
  return "Compartir resultado";
}

/**
 * Returns text for detail link
 */
export function getMatchDetailLinkText(): string {
  return "Detalle";
}

/**
 * Returns versus separator text
 */
export function getMatchVersusSeparatorText(): string {
  return "vs";
}

/**
 * Returns score placeholder text when set score is not available
 */
export function getMatchScorePlaceholderText(): string {
  return "—";
}

/**
 * Returns player display name considering whether the player is the active viewer
 */
export function getMatchTeamPlayerNameText(isViewer: boolean, name: string): string {
  return isViewer ? "Vos" : name;
}

/**
 * Returns localized status badge text for match result compact card
 */
export function getMatchStatusBadgeText(
  statusLabel: string,
  needsConfirmation: boolean
): string {
  if (needsConfirmation) return "Confirmar";

  const upper = statusLabel.toUpperCase();
  switch (upper) {
    case "PENDING":
      return "Pendiente";
    case "CONFIRMED":
      return "Confirmado";
    case "DISPUTED":
      return "Disputa";
    default:
      return statusLabel;
  }
}

/**
 * Returns badge variant for match status badge
 */
export function getMatchStatusBadgeVariant(
  statusLabel: string,
  needsConfirmation: boolean
): VariantProps<typeof badgeVariants>["variant"] {
  if (needsConfirmation) return "primary";

  const upper = statusLabel.toUpperCase();
  switch (upper) {
    case "CONFIRMED":
      return "success";
    case "DISPUTED":
      return "warning";
    default:
      return "default";
  }
}

/**
 * Returns accessible ARIA label for match detail link
 */
export function getMatchDetailLinkAriaLabel(formattedDate?: string | null): string {
  return formattedDate && formattedDate.trim().length > 0
    ? `Ver detalle del partido del ${formattedDate}`
    : "Ver detalle del partido";
}

/**
 * Returns side title and display label for match player court position
 */
export function getMatchPlayerSideLabel(side: "RIGHT" | "LEFT"): {
  title: string;
  label: string;
} {
  return side === "RIGHT"
    ? { title: "Lado derecho", label: "Der" }
    : { title: "Lado revés", label: "Rev" };
}

/**
 * Returns accessible ARIA label for player profile avatar link
 */
export function getMatchPlayerAvatarAriaLabel(playerName: string): string {
  return `Ver perfil de ${playerName}`;
}

/**
 * Returns accessible ARIA region landmark label for match result card
 */
export function getMatchResultCardRegionAriaLabel(label: string): string {
  return `Tarjeta de resultado: ${label}`;
}

/**
 * Returns CSS classes for MatchResultCard container
 */
export function getMatchResultCardContainerClasses(): string {
  return "rounded-xl border border-border bg-card shadow-xs overflow-hidden";
}

/**
 * Returns CSS classes for MatchResultCard header
 */
export function getMatchResultCardHeaderClasses(): string {
  return "border-b border-border px-4 py-2";
}

/**
 * Returns CSS classes for MatchResultCard title span
 */
export function getMatchResultCardTitleClasses(): string {
  return "text-xs font-semibold text-muted-foreground";
}

/**
 * Returns CSS classes for MatchResultCard content container
 */
export function getMatchResultCardContentClasses(): string {
  return "p-4 text-sm text-muted-foreground";
}

/**
 * Returns CSS classes for MatchResultCard footer container
 */
export function getMatchResultCardFooterClasses(): string {
  return "border-t border-border px-4 py-3 text-xs text-muted-foreground";
}

/**
 * Returns CSS classes for MatchResultCompact quick confirm button
 */
export function getMatchQuickConfirmButtonClasses(): string {
  return "flex items-center gap-1 bg-primary text-primary-foreground px-2.5 h-8 rounded-lg text-xs font-semibold transition-all hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Returns CSS classes for MatchResultCompact share button
 */
export function getMatchShareButtonClasses(): string {
  return "h-8 w-8 rounded-lg text-primary hover:bg-muted active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Returns CSS classes for MatchResultCompact detail link
 */
export function getMatchDetailLinkClasses(): string {
  return "flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-md";
}

/**
 * Returns CSS classes for team container in MatchResultCompact
 */
export function getMatchTeamContainerClasses(hasViewer: boolean): string {
  return hasViewer
    ? "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg p-2 transition-colors bg-muted/80 font-medium"
    : "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg p-2 transition-colors";
}

/**
 * Returns CSS classes for player avatar in MatchResultCompact
 */
export function getMatchPlayerAvatarClasses(index: number): string {
  return index === 0
    ? "border-2 border-card transition-all hover:opacity-80 active:scale-[0.95] ml-0"
    : "border-2 border-card transition-all hover:opacity-80 active:scale-[0.95] -ml-2";
}

/**
 * Returns CSS classes for player name link or text in MatchResultCompact
 */
export function getMatchPlayerNameClasses(isViewer: boolean): string {
  return isViewer
    ? "truncate hover:text-primary text-primary"
    : "truncate hover:text-primary";
}

/**
 * Returns CSS classes for player court side badge in MatchResultCompact
 */
export function getMatchSideBadgeClasses(): string {
  return "inline-flex items-center shrink-0 text-xs font-semibold px-1 py-0.5 rounded bg-muted text-muted-foreground/90 leading-none";
}

/**
 * Returns CSS classes for set score segment box in MatchResultCompact
 */
export function getMatchScoreSegmentClasses(
  hasNumericValues: boolean,
  didWinSet: boolean
): string {
  const segmentClass = hasNumericValues
    ? didWinSet
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground"
    : "bg-muted text-muted-foreground/60";

  return `flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold ${segmentClass}`;
}

/**
 * Returns CSS classes for versus separator line divider in MatchResultCompact
 */
export function getMatchVersusDividerClasses(): string {
  return "flex items-center gap-2 py-0.5";
}
