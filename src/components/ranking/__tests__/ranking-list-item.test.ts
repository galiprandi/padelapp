import { describe, it, expect } from "vitest";
import React from "react";
import { RankingListItem } from "../ranking-list-item";
import { getRankingListItemAriaLabel } from "../ranking-utils";

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
    const ariaLabel = getRankingListItemAriaLabel(1, "Agustín Tapia", true, 1050, 10, 2, 2);

    expect(ariaLabel).toBe(
      "Posición 1: Vos, 1050 puntos. 10 victorias, 2 derrotas. Cambio de posición: subió 2."
    );
  });

  it("computes aria-label correctly for another player with negative delta", () => {
    const ariaLabel = getRankingListItemAriaLabel(4, "Fernando Belasteguín", false, 980, 5, 3, -1);

    expect(ariaLabel).toBe(
      "Posición 4: Fernando Belasteguín, 980 puntos. 5 victorias, 3 derrotas. Cambio de posición: bajó 1."
    );
  });
});
