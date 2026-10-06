import { describe, it, expect } from "vitest";
import React from "react";
import { RankingInfo } from "../ranking-info";
import {
  getRankingRegionAriaLabel,
  getRankingRulesAriaLabel,
  getRankingRulesHeaderTitle,
  getRankingRulesHeaderSubtitle,
  getRankingRulesSectionTitle,
  getRankingFormulaText,
} from "../ranking-utils";

describe("RankingInfo Component", () => {
  it("creates a valid RankingInfo React element", () => {
    const element = React.createElement(RankingInfo);

    expect(element.type).toBe(RankingInfo);
  });

  it("has correct displayName or function name", () => {
    expect(RankingInfo.name).toBe("RankingInfo");
  });

  it("exports correct ARIA helper functions used by RankingInfo", () => {
    expect(getRankingRegionAriaLabel("rules")).toBe(
      "Reglas y fórmulas del ranking de Padel Red"
    );
    expect(getRankingRegionAriaLabel("rules-detail")).toBe(
      "Detalle de reglas y fórmulas del ranking"
    );
    expect(getRankingRulesAriaLabel(true)).toBe(
      "Ocultar reglas y fórmulas del ranking de Padel Red"
    );
    expect(getRankingRulesAriaLabel(false)).toBe(
      "Mostrar reglas y fórmulas del ranking de Padel Red"
    );
  });

  it("exports correct rules header and formula text functions", () => {
    expect(getRankingRulesHeaderTitle()).toBe("Reglas y Fórmulas del Ranking");
    expect(getRankingRulesHeaderSubtitle()).toBe(
      "¿Cómo se calculan los puntos y posiciones?"
    );
    expect(getRankingRulesSectionTitle("points")).toBe("Cálculo de Puntos");
    expect(getRankingRulesSectionTitle("penalties")).toBe("Penalizaciones por Asistencia");
    expect(getRankingRulesSectionTitle("decay")).toBe("Decay por Inactividad");
    expect(getRankingRulesSectionTitle("tiebreak")).toBe("Criterios de Desempate");
    expect(getRankingFormulaText()).toBe(
      "Puntos = 1000 + (Victorias × 15) + (Racha × 5) + (Bonus de Sets) - Penalizaciones"
    );
  });
});
