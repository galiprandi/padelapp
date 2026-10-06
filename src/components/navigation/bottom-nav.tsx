"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import {
  getSplitNavItems,
  getFabItemConfig,
  getFabAriaAttributes,
  getNavItemAriaAttributes,
  getBottomNavAriaLabel,
  getNotificationsBadgeAriaAttributes,
  formatNotificationsDisplayCount,
  isNavItemActive,
  getBottomNavContainerClasses,
  getBottomNavInnerContainerClasses,
  getNavItemClasses,
  getFabClasses,
  getNotificationsBadgeClasses,
  getBottomNavIconClasses,
  getBottomNavLabelClasses,
  getFabIconClasses,
} from "./nav-utils";

interface BottomNavProps {
  position?: "fixed" | "static";
  notificationsCount?: number;
  notificationsHref?: string;
}

export function BottomNav({
  position = "fixed",
  notificationsCount = 0,
  notificationsHref = "/notifications",
}: BottomNavProps) {
  const pathname = usePathname();
  const { primaryItems, secondaryItems } = getSplitNavItems();
  const fabConfig = getFabItemConfig();

  return (
    <nav
      role="navigation"
      aria-label={getBottomNavAriaLabel()}
      className={getBottomNavContainerClasses(position)}
    >
      <div className={getBottomNavInnerContainerClasses()}>
        {primaryItems.map((item) => {
          const isActive = isNavItemActive(item.href, pathname);
          const ariaAttrs = getNavItemAriaAttributes(item, isActive);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={getNavItemClasses(isActive)}
              {...ariaAttrs}
            >
              <item.icon className={getBottomNavIconClasses()} aria-hidden="true" />
              <span className={getBottomNavLabelClasses()}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* FAB Central */}
        <Link
          href={fabConfig.href}
          prefetch={true}
          className={getFabClasses()}
          {...getFabAriaAttributes()}
        >
          <Plus className={getFabIconClasses()} aria-hidden="true" />
        </Link>

        {secondaryItems.map((item) => {
          const isActive = isNavItemActive(item.href, pathname);
          const ariaAttrs = getNavItemAriaAttributes(item, isActive);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={getNavItemClasses(isActive)}
              {...ariaAttrs}
            >
              <item.icon className={getBottomNavIconClasses()} aria-hidden="true" />
              <span className={getBottomNavLabelClasses()}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {notificationsCount > 0 && (
          <Link
            href={notificationsHref}
            prefetch={true}
            {...getNotificationsBadgeAriaAttributes(notificationsCount)}
            className={getNotificationsBadgeClasses()}
          >
            {formatNotificationsDisplayCount(notificationsCount)}
          </Link>
        )}
      </div>
    </nav>
  );
}
