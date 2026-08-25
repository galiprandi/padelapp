import { describe, it, expect } from "vitest";
import {
  positionFromTeam,
  avatarFallback,
  createPlaceholderSlot,
  buildInitialState,
} from "@/lib/match-utils";

describe("positionFromTeam", () => {
  it("returns 0 for team A index 0", () => {
    expect(positionFromTeam("A", 0)).toBe(0);
  });

  it("returns 1 for team A index 1", () => {
    expect(positionFromTeam("A", 1)).toBe(1);
  });

  it("returns 2 for team B index 0", () => {
    expect(positionFromTeam("B", 0)).toBe(2);
  });

  it("returns 3 for team B index 1", () => {
    expect(positionFromTeam("B", 1)).toBe(3);
  });
});

describe("avatarFallback", () => {
  it("returns initials for single name", () => {
    expect(avatarFallback("Diego")).toBe("D");
  });

  it("returns initials for two-word name", () => {
    expect(avatarFallback("Diego Morales")).toBe("DM");
  });

  it("returns first two initials for long name", () => {
    expect(avatarFallback("Diego Alejandro Morales")).toBe("DA");
  });

  it("handles empty string", () => {
    expect(avatarFallback("")).toBe("");
  });

  it("handles names with accents or multiple spaces", () => {
    expect(avatarFallback("Agustín Tapia")).toBe("AT");
    expect(avatarFallback("   Juan   Pérez   ")).toBe("JP");
  });
});

describe("createPlaceholderSlot", () => {
  it("creates a placeholder with kind and displayName", () => {
    const slot = createPlaceholderSlot("Jugador 2");
    expect(slot).toEqual({ kind: "placeholder", displayName: "Jugador 2" });
  });
});

describe("buildInitialState", () => {
  it("returns state with team A and B each having 2 slots", () => {
    const state = buildInitialState();
    expect(state.A).toHaveLength(2);
    expect(state.B).toHaveLength(2);
  });

  it("team A index 0 is null (organizer slot)", () => {
    const state = buildInitialState();
    expect(state.A[0]).toBeNull();
  });

  it("team A index 1 is a placeholder", () => {
    const state = buildInitialState();
    expect(state.A[1]).toEqual({ kind: "placeholder", displayName: "Jugador 2" });
  });

  it("team B slots are placeholders", () => {
    const state = buildInitialState();
    expect(state.B[0]).toEqual({ kind: "placeholder", displayName: "Jugador 3" });
    expect(state.B[1]).toEqual({ kind: "placeholder", displayName: "Jugador 4" });
  });
});
