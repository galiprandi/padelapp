import { describe, it, expect } from "vitest";
import {
  formatJoinSlotInvitationMessage,
  formatStatus,
  teamKeyForPosition,
  defaultTeamLabel,
  MATCH_STATUS,
  getJoinSlotHelperMessage,
  groupMatchSlotsByTeam,
  getJoinSlotRegionAriaLabel,
  getSlotStatusBadgeProps,
} from "../join-slot-utils";

describe("join-slot-utils", () => {
  describe("formatJoinSlotInvitationMessage", () => {
    it("formats message with creator name when provided", () => {
      expect(formatJoinSlotInvitationMessage("Agustín Tapia", "Pareja A")).toBe(
        "Agustín Tapia te invitó a sumarte como Pareja A."
      );
    });

    it("handles whitespace in creator name", () => {
      expect(formatJoinSlotInvitationMessage("  Bela  ", "Pareja B")).toBe(
        "Bela te invitó a sumarte como Pareja B."
      );
    });

    it("falls back to generic invitation message when creator name is missing or empty", () => {
      expect(formatJoinSlotInvitationMessage(null, "Pareja A")).toBe(
        "Te invitaron a sumarte como Pareja A."
      );
      expect(formatJoinSlotInvitationMessage(undefined, "Pareja B")).toBe(
        "Te invitaron a sumarte como Pareja B."
      );
      expect(formatJoinSlotInvitationMessage("   ", "Pareja A")).toBe(
        "Te invitaron a sumarte como Pareja A."
      );
    });
  });

  describe("formatStatus", () => {
    it("formats match status correctly", () => {
      expect(formatStatus(MATCH_STATUS.CONFIRMED)).toBe("Confirmado");
      expect(formatStatus(MATCH_STATUS.DISPUTED)).toBe("En disputa");
      expect(formatStatus(MATCH_STATUS.CANCELLED)).toBe("Cancelado");
      expect(formatStatus(MATCH_STATUS.PENDING)).toBe("Pendiente");
    });
  });

  describe("teamKeyForPosition", () => {
    it("returns team A or B for 4-player matches", () => {
      expect(teamKeyForPosition(0, 4)).toBe("A");
      expect(teamKeyForPosition(1, 4)).toBe("A");
      expect(teamKeyForPosition(2, 4)).toBe("B");
      expect(teamKeyForPosition(3, 4)).toBe("B");
    });

    it("returns team A or B for singles 2-player matches", () => {
      expect(teamKeyForPosition(0, 2)).toBe("A");
      expect(teamKeyForPosition(1, 2)).toBe("B");
    });
  });

  describe("defaultTeamLabel", () => {
    it("returns Pareja A/B for 4-player matches", () => {
      expect(defaultTeamLabel("A", 4)).toBe("Pareja A");
      expect(defaultTeamLabel("B", 4)).toBe("Pareja B");
    });

    it("returns Jugador A/B for singles 2-player matches", () => {
      expect(defaultTeamLabel("A", 2)).toBe("Jugador A");
      expect(defaultTeamLabel("B", 2)).toBe("Jugador B");
    });
  });

  describe("getJoinSlotHelperMessage", () => {
    it("returns occupied warning when slot is taken by another user", () => {
      expect(
        getJoinSlotHelperMessage({
          slotTaken: true,
          slotTakenByViewer: false,
          matchClosed: false,
          viewerAlreadyInMatch: false,
        })
      ).toBe("Cupo ocupado, hablá con el organizador del partido.");
    });

    it("returns closed warning when match status is not pending", () => {
      expect(
        getJoinSlotHelperMessage({
          slotTaken: false,
          slotTakenByViewer: false,
          matchClosed: true,
          viewerAlreadyInMatch: false,
        })
      ).toBe("El partido ya no admite nuevas confirmaciones.");
    });

    it("returns already enrolled warning when viewer is in another slot", () => {
      expect(
        getJoinSlotHelperMessage({
          slotTaken: false,
          slotTakenByViewer: false,
          matchClosed: false,
          viewerAlreadyInMatch: true,
        })
      ).toBe("Ya estás inscripto en otro cupo para este partido.");
    });

    it("returns null when slot can be joined", () => {
      expect(
        getJoinSlotHelperMessage({
          slotTaken: false,
          slotTakenByViewer: false,
          matchClosed: false,
          viewerAlreadyInMatch: false,
        })
      ).toBeNull();
    });
  });

  describe("groupMatchSlotsByTeam", () => {
    it("groups 4-player slots into Team A and Team B", () => {
      const slots = [
        { id: "s1", position: 0 },
        { id: "s2", position: 1 },
        { id: "s3", position: 2 },
        { id: "s4", position: 3 },
      ];
      const grouped = groupMatchSlotsByTeam(slots, 4);
      expect(grouped.A).toHaveLength(2);
      expect(grouped.B).toHaveLength(2);
      expect(grouped.A[0].id).toBe("s1");
      expect(grouped.B[0].id).toBe("s3");
    });
  });

  describe("getJoinSlotRegionAriaLabel", () => {
    it("returns correct Argentine Spanish ARIA region labels", () => {
      expect(getJoinSlotRegionAriaLabel("header")).toBe("Encabezado de invitación");
      expect(getJoinSlotRegionAriaLabel("invitation")).toBe("Mensaje de invitación");
      expect(getJoinSlotRegionAriaLabel("match-detail")).toBe("Detalle del partido");
      expect(getJoinSlotRegionAriaLabel("formation")).toBe("Formación de los equipos");
      expect(getJoinSlotRegionAriaLabel("footer")).toBe("Confirmación de inscripción");
    });
  });

  describe("getSlotStatusBadgeProps", () => {
    it("returns confirmed badge properties when true", () => {
      const props = getSlotStatusBadgeProps(true);
      expect(props.text).toBe("Confirmado");
      expect(props.className).toContain("bg-emerald-100");
    });

    it("returns pending badge properties when false", () => {
      const props = getSlotStatusBadgeProps(false);
      expect(props.text).toBe("Pendiente");
      expect(props.className).toContain("bg-amber-100");
    });
  });
});
