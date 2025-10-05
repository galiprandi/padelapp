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
}

const TennisBallIcon: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <circle cx={12} cy={12} r={8} />
    <path d="M5 8a7 7 0 0 0 4 4" />
    <path d="M5 16a7 7 0 0 1 4-4" />
    <path d="M19 8a7 7 0 0 1-4 4" />
    <path d="M19 16a7 7 0 0 0-4-4" />
  </svg>
);

const NAV_ITEMS: BottomNavItem[] = [
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/match", label: "Partidos", icon: TennisBallIcon },
  { href: "/me", label: "Perfil", icon: User },
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
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

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
              <span
                className={cn(
                  "pointer-events-none absolute inset-x-1/3 top-0 h-0.5 transform-gpu bg-primary transition-transform duration-150",
                  isActive ? "scale-x-100" : "scale-x-0",
                )}
                aria-hidden
              />
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
