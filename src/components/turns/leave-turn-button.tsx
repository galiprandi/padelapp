"use client";

import { useState } from "react";
import { LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share/share-button";
import { createMagicLink } from "@/lib/magic-link";
import { leaveTurnAction } from "@/app/(app)/turnos/actions";
import { useRouter } from "next/navigation";

interface LeaveTurnButtonProps {
  turnId: string;
  club: string;
  wasFull?: boolean;
}

export function LeaveTurnButton({
  turnId,
  club,
  wasFull,
}: LeaveTurnButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const router = useRouter();

  const handleLeave = async () => {
    setLeaving(true);
    await leaveTurnAction(turnId);
    router.refresh();
  };

  if (!confirming) {
    return (
      <Button
        onClick={() => setConfirming(true)}
        variant="ghost"
        className="w-full h-10 rounded-lg text-xs font-bold text-destructive"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Bajarme del turno
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {wasFull && (
        <div className="rounded-lg border border-border bg-muted p-3 flex flex-col gap-2">
          <p className="text-xs text-muted-foreground text-center">
            ¿No podés venir? Compartí el link para que alguien ocupe tu lugar:
          </p>
          <ShareButton
            title="Sumate al Turno"
            text={`¡Se liberó un cupo en ${club}!`}
            url={createMagicLink({ resource: "turn", identifier: turnId }).url}
            variant="outline"
            className="w-full h-10 rounded-lg text-xs font-bold"
          />
        </div>
      )}
      <div className="flex gap-2">
        <Button
          onClick={() => setConfirming(false)}
          variant="outline"
          className="flex-1 h-10 rounded-lg text-xs font-bold"
          disabled={leaving}
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button
          onClick={handleLeave}
          variant="ghost"
          className="flex-1 h-10 rounded-lg text-xs font-bold text-destructive border border-destructive/30 hover:bg-destructive/10"
          disabled={leaving}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Confirmar baja
        </Button>
      </div>
    </div>
  );
}
