import { describe, it, expect } from "vitest";
import {
  getRankingRulesAriaLabel,
  getRankingFilterTabAriaLabel,
  getRankingSearchStatusAriaLabel,
  getPodiumPlayerAriaLabel,
  getRankingRegionAriaLabel,
} from "../ranking-utils";

describe("Ranking Helpers", () => {
  describe("getRankingRulesAriaLabel", () => {
    it("returns correct toggle label when open or closed", () => {
      expect(getRankingRulesAriaLabel(true)).toBe(
        "Ocultar reglas y fórmulas del ranking de Padel Red"
      );
      expect(getRankingRulesAriaLabel(false)).toBe(
        "Mostrar reglas y fórmulas del ranking de Padel Red"
      );
    });
  });

  describe("getRankingFilterTabAriaLabel", () => {
    it("returns correct tab labels without count", () => {
      expect(getRankingFilterTabAriaLabel("activos")).toBe(
        "Mostrar jugadores activos únicamente"
      );
      expect(getRankingFilterTabAriaLabel("todos")).toBe(
        "Mostrar todos los jugadores registrados"
      );
    });

    it("returns correct tab labels with count", () => {
      expect(getRankingFilterTabAriaLabel("activos", 12)).toBe(
        "Mostrar jugadores activos únicamente (12 registrados)"
      );
      expect(getRankingFilterTabAriaLabel("todos", 25)).toBe(
        "Mostrar todos los jugadores registrados (25 en total)"
      );
    });
  });

  describe("getRankingSearchStatusAriaLabel", () => {
    it("handles pending state", () => {
      expect(getRankingSearchStatusAriaLabel(true, "Tapia")).toBe(
        "Buscando jugadores en el ranking..."
      );
    });

    it("handles empty query", () => {
      expect(getRankingSearchStatusAriaLabel(false, "")).toBe("Búsqueda lista");
    });

    it("handles query with result count", () => {
      expect(getRankingSearchStatusAriaLabel(false, "Agus", 1)).toBe(
        'Se encontró 1 jugador para "Agus"'
      );
      expect(getRankingSearchStatusAriaLabel(false, "Tapia", 3)).toBe(
        'Se encontraron 3 jugadores para "Tapia"'
      );
    });

    it("handles query without result count", () => {
      expect(getRankingSearchStatusAriaLabel(false, "Coello")).toBe(
        'Filtrando por "Coello"'
      );
    });
  });

  describe("getPodiumPlayerAriaLabel", () => {
    it("returns formatted ARIA label for viewer in 1st position with positive delta", () => {
      expect(getPodiumPlayerAriaLabel(1, "Agustín Tapia", true, 1250, 2)).toBe(
        "1ra posición: Vos, 1250 puntos. Cambio de posición: subió 2."
      );
    });

    it("returns formatted ARIA label for opponent in 2nd position with negative delta", () => {
      expect(getPodiumPlayerAriaLabel(2, "Arturo Coello", false, 1180.4, -1)).toBe(
        "2da posición: Arturo Coello, 1180 puntos. Cambio de posición: bajó 1."
      );
    });

    it("returns formatted ARIA label for opponent in 3rd position with zero or null delta", () => {
      expect(getPodiumPlayerAriaLabel(3, "Ale Galán", false, 1120, 0)).toBe(
        "3ra posición: Ale Galán, 1120 puntos. Cambio de posición: sin cambios."
      );
      expect(getPodiumPlayerAriaLabel(3, "Ale Galán", false, 1120, null)).toBe(
        "3ra posición: Ale Galán, 1120 puntos. Cambio de posición: sin cambios."
      );
    });
  });

  describe("getRankingRegionAriaLabel", () => {
    it("returns correct landmark labels", () => {
      expect(getRankingRegionAriaLabel("rules")).toBe(
        "Reglas y fórmulas del ranking de Padel Red"
      );
      expect(getRankingRegionAriaLabel("search")).toBe(
        "Buscador de jugadores por nombre o alias"
      );
      expect(getRankingRegionAriaLabel("filter")).toBe(
        "Clasificación general y podio de jugadores"
      );
      expect(getRankingRegionAriaLabel("podium")).toBe(
        "Podio de los 3 mejores jugadores del ranking"
      );
    });
  });
});
