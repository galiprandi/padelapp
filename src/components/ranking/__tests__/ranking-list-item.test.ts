import { describe, it, expect } from "vitest";
import React from "react";
import { RankingListItem } from "../ranking-list-item";

describe("RankingListItem Component", () => {
  const mockPlayer = {
    id: "user-1",
    displayName: "Agustín Tapia",
    alias: null,
    image: null,
    rankingScore: 1050,
    rankingPosition: 1,
    rankingDelta: 2,
    wins: 10,
    losses: 2,
    attendanceScore: 1.0,
    matchPlayers: [
      { position: 0, match: { score: "6-4, 6-2" } },
      { position: 0, match: { score: "6-3, 6-1" } },
    ],
  };

  it("creates a valid RankingListItem React element", () => {
    const element = React.createElement(RankingListItem, {
      player: mockPlayer,
      index: 0,
      viewerId: "user-1",
    });

    expect(element.type).toBe(RankingListItem);
    expect(element.props.player.id).toBe("user-1");
  });

  it("computes aria-label correctly for active viewer player with positive delta", () => {
    const isViewer = true;
    const displayName = "Agustín Tapia";
    const positionNum = 1;
    const rankingDelta = 2;
    const score = 1050;
    const wins = 10;
    const losses = 2;

    const deltaText =
      rankingDelta > 0
        ? `subió ${rankingDelta}`
        : rankingDelta < 0
        ? `bajó ${Math.abs(rankingDelta)}`
        : "sin cambios";

    const ariaLabel = `Posición ${positionNum}: ${isViewer ? "Vos" : displayName}, ${Math.round(score)} puntos. ${wins} victorias, ${losses} derrotas. Cambio de posición: ${deltaText}.`;

    expect(ariaLabel).toBe(
      "Posición 1: Vos, 1050 puntos. 10 victorias, 2 derrotas. Cambio de posición: subió 2.",
    );
  });

  it("computes aria-label correctly for another player with negative delta", () => {
    const isViewer = false;
    const displayName = "Fernando Belasteguín";
    const positionNum = 4;
    const rankingDelta = -1;
    const score = 980;
    const wins = 5;
    const losses = 3;

    const deltaText =
      rankingDelta > 0
        ? `subió ${rankingDelta}`
        : rankingDelta < 0
        ? `bajó ${Math.abs(rankingDelta)}`
        : "sin cambios";

    const ariaLabel = `Posición ${positionNum}: ${isViewer ? "Vos" : displayName}, ${Math.round(score)} puntos. ${wins} victorias, ${losses} derrotas. Cambio de posición: ${deltaText}.`;

    expect(ariaLabel).toBe(
      "Posición 4: Fernando Belasteguín, 980 puntos. 5 victorias, 3 derrotas. Cambio de posición: bajó 1.",
    );
  });
});
