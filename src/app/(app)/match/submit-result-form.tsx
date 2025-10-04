"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitMatchResultAction } from "./actions";

interface SubmitResultFormProps {
  matchId: string;
  initialScore?: string | null;
  initialNotes?: string | null;
  onSuccess?: () => void;
}

export function SubmitResultForm({ matchId, initialScore, initialNotes, onSuccess }: SubmitResultFormProps) {
  const [score, setScore] = useState(initialScore ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (score.trim().length === 0) {
      setError("Please enter the final score.");
      return;
    }

    startTransition(async () => {
      const response = await submitMatchResultAction({
        matchId,
        score: score.trim(),
        notes: notes.trim().length > 0 ? notes.trim() : null,
      });

      if (response.status === "ok") {
        setSuccessMessage("Result submitted. Waiting for other players to confirm.");
        onSuccess?.();
      } else {
        setError(response.message ?? "We could not save the result.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="match-score">Resultado</Label>
        <Input
          id="match-score"
          placeholder="Ej: 6-4, 3-6, [10-7]"
          value={score}
          onChange={(event) => setScore(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="match-notes">Notas (opcional)</Label>
        <Textarea
          id="match-notes"
          placeholder="Agregá un comentario para tus rivales."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {successMessage ? <p className="text-sm text-primary">{successMessage}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar resultado"}
      </Button>
    </form>
  );
}
