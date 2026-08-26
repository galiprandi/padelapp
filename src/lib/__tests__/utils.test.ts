import { describe, it, expect } from "vitest";
import {
  getMatchWinner,
  calculateWinRate,
  capitalizeName,
  getTurnLabel,
  getTurnLabelWithDate,
  getCalendarTitle,
  getNaturalShareText,
  isToday,
  isTomorrow,
  getGreeting,
  getLevelBadgeLabel,
  isNavItemActive,
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

describe("isToday", () => {
  it("returns true for today", () => {
    expect(isToday(new Date())).toBe(true);
  });

  it("returns false for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday)).toBe(false);
  });

  it("returns false for tomorrow", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isToday(tomorrow)).toBe(false);
  });
});

describe("isTomorrow", () => {
  it("returns true for tomorrow", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isTomorrow(tomorrow)).toBe(true);
  });

  it("returns false for today", () => {
    expect(isTomorrow(new Date())).toBe(false);
  });

  it("returns false for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isTomorrow(yesterday)).toBe(false);
  });
});

describe("getGreeting", () => {
  it("returns a non-empty string", () => {
    const greeting = getGreeting();
    expect(greeting.length).toBeGreaterThan(0);
  });

  it("returns one of the expected greetings", () => {
    const greeting = getGreeting();
    expect(["Buenas noches", "Buen día", "Buenas tardes"]).toContain(greeting);
  });
});

describe("isNavItemActive", () => {
  it("returns true for exact match on /me", () => {
    expect(isNavItemActive("/me", "/me")).toBe(true);
  });

  it("returns false for /me when pathname is /me/profile", () => {
    expect(isNavItemActive("/me", "/me/profile")).toBe(false);
  });

  it("returns false for /me when pathname is /me/security", () => {
    expect(isNavItemActive("/me", "/me/security")).toBe(false);
  });

  it("returns true for /me/profile when pathname is /me/profile", () => {
    expect(isNavItemActive("/me/profile", "/me/profile")).toBe(true);
  });

  it("returns true for /me/profile when pathname is /me/security", () => {
    expect(isNavItemActive("/me/profile", "/me/security")).toBe(true);
  });

  it("returns true for /turnos when pathname is /turnos/nuevo", () => {
    expect(isNavItemActive("/turnos", "/turnos/nuevo")).toBe(true);
  });

  it("returns true for /ranking when pathname is /ranking", () => {
    expect(isNavItemActive("/ranking", "/ranking")).toBe(true);
  });

  it("returns false when pathname is null", () => {
    expect(isNavItemActive("/me", null)).toBe(false);
  });
});

describe("getLevelBadgeLabel", () => {
  it("returns '1ª Cat.' for level 1", () => {
    expect(getLevelBadgeLabel(1)).toBe("1ª Cat.");
  });

  it("returns '6ª Cat.' for level 6", () => {
    expect(getLevelBadgeLabel(6)).toBe("6ª Cat.");
  });

  it("returns '8ª Cat.' for level 8", () => {
    expect(getLevelBadgeLabel(8)).toBe("8ª Cat.");
  });

  it("returns default '6ª Cat.' when level is null or undefined", () => {
    expect(getLevelBadgeLabel(null)).toBe("6ª Cat.");
    expect(getLevelBadgeLabel(undefined)).toBe("6ª Cat.");
  });

  it("returns default '6ª Cat.' when level is out of range", () => {
    expect(getLevelBadgeLabel(0)).toBe("6ª Cat.");
    expect(getLevelBadgeLabel(9)).toBe("6ª Cat.");
  });
});

describe("getTurnLabelWithDate", () => {
  it("includes 'hoy' for today", () => {
    const now = new Date();
    const result = getTurnLabelWithDate("Padel Club", now);
    expect(result).toContain("hoy");
  });

  it("includes 'mañana' for tomorrow", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = getTurnLabelWithDate("Padel Club", tomorrow);
    expect(result).toContain("mañana");
  });

  it("includes club name", () => {
    const result = getTurnLabelWithDate("Padel Club", new Date());
    expect(result).toContain("Padel Club");
  });

  it("includes time", () => {
    const date = new Date(2026, 0, 15, 19, 30);
    const result = getTurnLabelWithDate("Padel Club", date);
    expect(result).toContain("19:30hs");
  });
});

describe("getCalendarTitle", () => {
  it("prefixes with 'Pádel ·'", () => {
    const date = new Date(2026, 0, 15, 19, 0);
    const result = getCalendarTitle("Padel Club", date);
    expect(result).toBe("Pádel · Padel Club · 19hs");
  });
});

describe("getNaturalShareText", () => {
  it("generates turn share text", () => {
    const date = new Date();
    const result = getNaturalShareText({ type: "turn", club: "Padel Club", date });
    expect(result).toContain("Turno de pádel");
    expect(result).toContain("Padel Club");
  });

  it("generates match-invite share text", () => {
    const date = new Date();
    const result = getNaturalShareText({ type: "match-invite", club: "Padel Club", date });
    expect(result).toContain("Partido de pádel");
    expect(result).toContain("Padel Club");
  });

  it("generates match-result share text with score", () => {
    const result = getNaturalShareText({
      type: "match-result",
      club: "Padel Club",
      date: new Date(),
      score: "6-4, 6-3",
    });
    expect(result).toContain("marcador");
    expect(result).toContain("6-4, 6-3");
  });

  it("generates match-result share text without score", () => {
    const result = getNaturalShareText({
      type: "match-result",
      club: "Padel Club",
      date: new Date(),
      score: null,
    });
    expect(result).toContain("marcador");
    expect(result).not.toContain(":");
  });

  it("returns empty string for unknown type", () => {
    const result = getNaturalShareText({
      type: "unknown" as "turn",
      club: "Padel Club",
      date: new Date(),
    });
    expect(result).toBe("");
  });

  it("includes 'hoy' for today's turn", () => {
    const result = getNaturalShareText({ type: "turn", club: "Padel Club", date: new Date() });
    expect(result).toContain("hoy");
  });

  it("includes 'mañana' for tomorrow's turn", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = getNaturalShareText({ type: "turn", club: "Padel Club", date: tomorrow });
    expect(result).toContain("mañana");
  });
});
