import { describe, it, expect } from "vitest";
import React from "react";
import { UserRankingBanner, UserRankingCard } from "../user-ranking-stats";

describe("UserRankingBanner and UserRankingCard Components", () => {
  it("creates a valid UserRankingBanner React element with props", () => {
    const element = React.createElement(UserRankingBanner, {
      userId: "user-123",
      position: 1,
      score: 1100,
      delta: 2,
      wins: 8,
      losses: 2,
      matchesPlayed: 10,
    });

    expect(element.type).toBe(UserRankingBanner);
    expect(element.props.position).toBe(1);
    expect(element.props.score).toBe(1100);
    expect(element.props.userId).toBe("user-123");
  });

  it("creates a valid UserRankingCard React element with partial props", () => {
    const element = React.createElement(UserRankingCard, {
      position: 3,
      score: 950,
      delta: -1,
      wins: 5,
      losses: 4,
      matchesPlayed: 9,
    });

    expect(element.type).toBe(UserRankingCard);
    expect(element.props.position).toBe(3);
    expect(element.props.score).toBe(950);
  });
});
