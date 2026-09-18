import { describe, it, expect } from "vitest";
import {
  getRankingRulesAriaLabel,
  getRankingFilterTabAriaLabel,
  getRankingSearchStatusAriaLabel,
  getPodiumPlayerAriaLabel,
  getRankingListItemAriaLabel,
  getRankingBreakdownButtonAriaLabel,
  getRankingUserSummaryAriaLabel,
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

  describe("getRankingListItemAriaLabel", () => {
    it("returns formatted ARIA label for active viewer player with positive delta", () => {
      expect(
        getRankingListItemAriaLabel(1, "Agustín Tapia", true, 1050, 10, 2, 2)
      ).toBe(
        "Posición 1: Vos, 1050 puntos. 10 victorias, 2 derrotas. Cambio de posición: subió 2."
      );
    });

    it("returns formatted ARIA label for another player with negative delta", () => {
      expect(
        getRankingListItemAriaLabel(4, "Fernando Belasteguín", false, 980, 5, 3, -1)
      ).toBe(
        "Posición 4: Fernando Belasteguín, 980 puntos. 5 victorias, 3 derrotas. Cambio de posición: bajó 1."
      );
    });

    it("returns formatted ARIA label for player with zero or null delta", () => {
      expect(
        getRankingListItemAriaLabel(2, "Arturo Coello", false, 1020, 8, 2, 0)
      ).toBe(
        "Posición 2: Arturo Coello, 1020 puntos. 8 victorias, 2 derrotas. Cambio de posición: sin cambios."
      );
      expect(
        getRankingListItemAriaLabel(2, "Arturo Coello", false, 1020, 8, 2, null)
      ).toBe(
        "Posición 2: Arturo Coello, 1020 puntos. 8 victorias, 2 derrotas. Cambio de posición: sin cambios."
      );
    });
  });

  describe("getRankingBreakdownButtonAriaLabel", () => {
    it("returns loading text when isPending is true", () => {
      expect(getRankingBreakdownButtonAriaLabel(false, true)).toBe(
        "Cargando desglose de puntos..."
      );
      expect(getRankingBreakdownButtonAriaLabel(true, true)).toBe(
        "Cargando desglose de puntos..."
      );
    });

    it("returns toggle labels when not pending", () => {
      expect(getRankingBreakdownButtonAriaLabel(true, false)).toBe(
        "Ocultar desglose de puntos 📊"
      );
      expect(getRankingBreakdownButtonAriaLabel(false, false)).toBe(
        "Ver desglose de puntos 📊"
      );
    });
  });

  describe("getRankingUserSummaryAriaLabel", () => {
    it("returns formatted ARIA label for banner with position and positive delta", () => {
      expect(
        getRankingUserSummaryAriaLabel(true, 1, 1150, 80, 100, 8, 2, 3)
      ).toBe(
        "Resumen de tu ranking: Posición #1, 1150 puntos. 8 victorias, 2 derrotas (80% de victorias). 100% de reputación. Cambio: subió 3 lugares."
      );
    });

    it("returns formatted ARIA label for card without position and negative delta", () => {
      expect(
        getRankingUserSummaryAriaLabel(false, null, 920, 50, 90, 3, 3, -2)
      ).toBe(
        "Tarjeta de mi posición: Sin posición asignada, 920 puntos. 3 victorias, 3 derrotas (50% de victorias). 90% de reputación. Cambio: bajó 2 lugares."
      );
    });

    it("returns formatted ARIA label when delta is zero or null", () => {
      expect(
        getRankingUserSummaryAriaLabel(false, 5, 1000, 60, 95, 6, 4, 0)
      ).toBe(
        "Tarjeta de mi posición: Posición #5, 1000 puntos. 6 victorias, 4 derrotas (60% de victorias). 95% de reputación. Cambio: sin cambios."
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
      expect(getRankingRegionAriaLabel("list")).toBe(
        "Listado de clasificación general de jugadores"
      );
      expect(getRankingRegionAriaLabel("breakdown")).toBe(
        "Desglose detallado de puntos de ranking"
      );
      expect(getRankingRegionAriaLabel("banner")).toBe(
        "Resumen de ranking de usuario"
      );
      expect(getRankingRegionAriaLabel("card")).toBe(
        "Tarjeta de posición y puntos de ranking"
      );
    });
  });
});
