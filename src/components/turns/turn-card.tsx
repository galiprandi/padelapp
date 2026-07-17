"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn, isToday, isTomorrow } from "@/lib/utils";
import { levelOptions } from "@/lib/mock-data";
import { joinTurnAction } from "@/app/(app)/turnos/actions";
import { ShareButton } from "@/components/share/share-button";
import { OpenToNetworkButton } from "@/components/turns/open-to-network-button";
import { createMagicLink } from "@/lib/magic-link";
import { LocalDay, LocalMonth, LocalTime } from "@/components/ui/local-date";
import { Badge } from "@/components/ui/badge";
import { useMounted } from "@/lib/hooks/use-mounted";

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
}: TurnCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const mounted = useMounted();
  const dateObj = new Date(turn.date);

  const isRecommended = variant === "recommended";
  const levelLabel =
    levelOptions.find((l) => l.value === turn.suggestedLevel.toString())
      ?.label ?? turn.suggestedLevel.toString();

  // Only compute date-relative labels after mount to avoid hydration
  // mismatch (server uses UTC, client uses local timezone).
  const isTodayDate = mounted && isToday(dateObj);
  const isTomorrowDate = mounted && isTomorrow(dateObj);

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
          "flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50",
          isRecommended && "border-primary bg-primary/5",
          isPending && "opacity-70 pointer-events-none",
        )}
      >
        {/* Date */}
        <div className="flex flex-col items-center justify-center rounded-lg bg-muted px-2.5 py-1.5 min-w-[56px] h-14">
          <span className="text-xs font-bold text-muted-foreground leading-none">
            <LocalMonth date={turn.date} />
          </span>
          <span className="text-xl font-bold text-foreground leading-none mt-1 tabular-nums">
            <LocalDay date={turn.date} />
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {turn.club}
            </p>
            {isTodayDate && (
              <Badge variant="success">Hoy</Badge>
            )}
            {isTomorrowDate && (
              <Badge variant="default">Mañana</Badge>
            )}
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <LocalTime date={turn.date} />
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {turn.players.length}/{turn.maxPlayers}
            </span>
            <span className="text-primary font-semibold">{levelLabel}</span>
          </div>
        </div>

        {/* Status / Action */}
        <div className="flex items-center gap-2 shrink-0">
          {isJoined && turn.players.length < turn.maxPlayers && (
            <OpenToNetworkButton
              turnId={turn.id}
              club={turn.club}
              variant="outline"
              size="icon"
              iconOnly
              showText={false}
              label="Notificar red"
              className="h-10 w-10"
            />
          )}

          <ShareButton
            url={createMagicLink({ resource: "turn", identifier: turn.id }).url}
            title="Sumate al Turno"
            text={`¡Sumate a mi turno de pádel en ${turn.club}!`}
            variant="ghost"
            size="icon"
            iconOnly
            className="h-10 w-10 rounded-lg text-muted-foreground hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
            }}
          />

          {canJoin ? (
            <button
              onClick={handleQuickJoin}
              disabled={isPending}
              aria-label={`Unirse al turno en ${turn.club}`}
              className="h-10 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Unirse"
              )}
            </button>
          ) : isJoined ? (
            <Badge variant="primary">Inscripto</Badge>
          ) : turn.status === "FULL" ? (
            <Badge variant="default">Completo</Badge>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
