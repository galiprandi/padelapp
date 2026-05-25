"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { createTurnAction } from "../actions";
import { useToast } from "@/components/toast/use-toast";
import { levelOptions } from "@/lib/constants";
import { Calendar, Clock, MapPin, Users, Trophy, MessageSquare, Loader2 } from "lucide-react";

export default function NewTurnPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      club: formData.get("club") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      duration: parseInt(formData.get("duration") as string),
      maxPlayers: parseInt(formData.get("players") as string),
      suggestedLevel: parseInt(formData.get("level") as string),
      notes: formData.get("notes") as string,
    };

    if (!data.club || !data.date || !data.time) {
      setError("Por favor completa los campos obligatorios.");
      return;
    }

    startTransition(async () => {
      const result = await createTurnAction(data);
      if (result.status === "ok") {
        showToast("Turno creado con éxito");
        router.push(`/t/${result.turnId}`);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader
        title="Nuevo turno"
        description="Configurá cancha, nivel y cupos. Al guardar tendrás un link listo para compartir."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-3xl border border-border/60 bg-muted/20 p-6 backdrop-blur-sm space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Ubicación y cancha</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="club" className="sr-only">Club y cancha</Label>
              <Input
                id="club"
                name="club"
                placeholder="Padel City · Cancha 3"
                className="rounded-xl h-11 bg-background shadow-sm focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Fecha</h3>
              </div>
              <Input
                id="date"
                name="date"
                type="date"
                className="rounded-xl h-11 bg-background shadow-sm focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Hora</h3>
              </div>
              <Input
                id="time"
                name="time"
                type="time"
                className="rounded-xl h-11 bg-background shadow-sm focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Duración</h3>
              </div>
              <select
                id="duration"
                name="duration"
                defaultValue="90"
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 shadow-sm"
              >
                <option value="60">60 min</option>
                <option value="90">90 min</option>
                <option value="120">120 min</option>
              </select>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Cupos</h3>
              </div>
              <select
                id="players"
                name="players"
                defaultValue="4"
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 shadow-sm"
              >
                <option value="4">4 jugadores</option>
                <option value="6">6 jugadores</option>
                <option value="8">8 jugadores</option>
                <option value="10">10 jugadores</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Trophy className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Nivel sugerido</h3>
            </div>
            <select
              id="level"
              name="level"
              defaultValue="6"
              className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 shadow-sm"
            >
              {levelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Notas opcionales</h3>
            </div>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Traer pelotas nuevas. Punto de encuentro en recepción."
              className="rounded-xl min-h-[100px] bg-background shadow-sm focus:ring-primary/20"
            />
          </div>
        </section>

        {error && <p className="text-sm text-destructive px-1">{error}</p>}

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full rounded-full shadow-lg h-12 text-base font-bold"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando turno...
              </>
            ) : (
              "Generar link compartible"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full mt-2 text-muted-foreground"
            size="sm"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
