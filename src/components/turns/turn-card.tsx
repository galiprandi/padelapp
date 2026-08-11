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
import { type PadelContact } from "@/lib/queries";

interface TurnCardProps {
  turn: {
    id: string;
    club: string;
    date: Date | string;
    players: {
      userId?: string;
      user?: {
        id: string;
        displayName: string;
        alias: string | null;
        image: string | null;
      };
    }[];
    substitutes?: {
      userId?: string;
      user?: {
        id: string;
        displayName: string;
        alias: string | null;
        image: string | null;
      };
    }[];
    maxPlayers: number;
    status?: string;
  };
  variant?: "default" | "recommended";
  isJoined?: boolean;
  isSubstitute?: boolean;
  isCreator?: boolean;
  contacts?: PadelContact[];
}

export function TurnCard({
  turn,
  variant = "default",
  isJoined,
  isSubstitute,
  contacts,
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
    !isSubstitute;
  const canJoin =
    !isJoined &&
    !isSubstitute &&
    (turn.status === "OPEN" || canJoinAsSubstitute);

  // Urgency: turn in < 3h with open slots
  const hoursUntilTurn = mounted
    // eslint-disable-next-line react-hooks/purity -- Date.now() is intentional: computes urgency for UI display
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

  // Find which of the enrolled players are in the contacts list
  const contactIds = new Set(contacts?.map((c) => c.id));
  const contactPlayers = turn.players
    .filter((p) => p.user && contactIds.has(p.user.id))
    .map((p) => p.user?.alias ?? p.user?.displayName ?? "");

  // Format names nicely in Spanish
  const formatNamesInSpanish = (names: string[]): string => {
    if (names.length === 0) return "";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} y ${names[1]}`;
    const firsts = names.slice(0, -1).join(", ");
    const last = names[names.length - 1];
    return `${firsts} y ${last}`;
  };

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:bg-muted active:scale-[0.98]",
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
                  variant="warning"
                >
                  {hoursUntilTurn < 1
                    ? "Urgente"
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

            {mounted && contactPlayers.length > 0 && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-500 font-semibold flex items-center gap-1.5 leading-none">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="truncate">
                  {contactPlayers.length === 1
                    ? `Juega tu contacto: ${contactPlayers[0]}`
                    : `Juegan tus contactos: ${formatNamesInSpanish(contactPlayers)}`}
                </span>
              </p>
            )}
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
              shareData={{
                type: "turn",
                club: turn.club,
                date: turn.date,
              }}
              variant="default"
              size="sm"
              iconOnly={false}
              className="flex-1"
            />

            {canJoin && (
              <button
                onClick={handleQuickJoin}
                disabled={isPending}
                aria-label={`Sumarse al turno en ${turn.club}`}
                className="h-8 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : canJoinAsSubstitute ? (
                  "Suplente"
                ) : (
                  "Sumarme"
                )}
              </button>
            )}
          </div>
        )}
    </div>
  );
}
