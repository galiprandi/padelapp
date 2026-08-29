"use client";

import { useState, useTransition } from "react";
import { LogOut, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share/share-button";
import { createMagicLink } from "@/lib/magic-link";
import { leaveTurnAction } from "@/app/(app)/turnos/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast/use-toast";

interface LeaveTurnButtonProps {
  turnId: string;
  club: string;
  wasFull?: boolean;
  isCreator?: boolean;
  date: Date | string;
}

export function LeaveTurnButton({
  turnId,
  club,
  wasFull,
  isCreator = false,
  date,
}: LeaveTurnButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  const handleLeave = () => {
    startTransition(async () => {
      const result = await leaveTurnAction(turnId);
      if (result.status === "ok") {
        showToast("Te bajaste del turno.");
      } else {
        showToast(result.message ?? "No se pudo bajar del turno.");
      }
      router.refresh();
    });
  };

  const turnDate = new Date(date);
  // eslint-disable-next-line react-hooks/purity -- Date.now() is intentional: computes time-until-turn for UI display
  const hoursUntilTurn = (turnDate.getTime() - Date.now()) / (1000 * 60 * 60);
  const isLateLeave = hoursUntilTurn < 2 && hoursUntilTurn >= 0 && !isCreator;

  if (!confirming) {
    return (
      <Button
        onClick={() => setConfirming(true)}
        variant="ghost"
        className="w-full h-10 rounded-lg text-xs font-bold text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all"
        aria-label="Bajarme del turno"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Bajarme del turno
      </Button>
    );
  }

  return (
    <div
      className="flex flex-col gap-2"
      onKeyDown={(e) => {
        if (e.key === "Escape" && !isPending) {
          setConfirming(false);
        }
      }}
    >
      {isLateLeave && (
        <div className="rounded-lg border border-destructive bg-card p-3 flex flex-col gap-1.5 text-left">
          <p className="text-xs font-bold text-destructive flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
            Baja tardía detectada
          </p>
          <p className="text-xs text-muted-foreground">
            Falta menos de 2 horas para el turno. Si te bajás ahora, tu <strong className="text-foreground">reputación de asistencia bajará un 5%</strong>.
          </p>
        </div>
      )}
      {wasFull && (
        <div className="rounded-lg border border-border bg-muted p-3 flex flex-col gap-2">
          <p className="text-xs text-muted-foreground text-center">
            ¿No podés venir? Compartí el link para que alguien ocupe tu lugar:
          </p>
          <ShareButton
            title="Sumate al Turno"
            text={`Se liberó un cupo en ${club}`}
            url={createMagicLink({ resource: "turn", identifier: turnId }).url}
            variant="outline"
            className="w-full h-10 rounded-lg text-xs font-bold active:scale-[0.98] transition-all"
          />
        </div>
      )}
      <div className="flex gap-2">
        <Button
          onClick={() => setConfirming(false)}
          variant="outline"
          className="flex-1 h-10 rounded-lg text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all"
          disabled={isPending}
          aria-label="Cancelar baja"
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button
          onClick={handleLeave}
          variant="ghost"
          className="flex-1 h-10 rounded-lg text-xs font-bold text-destructive border border-destructive/30 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all"
          disabled={isPending}
          aria-busy={isPending}
          aria-label={
            isPending ? "Procesando baja del turno..." : "Confirmar baja del turno"
          }
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          {isPending ? "Bajando..." : "Confirmar baja"}
        </Button>
      </div>
    </div>
  );
}
