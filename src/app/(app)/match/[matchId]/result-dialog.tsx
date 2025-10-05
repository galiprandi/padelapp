"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SubmitResultForm } from "../submit-result-form";
import { useToast } from "@/components/toast/use-toast";

interface ResultDialogProps {
  matchId: string;
  initialScore?: string | null;
  initialNotes?: string | null;
  triggerLabel?: string;
  sets: number;
}

export function ResultDialog({ matchId, initialScore, initialNotes, triggerLabel, sets }: ResultDialogProps) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        {triggerLabel ?? "Cargar resultado"}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-border/70 bg-card p-6 shadow-lg">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Resultado del partido</h2>
              <p className="text-sm text-muted-foreground">
                Compartí el marcador final y dejá un comentario opcional.
              </p>
            </div>

            <SubmitResultForm
              matchId={matchId}
              initialScore={initialScore}
              initialNotes={initialNotes}
              sets={sets}
              onSuccess={() => {
                showToast("Resultado enviado. Esperando confirmaciones.");
                setOpen(false);
              }}
            />

            <Button type="button" variant="ghost" className="w-full" onClick={() => setOpen(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
