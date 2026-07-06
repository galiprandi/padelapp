"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { levelOptions } from "@/lib/mock-data";
import { createTurnAction } from "../actions";
import { useToast } from "@/components/toast/use-toast";
import { Loader2, Check } from "lucide-react";
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

export default function NewTurnPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    club: "",
    date: "",
    time: "",
    duration: "90",
    maxPlayers: "4",
    suggestedLevel: "6",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.club || !formData.date || !formData.time) {
      showToast("Completá club, fecha y hora");
      return;
    }

    startTransition(async () => {
      const combinedDate = new Date(`${formData.date}T${formData.time}`);

      const response = await createTurnAction({
        club: formData.club,
        date: combinedDate.toISOString(),
        duration: parseInt(formData.duration),
        maxPlayers: parseInt(formData.maxPlayers),
        suggestedLevel: parseInt(formData.suggestedLevel),
        notes: formData.notes,
      });

      if (response.status === "ok") {
        showToast("Turno creado con éxito");
        router.push(`/t/${response.turnId}`);
      } else {
        showToast(response.message || "Error al crear el turno");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Nuevo turno</h1>
        <p className="text-sm text-muted-foreground">
          Configurá cancha, nivel y cupos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="club"
            requiredIndicator="*"
            className="text-sm font-semibold text-foreground"
          >
            Club y cancha
          </Label>
          <Input
            id="club"
            placeholder="Ej: Padel City · Cancha 3"
            value={formData.club}
            onChange={(e) => setFormData({ ...formData, club: e.target.value })}
            required
            aria-required="true"
            className="h-12"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label
              htmlFor="date"
              requiredIndicator="*"
              className="text-sm font-semibold text-foreground"
            >
              Fecha
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              aria-required="true"
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="time"
              requiredIndicator="*"
              className="text-sm font-semibold text-foreground"
            >
              Hora
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              required
              aria-required="true"
              className="h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label id="duration-label" className="text-sm font-semibold text-foreground">
            Duración
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
                  onClick={() =>
                    setFormData({ ...formData, duration: option.value })
                  }
                  className={cn(
                    "flex items-center justify-center py-2.5 rounded-lg border text-sm font-medium transition-colors",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label id="players-label" className="text-sm font-semibold text-foreground">
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
                  onClick={() =>
                    setFormData({ ...formData, maxPlayers: option.value })
                  }
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label id="level-label" className="text-sm font-semibold text-foreground">
            Nivel sugerido
          </Label>
          <div
            role="radiogroup"
            aria-labelledby="level-label"
            className="grid grid-cols-2 gap-2"
          >
            {levelOptions.map((option) => {
              const isSelected = formData.suggestedLevel === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() =>
                    setFormData({ ...formData, suggestedLevel: option.value })
                  }
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="notes"
            className="text-sm font-semibold text-foreground"
          >
            Notas adicionales
          </Label>
          <Textarea
            id="notes"
            placeholder="Ej: Traer pelotas nuevas. Punto de encuentro en recepción."
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="min-h-[100px] resize-none"
          />
        </div>

        <Button type="submit" className="w-full h-12" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear turno y compartir link"
          )}
        </Button>
      </form>
    </div>
  );
}
