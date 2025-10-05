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

const PadelRacketIcon: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M11 2a7 7 0 0 1 7 7c0 1.93-.77 3.68-2 4.95L11 19l-3-3 5-5.08A4.5 4.5 0 0 0 11 4.5" />
    <circle cx={9.5} cy={6.5} r={0.5} />
    <circle cx={12} cy={6} r={0.5} />
    <circle cx={9.5} cy={9} r={0.5} />
    <circle cx={12} cy={8.5} r={0.5} />
    <path d="m9 19 2 2" />
  </svg>
);

const NAV_ITEMS: BottomNavItem[] = [
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/match", label: "Partidos", icon: PadelRacketIcon },
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
          ? "fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[env(safe-area-inset-bottom,0px)] sm:px-6 md:px-8"
          : "mx-auto flex w-full justify-center px-4 sm:px-6 md:px-8",
        className,
      )}
      style={position === "fixed"
        ? { transform: keyboardOffset ? `translateY(-${keyboardOffset}px)` : undefined, transition: "transform 150ms ease" }
        : undefined}
    >
      <div className="relative flex h-14 w-full max-w-xl items-stretch justify-evenly border-t border-border/80 bg-zinc-900 text-primary-foreground">
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
                "min-h-[56px]",
                isActive ? "text-primary-foreground" : "text-primary-foreground/70 hover:text-primary-foreground",
              )}
              aria-label={item.label}
            >
              <span
                className={cn(
                  "pointer-events-none absolute inset-x-1/3 top-0 h-0.5 transform-gpu bg-primary-foreground transition-transform duration-150",
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
