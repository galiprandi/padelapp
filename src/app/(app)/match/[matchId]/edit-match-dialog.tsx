"use client";

import { useEffect, useState, useTransition } from "react";
import { updateMatchDetailsAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/toast/use-toast";

interface EditMatchDetailsDialogProps {
  matchId: string;
  initialClub: string | null;
  initialCourtNumber: string | null;
  initialNotes: string | null;
}

export function EditMatchDetailsDialog({ matchId, initialClub, initialCourtNumber, initialNotes }: EditMatchDetailsDialogProps) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [club, setClub] = useState(initialClub ?? "");
  const [courtNumber, setCourtNumber] = useState(initialCourtNumber ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setClub(initialClub ?? "");
      setCourtNumber(initialCourtNumber ?? "");
      setNotes(initialNotes ?? "");
      setError(null);
    }
  }, [open, initialClub, initialCourtNumber, initialNotes]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await updateMatchDetailsAction({
        matchId,
        club,
        courtNumber,
        notes,
      });

      if (response.status === "ok") {
        showToast("Partido actualizado");
        setOpen(false);
      } else {
        setError(response.message ?? "No pudimos guardar los cambios.");
      }
    });
  }

  return (
    <>
      <Button type="button" variant="ghost" onClick={() => setOpen(true)}>
        Editar detalles
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-border/70 bg-card p-6 shadow-lg">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Editar partido</h2>
              <p className="text-sm text-muted-foreground">
                Actualizá la información visible para todos los jugadores.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="edit-club">Club</Label>
                <Input
                  id="edit-club"
                  placeholder="Ej: Padel City"
                  value={club}
                  onChange={(event) => setClub(event.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-court">Número de cancha</Label>
                <Input
                  id="edit-court"
                  placeholder="Ej: 3"
                  value={courtNumber}
                  onChange={(event) => setCourtNumber(event.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notas</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Comentarios visibles para los jugadores"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  disabled={isPending}
                  rows={4}
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
