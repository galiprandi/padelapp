import { describe, it, expect } from "vitest";
import {
  getRankingRulesAriaLabel,
  getRankingRulesHeaderTitle,
  getRankingRulesHeaderSubtitle,
  getRankingRulesSectionTitle,
  getRankingFormulaText,
  getRankingFilterTabAriaLabel,
  getRankingSearchStatusAriaLabel,
  getRankingSearchInputAriaLabel,
  getRankingSearchClearAriaLabel,
  getRankingSearchPlaceholder,
  getRankingHeadingTitle,
  getRankingHeadingDescription,
  getRankingSkeletonAriaLabel,
  getRankingFilterEmptyTitle,
  getRankingFilterEmptyDescription,
  getRankingFilterClearAriaLabel,
  getPodiumPlayerAriaLabel,
  getRankingListItemAriaLabel,
  getRankingBreakdownButtonAriaLabel,
  getRankingUserSummaryAriaLabel,
  getPendingConfirmationsCountText,
  formatPendingMatchDate,
  getPendingMatchConfirmAriaLabel,
  getPendingMatchResultAriaLabel,
  getPendingMatchDetailAriaLabel,
  getRankingRegionAriaLabel,
  getWinStreakTitle,
  getDeltaChangeTitle,
  getRankingBreakdownItemLabel,
  getRankingStatLabel,
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

  describe("getRankingRulesHeaderTitle", () => {
    it("returns correct rules header title text", () => {
      expect(getRankingRulesHeaderTitle()).toBe("Reglas y Fórmulas del Ranking");
    });
  });

  describe("getRankingRulesHeaderSubtitle", () => {
    it("returns correct rules header subtitle text", () => {
      expect(getRankingRulesHeaderSubtitle()).toBe(
        "¿Cómo se calculan los puntos y posiciones?"
      );
    });
  });

  describe("getRankingRulesSectionTitle", () => {
    it("returns correct rules section title texts", () => {
      expect(getRankingRulesSectionTitle("points")).toBe("Cálculo de Puntos");
      expect(getRankingRulesSectionTitle("penalties")).toBe(
        "Penalizaciones por Asistencia"
      );
      expect(getRankingRulesSectionTitle("decay")).toBe("Decay por Inactividad");
      expect(getRankingRulesSectionTitle("tiebreak")).toBe("Criterios de Desempate");
    });
  });

  describe("getRankingFormulaText", () => {
    it("returns correct mathematical formula text", () => {
      expect(getRankingFormulaText()).toBe(
        "Puntos = 1000 + (Victorias × 15) + (Racha × 5) + (Bonus de Sets) - Penalizaciones"
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

  describe("getRankingSearchInputAriaLabel", () => {
    it("returns correct ARIA label for search input", () => {
      expect(getRankingSearchInputAriaLabel()).toBe("Buscar jugadores por nombre o alias");
    });
  });

  describe("getRankingSearchClearAriaLabel", () => {
    it("returns correct ARIA label for clearing search button", () => {
      expect(getRankingSearchClearAriaLabel()).toBe("Limpiar búsqueda");
    });
  });

  describe("getRankingSearchPlaceholder", () => {
    it("returns correct placeholder text for search input", () => {
      expect(getRankingSearchPlaceholder()).toBe("Buscar jugador o alias...");
    });
  });

  describe("getRankingHeadingTitle", () => {
    it("returns correct heading title text for ranking page", () => {
      expect(getRankingHeadingTitle()).toBe("Ranking");
    });
  });

  describe("getRankingHeadingDescription", () => {
    it("returns correct heading description text for ranking page", () => {
      expect(getRankingHeadingDescription()).toBe("Posiciones según resultados confirmados.");
    });
  });

  describe("getRankingSkeletonAriaLabel", () => {
    it("returns correct ARIA label for ranking loading skeleton", () => {
      expect(getRankingSkeletonAriaLabel()).toBe("Cargando clasificación y estadísticas de ranking...");
    });
  });

  describe("getRankingFilterEmptyTitle", () => {
    it("returns search query specific title when query is present", () => {
      expect(getRankingFilterEmptyTitle("Tapia")).toBe("No se encontraron jugadores");
    });

    it("returns default title when query is empty or undefined", () => {
      expect(getRankingFilterEmptyTitle()).toBe("Sin jugadores");
      expect(getRankingFilterEmptyTitle("")).toBe("Sin jugadores");
    });
  });

  describe("getRankingFilterEmptyDescription", () => {
    it("returns query specific description when query is present", () => {
      expect(getRankingFilterEmptyDescription("Coello")).toBe('No hay resultados para "Coello".');
    });

    it("returns default description when query is empty or undefined", () => {
      expect(getRankingFilterEmptyDescription()).toBe("Aún no hay jugadores registrados.");
      expect(getRankingFilterEmptyDescription("")).toBe("Aún no hay jugadores registrados.");
    });
  });

  describe("getRankingFilterClearAriaLabel", () => {
    it("returns correct ARIA label for clearing search from empty state", () => {
      expect(getRankingFilterClearAriaLabel()).toBe(
        "Limpiar búsqueda y volver a la clasificación general"
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

  describe("getPendingConfirmationsCountText", () => {
    it("returns zero pending message when count is 0 or negative", () => {
      expect(getPendingConfirmationsCountText(0)).toBe(
        "No tenés partidos pendientes de confirmación."
      );
      expect(getPendingConfirmationsCountText(-1)).toBe(
        "No tenés partidos pendientes de confirmación."
      );
    });

    it("returns singular message for 1 match", () => {
      expect(getPendingConfirmationsCountText(1)).toBe(
        "Tenés 1 partido pendiente. Confirmá para actualizar el ranking."
      );
    });

    it("returns plural message for multiple matches", () => {
      expect(getPendingConfirmationsCountText(3)).toBe(
        "Tenés 3 partidos pendientes. Confirmá para actualizar el ranking."
      );
    });
  });

  describe("formatPendingMatchDate", () => {
    it("returns empty string when not mounted or date is missing", () => {
      expect(formatPendingMatchDate(new Date(), false)).toBe("");
      expect(formatPendingMatchDate(undefined, true)).toBe("");
    });

    it("formats valid date string or Date object when mounted", () => {
      const sampleDate = new Date("2026-09-20T18:30:00Z");
      const formatted = formatPendingMatchDate(sampleDate, true);
      expect(formatted).not.toBe("");
      expect(typeof formatted).toBe("string");
    });

    it("returns empty string for invalid date", () => {
      expect(formatPendingMatchDate("invalid-date", true)).toBe("");
    });
  });

  describe("getPendingMatchConfirmAriaLabel", () => {
    it("returns label with score and date suffix", () => {
      expect(getPendingMatchConfirmAriaLabel("6-4 6-2", "20/09, 15:30")).toBe(
        "Confirmar resultado 6-4 6-2 para el partido del 20/09, 15:30"
      );
    });

    it("handles missing score or date", () => {
      expect(getPendingMatchConfirmAriaLabel(null, "20/09, 15:30")).toBe(
        "Confirmar resultado para el partido del 20/09, 15:30"
      );
      expect(getPendingMatchConfirmAriaLabel("6-4 6-2", "")).toBe(
        "Confirmar resultado 6-4 6-2"
      );
    });
  });

  describe("getPendingMatchResultAriaLabel", () => {
    it("returns label with date suffix when date is provided", () => {
      expect(getPendingMatchResultAriaLabel("20/09, 15:30")).toBe(
        "Cargar resultado para el partido del 20/09, 15:30"
      );
    });

    it("returns default label when date is empty", () => {
      expect(getPendingMatchResultAriaLabel("")).toBe("Cargar resultado");
    });
  });

  describe("getPendingMatchDetailAriaLabel", () => {
    it("returns label with date suffix when date is provided", () => {
      expect(getPendingMatchDetailAriaLabel("20/09, 15:30")).toBe(
        "Ver detalle del partido del 20/09, 15:30"
      );
    });

    it("returns default label when date is empty", () => {
      expect(getPendingMatchDetailAriaLabel("")).toBe("Ver detalle del partido");
    });
  });

  describe("getRankingRegionAriaLabel", () => {
    it("returns correct landmark labels", () => {
      expect(getRankingRegionAriaLabel("rules")).toBe(
        "Reglas y fórmulas del ranking de Padel Red"
      );
      expect(getRankingRegionAriaLabel("rules-detail")).toBe(
        "Detalle de reglas y fórmulas del ranking"
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
      expect(getRankingRegionAriaLabel("pending")).toBe(
        "Alertas de partidos pendientes de confirmación"
      );
      expect(getRankingRegionAriaLabel("skeleton")).toBe(
        "Cargando clasificación y estadísticas de ranking..."
      );
    });
  });

  describe("getWinStreakTitle", () => {
    it("returns empty string when streak is 0 or negative", () => {
      expect(getWinStreakTitle(0)).toBe("");
      expect(getWinStreakTitle(-1)).toBe("");
    });

    it("returns singular title for streak of 1", () => {
      expect(getWinStreakTitle(1)).toBe("Racha de 1 victoria");
    });

    it("returns plural title for streak greater than 1", () => {
      expect(getWinStreakTitle(3)).toBe("Racha de 3 victorias");
      expect(getWinStreakTitle(5)).toBe("Racha de 5 victorias");
    });
  });

  describe("getDeltaChangeTitle", () => {
    it("returns positive delta change text", () => {
      expect(getDeltaChangeTitle(1)).toBe("Subió 1 posición");
      expect(getDeltaChangeTitle(4)).toBe("Subió 4 posiciones");
    });

    it("returns negative delta change text", () => {
      expect(getDeltaChangeTitle(-1)).toBe("Bajó 1 posición");
      expect(getDeltaChangeTitle(-3)).toBe("Bajó 3 posiciones");
    });

    it("returns zero delta change text", () => {
      expect(getDeltaChangeTitle(0)).toBe("Sin cambios de posición");
    });
  });

  describe("getRankingBreakdownItemLabel", () => {
    it("returns item labels without value", () => {
      expect(getRankingBreakdownItemLabel("base")).toBe("Puntos base iniciales");
      expect(getRankingBreakdownItemLabel("wins")).toBe("Victorias");
      expect(getRankingBreakdownItemLabel("streak")).toBe("Racha actual");
      expect(getRankingBreakdownItemLabel("sets")).toBe("Bonus por sets ganados");
      expect(getRankingBreakdownItemLabel("late")).toBe("Llegadas tarde");
      expect(getRankingBreakdownItemLabel("noShow")).toBe("Ausencias sin aviso");
      expect(getRankingBreakdownItemLabel("decay")).toBe("Decay por inactividad");
      expect(getRankingBreakdownItemLabel("final")).toBe("Puntaje recalculado");
    });

    it("returns item labels with formatted values", () => {
      expect(getRankingBreakdownItemLabel("wins", 5)).toBe("Victorias (5)");
      expect(getRankingBreakdownItemLabel("streak", 3)).toBe("Racha actual (3 🔥)");
      expect(getRankingBreakdownItemLabel("late", 1)).toBe("Llegadas tarde (1)");
      expect(getRankingBreakdownItemLabel("noShow", 2)).toBe("Ausencias sin aviso (2)");
    });
  });

  describe("getRankingStatLabel", () => {
    it("returns heading stat labels", () => {
      expect(getRankingStatLabel("position")).toBe("Tu posición");
      expect(getRankingStatLabel("myPosition")).toBe("Mi posición");
      expect(getRankingStatLabel("points")).toBe("Puntos");
      expect(getRankingStatLabel("winRate")).toBe("WR");
      expect(getRankingStatLabel("reputation")).toBe("Rep");
    });
  });
});
