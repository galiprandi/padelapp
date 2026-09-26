import { describe, it, expect } from "vitest";
import {
  getRankingFilterTabAriaLabel,
  getRankingRegionAriaLabel,
  getRankingFilterEmptyTitle,
  getRankingFilterEmptyDescription,
  getRankingFilterClearAriaLabel,
} from "../ranking-utils";

describe("RankingFilter Component Helpers", () => {
  it("provides correct ARIA labels for region landmark and tabs", () => {
    expect(getRankingRegionAriaLabel("filter")).toBe("Clasificación general y podio de jugadores");
    expect(getRankingFilterTabAriaLabel("activos", 5)).toBe(
      "Mostrar jugadores activos únicamente (5 registrados)"
    );
    expect(getRankingFilterTabAriaLabel("todos", 10)).toBe(
      "Mostrar todos los jugadores registrados (10 en total)"
    );
  });

  it("provides correct empty state properties and action ARIA labels", () => {
    expect(getRankingFilterEmptyTitle("Coello")).toBe("No se encontraron jugadores");
    expect(getRankingFilterEmptyDescription("Coello")).toBe('No hay resultados para "Coello".');
    expect(getRankingFilterEmptyTitle()).toBe("Sin jugadores");
    expect(getRankingFilterEmptyDescription()).toBe("Aún no hay jugadores registrados.");
    expect(getRankingFilterClearAriaLabel()).toBe(
      "Limpiar búsqueda y volver a la clasificación general"
    );
  });
});
