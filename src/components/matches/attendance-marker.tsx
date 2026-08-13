"use client";

import { useState, useTransition, useEffect } from "react";
import { Check, X, Clock, Loader2 } from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import {
  markAttendanceAction,
  getMatchFeedbacksAction,
  savePlayerFeedbackAction,
} from "@/app/(app)/match/actions";
import { cn } from "@/lib/utils";

type AttendanceStatus = "ATTENDED" | "LATE" | "NO_SHOW";

interface AttendancePlayer {
  id: string;
  userId: string;
  name: string;
  image?: string;
  currentStatus: AttendanceStatus | null;
}

interface AttendanceMarkerProps {
  matchId: string;
  players: AttendancePlayer[];
  viewerId?: string;
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
    label: "No asistió",
    icon: X,
    color: "text-muted-foreground",
    activeColor: "bg-red-500/10 text-red-600 border-red-500/30",
  },
};

export function AttendanceMarker({
  matchId,
  players,
  viewerId,
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

  const [feedbacks, setFeedbacks] = useState<Record<string, "STRONGER" | "WEAKER" | null>>({});

  useEffect(() => {
    getMatchFeedbacksAction(matchId).then((res) => {
      if (res.status === "ok" && res.feedbacks) {
        setFeedbacks(
          Object.fromEntries(
            res.feedbacks.map((f) => [f.playerId, f.feedback]),
          ),
        );
      }
    });
  }, [matchId]);

  const handleStatusChange = (playerId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [playerId]: status }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const entries = Object.entries(statuses).map(([matchPlayerId, status]) => ({
        matchPlayerId,
        status,
      }));
      // 1. Save attendance
      const res = await markAttendanceAction(matchId, entries);
      if (res.status === "ok") {
        // 2. Save feedback
        const feedbackEntries = Object.entries(feedbacks).map(([playerId, feedback]) => ({
          playerId,
          feedback,
        }));
        if (feedbackEntries.length > 0) {
          const fbRes = await savePlayerFeedbackAction({
            matchId,
            feedbacks: feedbackEntries,
          });
          if (fbRes.status !== "ok") {
            showToast("Guardaste la asistencia, pero no pudimos registrar tu feedback.", {
              duration: 4000,
            });
            onSaved?.();
            return;
          }
        }
        showToast("Guardaste la asistencia y el feedback.");
        onSaved?.();
      } else {
        showToast(res.message || "No pudimos guardar la asistencia.", {
          duration: 4000,
        });
      }
    });
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-foreground">Asistencia y Feedback de Nivel</h2>
        <p className="text-xs text-muted-foreground">
          Confirmá la asistencia y calificá sutilmente si algún invitado jugó a un nivel diferente.
        </p>
      </div>

      <div className="space-y-3">
        {players.map((player) => {
          const current = statuses[player.id] ?? "ATTENDED";
          return (
            <div
              key={player.id}
              className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-3"
            >
              {/* Row 1: Player Info & Attendance status */}
              <div className="flex items-center gap-3">
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
                            "flex h-8 w-8 items-center justify-center rounded-lg border transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
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

              {/* Row 2: Sutil level feedback (only for other players) */}
              {viewerId && player.userId !== viewerId && (
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground font-medium">
                    Nivel vs. el grupo (opcional):
                  </span>
                  <div className="flex gap-1.5 shrink-0" role="radiogroup" aria-label={`Nivel de ${player.name} comparado con el grupo`}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={feedbacks[player.userId] === "STRONGER"}
                      onClick={() => {
                        setFeedbacks((prev) => ({
                          ...prev,
                          [player.userId]:
                            prev[player.userId] === "STRONGER"
                              ? null
                              : "STRONGER",
                        }));
                      }}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                        feedbacks[player.userId] === "STRONGER"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : "border-border bg-background text-muted-foreground hover:bg-muted",
                      )}
                    >
                      Más fuerte 💪
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={feedbacks[player.userId] === "WEAKER"}
                      onClick={() => {
                        setFeedbacks((prev) => ({
                          ...prev,
                          [player.userId]:
                            prev[player.userId] === "WEAKER" ? null : "WEAKER",
                        }));
                      }}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                        feedbacks[player.userId] === "WEAKER"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "border-border bg-background text-muted-foreground hover:bg-muted",
                      )}
                    >
                      Más flojo 📉
                    </button>
                  </div>
                </div>
              )}
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
          "Guardar asistencia y feedback"
        )}
      </Button>
    </section>
  );
}
