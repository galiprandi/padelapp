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
