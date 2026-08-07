import { describe, it, expect } from "vitest";
import { getRecencyWeight } from "@/lib/graph/engine";

describe("getRecencyWeight", () => {
  it("returns 0.5 for null date", () => {
    expect(getRecencyWeight(null)).toBe(0.5);
  });

  it("returns 1.0 for a match within the last 30 days", () => {
    const recent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    expect(getRecencyWeight(recent)).toBe(1.0);
  });

  it("returns 1.0 for a match today", () => {
    expect(getRecencyWeight(new Date())).toBe(1.0);
  });

  it("returns 0.75 for a match 30-60 days ago", () => {
    const date = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
    expect(getRecencyWeight(date)).toBe(0.75);
  });

  it("returns 0.5 for a match 60-120 days ago", () => {
    const date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
    expect(getRecencyWeight(date)).toBe(0.5);
  });

  it("returns 0.25 for a match more than 120 days ago", () => {
    const date = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000); // 200 days ago
    expect(getRecencyWeight(date)).toBe(0.25);
  });

  it("returns 0.25 for a very old match (1 year)", () => {
    const date = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    expect(getRecencyWeight(date)).toBe(0.25);
  });

  it("handles boundary: exactly 30 days ago (returns 0.75)", () => {
    const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    expect(getRecencyWeight(date)).toBe(0.75);
  });

  it("handles boundary: exactly 60 days ago (returns 0.5)", () => {
    const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    expect(getRecencyWeight(date)).toBe(0.5);
  });

  it("handles boundary: exactly 120 days ago (returns 0.25)", () => {
    const date = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
    expect(getRecencyWeight(date)).toBe(0.25);
  });
});

import { getPlayersLikeYouAction } from "@/app/network/actions";

describe("getPlayersLikeYouAction", () => {
  it("returns mock recommended player Facundo Lopez for viewer under mock/bypass conditions", async () => {
    const result = await getPlayersLikeYouAction("p-01");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "p-04",
      name: "Facundo Lopez",
      alias: "Facu",
      image: null,
      skillScore: 1020,
      preferredSide: "LEFT",
      matchesPlayed: 6,
    });
  });
});
