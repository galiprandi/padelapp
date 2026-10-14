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

/**
 * Generates an Argentine Spanish accessible ARIA label for the slot management dialog region.
 */
export function getManageSlotRegionAriaLabel(titleName?: string): string {
  if (titleName && titleName.trim().length > 0) {
    return `Gestionar cupo de ${titleName}`;
  }
  return "Gestionar jugador del partido";
}

/**
 * Returns localized Argentine Spanish title text for ManageSlotModal header.
 */
export function getManageSlotHeaderTitle(): string {
  return "Gestionar jugador";
}

/**
 * Generates an Argentine Spanish accessible ARIA label for the slot swap action button.
 */
export function getManageSlotSwapButtonText(): string {
  return "Mover";
}

export function getManageSlotSwapButtonAriaLabel(): string {
  return "Mover o intercambiar posición del jugador";
}

/**
 * Returns localized button text for releasing/removing slot.
 */
export function getManageSlotReleaseButtonText(): string {
  return "Quitar";
}

/**
 * Generates an Argentine Spanish accessible ARIA label for the slot release action button.
 */
export function getManageSlotReleaseButtonAriaLabel(): string {
  return "Quitar o liberar cupo del jugador";
}

/**
 * Returns localized button text for saving slot.
 */
export function getManageSlotSaveButtonText(): string {
  return "Guardar";
}

/**
 * Returns localized button text for closing/canceling slot management dialog.
 */
export function getManageSlotCloseButtonText(isReadOnlyUserSlot: boolean): string {
  return isReadOnlyUserSlot ? "Cerrar" : "Cancelar";
}

/**
 * Returns localized text for verified user badge in read-only slot state.
 */
export function getManageSlotVerifiedUserBadgeText(): string {
  return "Jugador verificado";
}

/**
 * Returns localized explanatory notice for verified user slot in read-only state.
 */
export function getManageSlotVerifiedUserNoticeText(): string {
  return 'Este cupo está ocupado por un perfil verificado. Si querés cambiarlo, debés "Quitar" al jugador primero.';
}

/**
 * Returns localized header label for recent players quick select list.
 */
export function getManageSlotRecentPlayersLabel(): string {
  return "Jugadores recientes";
}

/**
 * Returns localized placeholder text for the player search input field.
 */
export function getManageSlotSearchInputPlaceholder(): string {
  return "Buscar jugador o escribir nombre...";
}

/**
 * Returns localized ARIA label for clearing search input.
 */
export function getManageSlotSearchClearAriaLabel(): string {
  return "Limpiar nombre";
}

/**
 * Returns localized notice text displayed when no search results are found.
 */
export function getManageSlotNoResultsNoticeText(): string {
  return 'No hay jugadores con ese nombre. Tocá "Guardar" para registrarlo igual.';
}

/**
 * Returns localized header label for recent contacts list.
 */
export function getManageSlotRecentContactsLabel(): string {
  return "Contactos recientes";
}

/**
 * Returns localized ARIA label for the share invitation button.
 */
export function getManageSlotShareButtonAriaLabel(): string {
  return "Compartir enlace de invitación";
}

/**
 * Returns localized error message shown when attempting to share with an empty name.
 */
export function getManageSlotShareValidationErrorMessage(): string {
  return "Ingresá un nombre antes de compartir";
}
