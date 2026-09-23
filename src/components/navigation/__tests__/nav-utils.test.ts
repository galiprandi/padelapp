import { describe, it, expect } from "vitest";
import {
  getNavItems,
  getSplitNavItems,
  getFabItemConfig,
  getFabAriaAttributes,
  getNavItemAriaAttributes,
  getBottomNavAriaLabel,
  getBottomNavSkeletonAriaLabel,
  formatNotificationsAriaLabel,
  formatNotificationsDisplayCount,
  getNotificationsBadgeAriaAttributes,
  isNavItemActive,
  getBottomNavContainerClasses,
  getNavItemClasses,
  getFabClasses,
  getNotificationsBadgeClasses,
} from "../nav-utils";

describe("nav-utils", () => {
  describe("getBottomNavAriaLabel", () => {
    it("returns Spanish screen reader label for main bottom navigation", () => {
      expect(getBottomNavAriaLabel()).toBe("Navegación principal de Padel Red");
    });
  });

  describe("getBottomNavSkeletonAriaLabel", () => {
    it("returns Spanish screen reader label for loading bottom navigation skeleton", () => {
      expect(getBottomNavSkeletonAriaLabel()).toBe("Cargando navegación principal de Padel Red");
    });
  });

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

  describe("getNotificationsBadgeAriaAttributes", () => {
    it("returns status role, aria-live polite, and formatted aria-label", () => {
      const attrs = getNotificationsBadgeAriaAttributes(3);
      expect(attrs).toEqual({
        role: "status",
        "aria-live": "polite",
        "aria-label": "3 notificaciones pendientes",
      });
    });

    it("handles count of 1 correctly", () => {
      const attrs = getNotificationsBadgeAriaAttributes(1);
      expect(attrs).toEqual({
        role: "status",
        "aria-live": "polite",
        "aria-label": "1 notificación pendiente",
      });
    });
  });

  describe("getFabAriaAttributes", () => {
    it("returns aria-label matching FAB config label", () => {
      const attrs = getFabAriaAttributes();
      expect(attrs).toEqual({
        "aria-label": "Crear partido",
      });
    });
  });

  describe("getBottomNavContainerClasses", () => {
    it("returns fixed positioning and safe-area inset bottom classes by default", () => {
      const classes = getBottomNavContainerClasses();
      expect(classes).toContain("mx-auto flex w-full justify-center");
      expect(classes).toContain("fixed inset-x-0 bottom-0 z-40");
      expect(classes).toContain("pb-[env(safe-area-inset-bottom,0px)]");
    });

    it("returns static positioning without fixed classes when position is static", () => {
      const classes = getBottomNavContainerClasses("static");
      expect(classes).toContain("mx-auto flex w-full justify-center");
      expect(classes).not.toContain("fixed inset-x-0");
    });

    it("applies custom class overrides", () => {
      const classes = getBottomNavContainerClasses("fixed", "custom-nav-container");
      expect(classes).toContain("custom-nav-container");
    });
  });

  describe("getNavItemClasses", () => {
    it("returns active primary styling and touch/focus/scale classes when active", () => {
      const classes = getNavItemClasses(true);
      expect(classes).toContain("text-primary");
      expect(classes).toContain("min-h-[48px]");
      expect(classes).toContain("focus-visible:ring-2");
      expect(classes).toContain("active:scale-[0.98]");
    });

    it("returns muted text styling when inactive", () => {
      const classes = getNavItemClasses(false);
      expect(classes).toContain("text-muted-foreground");
      expect(classes).not.toContain("text-primary");
    });

    it("applies custom class overrides", () => {
      const classes = getNavItemClasses(false, "custom-item-class");
      expect(classes).toContain("custom-item-class");
    });
  });

  describe("getFabClasses", () => {
    it("returns primary background, rounded styling, focus ring, and tactile scaling", () => {
      const classes = getFabClasses();
      expect(classes).toContain("bg-primary text-primary-foreground");
      expect(classes).toContain("-mt-6 flex h-12 w-12");
      expect(classes).toContain("active:scale-[0.98]");
      expect(classes).toContain("focus-visible:ring-2");
    });

    it("applies custom class overrides", () => {
      const classes = getFabClasses("custom-fab-class");
      expect(classes).toContain("custom-fab-class");
    });
  });

  describe("getNotificationsBadgeClasses", () => {
    it("returns badge positioning, primary background, rounded-full, and focus ring", () => {
      const classes = getNotificationsBadgeClasses();
      expect(classes).toContain("absolute -top-3 right-6");
      expect(classes).toContain("rounded-full bg-primary");
      expect(classes).toContain("active:scale-[0.98]");
    });

    it("applies custom class overrides", () => {
      const classes = getNotificationsBadgeClasses("custom-badge-class");
      expect(classes).toContain("custom-badge-class");
    });
  });
});
