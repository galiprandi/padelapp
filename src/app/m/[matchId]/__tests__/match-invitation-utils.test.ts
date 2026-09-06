import { describe, it, expect } from "vitest";
import {
  formatStatus,
  teamKeyForPosition,
  defaultTeamLabel,
  getMatchInvitationTitle,
  getMatchInvitationMetadata,
  MATCH_STATUS,
} from "../match-invitation-utils";

describe("match-invitation-utils", () => {
  describe("formatStatus", () => {
    it("formats PENDING status as 'Pendiente'", () => {
      expect(formatStatus(MATCH_STATUS.PENDING)).toBe("Pendiente");
    });

    it("formats CONFIRMED status as 'Confirmado'", () => {
      expect(formatStatus(MATCH_STATUS.CONFIRMED)).toBe("Confirmado");
    });

    it("formats DISPUTED status as 'En disputa'", () => {
      expect(formatStatus(MATCH_STATUS.DISPUTED)).toBe("En disputa");
    });

    it("formats CANCELLED status as 'Cancelado'", () => {
      expect(formatStatus(MATCH_STATUS.CANCELLED)).toBe("Cancelado");
    });

    it("returns raw status if unmapped", () => {
      expect(formatStatus("UNKNOWN")).toBe("UNKNOWN");
    });
  });

  describe("teamKeyForPosition", () => {
    it("assigns position 0 to team A and position 1 to team B for 2-player match", () => {
      expect(teamKeyForPosition(0, 2)).toBe("A");
      expect(teamKeyForPosition(1, 2)).toBe("B");
    });

    it("assigns positions 0 and 1 to team A and positions 2 and 3 to team B for 4-player match", () => {
      expect(teamKeyForPosition(0, 4)).toBe("A");
      expect(teamKeyForPosition(1, 4)).toBe("A");
      expect(teamKeyForPosition(2, 4)).toBe("B");
      expect(teamKeyForPosition(3, 4)).toBe("B");
    });
  });

  describe("defaultTeamLabel", () => {
    it("returns 'Jugador A' / 'Jugador B' for 2-player matches", () => {
      expect(defaultTeamLabel("A", 2)).toBe("Jugador A");
      expect(defaultTeamLabel("B", 2)).toBe("Jugador B");
    });

    it("returns 'Pareja A' / 'Pareja B' for 4-player matches", () => {
      expect(defaultTeamLabel("A", 4)).toBe("Pareja A");
      expect(defaultTeamLabel("B", 4)).toBe("Pareja B");
    });
  });

  describe("getMatchInvitationTitle", () => {
    it("returns 'Partido Amistoso' for FRIENDLY matchType", () => {
      expect(getMatchInvitationTitle("FRIENDLY")).toBe("Partido Amistoso");
    });

    it("returns 'Torneo Local' for non-FRIENDLY matchType", () => {
      expect(getMatchInvitationTitle("COMPETITIVE")).toBe("Torneo Local");
      expect(getMatchInvitationTitle("TOURNAMENT")).toBe("Torneo Local");
    });
  });

  describe("getMatchInvitationMetadata", () => {
    it("returns fallback metadata when match is null", () => {
      const meta = getMatchInvitationMetadata(null);
      expect(meta.title).toBe("Partido no encontrado");
      expect(meta.description).toContain("no existe");
    });

    it("returns localized title and description with club name and formatted date", () => {
      const testDate = new Date("2026-10-15T18:00:00Z");
      const meta = getMatchInvitationMetadata({
        club: "Club San Martín",
        date: testDate,
      });

      expect(meta.title).toBe("Invitación a Partido en Club San Martín");
      expect(meta.description).toContain("Club San Martín");
    });

    it("handles missing club name with default string", () => {
      const meta = getMatchInvitationMetadata({
        club: null,
        date: "2026-10-15",
      });

      expect(meta.title).toBe("Invitación a Partido en el club");
    });
  });
});
