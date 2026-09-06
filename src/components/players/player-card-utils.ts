import { getLevelBadgeLabel } from "@/lib/utils";

export interface GetPlayerCardAriaLabelOptions {
  name: string;
  isInteractive: boolean;
  onManageClick?: () => void;
  isConfirmed?: boolean;
  customLabel?: string;
}

/**
 * Returns localized Argentine Spanish ARIA label for player cards.
 */
export function getPlayerCardAriaLabel({
  name,
  isInteractive,
  onManageClick,
  isConfirmed,
  customLabel,
}: GetPlayerCardAriaLabelOptions): string | undefined {
  if (!isInteractive) return undefined;
  if (customLabel) return customLabel;
  if (onManageClick) {
    return isConfirmed
      ? `Gestionar jugador ${name}`
      : `Invitar jugador ${name}`;
  }
  return `Ver perfil de ${name}`;
}

/**
 * Combines player role and category label into a formatted subtitle string.
 */
export function formatPlayerSubtitle(
  role?: string,
  category?: number
): string | null {
  const categoryLabel =
    typeof category === "number" ? getLevelBadgeLabel(category) : null;

  if (role && categoryLabel) {
    return `${role} · ${categoryLabel}`;
  }
  if (role) return role;
  if (categoryLabel) return categoryLabel;
  return null;
}

/**
 * Standardized keyboard event handler for Enter and Space key presses on interactive card containers.
 */
export function handlePlayerCardKeyDown(
  e: React.KeyboardEvent,
  isInteractive: boolean,
  action?: () => void
): void {
  if (isInteractive && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    action?.();
  }
}
