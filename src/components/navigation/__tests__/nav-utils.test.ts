import { describe, it, expect } from "vitest";
import {
  getNavItems,
  getSplitNavItems,
  getFabItemConfig,
  getNavItemAriaAttributes,
  formatNotificationsAriaLabel,
  formatNotificationsDisplayCount,
  isNavItemActive,
} from "../nav-utils";

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

  describe("formatNotificationsDisplayCount", () => {
    it("returns empty string when count is 0 or negative", () => {
      expect(formatNotificationsDisplayCount(0)).toBe("");
      expect(formatNotificationsDisplayCount(-5)).toBe("");
    });

    it("returns formatted count string for counts <= 99", () => {
      expect(formatNotificationsDisplayCount(1)).toBe("1");
      expect(formatNotificationsDisplayCount(12)).toBe("12");
      expect(formatNotificationsDisplayCount(99)).toBe("99");
    });

    it("returns '99+' cap when count exceeds 99", () => {
      expect(formatNotificationsDisplayCount(100)).toBe("99+");
      expect(formatNotificationsDisplayCount(250)).toBe("99+");
    });
  });

  describe("isNavItemActive", () => {
    it("returns false if pathname is null or empty", () => {
      expect(isNavItemActive("/turnos", null)).toBe(false);
      expect(isNavItemActive("/turnos", "")).toBe(false);
    });

    it("returns true on exact pathname match", () => {
      expect(isNavItemActive("/turnos", "/turnos")).toBe(true);
      expect(isNavItemActive("/ranking", "/ranking")).toBe(true);
      expect(isNavItemActive("/me", "/me")).toBe(true);
    });

    it("handles /me route special rules", () => {
      expect(isNavItemActive("/me", "/me")).toBe(true);
      expect(isNavItemActive("/me", "/me/profile")).toBe(false);
      expect(isNavItemActive("/me", "/me/security")).toBe(false);
    });

    it("handles /me/profile subroutes and security link", () => {
      expect(isNavItemActive("/me/profile", "/me/profile")).toBe(true);
      expect(isNavItemActive("/me/profile", "/me/profile/edit")).toBe(true);
      expect(isNavItemActive("/me/profile", "/me/security")).toBe(true);
      expect(isNavItemActive("/me/profile", "/me/security/devices")).toBe(true);
    });

    it("matches standard section prefix subroutes", () => {
      expect(isNavItemActive("/turnos", "/turnos/nuevo")).toBe(true);
      expect(isNavItemActive("/turnos", "/turnos/123/editar")).toBe(true);
      expect(isNavItemActive("/ranking", "/ranking/leaderboard")).toBe(true);
      expect(isNavItemActive("/turnos", "/match")).toBe(false);
    });
  });

  describe("getSplitNavItems", () => {
    it("splits navigation items into primary and secondary groups", () => {
      const { primaryItems, secondaryItems } = getSplitNavItems();
      expect(primaryItems).toHaveLength(2);
      expect(secondaryItems).toHaveLength(2);

      expect(primaryItems[0].href).toBe("/me");
      expect(primaryItems[1].href).toBe("/turnos");
      expect(secondaryItems[0].href).toBe("/ranking");
      expect(secondaryItems[1].href).toBe("/me/profile");
    });
  });

  describe("getFabItemConfig", () => {
    it("returns correct FAB CTA metadata", () => {
      const fab = getFabItemConfig();
      expect(fab).toEqual({
        href: "/match/new",
        label: "Crear partido",
      });
    });
  });

  describe("getNavItemAriaAttributes", () => {
    it("returns aria-label and aria-current='page' when item is active", () => {
      const navItem = { href: "/turnos", icon: expect.anything(), label: "Turnos" };
      const attrs = getNavItemAriaAttributes(navItem, true);

      expect(attrs).toEqual({
        "aria-label": "Turnos",
        "aria-current": "page",
      });
    });

    it("returns aria-label without aria-current when item is not active", () => {
      const navItem = { href: "/turnos", icon: expect.anything(), label: "Turnos" };
      const attrs = getNavItemAriaAttributes(navItem, false);

      expect(attrs).toEqual({
        "aria-label": "Turnos",
        "aria-current": undefined,
      });
    });
  });
});
