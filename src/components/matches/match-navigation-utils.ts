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
