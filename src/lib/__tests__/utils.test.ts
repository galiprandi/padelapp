import { describe, it, expect } from "vitest";
import {
  getMatchWinner,
  calculateWinRate,
  capitalizeName,
  getTurnLabel,
} from "@/lib/utils";

describe("getMatchWinner", () => {
  it("returns null for null score", () => {
    expect(getMatchWinner(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getMatchWinner("")).toBeNull();
  });

  it("returns 'A' when team A wins one set", () => {
    expect(getMatchWinner("6-4")).toBe("A");
  });

  it("returns 'B' when team B wins one set", () => {
    expect(getMatchWinner("3-6")).toBe("B");
  });

  it("returns 'A' when team A wins best of 2 sets", () => {
    expect(getMatchWinner("6-4, 6-3")).toBe("A");
  });

  it("returns 'B' when team B wins best of 2 sets", () => {
    expect(getMatchWinner("4-6, 3-6")).toBe("B");
  });

  it("returns null for a tie (one set each)", () => {
    expect(getMatchWinner("6-4, 4-6")).toBeNull();
  });

  it("handles super tiebreak format", () => {
    expect(getMatchWinner("6-4, 3-6, 10-7")).toBe("A");
  });

  it("handles whitespace-only separators", () => {
    expect(getMatchWinner("6-4   6-3")).toBe("A");
  });
});

describe("calculateWinRate", () => {
  it("returns 0 when matchesPlayed is 0", () => {
    expect(calculateWinRate(5, 0)).toBe(0);
  });

  it("returns 0 when matchesPlayed is undefined (falsy)", () => {
    expect(calculateWinRate(5, 0)).toBe(0);
  });

  it("returns 100 when all matches won", () => {
    expect(calculateWinRate(10, 10)).toBe(100);
  });

  it("returns 50 when half matches won", () => {
    expect(calculateWinRate(5, 10)).toBe(50);
  });

  it("rounds to nearest integer", () => {
    expect(calculateWinRate(1, 3)).toBe(33);
    expect(calculateWinRate(2, 3)).toBe(67);
  });
});

describe("capitalizeName", () => {
  it("capitalizes single word", () => {
    expect(capitalizeName("diego")).toBe("Diego");
  });

  it("capitalizes multiple words", () => {
    expect(capitalizeName("diego morales")).toBe("Diego Morales");
  });

  it("trims leading/trailing whitespace", () => {
    expect(capitalizeName("  diego  ")).toBe("Diego");
  });

  it("collapses multiple spaces", () => {
    expect(capitalizeName("diego   morales")).toBe("Diego Morales");
  });

  it("lowercases uppercase letters", () => {
    expect(capitalizeName("DIEGO MORALES")).toBe("Diego Morales");
  });

  it("handles empty string", () => {
    expect(capitalizeName("")).toBe("");
  });
});

describe("getTurnLabel", () => {
  it("formats club and time without minutes", () => {
    const date = new Date(2026, 0, 15, 19, 0);
    expect(getTurnLabel("Padel Club", date)).toBe("Padel Club · 19hs");
  });

  it("formats club and time with minutes", () => {
    const date = new Date(2026, 0, 15, 19, 30);
    expect(getTurnLabel("Padel Club", date)).toBe("Padel Club · 19:30hs");
  });
});
