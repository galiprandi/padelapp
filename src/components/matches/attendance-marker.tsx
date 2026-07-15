"use client";

import { useState, useTransition } from "react";
import { Check, X, Clock, Loader2 } from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import { markAttendanceAction } from "@/app/(app)/match/actions";
import { cn } from "@/lib/utils";

type AttendanceStatus = "ATTENDED" | "LATE" | "NO_SHOW";

interface AttendancePlayer {
  id: string;
  name: string;
  image?: string;
  currentStatus: AttendanceStatus | null;
}

interface AttendanceMarkerProps {
  matchId: string;
  players: AttendancePlayer[];
  onSaved?: () => void;
}

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; icon: typeof Check; color: string; activeColor: string }
> = {
  ATTENDED: {
    label: "Presente",
    icon: Check,
    color: "text-muted-foreground",
    activeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  },
  LATE: {
    label: "Tarde",
    icon: Clock,
    color: "text-muted-foreground",
    activeColor: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  },
  NO_SHOW: {
    label: "Ausente",
    icon: X,
    color: "text-muted-foreground",
    activeColor: "bg-red-500/10 text-red-600 border-red-500/30",
  },
};

export function AttendanceMarker({
  matchId,
  players,
  onSaved,
}: AttendanceMarkerProps) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(
      players.map((p) => [
        p.id,
        (p.currentStatus as AttendanceStatus) ?? "ATTENDED",
      ]),
    ),
  );

  const handleStatusChange = (playerId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [playerId]: status }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const entries = Object.entries(statuses).map(([matchPlayerId, status]) => ({
        matchPlayerId,
        status,
      }));
      const res = await markAttendanceAction(matchId, entries);
      if (res.status === "ok") {
        showToast("Asistencia guardada");
        onSaved?.();
      } else {
        showToast(res.message || "No se pudo guardar la asistencia", {
          duration: 4000,
        });
      }
    });
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-foreground">Asistencia</h2>
        <p className="text-xs text-muted-foreground">
          Marcá quién estuvo, llegó tarde o no asistió.
        </p>
      </div>

      <div className="space-y-3">
        {players.map((player) => {
          const current = statuses[player.id] ?? "ATTENDED";
          return (
            <div
              key={player.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <PlayerAvatar
                name={player.name}
                image={player.image}
                className="h-9 w-9 shrink-0"
              />
              <span className="flex-1 text-sm font-semibold text-foreground truncate">
                {player.name}
              </span>
              <div className="flex gap-1.5 shrink-0">
                {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(
                  (status) => {
                    const config = STATUS_CONFIG[status];
                    const Icon = config.icon;
                    const isActive = current === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusChange(player.id, status)}
                        aria-label={`${config.label} - ${player.name}`}
                        aria-pressed={isActive}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                          isActive
                            ? config.activeColor
                            : "border-border bg-background text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Button
        onClick={handleSave}
        disabled={pending}
        className="w-full h-11 rounded-lg text-sm font-semibold"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Guardar asistencia"
        )}
      </Button>
    </section>
  );
}
