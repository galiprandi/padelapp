import { cn, getLevelBadgeLabel } from "@/lib/utils";

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

const ALLOWED_AVATAR_HOSTS = ["lh3.googleusercontent.com"];

/**
 * Validates if an avatar image URL comes from an allowed remote host pattern.
 */
export function isSafeAvatarImage(image?: string | null): boolean {
  if (!image) return false;
  return ALLOWED_AVATAR_HOSTS.some((host) => image.includes(host));
}

/**
 * Returns localized Argentine Spanish ARIA accessibility label for player avatar image or fallback initials.
 */
export function getPlayerAvatarAriaLabel(
  name: string,
  hasSafeImage: boolean
): string {
  const sanitizedName = name.trim() || "Jugador";
  return hasSafeImage
    ? `Foto de perfil de ${sanitizedName}`
    : `Iniciales de ${sanitizedName}`;
}

/**
 * Returns standardized CSS container classes for player avatars.
 */
export function getPlayerAvatarClasses(className?: string): string {
  return cn(
    "flex shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-primary border border-border shadow-xs overflow-hidden",
    className
  );
}

/**
 * Returns explicit width and height style properties based on avatar size in pixels.
 */
export function getPlayerAvatarDimensionStyle(size = 40): {
  width: string;
  height: string;
} {
  const dimension = `${size}px`;
  return { width: dimension, height: dimension };
}

/**
 * Returns standardized CSS container classes for player cards including hover, focus-visible ring offset, and active tactile scaling.
 */
export function getPlayerCardContainerClasses(
  isInteractive: boolean,
  className?: string
): string {
  return cn(
    "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors",
    isInteractive &&
      "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all cursor-pointer",
    className
  );
}

/**
 * Returns localized Argentine Spanish ARIA region landmark label for pair groupings.
 */
export function getPairRegionAriaLabel(label: string): string {
  const trimmed = label.trim() || "Pareja";
  return `Grupo de pareja: ${trimmed}`;
}

/**
 * Returns localized Argentine Spanish ARIA label for ranking position badges.
 */
export function getRankingBadgeAriaLabel(ranking: number): string {
  return `Puesto número ${ranking} en el ranking`;
}
