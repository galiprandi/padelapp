import { describe, it, expect } from "vitest";
import {
  isValidMatchType,
  defaultTeamLabel,
  sanitizeTeamLabel,
  teamForPosition,
} from "@/lib/match-helpers";

describe("isValidMatchType", () => {
  it("accepts FRIENDLY", () => {
    expect(isValidMatchType("FRIENDLY")).toBe(true);
  });

  it("accepts LOCAL_TOURNAMENT", () => {
    expect(isValidMatchType("LOCAL_TOURNAMENT")).toBe(true);
  });

  it("rejects unknown type", () => {
    expect(isValidMatchType("UNKNOWN")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidMatchType("")).toBe(false);
  });

  it("rejects lowercase", () => {
    expect(isValidMatchType("friendly")).toBe(false);
  });
});

describe("defaultTeamLabel", () => {
  it("returns 'Pareja A' for team A in doubles", () => {
    expect(defaultTeamLabel("A", "DOUBLES")).toBe("Pareja A");
  });

  it("returns 'Pareja B' for team B in doubles", () => {
    expect(defaultTeamLabel("B", "DOUBLES")).toBe("Pareja B");
  });

  it("returns 'Jugador A' for team A in singles", () => {
    expect(defaultTeamLabel("A", "SINGLES")).toBe("Jugador A");
  });

  it("returns 'Jugador B' for team B in singles", () => {
    expect(defaultTeamLabel("B", "SINGLES")).toBe("Jugador B");
  });
});

describe("sanitizeTeamLabel", () => {
  it("returns default when value is undefined", () => {
    expect(sanitizeTeamLabel(undefined, "A", "DOUBLES")).toBe("Pareja A");
  });

  it("returns default when value is empty string", () => {
    expect(sanitizeTeamLabel("", "B", "DOUBLES")).toBe("Pareja B");
  });

  it("returns default when value is only whitespace", () => {
    expect(sanitizeTeamLabel("   ", "A", "SINGLES")).toBe("Jugador A");
  });

  it("returns trimmed value when valid", () => {
    expect(sanitizeTeamLabel("Los cracks", "A", "DOUBLES")).toBe("Los cracks");
  });

  it("trims surrounding whitespace from valid value", () => {
    expect(sanitizeTeamLabel("  Los cracks  ", "A", "DOUBLES")).toBe("Los cracks");
  });
});

describe("teamForPosition", () => {
  it("returns A for position 0 in singles (2 players)", () => {
    expect(teamForPosition(0, 2)).toBe("A");
  });

  it("returns B for position 1 in singles (2 players)", () => {
    expect(teamForPosition(1, 2)).toBe("B");
  });

  it("returns A for position 0 in doubles (4 players)", () => {
    expect(teamForPosition(0, 4)).toBe("A");
  });

  it("returns A for position 1 in doubles (4 players)", () => {
    expect(teamForPosition(1, 4)).toBe("A");
  });

  it("returns B for position 2 in doubles (4 players)", () => {
    expect(teamForPosition(2, 4)).toBe("B");
  });

  it("returns B for position 3 in doubles (4 players)", () => {
    expect(teamForPosition(3, 4)).toBe("B");
  });

  it("handles 3 players (casual mode) like doubles", () => {
    expect(teamForPosition(0, 3)).toBe("A");
    expect(teamForPosition(1, 3)).toBe("A");
    expect(teamForPosition(2, 3)).toBe("B");
  });
});
