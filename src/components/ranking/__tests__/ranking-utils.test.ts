import { describe, it, expect } from "vitest";
import {
  getRankingRulesAriaLabel,
  getRankingFilterTabAriaLabel,
  getRankingSearchStatusAriaLabel,
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
    });
  });
});
