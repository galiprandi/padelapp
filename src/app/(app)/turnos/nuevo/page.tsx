"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
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
    <div className="relative flex flex-col gap-6 pb-10 min-h-screen">
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-primary/10 blur-[100px] -z-10" />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <PageHeader
          size="lg"
          title="Nuevo turno"
          description="Configurá cancha, nivel y cupos. Al guardar tendrás un link listo para compartir."
          backHref="/turnos"
          descriptionClassName="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 fill-mode-both">
          <Card className="rounded-[2.5rem] border-border/40 bg-card/50 backdrop-blur-2xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-black">Detalles principales</CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Información visible para quienes reciban el link.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pb-10">
              <div className="space-y-3">
                <Label htmlFor="club" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">
                  Club y cancha
                </Label>
                <Input
                  id="club"
                  placeholder="Padel City · Cancha 3"
                  value={formData.club}
                  onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                  required
                  className="h-14 rounded-2xl bg-background/50 border-border/40 focus:bg-background transition-all text-base font-medium px-6"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="date" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="h-14 rounded-2xl bg-background/50 border-border/40 focus:bg-background transition-all font-medium px-4"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="time" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    className="h-14 rounded-2xl bg-background/50 border-border/40 focus:bg-background transition-all font-medium px-4"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Duración</Label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATION_OPTIONS.map((option) => {
                    const isSelected = formData.duration === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, duration: option.value })}
                        className={cn(
                          "flex items-center justify-center py-4 rounded-2xl border transition-all text-sm font-black active:scale-[0.98]",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-background/40 border-border/40 text-muted-foreground hover:bg-background/60"
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Jugadores</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PLAYER_OPTIONS.map((option) => {
                    const isSelected = formData.maxPlayers === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, maxPlayers: option.value })}
                        className={cn(
                          "flex items-center justify-between px-5 py-4 rounded-2xl border transition-all text-sm font-black text-left active:scale-[0.98]",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-background/40 border-border/40 text-muted-foreground hover:bg-background/60"
                        )}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Nivel sugerido</Label>
                <div className="grid grid-cols-2 gap-2">
                  {levelOptions.map((option) => {
                    const isSelected = formData.suggestedLevel === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, suggestedLevel: option.value })}
                        className={cn(
                          "flex items-center justify-between px-5 py-4 rounded-2xl border transition-all text-sm font-black text-left active:scale-[0.98]",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-background/40 border-border/40 text-muted-foreground hover:bg-background/60"
                        )}
                      >
                        <span className="truncate">{option.label}</span>
                        {isSelected && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="notes" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Notas opcionales</Label>
                <Textarea
                  id="notes"
                  placeholder="Traer pelotas nuevas. Punto de encuentro en recepción."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="min-h-[120px] rounded-[2rem] bg-background/50 border-border/40 focus:bg-background transition-all resize-none px-6 py-4"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          <Button
            type="submit"
            className="w-full rounded-2xl h-16 text-lg font-black shadow-2xl shadow-primary/30 transition-all active:scale-[0.98]"
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-7 w-7 animate-spin" />
                Generando link...
              </>
            ) : (
              "Generar link compartible"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
