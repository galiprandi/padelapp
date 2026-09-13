"use client";

import { useState, useTransition } from "react";
import { UserMinus, UserCheck, X, Loader2 } from "lucide-react";
import {
  removePlayerAction,
  assignSubstituteAction,
} from "@/app/(app)/turnos/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast/use-toast";
import {
  getRemovePlayerAriaLabel,
  getRemovePlayerSuccessToast,
  getAssignSubstituteAriaLabel,
  getAssignSubstituteSuccessToast,
} from "@/components/turns/turn-utils";

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
        showToast(getRemovePlayerSuccessToast(playerName));
      } else {
        showToast(result.message ?? "No se pudo sacar al jugador.");
      }
      router.refresh();
    });
  };

  if (!confirming) {
    return (
      <div
        role="region"
        aria-label={`Gestión de jugador ${playerName}`}
        className="inline-flex items-center"
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setConfirming(true);
          }}
          className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted border border-transparent hover:border-border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] shadow-xs"
          aria-label={getRemovePlayerAriaLabel({ playerName })}
        >
          <UserMinus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={`Confirmación para sacar a ${playerName}`}
      tabIndex={-1}
      className="inline-flex items-center gap-1.5 focus-visible:outline-none"
      onKeyDown={(e) => {
        if (e.key === "Escape" && !isPending) {
          e.preventDefault();
          e.stopPropagation();
          setConfirming(false);
        }
      }}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleRemove();
        }}
        disabled={isPending}
        aria-busy={isPending}
        className="rounded-md px-2 py-1 text-xs font-bold text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] flex items-center gap-1 shadow-xs"
        aria-label={getRemovePlayerAriaLabel({
          playerName,
          isPending,
          isConfirming: true,
        })}
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
        className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
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
        showToast(getAssignSubstituteSuccessToast(substituteName));
      } else {
        showToast(result.message ?? "No se pudo asignar al suplente.");
      }
      router.refresh();
    });
  };

  return (
    <div
      role="region"
      aria-label={`Asignación de suplente ${substituteName}`}
      className="inline-flex items-center"
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAssign();
        }}
        disabled={isPending}
        aria-busy={isPending}
        className="rounded-md px-2.5 py-1 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] shadow-xs"
        aria-label={getAssignSubstituteAriaLabel({
          substituteName,
          isPending,
        })}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <UserCheck className="h-3.5 w-3.5" />
        )}
        {isPending ? "Asignando..." : "Asignar"}
      </button>
    </div>
  );
}
