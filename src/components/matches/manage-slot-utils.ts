import type { SlotValue } from "@/lib/match-types";

/**
 * Returns the initial display value for the player input in ManageSlotModal.
 */
export function getManageSlotInitialValue(
  slot: SlotValue | null,
  placeholderName: string
): string {
  if (slot?.kind === "user") {
    return slot.player.displayName;
  }
  if (slot?.kind === "placeholder") {
    return slot.displayName;
  }
  return placeholderName;
}

/**
 * Validates player name input for placeholder slot saving.
 */
export function validateSlotInputValue(input: string): {
  isValid: boolean;
  error: string | null;
} {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: "Ingresá un nombre" };
  }
  return { isValid: true, error: null };
}

/**
 * Generates an accessible ARIA label for recent player selection chips.
 */
export function getRecentPlayerAriaLabel(displayName: string): string {
  return `Agregar a ${displayName}`;
}

/**
 * Generates an accessible ARIA label for player search result items.
 */
export function formatSearchPlayerAriaLabel(displayName: string): string {
  return `Seleccionar a ${displayName}`;
}

/**
 * Generates dynamic screen reader status message for player search results.
 */
export function getSearchResultsStatusAriaLabel(
  isSearching: boolean,
  showNoResults: boolean,
  resultsCount: number
): string {
  if (isSearching) {
    return "Buscando jugadores...";
  }
  if (showNoResults) {
    return "No se encontraron jugadores";
  }
  if (resultsCount > 0) {
    return `${resultsCount} jugador${resultsCount === 1 ? "" : "es"} encontrado${resultsCount === 1 ? "" : "s"}`;
  }
  return "";
}
