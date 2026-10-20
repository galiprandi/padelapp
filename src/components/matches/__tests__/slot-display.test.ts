import { describe, expect, it } from "vitest";
import {
  getSlotDisplayName,
  getSlotAriaLabel,
  getManageButtonAriaLabel,
  getSlotRegionAriaLabel,
  getSlotSubtext,
  getSelfBadgeText,
  getSlotContainerClasses,
  getSlotButtonClasses,
  getSlotAvatarClasses,
  getSelfBadgeContainerClasses,
  getSlotManageButtonClasses,
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

  describe("getSlotRegionAriaLabel", () => {
    it("formats slot region landmark ARIA label correctly", () => {
      const regionLabel = getSlotRegionAriaLabel("A", "Revés", "Arturo Coello");
      expect(regionLabel).toBe("Cupo Pareja A, Revés: Arturo Coello");
    });
  });

  describe("getSlotSubtext", () => {
    it("returns side label when slot is user", () => {
      expect(getSlotSubtext(true, "Derecha")).toBe("Derecha");
      expect(getSlotSubtext(true, "Revés")).toBe("Revés");
    });

    it("returns pending slot subtext when slot is not user", () => {
      expect(getSlotSubtext(false, "Derecha")).toBe("Derecha · Cupo pendiente");
      expect(getSlotSubtext(false, "Revés")).toBe("Revés · Cupo pendiente");
    });
  });

  describe("getSelfBadgeText", () => {
    it("returns self badge text in Argentine Spanish", () => {
      expect(getSelfBadgeText()).toBe("Vos");
    });
  });

  describe("getSlotContainerClasses", () => {
    it("returns primary border styling when slot is active", () => {
      const activeClasses = getSlotContainerClasses(true);
      expect(activeClasses).toContain("border-primary");
      expect(activeClasses).toContain("bg-card");
    });

    it("returns standard border styling when slot is not active", () => {
      const inactiveClasses = getSlotContainerClasses(false);
      expect(inactiveClasses).toContain("border-border");
      expect(inactiveClasses).toContain("bg-card");
    });
  });

  describe("getSlotButtonClasses", () => {
    it("returns muted background and font bold when active", () => {
      const activeClasses = getSlotButtonClasses(true);
      expect(activeClasses).toContain("bg-muted");
      expect(activeClasses).toContain("font-semibold");
    });

    it("returns hover background when inactive", () => {
      const inactiveClasses = getSlotButtonClasses(false);
      expect(inactiveClasses).toContain("hover:bg-muted");
    });
  });

  describe("getSlotAvatarClasses", () => {
    it("returns primary theme badge classes when active", () => {
      const activeAvatar = getSlotAvatarClasses(true);
      expect(activeAvatar).toContain("bg-primary");
      expect(activeAvatar).toContain("text-primary-foreground");
    });

    it("returns muted badge classes when inactive", () => {
      const inactiveAvatar = getSlotAvatarClasses(false);
      expect(inactiveAvatar).toContain("bg-muted");
      expect(inactiveAvatar).toContain("text-muted-foreground");
    });
  });

  describe("getSelfBadgeContainerClasses", () => {
    it("returns correct self badge container styling", () => {
      const classes = getSelfBadgeContainerClasses();
      expect(classes).toContain("bg-muted");
      expect(classes).toContain("border-border");
      expect(classes).toContain("shadow-xs");
    });
  });

  describe("getSlotManageButtonClasses", () => {
    it("returns correct manage button touch scale and focus styling", () => {
      const classes = getSlotManageButtonClasses();
      expect(classes).toContain("h-9");
      expect(classes).toContain("w-9");
      expect(classes).toContain("active:scale-[0.98]");
      expect(classes).toContain("ring-offset-background");
    });
  });
});
