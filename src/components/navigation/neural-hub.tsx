"use client";

import { useState, useEffect } from "react";
import Link from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import {
  Trophy,
  Calendar,
  User,
  CalendarDays,
  Bell,
  X,
  LayoutGrid,
  Zap,
  Activity,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NeuralHubProps {
  notificationsCount?: number;
}

export function NeuralHub({ notificationsCount = 0 }: NeuralHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close hub when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navItems = [
    { href: "/turnos", icon: CalendarDays, label: "Agenda", desc: "Turnos abiertos" },
    { href: "/ranking", icon: Trophy, label: "Stats", desc: "Global Ranking" },
    { href: "/match", icon: History, label: "History", desc: "Tus partidos" },
    { href: "/me", icon: User, label: "Profile", desc: "Ajustes y nivel" },
    { href: "/notifications", icon: Bell, label: "Alerts", desc: "Acciones pendientes", badge: notificationsCount },
  ];

  return (
    <>
      {/* HUD OVERLAY */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-6 transition-all duration-500",
          isOpen ? "visible opacity-100 backdrop-blur-3xl" : "invisible opacity-0 backdrop-blur-none"
        )}
      >
        <div className="absolute inset-0 bg-zinc-950/80" onClick={() => setIsOpen(false)} />

        {/* Tech Grid Background */}
        <div className="pointer-events-none absolute inset-0 opacity-10"
             style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

        <div className={cn(
          "relative w-full max-w-sm space-y-8 transition-all duration-500 transform",
          isOpen ? "translate-y-0 scale-100" : "translate-y-12 scale-95"
        )}>
          {/* HUD Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Neural Interface</p>
              <h2 className="text-2xl font-black text-white">COMMAND HUB</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-all active:scale-90"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Nav Grid */}
          <div className="grid grid-cols-1 gap-3">
            {navItems.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "group relative flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300 text-left w-full",
                    isActive
                      ? "border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                      : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  )}
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                    isActive ? "bg-primary text-white" : "bg-white/5 text-white/40 group-hover:text-white"
                  )}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className={cn(
                      "text-sm font-black uppercase tracking-widest transition-colors",
                      isActive ? "text-white" : "text-white/60 group-hover:text-white"
                    )}>
                      {item.label}
                    </h3>
                    <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">{item.desc}</p>
                  </div>
                  {item.badge ? (
                    <div className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-black text-accent-foreground shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]">
                      {item.badge}
                    </div>
                  ) : (
                    <Zap className={cn(
                      "h-4 w-4 transition-all duration-500",
                      isActive ? "text-primary opacity-100" : "text-white/10 opacity-0 group-hover:opacity-40"
                    )} />
                  )}

                  {/* HUD Corner Decorator */}
                  <div className="absolute right-0 top-0 h-4 w-4 border-r border-t border-white/10" />
                  <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-white/10" />
                </button>
              );
            })}
          </div>

          {/* HUD Footer Decorator */}
          <div className="flex items-center gap-4 opacity-20">
            <div className="h-[1px] flex-1 bg-white/50" />
            <Activity className="h-4 w-4 text-white" />
            <div className="h-[1px] flex-1 bg-white/50" />
          </div>
        </div>
      </div>

      {/* FLOATING TRIGGER BUTTON */}
      <div className="fixed bottom-8 right-8 z-[60] flex items-center justify-center">
        {/* Notification Pulse */}
        {notificationsCount > 0 && !isOpen && (
          <div className="absolute -inset-2 rounded-full bg-accent/20 animate-ping" />
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "group relative flex h-16 w-16 items-center justify-center rounded-[1.5rem] border transition-all duration-500 active:scale-90",
            isOpen
              ? "border-white/20 bg-zinc-900 text-white rotate-180"
              : "border-primary/50 bg-primary/20 text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:scale-110"
          )}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú de comandos"}
        >
          {isOpen ? (
            <X className="h-8 w-8" />
          ) : (
            <>
              <LayoutGrid className="h-8 w-8" />
              {notificationsCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-black text-accent-foreground shadow-lg">
                  {notificationsCount}
                </span>
              )}
            </>
          )}

          {/* Inner Glow */}
          <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-tr from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </div>
    </>
  );
}
