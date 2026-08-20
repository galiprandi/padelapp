"use client";

import { useState, useTransition } from "react";
import { UserMinus, UserCheck, X, Loader2 } from "lucide-react";
import {
  removePlayerAction,
  assignSubstituteAction,
} from "@/app/(app)/turnos/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast/use-toast";

export function RemovePlayerButton({
  turnId,
  playerUserId,
  playerName,
}: {
  turnId: string;
  playerUserId: string;
  playerName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removePlayerAction(turnId, playerUserId);
      if (result.status === "ok") {
        showToast(`Sacaste a ${playerName} del turno.`);
      } else {
        showToast(result.message ?? "No se pudo sacar al jugador.");
      }
      router.refresh();
    });
  };

  if (!confirming) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setConfirming(true);
        }}
        className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label={`Sacar a ${playerName}`}
      >
        <UserMinus className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleRemove();
        }}
        disabled={isPending}
        className="rounded-md px-2 py-1 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] flex items-center gap-1"
        aria-label={`Confirmar sacar a ${playerName}`}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          "Sacar"
        )}
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setConfirming(false);
        }}
        disabled={isPending}
        className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label="Cancelar sacar jugador"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function AssignSubstituteButton({
  turnId,
  substituteUserId,
  substituteName,
}: {
  turnId: string;
  substituteUserId: string;
  substituteName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  const handleAssign = () => {
    startTransition(async () => {
      const result = await assignSubstituteAction(turnId, substituteUserId);
      if (result.status === "ok") {
        showToast(`Promoviste a ${substituteName} a titular.`);
      } else {
        showToast(result.message ?? "No se pudo asignar al suplente.");
      }
      router.refresh();
    });
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleAssign();
      }}
      disabled={isPending}
      className="rounded-md px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-all disabled:opacity-50 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
      aria-label={`Asignar a ${substituteName}`}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <UserCheck className="h-3.5 w-3.5" />
      )}
      {isPending ? "Asignando..." : "Asignar"}
    </button>
  );
}
