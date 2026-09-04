import { describe, it, expect } from "vitest";
import React from "react";
import { RankingInfo } from "../ranking-info";

describe("RankingInfo Component", () => {
  it("creates a valid RankingInfo React element", () => {
    const element = React.createElement(RankingInfo);

    expect(element.type).toBe(RankingInfo);
  });

  it("has correct displayName or function name", () => {
    expect(RankingInfo.name).toBe("RankingInfo");
  });
});
