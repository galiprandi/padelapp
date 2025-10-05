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

const MatchPaddlesIcon: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <circle cx={9} cy={9} r={3.2} />
    <circle cx={15} cy={9} r={3.2} />
    <path d="M7.1 11.9 11.5 16.3" />
    <path d="M12.5 13 16.9 17.4" />
  </svg>
);

const MatchPaddlesSolidIcon: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M9 5.25a3.75 3.75 0 1 1-2.651 6.4l3.931 3.931a1.2 1.2 0 1 1-1.697 1.697l-3.95-3.95A3.75 3.75 0 0 1 9 5.25Z" />
    <path d="M15 5.25a3.75 3.75 0 1 1-2.651 6.4l3.931 3.931a1.2 1.2 0 0 1-1.697 1.697l-3.95-3.95A3.75 3.75 0 0 1 15 5.25Z" />
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
  { href: "/match", label: "Partidos", icon: MatchPaddlesIcon, activeIcon: MatchPaddlesSolidIcon },
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
