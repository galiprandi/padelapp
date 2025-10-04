"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarPlus, Home, Sparkles, Trophy } from "lucide-react";

const items = [
  { href: "/(app)/dashboard", label: "Inicio", icon: Home },
  { href: "/(app)/turnos", label: "Turnos", icon: CalendarPlus },
  { href: "/(app)/ranking", label: "Ranking", icon: Trophy },
  { href: "/(app)/registro", label: "Partido", icon: Sparkles },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-full items-center justify-between rounded-full border border-border bg-card/90 px-4 py-2 shadow-sm backdrop-blur">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
