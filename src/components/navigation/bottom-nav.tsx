"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, CalendarDays, User, Home, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const navItems = [
    { href: "/me", icon: Home, label: "Inicio" },
    { href: "/turnos", icon: CalendarDays, label: "Turnos" },
    { href: "/ranking", icon: Trophy, label: "Ranking" },
    { href: "/me/profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Bottom navigation"
      className={cn(
        "mx-auto flex w-full justify-center",
        position === "fixed" &&
          "fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom,0px)]",
      )}
    >
      <div className="relative flex h-16 w-full items-stretch justify-evenly border-t border-border bg-background">
        {navItems.slice(0, 2).map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex flex-1 flex-col items-center justify-center transition-colors min-h-[48px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
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
          href="/match/new"
          className="relative -mt-6 flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
          aria-label="Crear partido"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </Link>

        {navItems.slice(2).map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex flex-1 flex-col items-center justify-center transition-colors min-h-[48px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
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
            aria-label="Notificaciones"
            className="absolute -top-3 right-6 flex h-7 min-w-[28px] items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground"
          >
            {notificationsCount}
          </Link>
        )}
      </div>
    </nav>
  );
}
