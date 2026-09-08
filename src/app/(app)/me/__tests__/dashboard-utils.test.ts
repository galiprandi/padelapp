import { describe, it, expect } from "vitest";
import {
  calculateRecentForm,
  calculateDashboardBadgeCount,
  getAgendaItems,
  getHeroActivity,
  formatDashboardWelcomeSubtitle,
  type DashboardMatch,
  type DashboardTurn,
} from "../dashboard-utils";

describe("dashboard-utils", () => {
  describe("calculateRecentForm", () => {
    const viewerId = "user-123";

    it("calculates wins and losses accurately for Team A player", () => {
      const matches: DashboardMatch[] = [
        {
          id: "m1",
          score: "6-4 6-2", // Team A wins
          players: [
            { position: 0, userId: viewerId },
            { position: 1, userId: "partner-1" },
            { position: 2, userId: "rival-1" },
            { position: 3, userId: "rival-2" },
          ],
        },
        {
          id: "m2",
          score: "4-6 2-6", // Team B wins
          players: [
            { position: 0, userId: viewerId },
            { position: 1, userId: "partner-1" },
            { position: 2, userId: "rival-1" },
            { position: 3, userId: "rival-2" },
          ],
        },
      ];

      const form = calculateRecentForm(matches, viewerId);
      expect(form).toEqual(["W", "L"]);
    });

    it("calculates wins and losses accurately for Team B player (position >= 2)", () => {
      const matches: DashboardMatch[] = [
        {
          id: "m1",
          score: "6-4 6-2", // Team A wins -> Team B loses
          players: [
            { position: 0, userId: "rival-1" },
            { position: 1, userId: "rival-2" },
            { position: 2, userId: viewerId },
            { position: 3, userId: "partner-1" },
          ],
        },
      ];

      const form = calculateRecentForm(matches, viewerId);
      expect(form).toEqual(["L"]);
    });

    it("defaults to 'L' when score or player is missing or invalid", () => {
      const matches: DashboardMatch[] = [
        { id: "m1", score: null, players: [{ position: 0, userId: viewerId }] },
        { id: "m2", score: "invalid-score", players: [{ position: 0, userId: viewerId }] },
        { id: "m3", score: "6-0 6-0", players: [{ position: 0, userId: "other-user" }] },
      ];

      const form = calculateRecentForm(matches, viewerId);
      expect(form).toEqual(["L", "L", "L"]);
    });

    it("respects custom limit parameter", () => {
      const matches: DashboardMatch[] = Array.from({ length: 10 }, (_, i) => ({
        id: `m${i}`,
        score: "6-0 6-0",
        players: [{ position: 0, userId: viewerId }],
      }));

      const form = calculateRecentForm(matches, viewerId, 3);
      expect(form).toHaveLength(3);
    });
  });

  describe("calculateDashboardBadgeCount", () => {
    it("sums positive counts correctly", () => {
      expect(calculateDashboardBadgeCount(2, 1, 3)).toBe(6);
    });

    it("handles zero and negative counts gracefully", () => {
      expect(calculateDashboardBadgeCount(0, 0, 0)).toBe(0);
      expect(calculateDashboardBadgeCount(-1, 2, -5)).toBe(2);
    });
  });

  describe("getAgendaItems", () => {
    it("combines turns and matches and sorts chronologically ascending", () => {
      const turn1: DashboardTurn = {
        id: "t1",
        date: "2026-10-15T18:00:00Z",
        players: [],
        maxPlayers: 4,
      };

      const turn2: DashboardTurn = {
        id: "t2",
        date: "2026-10-10T18:00:00Z",
        players: [],
        maxPlayers: 4,
      };

      const match1: DashboardMatch = {
        id: "m1",
        date: "2026-10-12T18:00:00Z",
        players: [],
      };

      const agenda = getAgendaItems([turn1, turn2], [match1]);

      expect(agenda).toHaveLength(3);
      expect(agenda.map((item) => item.id)).toEqual(["t2", "m1", "t1"]);
      expect(agenda.map((item) => item.type)).toEqual(["turn", "match", "turn"]);
    });

    it("handles empty arrays gracefully", () => {
      expect(getAgendaItems([], [])).toEqual([]);
    });
  });

  describe("getHeroActivity", () => {
    const now = new Date("2026-10-10T12:00:00Z");

    it("returns first agenda item if within 24 hours of now", () => {
      const agenda = [
        {
          id: "t1",
          type: "turn" as const,
          date: new Date("2026-10-10T18:00:00Z"), // +6 hours
          data: { id: "t1" },
        },
      ];

      const hero = getHeroActivity(agenda, now);
      expect(hero).toEqual(agenda[0]);
    });

    it("returns null if first agenda item is >24 hours away", () => {
      const agenda = [
        {
          id: "t1",
          type: "turn" as const,
          date: new Date("2026-10-12T18:00:00Z"), // +54 hours
          data: { id: "t1" },
        },
      ];

      const hero = getHeroActivity(agenda, now);
      expect(hero).toBeNull();
    });

    it("returns null for empty agenda", () => {
      expect(getHeroActivity([], now)).toBeNull();
    });
  });

  describe("formatDashboardWelcomeSubtitle", () => {
    it("returns onboarding subtitle for new users", () => {
      expect(formatDashboardWelcomeSubtitle(true)).toBe(
        "Bienvenido. Empezá creando tu primer turno.",
      );
    });

    it("returns regular activity subtitle for returning users", () => {
      expect(formatDashboardWelcomeSubtitle(false)).toBe(
        "Tu actividad de pádel en un solo lugar.",
      );
    });
  });
});
