"use client";

import { useState, useTransition, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { levelOptions } from "@/lib/mock-data";
import { getTurnByIdAction, updateTurnAction } from "../../actions";
import { useToast } from "@/components/toast/use-toast";
import { Loader2, Zap, Info, Clock, Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";

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

interface EditTurnPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTurnPage({ params }: EditTurnPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    club: "",
    date: "",
    time: "",
    duration: "90",
    maxPlayers: "4",
    suggestedLevel: "6",
    notes: "",
  });

  useEffect(() => {
    async function loadTurn() {
      const response = await getTurnByIdAction(id);
      if (response.status === "ok" && response.turn) {
        const turn = response.turn;
        const turnDate = new Date(turn.date);
        setFormData({
          club: turn.club,
          date: turnDate.toISOString().split("T")[0],
          time: turnDate.toTimeString().slice(0, 5),
          duration: turn.duration.toString(),
          maxPlayers: turn.maxPlayers.toString(),
          suggestedLevel: turn.suggestedLevel.toString(),
          notes: turn.notes || "",
        });
      } else {
        showToast("Error al cargar el turno");
        router.push("/turnos");
      }
      setIsLoading(false);
    }
    loadTurn();
  }, [id, router, showToast]);

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
        suggestedLevel: parseInt(formData.suggestedLevel),
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href={`/t/${id}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
          aria-label="Volver"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Editar turno</h1>
          <p className="text-sm text-muted-foreground">Modificá los detalles de tu turno.</p>
        </div>
      </div>

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
              <Input
                id="club"
                placeholder="Ej: Padel City · Cancha 3"
                value={formData.club}
                onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                required
                aria-required="true"
                className="h-10 rounded-lg"
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
                  className="h-10 rounded-lg"
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
                  className="h-10 rounded-lg"
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
                        "flex items-center justify-center h-10 rounded-lg border text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
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
                        "flex items-center justify-between px-4 h-10 rounded-lg border text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
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

            <div className="flex flex-col gap-3">
              <Label
                id="level-label"
                className="text-sm font-semibold"
              >
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
                      onClick={() => setFormData({ ...formData, suggestedLevel: option.value })}
                      className={cn(
                        "flex items-center justify-between px-4 h-10 rounded-lg border text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {session?.user?.level !== undefined && (() => {
                const userLevel = session.user.level;
                const suggestedLevel = parseInt(formData.suggestedLevel, 10);
                const levelDiff = Math.abs(userLevel - suggestedLevel);

                if (levelDiff <= 1) return null;

                // In padel, level 1 is highest and level 8 is beginner.
                // So a higher level number means a lower skill level.
                const isUserWeakerThanSuggested = userLevel > suggestedLevel;

                return (
                  <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-900 text-xs">
                    <span className="text-sm shrink-0">⚠️</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold">Recomendación de nivel</span>
                      <span>
                        {isUserWeakerThanSuggested
                          ? `Tu nivel (Nivel ${userLevel}) es menor que el nivel sugerido para este turno (Nivel ${suggestedLevel}). El partido podría resultar muy exigente.`
                          : `Tu nivel (Nivel ${userLevel}) es mayor que el nivel sugerido para este turno (Nivel ${suggestedLevel}). El ritmo de juego podría ser menor al tuyo.`}
                      </span>
                    </div>
                  </div>
                );
              })()}
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
                className="min-h-[100px] rounded-lg resize-none"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-bold rounded-lg"
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
    </div>
  );
}
