import { describe, it, expect } from "vitest";
import {
  getPendingConfirmationsCountText,
  formatPendingMatchDate,
  getPendingMatchConfirmAriaLabel,
  getPendingMatchResultAriaLabel,
  getPendingMatchDetailAriaLabel,
  getRankingRegionAriaLabel,
} from "../ranking-utils";

describe("PendingConfirmationsAlert Helpers Integration", () => {
  const sampleMatchWithScore = {
    id: "match-1",
    score: "6-3 6-4",
    date: "2026-09-20T18:00:00Z",
    createdAt: "2026-09-20T18:00:00Z",
    players: [],
  };

  const sampleMatchWithoutScore = {
    id: "match-2",
    score: null,
    date: "2026-09-21T18:00:00Z",
    createdAt: "2026-09-21T18:00:00Z",
    players: [],
  };

  it("generates correct header text for pending actions list length", () => {
    const list = [sampleMatchWithScore, sampleMatchWithoutScore];
    expect(getPendingConfirmationsCountText(list.length)).toBe(
      "Tenés 2 partidos pendientes. Confirmá para actualizar el ranking."
    );
  });

  it("generates region landmark label for pending alerts section", () => {
    expect(getRankingRegionAriaLabel("pending")).toBe(
      "Alertas de partidos pendientes de confirmación"
    );
  });

  it("generates correct ARIA button labels for matches with score", () => {
    const formattedDate = formatPendingMatchDate(sampleMatchWithScore.date, true);
    const confirmLabel = getPendingMatchConfirmAriaLabel(
      sampleMatchWithScore.score,
      formattedDate
    );
    const detailLabel = getPendingMatchDetailAriaLabel(formattedDate);

    expect(confirmLabel).toContain("Confirmar resultado 6-3 6-4");
    expect(confirmLabel).toContain(formattedDate);
    expect(detailLabel).toContain("Ver detalle del partido del");
    expect(detailLabel).toContain(formattedDate);
  });

  it("generates correct ARIA button labels for matches without score", () => {
    const formattedDate = formatPendingMatchDate(sampleMatchWithoutScore.date, true);
    const resultLabel = getPendingMatchResultAriaLabel(formattedDate);
    const detailLabel = getPendingMatchDetailAriaLabel(formattedDate);

    expect(resultLabel).toContain("Cargar resultado para el partido del");
    expect(resultLabel).toContain(formattedDate);
    expect(detailLabel).toContain("Ver detalle del partido del");
    expect(detailLabel).toContain(formattedDate);
  });
});
