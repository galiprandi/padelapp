"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { levelOptions } from "@/lib/mock-data";
import { createTurnAction } from "../actions";
import { useToast } from "@/components/toast/use-toast";
import { Loader2 } from "lucide-react";

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
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader
        title="Nuevo turno"
        description="Configurá cancha, nivel y cupos. Al guardar tendrás un link listo para compartir."
      />

      <form onSubmit={handleSubmit}>
        <Card className="rounded-3xl border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Detalles principales</CardTitle>
            <CardDescription>Información visible para quienes reciban el link.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="club" requiredIndicator="*">
                Club y cancha
              </Label>
              <Input
                id="club"
                placeholder="Padel City · Cancha 3"
                value={formData.club}
                onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="duration">Duración</Label>
                <select
                  id="duration"
                  className="h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                >
                  <option value="60">60 minutos</option>
                  <option value="90">90 minutos</option>
                  <option value="120">120 minutos</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="players">Jugadores</Label>
                <select
                  id="players"
                  className="h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
                  value={formData.maxPlayers}
                  onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
                >
                  <option value="4">4 jugadores</option>
                  <option value="6">6 jugadores</option>
                  <option value="8">8 jugadores</option>
                  <option value="10">10 jugadores</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Nivel sugerido</Label>
              <select
                id="level"
                className="h-10 w-full rounded-full border border-input bg-background px-4 text-sm"
                value={formData.suggestedLevel}
                onChange={(e) => setFormData({ ...formData, suggestedLevel: e.target.value })}
              >
                {levelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas opcionales</Label>
              <Textarea
                id="notes"
                placeholder="Traer pelotas nuevas. Punto de encuentro en recepción."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="mt-6 w-full rounded-full"
          size="lg"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando link...
            </>
          ) : (
            "Generar link compartible"
          )}
        </Button>
      </form>
    </div>
  );
}
