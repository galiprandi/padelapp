import { describe, expect, it } from "vitest";
import {
  getSlotDisplayName,
  getSlotAriaLabel,
  getManageButtonAriaLabel,
} from "../slot-display-utils";
import type { SlotValue } from "@/lib/match-types";

describe("SlotDisplay Pure Helpers", () => {
  describe("getSlotDisplayName", () => {
    it("returns registered user player's display name when slot is user", () => {
      const slot: SlotValue = {
        kind: "user",
        player: {
          id: "u1",
          displayName: "Agustín Tapia",
          email: "tapia@padel.ar",
          image: null,
        },
      };
      const name = getSlotDisplayName(slot, "B", 1, "Arturo Coello");
      expect(name).toBe("Agustín Tapia");
    });

    it("returns custom placeholder display name when slot is placeholder", () => {
      const slot: SlotValue = {
        kind: "placeholder",
        displayName: "Sanyo Gutiérrez",
      };
      const name = getSlotDisplayName(slot, "A", 1, "Arturo Coello");
      expect(name).toBe("Sanyo Gutiérrez");
    });

    it("returns creator display name for Team A, index 0 when unassigned", () => {
      const name = getSlotDisplayName(null, "A", 0, "Arturo Coello");
      expect(name).toBe("Arturo Coello");
    });

    it("returns default position placeholder for Team A, index 1 when unassigned", () => {
      const name = getSlotDisplayName(null, "A", 1, "Arturo Coello");
      expect(name).toBe("Jugador 2");
    });

    it("returns default position placeholder for Team B, index 0 when unassigned", () => {
      const name = getSlotDisplayName(null, "B", 0, "Arturo Coello");
      expect(name).toBe("Jugador 3");
    });

    it("returns default position placeholder for Team B, index 1 when unassigned", () => {
      const name = getSlotDisplayName(null, "B", 1, "Arturo Coello");
      expect(name).toBe("Jugador 4");
    });
  });

  describe("getSlotAriaLabel", () => {
    it("formats slot selection ARIA label correctly", () => {
      const label = getSlotAriaLabel("A", "Derecha", "Agustín Tapia");
      expect(label).toBe("Seleccionar Pareja A, Derecha: Agustín Tapia");
    });
  });

  describe("getManageButtonAriaLabel", () => {
    it("returns management label for placeholder slots", () => {
      expect(getManageButtonAriaLabel("placeholder")).toBe("Gestionar nombre del cupo");
    });

    it("returns player change label for user slots", () => {
      expect(getManageButtonAriaLabel("user")).toBe("Cambiar jugador");
    });

    it("returns assignment label for unassigned slots", () => {
      expect(getManageButtonAriaLabel(undefined)).toBe("Asignar jugador");
    });
  });
});
