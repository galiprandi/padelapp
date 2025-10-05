"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitMatchResultAction } from "./actions";

interface SubmitResultFormProps {
  matchId: string;
  initialScore?: string | null;
  initialNotes?: string | null;
  sets: number;
  onSuccess?: () => void;
}

function parseInitialSets(score: string | null | undefined, sets: number): string[] {
  const empty = Array.from({ length: Math.max(sets, 1) }, () => "");
  if (!score) {
    return empty;
  }

  const segments = score
    .split(",")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  return empty.map((value, index) => segments[index] ?? value);
}

export function SubmitResultForm({ matchId, initialScore, initialNotes, sets, onSuccess }: SubmitResultFormProps) {
  const [setScores, setSetScores] = useState(() => parseInitialSets(initialScore, sets));
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<number | null>(null);
  const [setInputValue, setSetInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSetScores(parseInitialSets(initialScore, sets));
  }, [initialScore, sets]);

  const scorePreview = useMemo(() => {
    const trimmed = setScores.map((value) => value.trim()).filter((value) => value.length > 0);
    return trimmed.join(", ");
  }, [setScores]);

  function handleEditSet(index: number) {
    setEditingSet(index);
    setSetInputValue(setScores[index] ?? "");
    // focus next frame
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }

  function handleSaveSet() {
    if (editingSet === null) {
      return;
    }

    setSetScores((prev) => {
      const next = [...prev];
      next[editingSet] = setInputValue.trim();
      return next;
    });

    setEditingSet(null);
    setSetInputValue("");
  }

  function handleCancelEdit() {
    setEditingSet(null);
    setSetInputValue("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (editingSet !== null) {
      setError("Guardá el set que estás editando antes de enviar.");
      return;
    }

    const filledScores = setScores.map((value) => value.trim());

    if (filledScores.some((value) => value.length === 0)) {
      setError("Completá el resultado de cada set.");
      return;
    }

    const finalScore = filledScores.join(", ");

    startTransition(async () => {
      const response = await submitMatchResultAction({
        matchId,
        score: finalScore,
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
        <Label>Resultado por sets</Label>
        <div className="flex flex-wrap gap-2">
          {setScores.map((value, index) => {
            const displayValue = value.trim().length > 0 ? value.trim() : "-";

            return (
              <Button
                key={`set-${index}`}
                type="button"
                variant={value.trim().length > 0 ? "secondary" : "outline"}
                className="h-10 min-w-[72px] rounded-full px-4"
                onClick={() => handleEditSet(index)}
              >
                Set {index + 1}: {displayValue}
              </Button>
            );
          })}
        </div>

        {editingSet !== null ? (
          <div className="mt-3 space-y-2 rounded-lg border border-border/70 bg-muted/40 p-3">
            <Label htmlFor="set-score">Set {editingSet + 1}</Label>
            <Input
              id="set-score"
              ref={inputRef}
              placeholder="Ej: 6-4"
              value={setInputValue}
              onChange={(event) => setSetInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSaveSet();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit}>
                Cancelar
              </Button>
              <Button type="button" size="sm" onClick={handleSaveSet}>
                Guardar set
              </Button>
            </div>
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">Ingresá el marcador exacto de cada set (ej: 6-4, 7-5).</p>
        {scorePreview ? (
          <p className="text-sm font-medium text-foreground">Resultado final: {scorePreview}</p>
        ) : null}
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
