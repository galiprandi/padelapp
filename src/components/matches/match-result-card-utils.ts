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
