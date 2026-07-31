"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClubInput } from "@/components/club-input";
import { updateTurnAction } from "../../actions";
import { useToast } from "@/components/toast/use-toast";
import { Loader2, Zap, Info, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const DURATION_OPTIONS = [
  { value: "60", label: "60 min" },
  { value: "90", label: "90 min" },
  { value: "120", label: "120 min" },
];

const PLAYER_OPTIONS = [
  { value: "4", label: "4 jugadores" },
  { value: "6", label: "6 jugadores" },
  { value: "8", label: "8 jugadores" },
  { value: "10", label: "10 jugadores" },
];

interface EditTurnFormProps {
  id: string;
  initialTurn: {
    club: string;
    date: string;
    time: string;
    duration: string;
    maxPlayers: string;
    notes: string;
  };
}

export function EditTurnForm({ id, initialTurn }: EditTurnFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    club: initialTurn.club,
    date: initialTurn.date,
    time: initialTurn.time,
    duration: initialTurn.duration,
    maxPlayers: initialTurn.maxPlayers,
    notes: initialTurn.notes,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.club || !formData.date || !formData.time) {
      showToast("Completá club, fecha y hora");
      return;
    }

    startTransition(async () => {
      const combinedDate = new Date(`${formData.date}T${formData.time}`);

      const response = await updateTurnAction(id, {
        club: formData.club,
        date: combinedDate.toISOString(),
        duration: parseInt(formData.duration),
        maxPlayers: parseInt(formData.maxPlayers),
        notes: formData.notes,
      });

      if (response.status === "ok") {
        showToast("Turno actualizado con éxito");
        router.push(`/t/${id}`);
      } else {
        showToast(response.message || "Error al actualizar el turno");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Detalles del partido</h2>
          </div>
        </div>
        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="club"
              requiredIndicator="*"
              className="text-sm font-semibold"
            >
              Club y cancha
            </Label>
            <ClubInput
              id="club"
              placeholder="Ej: Padel City · Cancha 3"
              value={formData.club}
              onChange={(value) => setFormData({ ...formData, club: value })}
              required
              aria-required="true"
              className="h-10 rounded-lg animate-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="date"
                requiredIndicator="*"
                className="text-sm font-semibold"
              >
                Fecha
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                aria-required="true"
                className="h-10 rounded-lg animate-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="time"
                requiredIndicator="*"
                className="text-sm font-semibold"
              >
                Hora
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                aria-required="true"
                className="h-10 rounded-lg animate-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label
              id="duration-label"
              className="text-sm font-semibold flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Duración del turno
            </Label>
            <div
              role="radiogroup"
              aria-labelledby="duration-label"
              className="grid grid-cols-3 gap-2"
            >
              {DURATION_OPTIONS.map((option) => {
                const isSelected = formData.duration === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setFormData({ ...formData, duration: option.value })}
                    className={cn(
                      "flex items-center justify-center h-12 rounded-lg border text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground shadow-sm font-semibold"
                        : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label
              id="players-label"
              className="text-sm font-semibold flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Cupos totales
            </Label>
            <div
              role="radiogroup"
              aria-labelledby="players-label"
              className="grid grid-cols-2 gap-2"
            >
              {PLAYER_OPTIONS.map((option) => {
                const isSelected = formData.maxPlayers === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setFormData({ ...formData, maxPlayers: option.value })}
                    className={cn(
                      "flex items-center justify-between px-4 h-12 rounded-lg border text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground shadow-sm font-semibold"
                        : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes" className="text-sm font-semibold flex items-center gap-2">
              <Info className="h-4 w-4" />
              Notas adicionales
            </Label>
            <Textarea
              id="notes"
              placeholder="Ej: Traer pelotas nuevas..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-[100px] rounded-lg resize-none animate-none"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base font-bold rounded-lg transition-all active:scale-[0.98]"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Actualizando...
          </>
        ) : (
          "Guardar cambios"
        )}
      </Button>
    </form>
  );
}
