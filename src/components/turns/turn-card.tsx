"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn, isToday, isTomorrow } from "@/lib/utils";
import { levelOptions } from "@/lib/mock-data";
import { joinTurnAction } from "@/app/(app)/turnos/actions";

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
  isJoined?: boolean;
  isCreator?: boolean;
}

export function TurnCard({
  turn,
  variant = "default",
  isJoined,
  isCreator,
}: TurnCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const dateObj = new Date(turn.date);

  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString("es-ES", { month: "short" });
  const timeStr = dateObj.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isRecommended = variant === "recommended";
  const levelLabel =
    levelOptions.find((l) => l.value === turn.suggestedLevel.toString())
      ?.label ?? turn.suggestedLevel.toString();

  const isTodayDate = isToday(dateObj);
  const isTomorrowDate = isTomorrow(dateObj);

  const canJoin = !isJoined && turn.status === "OPEN";

  const handleQuickJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const res = await joinTurnAction(turn.id);
      if (res.status === "ok") {
        router.refresh();
      }
    });
  };

  return (
    <Link href={`/t/${turn.id}`}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/30",
          isRecommended && "border-primary/20 bg-primary/5",
          isPending && "opacity-70 pointer-events-none",
        )}
      >
        {/* Date */}
        <div className="flex flex-col items-center justify-center rounded-lg bg-primary/10 px-2.5 py-2 min-w-[52px]">
          <span className="text-[10px] font-medium uppercase text-primary">
            {month}
          </span>
          <span className="text-xl font-bold text-primary leading-none mt-0.5">
            {day}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {turn.club}
            </p>
            {isTodayDate && (
              <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                Hoy
              </span>
            )}
            {isTomorrowDate && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                Mañana
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeStr}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {turn.players.length}/{turn.maxPlayers}
            </span>
            <span className="text-primary">{levelLabel}</span>
          </div>
        </div>

        {/* Status / Action */}
        {canJoin ? (
          <button
            onClick={handleQuickJoin}
            disabled={isPending}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shrink-0 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[72px]"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Unirse"
            )}
          </button>
        ) : isJoined ? (
          <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary shrink-0">
            Inscripto
          </span>
        ) : turn.status === "FULL" ? (
          <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground shrink-0">
            Completo
          </span>
        ) : null}
      </div>
    </Link>
  );
}
