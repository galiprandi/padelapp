import { describe, it, expect } from "vitest";
import {
  getManageSlotInitialValue,
  validateSlotInputValue,
  getRecentPlayerAriaLabel,
  formatSearchPlayerAriaLabel,
  getSearchResultsStatusAriaLabel,
  getManageSlotRegionAriaLabel,
  getManageSlotHeaderTitle,
  getManageSlotSwapButtonText,
  getManageSlotSwapButtonAriaLabel,
  getManageSlotReleaseButtonText,
  getManageSlotReleaseButtonAriaLabel,
  getManageSlotSaveButtonText,
  getManageSlotCloseButtonText,
  getManageSlotVerifiedUserBadgeText,
  getManageSlotVerifiedUserNoticeText,
  getManageSlotRecentPlayersLabel,
  getManageSlotSearchInputPlaceholder,
  getManageSlotSearchClearAriaLabel,
  getManageSlotNoResultsNoticeText,
  getManageSlotRecentContactsLabel,
  getManageSlotShareButtonAriaLabel,
  getManageSlotShareValidationErrorMessage,
} from "../manage-slot-utils";

describe("manage-slot-utils", () => {
  describe("getManageSlotInitialValue", () => {
    it("returns user player displayName when slot is kind 'user'", () => {
      const value = getManageSlotInitialValue(
        {
          kind: "user",
          player: {
            id: "u1",
            displayName: "Agustín Tapia",
            email: "tapia@padel.ar",
            image: null,
          },
        },
        "Jugador 1"
      );
      expect(value).toBe("Agustín Tapia");
    });

    it("returns slot displayName when slot is kind 'placeholder'", () => {
      const value = getManageSlotInitialValue(
        {
          kind: "placeholder",
          displayName: "Fede Chingotto",
        },
        "Jugador 1"
      );
      expect(value).toBe("Fede Chingotto");
    });

    it("returns fallback placeholderName when slot is null", () => {
      const value = getManageSlotInitialValue(null, "Jugador 1");
      expect(value).toBe("Jugador 1");
    });
  });

  describe("validateSlotInputValue", () => {
    it("returns invalid with Argentine error message when input is empty or whitespace", () => {
      expect(validateSlotInputValue("")).toEqual({
        isValid: false,
        error: "Ingresá un nombre",
      });
      expect(validateSlotInputValue("   ")).toEqual({
        isValid: false,
        error: "Ingresá un nombre",
      });
    });

    it("returns valid with null error when name is provided", () => {
      expect(validateSlotInputValue("  Arturo Coello  ")).toEqual({
        isValid: true,
        error: null,
      });
    });
  });

  describe("getRecentPlayerAriaLabel", () => {
    it("formats Argentine Spanish ARIA label for quick add chips", () => {
      expect(getRecentPlayerAriaLabel("Agustín")).toBe("Agregar a Agustín");
    });
  });

  describe("formatSearchPlayerAriaLabel", () => {
    it("formats Argentine Spanish ARIA label for search list items", () => {
      expect(formatSearchPlayerAriaLabel("Bela")).toBe("Seleccionar a Bela");
    });
  });

  describe("getSearchResultsStatusAriaLabel", () => {
    it("returns searching message when isSearching is true", () => {
      expect(getSearchResultsStatusAriaLabel(true, false, 0)).toBe(
        "Buscando jugadores..."
      );
    });

    it("returns no results message when showNoResults is true", () => {
      expect(getSearchResultsStatusAriaLabel(false, true, 0)).toBe(
        "No se encontraron jugadores"
      );
    });

    it("returns singular match count message", () => {
      expect(getSearchResultsStatusAriaLabel(false, false, 1)).toBe(
        "1 jugador encontrado"
      );
    });

    it("returns plural match count message", () => {
      expect(getSearchResultsStatusAriaLabel(false, false, 3)).toBe(
        "3 jugadores encontrados"
      );
    });

    it("returns empty string when no search query active", () => {
      expect(getSearchResultsStatusAriaLabel(false, false, 0)).toBe("");
    });
  });

  describe("newly extracted slot management helper functions", () => {
    it("returns correct region landmark ARIA label when title name is supplied", () => {
      expect(getManageSlotRegionAriaLabel("Agustín Tapia")).toBe(
        "Gestionar cupo de Agustín Tapia",
      );
    });

    it("returns default region landmark ARIA label when title name is empty or missing", () => {
      expect(getManageSlotRegionAriaLabel()).toBe("Gestionar jugador del partido");
      expect(getManageSlotRegionAriaLabel("  ")).toBe("Gestionar jugador del partido");
    });

    it("returns correct header title text", () => {
      expect(getManageSlotHeaderTitle()).toBe("Gestionar jugador");
    });

    it("returns correct swap button text", () => {
      expect(getManageSlotSwapButtonText()).toBe("Mover");
    });

    it("returns correct swap button ARIA label", () => {
      expect(getManageSlotSwapButtonAriaLabel()).toBe(
        "Mover o intercambiar posición del jugador",
      );
    });

    it("returns correct release button text", () => {
      expect(getManageSlotReleaseButtonText()).toBe("Quitar");
    });

    it("returns correct release button ARIA label", () => {
      expect(getManageSlotReleaseButtonAriaLabel()).toBe(
        "Quitar o liberar cupo del jugador",
      );
    });

    it("returns correct save button text", () => {
      expect(getManageSlotSaveButtonText()).toBe("Guardar");
    });

    it("returns correct close/cancel button text depending on read-only user slot state", () => {
      expect(getManageSlotCloseButtonText(true)).toBe("Cerrar");
      expect(getManageSlotCloseButtonText(false)).toBe("Cancelar");
    });

    it("returns correct verified user badge text", () => {
      expect(getManageSlotVerifiedUserBadgeText()).toBe("Jugador verificado");
    });

    it("returns correct verified user notice text", () => {
      expect(getManageSlotVerifiedUserNoticeText()).toBe(
        'Este cupo está ocupado por un perfil verificado. Si querés cambiarlo, debés "Quitar" al jugador primero.',
      );
    });

    it("returns correct recent players label", () => {
      expect(getManageSlotRecentPlayersLabel()).toBe("Jugadores recientes");
    });

    it("returns correct search input placeholder", () => {
      expect(getManageSlotSearchInputPlaceholder()).toBe(
        "Buscar jugador o escribir nombre...",
      );
    });

    it("returns correct search clear ARIA label", () => {
      expect(getManageSlotSearchClearAriaLabel()).toBe("Limpiar nombre");
    });

    it("returns correct no results notice text", () => {
      expect(getManageSlotNoResultsNoticeText()).toBe(
        'No hay jugadores con ese nombre. Tocá "Guardar" para registrarlo igual.',
      );
    });

    it("returns correct recent contacts label", () => {
      expect(getManageSlotRecentContactsLabel()).toBe("Contactos recientes");
    });

    it("returns correct share button ARIA label", () => {
      expect(getManageSlotShareButtonAriaLabel()).toBe(
        "Compartir enlace de invitación",
      );
    });

    it("returns correct share validation error message", () => {
      expect(getManageSlotShareValidationErrorMessage()).toBe(
        "Ingresá un nombre antes de compartir",
      );
    });
  });
});
