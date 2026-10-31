import { cn } from "@/lib/utils";

/**
 * Generates an accessible, localized ARIA label for empty state region containers.
 */
export function getEmptyStateAriaLabel(title: string, description?: string): string {
  const cleanTitle = title.trim();
  if (!description || !description.trim()) {
    return cleanTitle;
  }
  return `${cleanTitle} - ${description.trim()}`;
}

/**
 * Returns merged container class names for EmptyState cards adhering to solid MDS styling.
 */
export function getEmptyStateContainerClasses(className?: string): string {
  return cn(
    "flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-12 text-center shadow-xs",
    className,
  );
}

/**
 * Returns standardized CSS classes for empty state icon container badge.
 */
export function getEmptyStateIconBadgeClasses(): string {
  return "mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border shadow-xs";
}

/**
 * Returns standardized CSS classes for empty state text content wrapper.
 */
export function getEmptyStateContentClasses(): string {
  return "flex flex-col gap-1";
}

/**
 * Returns standardized CSS classes for empty state heading title.
 */
export function getEmptyStateTitleClasses(): string {
  return "text-sm font-bold text-foreground";
}

/**
 * Returns standardized CSS classes for empty state description text.
 */
export function getEmptyStateDescriptionClasses(): string {
  return "text-xs text-muted-foreground max-w-[280px] mx-auto";
}

/**
 * Returns standardized CSS classes for empty state action button wrapper.
 */
export function getEmptyStateActionWrapperClasses(): string {
  return "mt-4 w-full flex justify-center";
}
