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
  getNavItemClasses,
  getFabClasses,
  getNotificationsBadgeClasses,
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
      <div className="relative flex h-16 w-full items-stretch justify-evenly border-t border-border bg-background">
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
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span className="mt-1 text-xs font-semibold">
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
          <Plus className="h-6 w-6" aria-hidden="true" />
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
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span className="mt-1 text-xs font-semibold">
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
