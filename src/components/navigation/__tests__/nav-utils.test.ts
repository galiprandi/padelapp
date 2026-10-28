import { describe, it, expect } from "vitest";
import {
  getNavItems,
  getSplitNavItems,
  getFabItemConfig,
  getFabAriaAttributes,
  getNavItemAriaAttributes,
  getBottomNavAriaLabel,
  getBottomNavAriaAttributes,
  getBottomNavSkeletonAriaLabel,
  getCatalogSkeletonAriaLabel,
  getCatalogSkeletonContainerClasses,
  getCatalogSkeletonLayoutClasses,
  getCatalogSkeletonSidebarClasses,
  getCatalogSkeletonSidebarStickyClasses,
  getCatalogSkeletonMainContentClasses,
  getCatalogSkeletonHeaderClasses,
  getCatalogSkeletonSectionCardClasses,
  getCatalogSkeletonSidebarSectionClasses,
  getCatalogSkeletonSidebarTabContainerClasses,
  getCatalogSkeletonMainContentListClasses,
  getCatalogSkeletonSectionGroupClasses,
  getCatalogSkeletonCardSectionClasses,
  getCatalogSkeletonCardListClasses,
  getCatalogSkeletonSidebarHeadingTitleClasses,
  getCatalogSkeletonSidebarTabButtonClasses,
  getCatalogSkeletonSidebarItemListClasses,
  getCatalogSkeletonSidebarItemClasses,
  getCatalogSkeletonHeaderTitleClasses,
  getCatalogSkeletonHeaderSubtitleClasses,
  getCatalogSkeletonSectionTitleClasses,
  getCatalogSkeletonInputClasses,
  getCatalogSkeletonButtonClasses,
  getCatalogSkeletonChipGroupClasses,
  getCatalogSkeletonChipClasses,
  getCatalogSkeletonCardItemClasses,
  formatNotificationsAriaLabel,
  formatNotificationsDisplayCount,
  getNotificationsBadgeAriaAttributes,
  isNavItemActive,
  getBottomNavContainerClasses,
  getBottomNavInnerContainerClasses,
  getBottomNavSkeletonTabsConfig,
  getBottomNavTabSkeletonClasses,
  getBottomNavTabItemSkeletonClasses,
  getBottomNavFabSkeletonClasses,
  getNavItemClasses,
  getFabClasses,
  getNotificationsBadgeClasses,
  getFloatingNotificationsBadgeClasses,
  getBottomNavSkeletonAriaAttributes,
  getBottomNavTabIconSkeletonClasses,
  getBottomNavTabLabelSkeletonClasses,
  getBottomNavFabIconSkeletonClasses,
  getBottomNavIconClasses,
  getBottomNavLabelClasses,
  getFabIconClasses,
  getAppLayoutClasses,
  getAppMainClasses,
  getAppLayoutAriaAttributes,
  getAppMainAriaAttributes,
  getNotificationsSkeletonAriaLabel,
  getNotificationsRegionAriaLabel,
  getNotificationsHeadingTitle,
  getNotificationsHeadingDescription,
  getNotificationsActionsTitle,
  getNotificationsActionsBadgeAriaLabel,
  getNotificationsEmptyStateProps,
  shouldRenderNotificationsBadge,
  getNotificationsBadgeHref,
  getNotificationsBadgeLinkProps,
  getNavItemLinkProps,
  getFabLinkProps,
  getPendingActionMatchDetailProps,
  getBottomNavNotificationsBadgeLinkProps,
  getNotificationsHeaderClasses,
  getNotificationsSkeletonContainerClasses,
  getNotificationsContainerClasses,
  getNotificationsActionsBadgeClasses,
  getNotificationsListClasses,
  getNotificationsHeadingTitleClasses,
  getNotificationsHeadingDescriptionClasses,
  getNotificationsSectionHeaderClasses,
  getNotificationsSectionTitleClasses,
  getNotificationsSkeletonHeadingTitleClasses,
  getNotificationsSkeletonHeadingSubtitleClasses,
  getNotificationsSkeletonSectionBadgeClasses,
  getNotificationsSkeletonItemClasses,
} from "../nav-utils";

describe("nav-utils", () => {
  describe("getBottomNavAriaLabel", () => {
    it("returns Spanish screen reader label for main bottom navigation", () => {
      expect(getBottomNavAriaLabel()).toBe("Navegación principal de Padel Red");
    });
  });

  describe("getBottomNavAriaAttributes", () => {
    it("returns navigation role and localized screen reader ARIA label", () => {
      const attrs = getBottomNavAriaAttributes();
      expect(attrs).toEqual({
        role: "navigation",
        "aria-label": "Navegación principal de Padel Red",
      });
    });
  });

  describe("getNavItemLinkProps", () => {
    it("returns composed link properties for active navigation item", () => {
      const navItem = { href: "/turnos", icon: expect.anything(), label: "Turnos" };
      const props = getNavItemLinkProps(navItem, true);

      expect(props).toEqual({
        href: "/turnos",
        prefetch: true,
        className: expect.stringContaining("text-primary"),
        "aria-label": "Turnos",
        "aria-current": "page",
      });
    });

    it("returns composed link properties for inactive navigation item", () => {
      const navItem = { href: "/ranking", icon: expect.anything(), label: "Ranking" };
      const props = getNavItemLinkProps(navItem, false);

      expect(props).toEqual({
        href: "/ranking",
        prefetch: true,
        className: expect.stringContaining("text-muted-foreground"),
        "aria-label": "Ranking",
        "aria-current": undefined,
      });
    });
  });

  describe("getFabLinkProps", () => {
    it("returns composed link properties for FAB action button", () => {
      const props = getFabLinkProps();

      expect(props).toEqual({
        href: "/match/new",
        prefetch: true,
        className: expect.stringContaining("bg-primary"),
        "aria-label": "Crear partido",
      });
    });
  });

  describe("getBottomNavSkeletonAriaLabel", () => {
    it("returns Spanish screen reader label for loading bottom navigation skeleton", () => {
      expect(getBottomNavSkeletonAriaLabel()).toBe("Cargando navegación principal de Padel Red");
    });
  });

  describe("getBottomNavSkeletonAriaAttributes", () => {
    it("returns status role, aria-busy true, and localized ARIA label", () => {
      const attrs = getBottomNavSkeletonAriaAttributes();
      expect(attrs).toEqual({
        role: "status",
        "aria-busy": "true",
        "aria-label": "Cargando navegación principal de Padel Red",
      });
    });
  });

  describe("Skeleton and Nav Icon/Label Class Helpers", () => {
    it("getBottomNavTabIconSkeletonClasses returns tab icon skeleton classes", () => {
      const classes = getBottomNavTabIconSkeletonClasses();
      expect(classes).toContain("h-5 w-5 rounded-md");
    });

    it("getBottomNavTabLabelSkeletonClasses returns tab label skeleton classes", () => {
      const classes = getBottomNavTabLabelSkeletonClasses();
      expect(classes).toContain("h-3 w-10 rounded-sm");
    });

    it("getBottomNavFabIconSkeletonClasses returns fab icon skeleton classes", () => {
      const classes = getBottomNavFabIconSkeletonClasses();
      expect(classes).toContain("h-6 w-6 rounded-md");
    });

    it("getBottomNavIconClasses returns navigation icon classes", () => {
      const classes = getBottomNavIconClasses();
      expect(classes).toContain("h-5 w-5");
    });

    it("getBottomNavLabelClasses returns navigation label typography classes", () => {
      const classes = getBottomNavLabelClasses();
      expect(classes).toContain("mt-1 text-xs font-semibold");
    });

    it("getFabIconClasses returns FAB icon dimensions", () => {
      const classes = getFabIconClasses();
      expect(classes).toContain("h-6 w-6");
    });
  });

  describe("Catalog Skeleton Helpers", () => {
    it("getCatalogSkeletonAriaLabel returns Spanish screen reader label for loading catalog skeleton", () => {
      expect(getCatalogSkeletonAriaLabel()).toBe("Cargando catálogo de componentes de Padel Red");
    });

    it("getCatalogSkeletonContainerClasses returns container styling classes", () => {
      expect(getCatalogSkeletonContainerClasses()).toContain("min-h-screen bg-background p-6");
      expect(getCatalogSkeletonContainerClasses("custom-container")).toContain("custom-container");
    });

    it("getCatalogSkeletonLayoutClasses returns layout flex classes", () => {
      expect(getCatalogSkeletonLayoutClasses()).toContain("mx-auto flex gap-12 max-w-none");
      expect(getCatalogSkeletonLayoutClasses("custom-layout")).toContain("custom-layout");
    });

    it("getCatalogSkeletonSidebarClasses returns sidebar classes", () => {
      expect(getCatalogSkeletonSidebarClasses()).toContain("w-64 shrink-0 hidden lg:block");
      expect(getCatalogSkeletonSidebarClasses("custom-sidebar")).toContain("custom-sidebar");
    });

    it("getCatalogSkeletonSidebarStickyClasses returns sticky sidebar classes", () => {
      expect(getCatalogSkeletonSidebarStickyClasses()).toContain("sticky top-6 space-y-6");
      expect(getCatalogSkeletonSidebarStickyClasses("custom-sticky")).toContain("custom-sticky");
    });

    it("getCatalogSkeletonMainContentClasses returns main content area classes", () => {
      expect(getCatalogSkeletonMainContentClasses()).toContain("flex-1 min-w-0");
      expect(getCatalogSkeletonMainContentClasses("custom-main")).toContain("custom-main");
    });

    it("getCatalogSkeletonHeaderClasses returns main header classes", () => {
      expect(getCatalogSkeletonHeaderClasses()).toContain("mb-12 space-y-2");
      expect(getCatalogSkeletonHeaderClasses("custom-header")).toContain("custom-header");
    });

    it("getCatalogSkeletonSectionCardClasses returns section card styling classes", () => {
      expect(getCatalogSkeletonSectionCardClasses()).toContain("p-6 border border-border rounded-xl bg-card space-y-2");
      expect(getCatalogSkeletonSectionCardClasses("custom-card")).toContain("custom-card");
    });

    it("getCatalogSkeletonSidebarSectionClasses returns sidebar section container styling classes", () => {
      expect(getCatalogSkeletonSidebarSectionClasses()).toContain("space-y-3");
      expect(getCatalogSkeletonSidebarSectionClasses("custom-sec")).toContain("custom-sec");
    });

    it("getCatalogSkeletonSidebarTabContainerClasses returns tab container styling classes", () => {
      expect(getCatalogSkeletonSidebarTabContainerClasses()).toContain("flex bg-muted rounded-xl p-1 border border-border");
      expect(getCatalogSkeletonSidebarTabContainerClasses("custom-tabs")).toContain("custom-tabs");
    });

    it("getCatalogSkeletonMainContentListClasses returns main content list layout classes", () => {
      expect(getCatalogSkeletonMainContentListClasses()).toContain("space-y-16 max-w-sm mx-auto lg:max-w-none");
      expect(getCatalogSkeletonMainContentListClasses("custom-list")).toContain("custom-list");
    });

    it("getCatalogSkeletonSectionGroupClasses returns section group spacing classes", () => {
      expect(getCatalogSkeletonSectionGroupClasses()).toContain("space-y-6");
      expect(getCatalogSkeletonSectionGroupClasses("custom-group")).toContain("custom-group");
    });

    it("getCatalogSkeletonCardSectionClasses returns card section styling classes", () => {
      expect(getCatalogSkeletonCardSectionClasses()).toContain("p-6 border border-border rounded-xl bg-card space-y-6");
      expect(getCatalogSkeletonCardSectionClasses("custom-card-sec")).toContain("custom-card-sec");
    });

    it("getCatalogSkeletonCardListClasses returns card list styling classes", () => {
      expect(getCatalogSkeletonCardListClasses()).toContain("p-6 border border-border rounded-xl bg-card space-y-4");
      expect(getCatalogSkeletonCardListClasses("custom-card-list")).toContain("custom-card-list");
    });

    it("getCatalogSkeletonSidebarHeadingTitleClasses returns sidebar heading title skeleton dimension classes", () => {
      expect(getCatalogSkeletonSidebarHeadingTitleClasses()).toContain("h-4 w-12");
      expect(getCatalogSkeletonSidebarHeadingTitleClasses("custom-title")).toContain("custom-title");
    });

    it("getCatalogSkeletonSidebarTabButtonClasses returns sidebar tab button skeleton dimension classes", () => {
      expect(getCatalogSkeletonSidebarTabButtonClasses()).toContain("h-8 flex-1 rounded-lg");
      expect(getCatalogSkeletonSidebarTabButtonClasses("custom-tab")).toContain("custom-tab");
    });

    it("getCatalogSkeletonSidebarItemListClasses returns sidebar item list container classes", () => {
      expect(getCatalogSkeletonSidebarItemListClasses()).toContain("space-y-2");
      expect(getCatalogSkeletonSidebarItemListClasses("custom-item-list")).toContain("custom-item-list");
    });

    it("getCatalogSkeletonSidebarItemClasses returns sidebar item skeleton dimension classes", () => {
      expect(getCatalogSkeletonSidebarItemClasses()).toContain("h-9 w-full rounded-lg");
      expect(getCatalogSkeletonSidebarItemClasses("custom-item")).toContain("custom-item");
    });

    it("getCatalogSkeletonHeaderTitleClasses returns header title skeleton dimension classes", () => {
      expect(getCatalogSkeletonHeaderTitleClasses()).toContain("h-7 w-64");
      expect(getCatalogSkeletonHeaderTitleClasses("custom-hdr-title")).toContain("custom-hdr-title");
    });

    it("getCatalogSkeletonHeaderSubtitleClasses returns header subtitle skeleton dimension classes", () => {
      expect(getCatalogSkeletonHeaderSubtitleClasses()).toContain("h-4 w-96");
      expect(getCatalogSkeletonHeaderSubtitleClasses("custom-hdr-sub")).toContain("custom-hdr-sub");
    });

    it("getCatalogSkeletonSectionTitleClasses returns section title skeleton dimension classes", () => {
      expect(getCatalogSkeletonSectionTitleClasses()).toContain("h-5 w-32");
      expect(getCatalogSkeletonSectionTitleClasses("custom-sec-title")).toContain("custom-sec-title");
    });

    it("getCatalogSkeletonInputClasses returns input skeleton dimension classes", () => {
      expect(getCatalogSkeletonInputClasses()).toContain("h-12 w-full rounded-lg");
      expect(getCatalogSkeletonInputClasses("custom-input")).toContain("custom-input");
    });

    it("getCatalogSkeletonButtonClasses returns button skeleton dimension classes", () => {
      expect(getCatalogSkeletonButtonClasses()).toContain("h-10 w-full rounded-lg");
      expect(getCatalogSkeletonButtonClasses("custom-btn")).toContain("custom-btn");
    });

    it("getCatalogSkeletonChipGroupClasses returns chip group flex container classes", () => {
      expect(getCatalogSkeletonChipGroupClasses()).toContain("flex gap-2");
      expect(getCatalogSkeletonChipGroupClasses("custom-chip-group")).toContain("custom-chip-group");
    });

    it("getCatalogSkeletonChipClasses returns chip skeleton dimension classes", () => {
      expect(getCatalogSkeletonChipClasses()).toContain("h-6 w-16 rounded-full");
      expect(getCatalogSkeletonChipClasses("custom-chip")).toContain("custom-chip");
    });

    it("getCatalogSkeletonCardItemClasses returns card item skeleton dimension classes", () => {
      expect(getCatalogSkeletonCardItemClasses()).toContain("h-16 w-full rounded-xl");
      expect(getCatalogSkeletonCardItemClasses("custom-card-item")).toContain("custom-card-item");
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

  describe("getBottomNavInnerContainerClasses", () => {
    it("returns inner container layout styling", () => {
      const classes = getBottomNavInnerContainerClasses();
      expect(classes).toContain("relative flex h-16 w-full items-stretch justify-evenly border-t border-border bg-background");
    });

    it("applies custom class overrides", () => {
      const classes = getBottomNavInnerContainerClasses("custom-inner-nav");
      expect(classes).toContain("custom-inner-nav");
    });
  });

  describe("getBottomNavTabSkeletonClasses", () => {
    it("returns flex column alignment classes for tab skeleton", () => {
      const classes = getBottomNavTabSkeletonClasses();
      expect(classes).toContain("flex flex-1 flex-col items-center justify-center gap-1");
    });

    it("applies custom class overrides", () => {
      const classes = getBottomNavTabSkeletonClasses("custom-tab-skeleton");
      expect(classes).toContain("custom-tab-skeleton");
    });
  });

  describe("getBottomNavSkeletonTabsConfig", () => {
    it("returns left and right tabs arrays for skeleton rendering", () => {
      const config = getBottomNavSkeletonTabsConfig();
      expect(config).toEqual({
        leftTabs: [1, 2],
        rightTabs: [3, 4],
      });
    });
  });

  describe("getBottomNavTabItemSkeletonClasses", () => {
    it("returns tab item skeleton classes matching getBottomNavTabSkeletonClasses", () => {
      const classes = getBottomNavTabItemSkeletonClasses();
      expect(classes).toContain("flex flex-1 flex-col items-center justify-center gap-1");
    });

    it("applies custom class overrides", () => {
      const classes = getBottomNavTabItemSkeletonClasses("custom-tab-item");
      expect(classes).toContain("custom-tab-item");
    });
  });

  describe("getBottomNavFabSkeletonClasses", () => {
    it("returns FAB skeleton container alignment and styling", () => {
      const classes = getBottomNavFabSkeletonClasses();
      expect(classes).toContain("relative -mt-6 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted shadow-xs");
    });

    it("applies custom class overrides", () => {
      const classes = getBottomNavFabSkeletonClasses("custom-fab-skeleton");
      expect(classes).toContain("custom-fab-skeleton");
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

  describe("getFloatingNotificationsBadgeClasses", () => {
    it("returns fixed positioning, safe area inset bottom elevation, z-50, shadow-md, and active tactile scale", () => {
      const classes = getFloatingNotificationsBadgeClasses();
      expect(classes).toContain("fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+12px)] right-6 z-50");
      expect(classes).toContain("rounded-full bg-primary");
      expect(classes).toContain("shadow-md");
      expect(classes).toContain("active:scale-[0.98]");
      expect(classes).toContain("focus-visible:ring-2");
    });

    it("applies custom class overrides", () => {
      const classes = getFloatingNotificationsBadgeClasses("custom-floating-badge");
      expect(classes).toContain("custom-floating-badge");
    });
  });

  describe("getAppLayoutClasses", () => {
    it("returns layout container base classes", () => {
      const classes = getAppLayoutClasses();
      expect(classes).toContain("relative flex min-h-screen flex-col bg-background");
    });

    it("applies custom class overrides", () => {
      const classes = getAppLayoutClasses("custom-layout");
      expect(classes).toContain("custom-layout");
    });
  });

  describe("getAppMainClasses", () => {
    it("returns main container classes with padding bottom for bottom nav space", () => {
      const classes = getAppMainClasses();
      expect(classes).toContain("flex-1 px-5 pt-4 pb-20");
    });

    it("applies custom class overrides", () => {
      const classes = getAppMainClasses("custom-main");
      expect(classes).toContain("custom-main");
    });
  });

  describe("getAppLayoutAriaAttributes", () => {
    it("returns region role and localized screen reader aria-label", () => {
      const attrs = getAppLayoutAriaAttributes();
      expect(attrs).toEqual({
        role: "region",
        "aria-label": "Aplicación Padel Red",
      });
    });
  });

  describe("getAppMainAriaAttributes", () => {
    it("returns main role and localized screen reader aria-label", () => {
      const attrs = getAppMainAriaAttributes();
      expect(attrs).toEqual({
        role: "main",
        "aria-label": "Contenido principal",
      });
    });
  });

  describe("Notifications Page Helpers", () => {
    it("getNotificationsSkeletonAriaLabel returns Spanish screen reader label for skeleton loading", () => {
      expect(getNotificationsSkeletonAriaLabel()).toBe("Cargando notificaciones y acciones pendientes");
    });

    it("getNotificationsRegionAriaLabel returns Spanish screen reader label for main section", () => {
      expect(getNotificationsRegionAriaLabel()).toBe("Sección de notificaciones y acciones pendientes");
    });

    it("getNotificationsHeadingTitle returns heading title", () => {
      expect(getNotificationsHeadingTitle()).toBe("Notificaciones");
    });

    it("getNotificationsHeadingDescription returns heading description", () => {
      expect(getNotificationsHeadingDescription()).toBe("Confirmaciones y resultados pendientes.");
    });

    it("getNotificationsActionsTitle returns actions section title", () => {
      expect(getNotificationsActionsTitle()).toBe("Acciones requeridas");
    });

    it("getNotificationsActionsBadgeAriaLabel formats singular and plural actions badge label", () => {
      expect(getNotificationsActionsBadgeAriaLabel(0)).toBe("");
      expect(getNotificationsActionsBadgeAriaLabel(1)).toBe("1 acción pendiente");
      expect(getNotificationsActionsBadgeAriaLabel(3)).toBe("3 acciones pendientes");
    });

    it("getNotificationsEmptyStateProps returns empty state metadata and action href", () => {
      const props = getNotificationsEmptyStateProps();
      expect(props).toEqual({
        title: "Todo al día",
        description: "No tenés acciones pendientes por ahora.",
        actionText: "Volver al inicio",
        actionHref: "/me",
      });
    });

    it("shouldRenderNotificationsBadge returns true if count > 0", () => {
      expect(shouldRenderNotificationsBadge(0)).toBe(false);
      expect(shouldRenderNotificationsBadge(-1)).toBe(false);
      expect(shouldRenderNotificationsBadge(1)).toBe(true);
      expect(shouldRenderNotificationsBadge(5)).toBe(true);
    });

    it("getNotificationsBadgeHref returns target notifications path", () => {
      expect(getNotificationsBadgeHref()).toBe("/notifications");
    });

    it("getNotificationsBadgeLinkProps returns composed link properties and ARIA attributes", () => {
      const linkProps = getNotificationsBadgeLinkProps(3);
      expect(linkProps).toEqual({
        href: "/notifications",
        prefetch: true,
        role: "status",
        "aria-live": "polite",
        "aria-label": "3 notificaciones pendientes",
        className: expect.stringContaining("fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+12px)]"),
      });
    });

    it("getPendingActionMatchDetailProps computes result URL and label when match lacks score", () => {
      const props = getPendingActionMatchDetailProps({ id: "match-123" });
      expect(props).toEqual({
        detailUrl: "/match/match-123/result",
        label: "Cargar resultado",
      });
    });

    it("getPendingActionMatchDetailProps computes detail URL and label when match has score", () => {
      const props = getPendingActionMatchDetailProps({ id: "match-456", score: { set1: "6-4" } });
      expect(props).toEqual({
        detailUrl: "/match/match-456",
        label: "Confirmar",
      });
    });

    it("getBottomNavNotificationsBadgeLinkProps returns composed link props for bottom nav inline badge", () => {
      const props = getBottomNavNotificationsBadgeLinkProps(2, "/notifications");
      expect(props).toEqual({
        href: "/notifications",
        prefetch: true,
        role: "status",
        "aria-live": "polite",
        "aria-label": "2 notificaciones pendientes",
        className: expect.stringContaining("absolute -top-3 right-6"),
      });
    });

    it("getNotificationsHeaderClasses returns flex container classes", () => {
      expect(getNotificationsHeaderClasses()).toContain("flex flex-col gap-6");
      expect(getNotificationsHeaderClasses("custom-header")).toContain("custom-header");
    });

    it("getNotificationsSkeletonContainerClasses returns skeleton flex container classes", () => {
      expect(getNotificationsSkeletonContainerClasses()).toContain("flex flex-col gap-6");
      expect(getNotificationsSkeletonContainerClasses("custom-skeleton-container")).toContain("custom-skeleton-container");
    });

    it("getNotificationsContainerClasses returns spacing container classes", () => {
      expect(getNotificationsContainerClasses()).toContain("space-y-3");
      expect(getNotificationsContainerClasses("custom-container")).toContain("custom-container");
    });

    it("getNotificationsActionsBadgeClasses returns badge styling classes", () => {
      expect(getNotificationsActionsBadgeClasses()).toContain("rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground");
      expect(getNotificationsActionsBadgeClasses("custom-badge")).toContain("custom-badge");
    });

    it("getNotificationsListClasses returns list spacing classes", () => {
      expect(getNotificationsListClasses()).toContain("space-y-2");
      expect(getNotificationsListClasses("custom-list")).toContain("custom-list");
    });

    it("getNotificationsHeadingTitleClasses returns title typography classes", () => {
      expect(getNotificationsHeadingTitleClasses()).toContain("text-xl font-bold text-foreground");
      expect(getNotificationsHeadingTitleClasses("custom-title")).toContain("custom-title");
    });

    it("getNotificationsHeadingDescriptionClasses returns description typography classes", () => {
      expect(getNotificationsHeadingDescriptionClasses()).toContain("text-sm text-muted-foreground");
      expect(getNotificationsHeadingDescriptionClasses("custom-desc")).toContain("custom-desc");
    });

    it("getNotificationsSectionHeaderClasses returns section header flex classes", () => {
      expect(getNotificationsSectionHeaderClasses()).toContain("flex items-center gap-2");
      expect(getNotificationsSectionHeaderClasses("custom-sec-hdr")).toContain("custom-sec-hdr");
    });

    it("getNotificationsSectionTitleClasses returns section title typography classes", () => {
      expect(getNotificationsSectionTitleClasses()).toContain("text-sm font-bold text-foreground");
      expect(getNotificationsSectionTitleClasses("custom-sec-title")).toContain("custom-sec-title");
    });

    it("getNotificationsSkeletonHeadingTitleClasses returns title skeleton dimension classes", () => {
      expect(getNotificationsSkeletonHeadingTitleClasses()).toContain("h-5 w-32");
      expect(getNotificationsSkeletonHeadingTitleClasses("custom-skel-title")).toContain("custom-skel-title");
    });

    it("getNotificationsSkeletonHeadingSubtitleClasses returns subtitle skeleton dimension classes", () => {
      expect(getNotificationsSkeletonHeadingSubtitleClasses()).toContain("mt-1 h-4 w-48");
      expect(getNotificationsSkeletonHeadingSubtitleClasses("custom-skel-sub")).toContain("custom-skel-sub");
    });

    it("getNotificationsSkeletonSectionBadgeClasses returns section badge skeleton dimension classes", () => {
      expect(getNotificationsSkeletonSectionBadgeClasses()).toContain("h-5 w-8 rounded-md");
      expect(getNotificationsSkeletonSectionBadgeClasses("custom-skel-badge")).toContain("custom-skel-badge");
    });

    it("getNotificationsSkeletonItemClasses returns card item skeleton dimension classes", () => {
      expect(getNotificationsSkeletonItemClasses()).toContain("h-16 w-full rounded-xl");
      expect(getNotificationsSkeletonItemClasses("custom-skel-item")).toContain("custom-skel-item");
    });
  });
});
