"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Calendar, User } from "lucide-react";
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
    { href: "/ranking", icon: Trophy, label: "Ranking" },
    { href: "/turnos", icon: Calendar, label: "Turnos" },
    { href: "/match", icon: Calendar, label: "Partidos" },
    { href: "/me", icon: User, label: "Perfil" },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Barra de navegación inferior"
      className={cn(
        "mx-auto flex w-full justify-center",
        position === "fixed" && "fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom,0px)]"
      )}
    >
      <div className="relative flex h-14 w-full items-stretch justify-evenly border-t border-border/70 bg-zinc-900">
        {navItems.map((item) => {
          // Check if active: exact match or starts with segment (for subpages)
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex flex-1 flex-col items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary min-h-[48px]",
                isActive ? "text-primary" : "text-white/50 hover:text-white/70"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator bar at the top */}
              {isActive && (
                <span className="absolute top-0 h-0.5 w-10 rounded-b-full bg-primary animate-in fade-in zoom-in duration-300" />
              )}

              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-105"
                )}
                aria-hidden="true"
              />
              <span className={cn(
                "mt-1 text-[10px] font-bold tracking-tight transition-opacity duration-200",
                isActive ? "opacity-100" : "opacity-70"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {notificationsCount > 0 && (
          <Link
            href={notificationsHref}
            aria-label="Notificaciones"
            className="absolute -top-3 right-4 flex h-8 min-w-[32px] items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground shadow transition-transform duration-150 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span>{notificationsCount}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
