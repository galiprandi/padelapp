import { describe, it, expect } from "vitest";
import {
  getPublicProfileSideLabel,
  formatSideWinRateSummary,
  calculateWinningStreak,
  formatPartnerWinsText,
  formatRivalMatchesText,
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
});
