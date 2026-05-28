
import { Clock, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { levelOptions } from "@/lib/mock-data";

interface TurnCardProps {
  turn: {
    id: string;
    club: string;
    date: Date | string;
    players: any[];
    maxPlayers: number;
    suggestedLevel: number | string;
    status?: string;
  };
  variant?: "default" | "recommended";
}

export function TurnCard({ turn, variant = "default" }: TurnCardProps) {
  const dateObj = new Date(turn.date);

  // Pre-formatting in a way that is less likely to cause hydration mismatches
  // if this were a client component, but since we removed 'use client'
  // we are safer. Still, keeping it clean.
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString("es-ES", { month: "short" });
  const timeStr = dateObj.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isRecommended = variant === "recommended";
  const levelLabel = levelOptions.find(l => l.value === turn.suggestedLevel.toString())?.label ?? turn.suggestedLevel.toString();

  return (
    <Link href={`/t/${turn.id}`}>
      <div
        className={cn(
          "flex items-center gap-4 rounded-3xl p-4 backdrop-blur-sm border transition-all active:scale-[0.98]",
          isRecommended
            ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
            : "bg-card/50 border-border/40 hover:bg-card/80"
        )}
      >
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl px-3 py-3 text-primary min-w-[60px]",
            isRecommended ? "bg-primary/20" : "bg-primary/10"
          )}
        >
          <span className="text-[10px] font-black uppercase leading-none">
            {month}
          </span>
          <span className="text-2xl font-black leading-none mt-1">
            {day}
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-bold text-foreground">{turn.club}</p>
            {turn.status === "FULL" && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[8px] font-black uppercase tracking-widest shrink-0">
                Completo
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary/70" />
              {timeStr}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-primary/70" />
              {turn.players.length}/{turn.maxPlayers}
            </span>
            <span className="flex items-center gap-1 text-primary">
              <Trophy className="h-3.5 w-3.5" />
              {levelLabel}
            </span>
          </div>
        </div>

        {isRecommended && (
          <div className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary shrink-0 border border-primary/20">
            Unirse
          </div>
        )}
      </div>
    </Link>
  );
}
