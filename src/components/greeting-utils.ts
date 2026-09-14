import { getLevelBadgeLabel } from "@/lib/utils";

export interface OnboardingProgressParams {
  hasAlias: boolean;
  hasActivity: boolean;
  isPwaInstalled?: boolean;
  hasNotifications?: boolean;
}

/**
 * Calculates the total number of completed onboarding steps out of 4.
 */
export function getOnboardingProgressCount({
  hasAlias,
  hasActivity,
  isPwaInstalled = false,
  hasNotifications = false,
}: OnboardingProgressParams): number {
  return (
    (hasAlias ? 1 : 0) +
    (hasActivity ? 1 : 0) +
    (isPwaInstalled ? 1 : 0) +
    (hasNotifications ? 1 : 0)
  );
}

/**
 * Formats an Argentine Spanish screen reader ARIA label for the onboarding progress badge.
 */
export function getOnboardingProgressAriaLabel(count: number, total: number = 4): string {
  return `Progreso de preparación: ${count} de ${total} pasos completados`;
}

/**
 * Formats an accessible ARIA label for the entire user greeting section.
 */
export function getGreetingAriaLabel(
  greeting: string,
  name: string,
  categoryLabel?: string | null
): string {
  if (categoryLabel) {
    return `Saludo: ${greeting}, ${name}. Categoría: ${categoryLabel}.`;
  }
  return `Saludo: ${greeting}, ${name}.`;
}

/**
 * Returns the formatted category badge label or null if level is not provided.
 */
export function formatCategoryBadgeText(level?: number | null): string | null {
  if (level === undefined || level === null) return null;
  return getLevelBadgeLabel(level);
}
