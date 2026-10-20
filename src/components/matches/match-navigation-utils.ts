import { cn } from "@/lib/utils";

/**
 * Returns the accessible ARIA label for the match navigation step region.
 */
export function getMatchNavigationAriaLabel(): string {
  return "Navegación de pasos del partido";
}

/**
 * Formats an Argentine Spanish accessible screen reader label for the primary action button.
 */
export function getPrimaryButtonAriaLabel(
  primaryButtonText: string,
  primaryLoading?: boolean,
): string {
  if (primaryLoading) {
    return `${primaryButtonText} - Procesando`;
  }
  return primaryButtonText;
}

/**
 * Formats an Argentine Spanish accessible screen reader label for the secondary action button.
 */
export function getSecondaryButtonAriaLabel(secondaryButtonText: string): string {
  return secondaryButtonText;
}

/**
 * Returns Tailwind CSS class names for match navigation container region landmark.
 */
export function getMatchNavigationContainerClasses(): string {
  return "flex flex-col gap-2";
}

/**
 * Returns Tailwind CSS class names for match navigation primary action button.
 */
export function getPrimaryButtonClasses(): string {
  return "w-full h-12 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background shadow-xs";
}

/**
 * Derives secondary navigation button styling classes according to variant.
 */
export function getSecondaryButtonClasses(
  secondaryVariant: "ghost" | "outline" = "ghost",
): string {
  return cn(
    "w-full h-10 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    secondaryVariant === "ghost"
      ? "text-muted-foreground hover:text-foreground"
      : "",
  );
}
