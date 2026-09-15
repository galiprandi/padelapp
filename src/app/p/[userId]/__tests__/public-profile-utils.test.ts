import { describe, it, expect } from "vitest";
import {
  getPublicProfileSideLabel,
  formatSideWinRateSummary,
  calculateWinningStreak,
  formatPartnerWinsText,
  formatRivalMatchesText,
  calculateRecentForm,
  getRecentFormAriaLabel,
  getStreakBadgeText,
  getWinRateAriaLabel,
} from "../public-profile-utils";

describe("public-profile-utils", () => {
  describe("getPublicProfileSideLabel", () => {
    it("returns 'Derecha' for RIGHT side preference", () => {
      expect(getPublicProfileSideLabel("RIGHT")).toBe("Derecha");
    });

    it("returns 'Revés' for LEFT side preference", () => {
      expect(getPublicProfileSideLabel("LEFT")).toBe("Revés");
    });

    it("returns 'Alterno' for BOTH or null side preference", () => {
      expect(getPublicProfileSideLabel("BOTH")).toBe("Alterno");
      expect(getPublicProfileSideLabel(null)).toBe("Alterno");
    });
  });

  describe("formatSideWinRateSummary", () => {
    it("formats right win rate only", () => {
      expect(formatSideWinRateSummary(0.75, null)).toBe("Der: 75% WR");
    });

    it("formats left win rate only", () => {
      expect(formatSideWinRateSummary(null, 0.6)).toBe("Rev: 60% WR");
    });

    it("formats both right and left win rates", () => {
      expect(formatSideWinRateSummary(0.8, 0.5)).toBe("Der: 80% WR Rev: 50% WR");
    });

    it("returns 'Sin partidos' when both win rates are null", () => {
      expect(formatSideWinRateSummary(null, null)).toBe("Sin partidos");
    });
  });

  describe("calculateWinningStreak", () => {
    it("returns 0 for empty array or initial loss", () => {
      expect(calculateWinningStreak([])).toBe(0);
      expect(calculateWinningStreak(["L", "W", "W"])).toBe(0);
    });

    it("calculates active winning streak from start of form array", () => {
      expect(calculateWinningStreak(["W", "W", "W", "L"])).toBe(3);
      expect(calculateWinningStreak(["W", "L", "W"])).toBe(1);
    });
  });

  describe("formatPartnerWinsText & formatRivalMatchesText", () => {
    it("formats singular and plural partner wins", () => {
      expect(formatPartnerWinsText(1)).toBe("1 victoria 🔥");
      expect(formatPartnerWinsText(5)).toBe("5 victorias 🔥");
    });

    it("formats singular and plural rival matches", () => {
      expect(formatRivalMatchesText(1)).toBe("1 partido ⚔️");
      expect(formatRivalMatchesText(4)).toBe("4 partidos ⚔️");
    });
  });

  describe("calculateRecentForm", () => {
    it("returns empty array for empty matches list", () => {
      expect(calculateRecentForm([], "user-1")).toEqual([]);
    });

    it("correctly identifies wins and losses based on player position and match score", () => {
      const mockMatches = [
        {
          score: "6-4 6-2",
          players: [
            { userId: "user-1", position: 0 },
            { userId: "user-2", position: 1 },
            { userId: "user-3", position: 2 },
            { userId: "user-4", position: 3 },
          ],
        },
        {
          score: "4-6 2-6",
          players: [
            { userId: "user-1", position: 0 },
            { userId: "user-2", position: 1 },
            { userId: "user-3", position: 2 },
            { userId: "user-4", position: 3 },
          ],
        },
        {
          score: null,
          players: [
            { userId: "user-1", position: 0 },
          ],
        },
      ];

      expect(calculateRecentForm(mockMatches, "user-1")).toEqual(["W", "L", "L"]);
    });
  });

  describe("getRecentFormAriaLabel", () => {
    it("returns 'Sin partidos' for empty form array", () => {
      expect(getRecentFormAriaLabel([])).toBe("Sin partidos");
    });

    it("formats results into localized Spanish ARIA string", () => {
      expect(getRecentFormAriaLabel(["W", "L", "W"])).toBe("Forma reciente: G, P, G");
    });
  });

  describe("getStreakBadgeText", () => {
    it("formats singular and plural streak text", () => {
      expect(getStreakBadgeText(1)).toBe("Racha: 1 Victoria 🔥");
      expect(getStreakBadgeText(3)).toBe("Racha: 3 Victorias 🔥");
    });
  });

  describe("getWinRateAriaLabel", () => {
    it("formats zero matches played label", () => {
      expect(getWinRateAriaLabel(0, 0)).toBe("Efectividad: 0% en 0 partidos");
    });

    it("formats singular and plural matches played win rate label", () => {
      expect(getWinRateAriaLabel(100, 1)).toBe("Efectividad: 100% en 1 partido");
      expect(getWinRateAriaLabel(75, 8)).toBe("Efectividad: 75% en 8 partidos");
    });
  });
});
