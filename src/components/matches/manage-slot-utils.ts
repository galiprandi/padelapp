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

/**
 * Pure CSS class helper functions for ManageSlotModal layout and styling.
 */
export function getManageSlotBackdropClasses(): string {
  return "fixed inset-0 z-[60] flex items-stretch sm:items-center justify-center bg-black/60";
}

export function getManageSlotDialogClasses(): string {
  return "w-full max-w-sm flex flex-col bg-card shadow-xs sm:rounded-xl sm:border sm:border-border sm:max-h-[90dvh] h-[100dvh] sm:h-auto";
}

export function getManageSlotHeaderClasses(): string {
  return "flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/50 shrink-0";
}

export function getManageSlotHeaderTitleClasses(): string {
  return "text-xl font-bold text-foreground";
}

export function getManageSlotHeaderActionsClasses(): string {
  return "flex gap-2";
}

export function getManageSlotSwapButtonClasses(): string {
  return "text-primary hover:bg-primary/10 rounded-lg h-8 font-semibold text-xs px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all";
}

export function getManageSlotReleaseButtonClasses(): string {
  return "text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg h-8 font-semibold text-xs px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all";
}

export function getManageSlotContentClasses(): string {
  return "flex-1 overflow-y-auto px-6 py-4 space-y-4";
}

export function getManageSlotVerifiedCardClasses(): string {
  return "flex items-center gap-3 rounded-lg border border-border bg-muted p-4 shadow-xs";
}

export function getManageSlotVerifiedBadgeClasses(): string {
  return "text-xs text-muted-foreground";
}

export function getManageSlotVerifiedNoticeClasses(): string {
  return "text-xs font-medium text-muted-foreground/60 leading-relaxed px-1";
}

export function getManageSlotRecentPlayersHeaderClasses(): string {
  return "text-xs font-semibold text-muted-foreground flex items-center gap-1.5 px-1";
}

export function getManageSlotRecentPlayersRadiogroupClasses(): string {
  return "flex gap-2 overflow-x-auto pb-1 -mx-1 px-1";
}

export function getManageSlotRecentPlayerButtonClasses(): string {
  return "flex flex-col items-center gap-1 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-lg active:scale-[0.98] transition-all";
}

export function getManageSlotRecentPlayerAvatarClasses(): string {
  return "rounded-full ring-2 ring-border group-hover:ring-primary group-active:ring-primary transition-all";
}

export function getManageSlotSearchSectionClasses(): string {
  return "space-y-3";
}

export function getManageSlotSearchInputWrapperClasses(): string {
  return "relative h-12";
}

export function getManageSlotSearchInputClasses(): string {
  return "h-12 pl-11 pr-11 rounded-lg bg-background border-border text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

export function getManageSlotSearchClearButtonClasses(): string {
  return "absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground/40 hover:text-foreground transition-all rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

export function getManageSlotSearchResultsClasses(): string {
  return "rounded-lg border border-border bg-muted p-2 space-y-1 shadow-xs";
}

export function getManageSlotSearchResultItemClasses(): string {
  return "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 active:scale-[0.98] transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

export function getManageSlotNoResultsNoticeClasses(): string {
  return "text-xs font-medium text-muted-foreground italic px-1";
}

export function getManageSlotRecentContactsLabelClasses(): string {
  return "text-xs font-semibold text-muted-foreground px-1";
}

export function getManageSlotErrorMessageClasses(): string {
  return "text-xs font-semibold text-destructive px-1";
}

export function getManageSlotFooterClasses(): string {
  return "flex flex-col gap-3 px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-border/50 shrink-0";
}

export function getManageSlotFooterActionsClasses(): string {
  return "flex gap-2";
}

export function getManageSlotSaveButtonClasses(): string {
  return "flex-1 h-12 rounded-lg font-bold text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all";
}

export function getManageSlotShareButtonClasses(): string {
  return "h-12 w-12 rounded-lg border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all";
}

export function getManageSlotCloseButtonClasses(): string {
  return "w-full h-10 rounded-lg font-medium text-muted-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all";
}
