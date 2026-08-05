import { describe, it, expect } from "vitest";
import { normalizeClub, pickClubDisplayName } from "@/lib/club";

describe("normalizeClub", () => {
  it("returns empty string for null", () => {
    expect(normalizeClub(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(normalizeClub(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(normalizeClub("")).toBe("");
  });

  it("lowercases the name", () => {
    expect(normalizeClub("PADEL CITY")).toBe("padel city");
  });

  it("trims leading/trailing whitespace", () => {
    expect(normalizeClub("  Padel City  ")).toBe("padel city");
  });

  it("collapses internal whitespace", () => {
    expect(normalizeClub("Padel    City")).toBe("padel city");
  });

  it("strips court suffix with · separator", () => {
    expect(normalizeClub("Padel City · Cancha 3")).toBe("padel city");
  });

  it("strips court suffix with - separator", () => {
    expect(normalizeClub("Padel City - Cancha 3")).toBe("padel city");
  });

  it("strips court suffix without separator", () => {
    expect(normalizeClub("Padel City Cancha 3")).toBe("padel city");
  });

  it("strips trailing decorative separator", () => {
    expect(normalizeClub("Padel City ·")).toBe("padel city");
  });

  it("strips trailing dash separator", () => {
    expect(normalizeClub("Padel City -")).toBe("padel city");
  });

  it("handles multi-digit court numbers", () => {
    expect(normalizeClub("Padel City · Cancha 12")).toBe("padel city");
  });

  it("preserves club name with numbers (not court suffix)", () => {
    expect(normalizeClub("Padel 24")).toBe("padel 24");
  });
});

describe("pickClubDisplayName", () => {
  it("returns empty string for empty array", () => {
    expect(pickClubDisplayName([])).toBe("");
  });

  it("returns the only name for single-element array", () => {
    expect(pickClubDisplayName(["Padel City"])).toBe("Padel City");
  });

  it("prefers most frequent spelling", () => {
    const originals = ["padel city", "Padel City", "Padel City", "PADEL CITY"];
    expect(pickClubDisplayName(originals)).toBe("Padel City");
  });

  it("falls back to longest name on frequency tie", () => {
    const originals = ["Padel City", "Padel City Norte"];
    // Both have frequency 1, so score = 1*10 + length
    // "Padel City" = 10 + 10 = 20
    // "Padel City Norte" = 10 + 16 = 26
    expect(pickClubDisplayName(originals)).toBe("Padel City Norte");
  });

  it("trims whitespace before counting", () => {
    const originals = ["  Padel City  ", "Padel City"];
    // Both map to "Padel City" after trim, frequency = 2
    expect(pickClubDisplayName(originals)).toBe("Padel City");
  });

  it("skips empty strings after trim", () => {
    const originals = ["", "  ", "Padel City"];
    expect(pickClubDisplayName(originals)).toBe("Padel City");
  });

  it("falls back to first element if all are empty after trim", () => {
    const originals = ["  ", ""];
    expect(pickClubDisplayName(originals)).toBe("  ");
  });
});
