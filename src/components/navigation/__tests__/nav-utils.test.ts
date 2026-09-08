import { describe, it, expect } from "vitest";
import { getNavItems, formatNotificationsAriaLabel } from "../nav-utils";

describe("nav-utils", () => {
  describe("getNavItems", () => {
    it("returns expected navigation items list", () => {
      const items = getNavItems();
      expect(items).toHaveLength(4);

      expect(items[0]).toEqual({
        href: "/me",
        icon: expect.anything(),
        label: "Inicio",
      });
      expect(items[1]).toEqual({
        href: "/turnos",
        icon: expect.anything(),
        label: "Turnos",
      });
      expect(items[2]).toEqual({
        href: "/ranking",
        icon: expect.anything(),
        label: "Ranking",
      });
      expect(items[3]).toEqual({
        href: "/me/profile",
        icon: expect.anything(),
        label: "Perfil",
      });
    });
  });

  describe("formatNotificationsAriaLabel", () => {
    it("returns empty string when count is 0 or negative", () => {
      expect(formatNotificationsAriaLabel(0)).toBe("");
      expect(formatNotificationsAriaLabel(-1)).toBe("");
    });

    it("returns singular label when count is 1", () => {
      expect(formatNotificationsAriaLabel(1)).toBe("1 notificación pendiente");
    });

    it("returns plural label when count is greater than 1", () => {
      expect(formatNotificationsAriaLabel(5)).toBe("5 notificaciones pendientes");
      expect(formatNotificationsAriaLabel(99)).toBe("99 notificaciones pendientes");
    });
  });
});
