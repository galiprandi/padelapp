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
import { Loader2, Check, Zap, Info, Clock } from "lucide-react";
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
    <div className="relative flex flex-col gap-6 pb-20 min-h-screen">
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-primary/10 blur-[100px] -z-10" />
      <div className="absolute top-[40%] right-0 w-64 h-64 bg-primary/5 blur-[120px] -z-10 rounded-full" />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <PageHeader
          size="lg"
          title="Nuevo turno"
          description="Configurá cancha, nivel y cupos. Al guardar tendrás un link listo para compartir."
          backHref="/turnos"
          descriptionClassName="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 fill-mode-both">
          <Card className="rounded-[2.5rem] border-border/40 bg-card/50 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <CardHeader className="pb-8 pt-10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary fill-current" />
                <CardTitle className="text-2xl font-black tracking-tight">Detalles del partido</CardTitle>
              </div>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Información esencial para tus invitados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-10 pb-12">
              <div className="space-y-4">
                <Label htmlFor="club" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2 flex items-center gap-2">
                  Club y cancha
                </Label>
                <Input
                  id="club"
                  placeholder="Ej: Padel City · Cancha 3"
                  value={formData.club}
                  onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                  required
                  className="h-16 rounded-[1.25rem] bg-background/50 border-border/40 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-lg font-bold px-6 placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Label htmlFor="date" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="h-16 rounded-[1.25rem] bg-background/50 border-border/40 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold px-5"
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="time" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    className="h-16 rounded-[1.25rem] bg-background/50 border-border/40 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-bold px-5"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Duración del turno
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {DURATION_OPTIONS.map((option) => {
                    const isSelected = formData.duration === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, duration: option.value })}
                        className={cn(
                          "flex items-center justify-center py-4 rounded-[1.25rem] border transition-all text-sm font-black active:scale-[0.96]",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]"
                            : "bg-background/40 border-border/40 text-muted-foreground hover:bg-background/60"
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-5">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2 flex items-center gap-2">
                  <Check className="h-3 w-3" />
                  Cupos totales
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {PLAYER_OPTIONS.map((option) => {
                    const isSelected = formData.maxPlayers === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, maxPlayers: option.value })}
                        className={cn(
                          "flex items-center justify-between px-6 py-5 rounded-[1.25rem] border transition-all text-sm font-black text-left active:scale-[0.96]",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]"
                            : "bg-background/40 border-border/40 text-muted-foreground hover:bg-background/60"
                        )}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check className="h-5 w-5 shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-5">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2 flex items-center gap-2">
                  Nivel sugerido
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {levelOptions.map((option) => {
                    const isSelected = formData.suggestedLevel === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, suggestedLevel: option.value })}
                        className={cn(
                          "flex items-center justify-between px-6 py-5 rounded-[1.25rem] border transition-all text-sm font-black text-left active:scale-[0.96]",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]"
                            : "bg-background/40 border-border/40 text-muted-foreground hover:bg-background/60"
                        )}
                      >
                        <span className="truncate">{option.label}</span>
                        {isSelected && <Check className="h-5 w-5 shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="notes" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2 flex items-center gap-2">
                  <Info className="h-3 w-3" />
                  Notas adicionales
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Ej: Traer pelotas nuevas. Punto de encuentro en recepción."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="min-h-[140px] rounded-[2rem] bg-background/50 border-border/40 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all resize-none px-6 py-6 text-base font-medium placeholder:text-muted-foreground/30"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both px-2">
          <Button
            type="submit"
            className="w-full rounded-[2rem] h-20 text-xl font-black shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] relative overflow-hidden group"
            size="lg"
            disabled={isPending}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/10 to-primary-foreground/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {isPending ? (
              <>
                <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                Generando link...
              </>
            ) : (
              "Crear turno y compartir link"
            )}
          </Button>
          <p className="text-center mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
            Al confirmar, se generará una URL pública para que cualquiera pueda anotarse.
          </p>
        </div>
      </form>
    </div>
  );
}
