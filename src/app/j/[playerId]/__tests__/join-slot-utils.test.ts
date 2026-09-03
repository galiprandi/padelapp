import { describe, it, expect } from "vitest";
import {
  formatJoinSlotInvitationMessage,
  formatStatus,
  teamKeyForPosition,
  defaultTeamLabel,
  MATCH_STATUS,
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
});
