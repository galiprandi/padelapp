import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { BottomNav } from "../bottom-nav";
import { BottomNavSkeleton } from "../bottom-nav-skeleton";

vi.mock("next/navigation", () => ({
  usePathname: () => "/me",
}));

interface LinkProps {
  href?: string;
  "aria-label"?: string;
  prefetch?: boolean;
}

describe("BottomNav Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders navigation container with ARIA landmark attributes", () => {
    const element = BottomNav({});

    expect(element.type).toBe("nav");
    expect(element.props.role).toBe("navigation");
    expect(element.props["aria-label"]).toBe("Bottom navigation");
  });

  it("applies fixed positioning by default and static when position prop is set", () => {
    const fixedNav = BottomNav({ position: "fixed" });
    expect(fixedNav.props.className).toContain("fixed inset-x-0 bottom-0");

    const staticNav = BottomNav({ position: "static" });
    expect(staticNav.props.className).not.toContain("fixed inset-x-0 bottom-0");
  });

  it("renders notifications badge link when notificationsCount > 0", () => {
    const elementWithBadge = BottomNav({ notificationsCount: 3, notificationsHref: "/notifications" });

    const innerContainer = elementWithBadge.props.children;
    const childrenList = React.Children.toArray(innerContainer.props.children);

    const badgeLink = childrenList.find(
      (child): child is React.ReactElement<LinkProps> =>
        React.isValidElement<LinkProps>(child) && child.props.href === "/notifications",
    );

    expect(badgeLink).toBeDefined();
    expect(badgeLink?.props["aria-label"]).toBe("3 notificaciones pendientes");
    expect(badgeLink?.props.prefetch).toBe(true);
  });

  it("formats singular notification ARIA label when notificationsCount === 1", () => {
    const elementWithBadge = BottomNav({ notificationsCount: 1, notificationsHref: "/notifications" });

    const innerContainer = elementWithBadge.props.children;
    const childrenList = React.Children.toArray(innerContainer.props.children);

    const badgeLink = childrenList.find(
      (child): child is React.ReactElement<LinkProps> =>
        React.isValidElement<LinkProps>(child) && child.props.href === "/notifications",
    );

    expect(badgeLink?.props["aria-label"]).toBe("1 notificación pendiente");
  });
});

describe("BottomNavSkeleton Component", () => {
  it("renders status role and Spanish navigation loading ARIA label", () => {
    const skeleton = BottomNavSkeleton({});

    expect(skeleton.props.role).toBe("status");
    expect(skeleton.props["aria-label"]).toBe("Cargando barra de navegación");
  });

  it("applies fixed positioning by default and static when position prop is set", () => {
    const fixedSkeleton = BottomNavSkeleton({ position: "fixed" });
    expect(fixedSkeleton.props.className).toContain("fixed inset-x-0 bottom-0");

    const staticSkeleton = BottomNavSkeleton({ position: "static" });
    expect(staticSkeleton.props.className).not.toContain("fixed inset-x-0 bottom-0");
  });
});
