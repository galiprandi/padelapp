import Link from "next/link";
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
  return (
    <nav
      role="navigation"
      aria-label="Barra de navegación inferior"
      className={cn(
        "mx-auto flex w-full justify-center",
        position === "fixed" && "fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom,0px)]"
      )}
    >
      <div className="relative flex h-12 w-full items-stretch justify-evenly border-t border-border/70 bg-zinc-900">
        <Link
          href="/ranking"
          className="group relative flex flex-1 items-center justify-center transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary min-h-[48px] text-primary/70 hover:text-primary"
          aria-label="Ranking"
        >
          <Trophy className="h-6 w-6" aria-hidden="true" />
          <span className="sr-only">Ranking</span>
        </Link>
        <Link
          href="/match"
          className="group relative flex flex-1 items-center justify-center transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary min-h-[48px] text-primary/70 hover:text-primary"
          aria-label="Partidos"
        >
          <Calendar className="h-6 w-6" aria-hidden="true" />
          <span className="sr-only">Partidos</span>
        </Link>
        <Link
          href="/me"
          className="group relative flex flex-1 items-center justify-center transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary min-h-[48px] text-primary/70 hover:text-primary"
          aria-label="Perfil"
        >
          <User className="h-6 w-6" aria-hidden="true" />
          <span className="sr-only">Perfil</span>
        </Link>
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
