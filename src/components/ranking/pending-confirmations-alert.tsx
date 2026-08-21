"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Calendar, AlertCircle, ChevronRight } from "lucide-react";
import { useToast } from "@/components/toast/use-toast";
import { useMounted } from "@/lib/hooks/use-mounted";
import { confirmMatchResultAction } from "@/app/(app)/match/actions";
import Link from "next/link";

interface PendingPlayer {
  id: string;
  position: number;
  displayName?: string | null;
  resultConfirmed?: boolean;
  user?: {
    id: string;
    displayName: string | null;
    alias?: string | null;
  } | null;
}

interface PendingMatch {
  id: string;
  score?: string | null;
  date?: Date | string;
  createdAt: Date | string;
  players: PendingPlayer[];
}

interface PendingConfirmationsAlertProps {
  pendingActions: PendingMatch[];
  viewerId: string;
}

export function PendingConfirmationsAlert({
  pendingActions,
  viewerId,
}: PendingConfirmationsAlertProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const mounted = useMounted();
  const [isConfirming, startTransition] = useTransition();
  const [activeConfirmingId, setActiveConfirmingId] = useState<string | null>(null);

  if (pendingActions.length === 0) return null;

  const handleConfirm = (matchId: string) => {
    setActiveConfirmingId(matchId);
    startTransition(async () => {
      try {
        const res = await confirmMatchResultAction(matchId);
        if (res.status === "ok") {
          showToast("Confirmaste el resultado. 🏆", {
            type: "success",
          });
          router.refresh();
        } else {
          showToast(res.message || "No se pudo confirmar el resultado.", {
            type: "error",
          });
        }
      } catch (err) {
        console.error("Error confirming match:", err);
        showToast("Ocurrió un error al procesar la confirmación.", {
          type: "error",
        });
      } finally {
        setActiveConfirmingId(null);
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground leading-tight">
            Confirmaciones pendientes
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tenés {pendingActions.length} {pendingActions.length === 1 ? "partido pendiente" : "partidos pendientes"}. Confirmá para actualizar el ranking.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {pendingActions.map((match) => {
          const hasScore = !!match.score;
          const matchDate = match.date ? new Date(match.date) : new Date(match.createdAt);
          const formattedDate = mounted
            ? new Intl.DateTimeFormat("es-AR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }).format(matchDate)
            : "";

          const isThisConfirming = activeConfirmingId === match.id && isConfirming;

          return (
            <div
              key={match.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 p-3"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                  <span className="tabular-nums">{formattedDate}</span>
                </div>
                {hasScore ? (
                  <p className="text-sm font-bold text-foreground">
                    Resultado cargado: <span className="text-primary tabular-nums">{match.score}</span>
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-destructive">
                    Pendiente de cargar resultado
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {hasScore ? (
                  <button
                    type="button"
                    onClick={() => handleConfirm(match.id)}
                    disabled={isConfirming}
                    aria-label={`Confirmar resultado ${match.score} para el partido del ${formattedDate}`}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                  >
                    {isThisConfirming ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Confirmar
                  </button>
                ) : (
                  <Link
                    href={`/match/${match.id}/result`}
                    prefetch={true}
                    aria-label={`Cargar resultado para el partido del ${formattedDate}`}
                    className="flex h-9 items-center justify-center gap-1 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Cargar resultado
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
                <Link
                  href={`/match/${match.id}`}
                  prefetch={true}
                  aria-label={`Ver detalle del partido del ${formattedDate}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
