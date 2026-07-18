"use client";

import { useState } from "react";
import { UserMinus, UserCheck, X } from "lucide-react";
import {
  removePlayerAction,
  assignSubstituteAction,
} from "@/app/(app)/turnos/actions";
import { useRouter } from "next/navigation";

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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    setLoading(true);
    await removePlayerAction(turnId, playerUserId);
    router.refresh();
  };

  if (!confirming) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setConfirming(true);
        }}
        className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        aria-label={`Remover a ${playerName}`}
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
        disabled={loading}
        className="rounded-md px-2 py-1 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "Sacar"}
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setConfirming(false);
        }}
        disabled={loading}
        className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAssign = async () => {
    setLoading(true);
    await assignSubstituteAction(turnId, substituteUserId);
    router.refresh();
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleAssign();
      }}
      disabled={loading}
      className="rounded-md px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center gap-1"
      aria-label={`Asignar a ${substituteName}`}
    >
      <UserCheck className="h-3.5 w-3.5" />
      {loading ? "..." : "Asignar"}
    </button>
  );
}
