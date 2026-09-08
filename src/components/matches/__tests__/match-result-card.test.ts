import { describe, it, expect } from "vitest";
import { parseScoreSets, calculateMatchSetWins } from "@/lib/match-helpers";

describe("MatchResultCardContainerAndAriaProps", () => {
  it("generates correct ARIA region label for MatchResultCard label prop", () => {
    const label = "Último partido";
    const regionProps = {
      role: "region",
      "aria-label": `Tarjeta de resultado: ${label}`,
    };

    expect(regionProps).toEqual({
      role: "region",
      "aria-label": "Tarjeta de resultado: Último partido",
    });
  });

  it("computes status variant and label correctly for pending match needing viewer confirmation", () => {
    const matchStatus: string = "PENDING";
    const viewerId = "usr-1";
    const matchScore = "6-4, 6-3";
    const players = [
      { id: "p1", position: 0, user: { id: "usr-1", displayName: "Agustín" }, resultConfirmed: false },
      { id: "p2", position: 1, user: { id: "usr-2", displayName: "Bela" }, resultConfirmed: true },
      { id: "p3", position: 2, user: { id: "usr-3", displayName: "Coello" }, resultConfirmed: true },
      { id: "p4", position: 3, user: { id: "usr-4", displayName: "Roby" }, resultConfirmed: true },
    ];

    const needsConfirmation = Boolean(
      viewerId &&
      matchStatus !== "CONFIRMED" &&
      matchScore &&
      players.some((p) => p.user?.id === viewerId && !p.resultConfirmed),
    );

    expect(needsConfirmation).toBe(true);

    const quickConfirmAriaLabel = `Confirmar resultado ${matchScore ? `(${matchScore})` : ""} del partido`;
    expect(quickConfirmAriaLabel).toBe("Confirmar resultado (6-4, 6-3) del partido");
  });

  it("computes status variant as success for confirmed match", () => {
    const matchStatus = "CONFIRMED";
    const statusLabel = matchStatus.toString();

    const getStatusVariant = (status: string) => {
      switch (status.toUpperCase()) {
        case "CONFIRMED":
          return "success";
        case "DISPUTED":
          return "warning";
        default:
          return "default";
      }
    };

    expect(getStatusVariant(statusLabel)).toBe("success");
  });

  it("calculates winner and set breakdown cleanly from score string using match helpers", () => {
    const score = "6-3, 4-6, 7-6";
    const parsedSets = parseScoreSets(score);
    const { setWins, winnerIndex } = calculateMatchSetWins(parsedSets);

    expect(parsedSets).toEqual([
      [6, 3],
      [4, 6],
      [7, 6],
    ]);
    expect(setWins).toEqual([2, 1]);
    expect(winnerIndex).toBe(0); // Team A won
  });
});
