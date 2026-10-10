"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import {
  getSplitNavItems,
  getBottomNavAriaAttributes,
  getNotificationsBadgeAriaAttributes,
  formatNotificationsDisplayCount,
  isNavItemActive,
  getNavItemLinkProps,
  getFabLinkProps,
  getBottomNavContainerClasses,
  getBottomNavInnerContainerClasses,
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

  return (
    <nav
      {...getBottomNavAriaAttributes()}
      className={getBottomNavContainerClasses(position)}
    >
      <div className={getBottomNavInnerContainerClasses()}>
        {primaryItems.map((item) => {
          const isActive = isNavItemActive(item.href, pathname);
          const linkProps = getNavItemLinkProps(item, isActive);
          return (
            <Link key={item.href} {...linkProps}>
              <item.icon className={getBottomNavIconClasses()} aria-hidden="true" />
              <span className={getBottomNavLabelClasses()}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* FAB Central */}
        <Link {...getFabLinkProps()}>
          <Plus className={getFabIconClasses()} aria-hidden="true" />
        </Link>

        {secondaryItems.map((item) => {
          const isActive = isNavItemActive(item.href, pathname);
          const linkProps = getNavItemLinkProps(item, isActive);
          return (
            <Link key={item.href} {...linkProps}>
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
