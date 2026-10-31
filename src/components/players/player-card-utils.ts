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

/**
 * Returns standardized CSS badge classes for player ranking display.
 */
export function getPlayerRankingBadgeClasses(): string {
  return "flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-muted px-2 text-xs font-bold text-foreground border border-border shadow-xs";
}

/**
 * Returns standardized CSS badge classes for compact player ranking display.
 */
export function getPlayerCompactRankingBadgeClasses(): string {
  return "flex h-7 min-w-[28px] items-center justify-center rounded-md bg-muted px-1.5 text-xs font-bold text-muted-foreground border border-border shadow-xs";
}

/**
 * Returns standardized CSS container classes for player preview management icon slot.
 */
export function getPlayerPreviewManageIconContainerClasses(): string {
  return "flex h-8 w-8 items-center justify-center text-muted-foreground";
}

/**
 * Returns standardized CSS container classes for pair preview cards.
 */
export function getPairPreviewContainerClasses(): string {
  return "relative rounded-xl border border-border bg-card mt-8 shadow-xs";
}

/**
 * Returns standardized CSS badge classes for pair labels.
 */
export function getPairBadgeClasses(): string {
  return "absolute left-6 top-0 -translate-y-1/2 rounded-full bg-background border border-border px-3 py-0.5 text-xs font-bold text-muted-foreground shadow-xs z-10";
}

/**
 * Returns standardized CSS container classes for pair preview body content.
 */
export function getPairPreviewBodyClasses(): string {
  return "relative space-y-3 p-5 pt-6";
}

/**
 * Returns standardized CSS classes for pair preview vertical connection line.
 */
export function getPairPreviewLineClasses(): string {
  return "pointer-events-none absolute left-2 top-8 bottom-8 w-px bg-border";
}

/**
 * Returns standardized CSS classes for pair preview horizontal player connector.
 */
export function getPairPreviewConnectorClasses(): string {
  return "pointer-events-none absolute left-[-20px] top-1/2 h-px w-5 -translate-y-1/2 bg-border";
}

/**
 * Returns standardized CSS container classes for inline pair cards.
 */
export function getPairInlineContainerClasses(): string {
  return "relative rounded-xl border border-border bg-card shadow-xs";
}

/**
 * Returns standardized CSS container classes for inline pair content layout.
 */
export function getPairInlineContentClasses(): string {
  return "flex items-center gap-4 px-6 py-6 pt-7";
}

/**
 * Returns standardized CSS container classes for individual player item in inline pairs.
 */
export function getPairInlinePlayerItemClasses(): string {
  return "flex min-w-0 flex-1 items-center gap-3 group transition-colors";
}

/**
 * Returns standardized CSS classes for inline pair vertical divider.
 */
export function getPairInlineDividerClasses(): string {
  return "h-8 w-px bg-border";
}

/**
 * Returns standardized CSS classes for player avatar inside inline pair.
 */
export function getPairInlineAvatarClasses(): string {
  return "rounded-lg border border-border shadow-xs";
}
