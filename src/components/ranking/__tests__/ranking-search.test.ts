import { describe, it, expect, vi } from "vitest";
import {
  getRankingSearchInputAriaLabel,
  getRankingSearchClearAriaLabel,
  getRankingSearchPlaceholder,
  getRankingRegionAriaLabel,
} from "../ranking-utils";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "q" ? "Agus" : null),
    toString: () => "q=Agus",
  }),
}));

describe("RankingSearch Component Helpers", () => {
  it("provides correct ARIA labels and placeholders for search input and region", () => {
    expect(getRankingRegionAriaLabel("search")).toBe("Buscador de jugadores por nombre o alias");
    expect(getRankingSearchInputAriaLabel()).toBe("Buscar jugadores por nombre o alias");
    expect(getRankingSearchClearAriaLabel()).toBe("Limpiar búsqueda");
    expect(getRankingSearchPlaceholder()).toBe("Buscar jugador o alias...");
  });
});
