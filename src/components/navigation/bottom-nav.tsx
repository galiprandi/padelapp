"use client";

import type { ComponentType, SVGProps } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Trophy, User } from "lucide-react";

import { cn } from "@/lib/utils";

interface BottomNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  activeIcon?: ComponentType<SVGProps<SVGSVGElement>>;
}

const MatchGlyphIcon: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M3.34 17c2.761 4.783 8.877 6.421 13.66 3.66a9.96 9.96 0 0 0 4.197-4.731 9.99 9.99 0 0 0-.537-8.93 9.99 9.99 0 0 0-7.464-4.928A9.96 9.96 0 0 0 7 3.339C2.217 6.101.58 12.217 3.34 17Z" />
    <path d="M13.196 2.071s-.232 3.599 2.268 7.93 5.733 5.928 5.733 5.928M2.804 8.071s3.232 1.599 5.732 5.93 2.268 7.928 2.268 7.928" />
  </svg>
);

const MatchGlyphSolidIcon: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M20.688 16.508a9 9 0 0 1-.437-.262a14 14 0 0 1-1.464-1.082c-1.176-.987-2.67-2.535-3.971-4.787c-1.3-2.253-1.893-4.32-2.16-5.833a14 14 0 0 1-.205-1.81a9 9 0 0 1-.009-.508c.001-.06.008-.182.009-.215A9.95 9.95 0 0 0 7 3.34a9.95 9.95 0 0 0-3.875 4.051l.189.103q.16.089.437.262c.367.234.876.588 1.464 1.082c1.176.988 2.67 2.535 3.97 4.788c1.301 2.252 1.894 4.32 2.162 5.832c.133.757.185 1.375.204 1.81c.01.217.01.389.009.509v.215a9.95 9.95 0 0 0 5.44-1.33a9.95 9.95 0 0 0 3.874-4.046z" />
    <path d="M10.06 21.811a9 9 0 0 0-.007-.478a12 12 0 0 0-.183-1.613c-.241-1.369-.783-3.266-1.982-5.343c-1.2-2.078-2.572-3.495-3.637-4.39a12 12 0 0 0-1.304-.964c-.159-.1-.33-.199-.412-.245a9.98 9.98 0 0 0 .806 8.224a9.98 9.98 0 0 0 6.719 4.81m3.883-19.62a10 10 0 0 0 .006.479c.017.375.063.927.184 1.612c.241 1.37.783 3.266 1.982 5.344c1.2 2.077 2.572 3.494 3.637 4.389c.532.447.987.762 1.304.964c.159.101.33.2.412.245a9.98 9.98 0 0 0-.806-8.223a9.98 9.98 0 0 0-6.719-4.81" />
  </svg>
);

const TrophySolidIcon: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M6 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1h2a1 1 0 0 1 1 1v1.5a4.5 4.5 0 0 1-3.8 4.437A6 6 0 0 1 13 15.74V17h2.5a1.5 1.5 0 0 1 0 3H8.5a1.5 1.5 0 0 1 0-3H11v-1.26a6 6 0 0 1-4.2-4.803A4.5 4.5 0 0 1 3 6.5V5a1 1 0 0 1 1-1h2Zm0 2H5v1.5A2.5 2.5 0 0 0 7.5 9h.119A4.5 4.5 0 0 1 6 5Zm12 0a4.5 4.5 0 0 1-1.619 4H16.5A2.5 2.5 0 0 0 19 6.5V5h-1Z" />
  </svg>
);

const UserSolidIcon: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    <path d="M4 19.25A7.25 7.25 0 0 1 11.25 12h1.5A7.25 7.25 0 0 1 20 19.25V21H4Z" />
  </svg>
);

const NAV_ITEMS: BottomNavItem[] = [
  { href: "/ranking", label: "Ranking", icon: Trophy, activeIcon: TrophySolidIcon },
  { href: "/match", label: "Partidos", icon: MatchGlyphIcon, activeIcon: MatchGlyphSolidIcon },
  { href: "/me", label: "Perfil", icon: User, activeIcon: UserSolidIcon },
];

export interface BottomNavProps {
  className?: string;
  notificationsCount?: number;
  notificationsHref?: string;
  position?: "fixed" | "static";
}

export function BottomNav({ className, notificationsCount = 0, notificationsHref, position = "fixed" }: BottomNavProps) {
  const pathname = usePathname();
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (position !== "fixed") {
      setKeyboardOffset(0);
      return undefined;
    }

    const viewport = window.visualViewport;

    if (!viewport) {
      return undefined;
    }

    const updateOffset = () => {
      const heightReduction = window.innerHeight - viewport.height;
      setKeyboardOffset(heightReduction > 150 ? heightReduction - 150 : 0);
    };

    updateOffset();

    viewport.addEventListener("resize", updateOffset);
    viewport.addEventListener("scroll", updateOffset);

    return () => {
      viewport.removeEventListener("resize", updateOffset);
      viewport.removeEventListener("scroll", updateOffset);
    };
  }, [position]);

  const notificationsTarget = useMemo(() => {
    if (!notificationsHref) {
      return undefined;
    }
    return notificationsHref;
  }, [notificationsHref]);

  const displayBadge = notificationsCount > 0;

  return (
    <nav
      role="navigation"
      aria-label="Barra de navegación inferior"
      className={cn(
        position === "fixed"
          ? "fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[env(safe-area-inset-bottom,0px)]"
          : "mx-auto flex w-full justify-center",
        className,
      )}
      style={position === "fixed"
        ? { transform: keyboardOffset ? `translateY(-${keyboardOffset}px)` : undefined, transition: "transform 150ms ease" }
        : undefined}
    >
      <div className="relative flex h-12 w-full items-stretch justify-evenly border-t border-border/70 bg-zinc-900">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex flex-1 items-center justify-center transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
                "min-h-[48px]",
                isActive ? "text-primary" : "text-primary/70 hover:text-primary",
              )}
              aria-label={item.label}
            >
              <Icon className="h-6 w-6" aria-hidden />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}

        {displayBadge ? (
          <Link
            href={notificationsTarget ?? "#"}
            aria-label="Notificaciones"
            className="absolute -top-3 right-4 flex h-8 min-w-[32px] items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground shadow transition-transform duration-150 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Bell className="mr-1 h-4 w-4" aria-hidden />
            <span>{notificationsCount}</span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

export default BottomNav;
