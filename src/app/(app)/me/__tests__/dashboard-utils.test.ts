import { describe, it, expect } from "vitest";
import {
  calculateRecentForm,
  calculateDashboardBadgeCount,
  getAgendaItems,
  getHeroActivity,
  formatDashboardWelcomeSubtitle,
  getDashboardSkeletonAriaLabel,
  getCreateFirstTurnAriaLabel,
  getIncompleteProfileRegionAriaLabel,
  getInviteFriendsRegionAriaLabel,
  getDashboardStatsRegionAriaLabel,
  getRankingStatAriaLabel,
  getMatchesStatAriaLabel,
  getWinsStatAriaLabel,
  getReputationStatAriaLabel,
  getHeroActivityRegionAriaLabel,
  formatMissingPlayersText,
  getPendingActionsRegionAriaLabel,
  getPendingActionMatchLabel,
  getPendingAttendanceRegionAriaLabel,
  formatPlayersWithoutAttendanceText,
  getAgendaRegionAriaLabel,
  getSubstituteTurnsRegionAriaLabel,
  getOpenSlotBadgeText,
  getRecommendedTurnsRegionAriaLabel,
  getRecentResultsRegionAriaLabel,
  formatRecentFormAriaLabel,
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
      const turnData: DashboardTurn = {
        id: "t1",
        date: "2026-10-10T18:00:00Z",
        players: [],
        maxPlayers: 4,
      };

      const agenda = [
        {
          id: "t1",
          type: "turn" as const,
          date: new Date("2026-10-10T18:00:00Z"), // +6 hours
          data: turnData,
        },
      ];

      const hero = getHeroActivity(agenda, now);
      expect(hero).toEqual(agenda[0]);
    });

    it("returns null if first agenda item is >24 hours away", () => {
      const turnData: DashboardTurn = {
        id: "t1",
        date: "2026-10-12T18:00:00Z",
        players: [],
        maxPlayers: 4,
      };

      const agenda = [
        {
          id: "t1",
          type: "turn" as const,
          date: new Date("2026-10-12T18:00:00Z"), // +54 hours
          data: turnData,
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

  describe("getDashboardSkeletonAriaLabel", () => {
    it("returns dashboard loading skeleton ARIA label string", () => {
      expect(getDashboardSkeletonAriaLabel()).toBe("Cargando mi perfil y panel principal de pádel");
    });
  });

  describe("extracted pure helper functions", () => {
    it("returns create first turn aria label", () => {
      expect(getCreateFirstTurnAriaLabel()).toBe(
        "Creá tu primer turno. Armá un turno, compartilo por WhatsApp y jugá.",
      );
    });

    it("returns incomplete profile region aria label", () => {
      expect(getIncompleteProfileRegionAriaLabel()).toBe("Perfil de jugador incompleto");
    });

    it("returns invite friends region aria label", () => {
      expect(getInviteFriendsRegionAriaLabel()).toBe("Invitar amigos a Padel Red");
    });

    it("returns dashboard stats region aria label", () => {
      expect(getDashboardStatsRegionAriaLabel()).toBe("Resumen de estadísticas personales");
    });

    it("formats ranking stat aria label correctly", () => {
      expect(getRankingStatAriaLabel(5)).toBe("Ranking: posición actual #5. Ver clasificación.");
      expect(getRankingStatAriaLabel(null)).toBe("Ranking: posición actual #sin clasificar. Ver clasificación.");
    });

    it("formats matches stat aria label correctly", () => {
      expect(getMatchesStatAriaLabel(12)).toBe("Partidos jugados: 12. Ver historial de partidos.");
    });

    it("formats wins stat aria label correctly", () => {
      expect(getWinsStatAriaLabel(8)).toBe("Victorias: 8. Ver tabla de posiciones.");
    });

    it("formats reputation stat aria label correctly", () => {
      expect(getReputationStatAriaLabel(0.95)).toBe("Reputación de asistencia: 95%. Ver ranking.");
      expect(getReputationStatAriaLabel(null)).toBe("Reputación de asistencia: 100%. Ver ranking.");
    });

    it("formats hero activity region aria label correctly", () => {
      expect(getHeroActivityRegionAriaLabel(true)).toBe("Próximo turno incompleto");
      expect(getHeroActivityRegionAriaLabel(false)).toBe("Próxima actividad inminente");
    });

    it("formats missing players text correctly", () => {
      expect(formatMissingPlayersText(2)).toBe("Faltan 2");
    });

    it("returns pending actions region aria label", () => {
      expect(getPendingActionsRegionAriaLabel()).toBe("Acciones pendientes de partidos");
    });

    it("returns pending action match label", () => {
      expect(getPendingActionMatchLabel(true)).toBe("Cargar resultado");
      expect(getPendingActionMatchLabel(false)).toBe("Confirmación pendiente");
    });

    it("returns pending attendance region aria label", () => {
      expect(getPendingAttendanceRegionAriaLabel()).toBe("Marcar asistencia de partidos");
    });

    it("formats players without attendance text correctly", () => {
      expect(formatPlayersWithoutAttendanceText(3)).toBe("3 sin marcar");
    });

    it("returns agenda region aria label", () => {
      expect(getAgendaRegionAriaLabel()).toBe("Agenda personal de turnos y partidos");
    });

    it("returns substitute turns region aria label", () => {
      expect(getSubstituteTurnsRegionAriaLabel()).toBe("Turnos como suplente");
    });

    it("returns open slot badge text", () => {
      expect(getOpenSlotBadgeText()).toBe("Cupo libre");
    });

    it("returns recommended turns region aria label", () => {
      expect(getRecommendedTurnsRegionAriaLabel()).toBe("Turnos disponibles recomendados");
    });

    it("returns recent results region aria label", () => {
      expect(getRecentResultsRegionAriaLabel()).toBe("Últimos resultados de partidos");
    });

    it("formats recent form aria label correctly", () => {
      expect(formatRecentFormAriaLabel(["W", "L", "W"])).toBe("Forma reciente: G, P, G");
    });
  });
});
