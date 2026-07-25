"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn, isToday, isTomorrow } from "@/lib/utils";
import {
  joinTurnAction,
  joinSubstituteAction,
} from "@/app/(app)/turnos/actions";
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
    substitutes?: any[];
    maxPlayers: number;
    suggestedLevel: number | string;
    status?: string;
  };
  variant?: "default" | "recommended";
  isJoined?: boolean;
  isSubstitute?: boolean;
  isCreator?: boolean;
}

export function TurnCard({
  turn,
  variant = "default",
  isJoined,
  isSubstitute,
}: TurnCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const mounted = useMounted();
  const dateObj = new Date(turn.date);

  const isRecommended = variant === "recommended";

  // Only compute date-relative labels after mount to avoid hydration
  // mismatch (server uses UTC, client uses local timezone).
  const isTodayDate = mounted && isToday(dateObj);
  const isTomorrowDate = mounted && isTomorrow(dateObj);

  const isFull = turn.players.length >= turn.maxPlayers;
  const canJoinAsSubstitute =
    isFull &&
    !isJoined &&
    !isSubstitute &&
    (turn.substitutes?.length ?? 0) < turn.maxPlayers;
  const canJoin =
    !isJoined &&
    !isSubstitute &&
    (turn.status === "OPEN" || canJoinAsSubstitute);

  // Urgency: turn in < 3h with open slots
  const hoursUntilTurn = mounted
    ? (dateObj.getTime() - Date.now()) / (1000 * 60 * 60)
    : 999;
  const isUrgent =
    mounted && hoursUntilTurn < 3 && hoursUntilTurn >= 0 && !isFull;

  const handleQuickJoin = () => {
    startTransition(async () => {
      const res = canJoinAsSubstitute
        ? await joinSubstituteAction(turn.id)
        : await joinTurnAction(turn.id);
      if (res.status === "ok") {
        router.refresh();
      }
    });
  };

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50",
        isRecommended && "border-primary bg-primary/5",
        isPending && "opacity-70 pointer-events-none",
      )}
    >
      <Link
        href={`/t/${turn.id}`}
        className="absolute inset-0 rounded-xl"
        aria-label={`Ver turno en ${turn.club}`}
      />
        <div className="flex items-center gap-3">
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
              {isTodayDate && <Badge variant="success">Hoy</Badge>}
              {isTomorrowDate && <Badge variant="default">Mañana</Badge>}
              {isUrgent && (
                <Badge
                  variant="default"
                  className="bg-amber-500/20 text-amber-600 border-amber-500/30"
                >
                  {hoursUntilTurn < 1
                    ? "¡Urgente!"
                    : `En ${Math.round(hoursUntilTurn)}h`}
                </Badge>
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
                {turn.substitutes && turn.substitutes.length > 0 && (
                  <span className="text-muted-foreground/70">
                    (+{turn.substitutes.length} supl
                    {turn.substitutes.length === 1 ? "" : "es"})
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div className="shrink-0">
            {canJoin ? null : isSubstitute ? (
              <Badge variant="default">Suplente</Badge>
            ) : isJoined ? (
              <Badge variant="primary">Inscripto</Badge>
            ) : turn.status === "FULL" ? (
              <Badge variant="default">Completo</Badge>
            ) : null}
          </div>
        </div>

        {/* Actions row */}
        {(isJoined || canJoin) && (
          <div className="relative z-10 flex items-stretch gap-2">
            {isJoined && turn.players.length < turn.maxPlayers && (
              <div className="flex-1">
                <OpenToNetworkButton
                  turnId={turn.id}
                  club={turn.club}
                  variant="outline"
                  size="sm"
                  showText={false}
                  label="Salvar turno"
                  iconOnly={false}
                />
              </div>
            )}

            <ShareButton
              url={createMagicLink({ resource: "turn", identifier: turn.id }).url}
              title="Sumate al Turno"
              text={`¡Sumate a mi turno de pádel en ${turn.club}!`}
              variant="default"
              size="sm"
              iconOnly={false}
              className="flex-1"
            />

            {canJoin && (
              <button
                onClick={handleQuickJoin}
                disabled={isPending}
                aria-label={`Unirse al turno en ${turn.club}`}
                className="h-8 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : canJoinAsSubstitute ? (
                  "Suplente"
                ) : (
                  "Unirse"
                )}
              </button>
            )}
          </div>
        )}
    </div>
  );
}
