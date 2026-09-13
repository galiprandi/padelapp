import { describe, it, expect } from "vitest";
import {
  getManageSlotInitialValue,
  validateSlotInputValue,
  getRecentPlayerAriaLabel,
  formatSearchPlayerAriaLabel,
  getSearchResultsStatusAriaLabel,
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
});
