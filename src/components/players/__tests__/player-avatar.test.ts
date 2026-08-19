import { describe, it, expect } from "vitest";
import { getPlayerInitials } from "../player-avatar";

describe("getPlayerInitials", () => {
  it("extracts initials from a standard two-word name", () => {
    expect(getPlayerInitials("Fernando Belasteguín")).toBe("FB");
    expect(getPlayerInitials("Juan Lebrón")).toBe("JL");
  });

  it("extracts up to two initials from a multi-word name", () => {
    expect(getPlayerInitials("Alejandro Galán Romo")).toBe("AG");
    expect(getPlayerInitials("Agustín Tapia Aliprandi")).toBe("AT");
  });

  it("handles single word names correctly", () => {
    expect(getPlayerInitials("Bela")).toBe("B");
    expect(getPlayerInitials("Gero")).toBe("G");
  });

  it("sanitizes special characters and keeps Spanish accents and eñes", () => {
    expect(getPlayerInitials("Ángel @Sánchez!")).toBe("ÁS");
    expect(getPlayerInitials("Ñandú <Gómez>")).toBe("ÑG");
  });

  it("handles empty or whitespace-only strings gracefully", () => {
    expect(getPlayerInitials("")).toBe("");
    expect(getPlayerInitials("   ")).toBe("");
  });
});
