"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { CalendarPlus, Home, LogOut, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/me", label: "Inicio", icon: Home },
  { href: "/turnos", label: "Turnos", icon: CalendarPlus },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/match", label: "Partido", icon: Sparkles },
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
      <button
        type="button"
        onClick={() => void signOut({ callbackUrl: "/" })}
        className="flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <LogOut className="h-5 w-5" aria-hidden />
        <span>Salir</span>
      </button>
    </nav>
  );
}
