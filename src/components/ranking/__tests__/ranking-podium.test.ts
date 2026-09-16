import { describe, it, expect } from "vitest";
import React from "react";
import { RankingPodium } from "../ranking-podium";
import { getPodiumPlayerAriaLabel, getRankingRegionAriaLabel } from "../ranking-utils";

describe("RankingPodium Component", () => {
  const sampleTopThree = [
    {
      id: "user-1",
      displayName: "Agustín Tapia",
      alias: "Tapia",
      image: null,
      rankingScore: 1250,
      rankingDelta: 2,
      matchPlayers: [],
    },
    {
      id: "user-2",
      displayName: "Arturo Coello",
      alias: "Coello",
      image: null,
      rankingScore: 1180,
      rankingDelta: -1,
      matchPlayers: [],
    },
    {
      id: "user-3",
      displayName: "Ale Galán",
      alias: "Galán",
      image: null,
      rankingScore: 1120,
      rankingDelta: 0,
      matchPlayers: [],
    },
  ];

  it("creates a valid RankingPodium React element", () => {
    const element = React.createElement(RankingPodium, {
      topThree: sampleTopThree,
      viewerId: "user-1",
    });

    expect(element.type).toBe(RankingPodium);
  });

  it("has correct component function name", () => {
    expect(RankingPodium.name).toBe("RankingPodium");
  });

  it("computes accurate ARIA labels for podium positions", () => {
    const labelFirst = getPodiumPlayerAriaLabel(1, "Agustín Tapia", true, 1250, 2);
    expect(labelFirst).toBe("1ra posición: Vos, 1250 puntos. Cambio de posición: subió 2.");

    const labelSecond = getPodiumPlayerAriaLabel(2, "Arturo Coello", false, 1180, -1);
    expect(labelSecond).toBe("2da posición: Arturo Coello, 1180 puntos. Cambio de posición: bajó 1.");

    const labelThird = getPodiumPlayerAriaLabel(3, "Ale Galán", false, 1120, 0);
    expect(labelThird).toBe("3ra posición: Ale Galán, 1120 puntos. Cambio de posición: sin cambios.");
  });

  it("provides correct region landmark ARIA label for podium", () => {
    expect(getRankingRegionAriaLabel("podium")).toBe(
      "Podio de los 3 mejores jugadores del ranking"
    );
  });
});
