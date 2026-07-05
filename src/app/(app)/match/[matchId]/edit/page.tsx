"use client";

import { useState, useTransition, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getMatchByIdAction, updateMatchDetailsAction } from "../../actions";
import { useToast } from "@/components/toast/use-toast";
import { Loader2, Check, Zap, Info, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const MATCH_TYPE_OPTIONS = [
  { value: "FRIENDLY", label: "Amistoso" },
  { value: "LOCAL_TOURNAMENT", label: "Torneo" },
];

const SETS_OPTIONS = [
  { value: "1", label: "1 Set" },
  { value: "3", label: "3 Sets" },
  { value: "5", label: "5 Sets" },
];

interface EditMatchPageProps {
  params: Promise<{ matchId: string }>;
}

export default function EditMatchPage({ params }: EditMatchPageProps) {
  const { matchId } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    club: "",
    courtNumber: "",
    date: "",
    time: "",
    sets: "3",
    matchType: "FRIENDLY",
    notes: "",
  });

  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    async function loadMatch() {
      const response = await getMatchByIdAction(matchId);
      if (response.status === "ok" && response.match) {
        const match = response.match;
        const matchDate = new Date(match.date);
        setFormData({
          club: match.club || "",
          courtNumber: match.courtNumber || "",
          date: matchDate.toISOString().split("T")[0],
          time: matchDate.toTimeString().slice(0, 5),
          sets: match.sets.toString(),
          matchType: match.matchType,
          notes: match.notes || "",
        });
        setIsClosed(match.status === 'CONFIRMED');
      } else {
        showToast("Error al cargar el partido");
        router.push("/match");
      }
      setIsLoading(false);
    }
    loadMatch();
  }, [matchId, router, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const combinedDate = new Date(`${formData.date}T${formData.time}`);

      const response = await updateMatchDetailsAction({
        matchId,
        date: combinedDate.toISOString(),
        sets: parseInt(formData.sets),
        matchType: formData.matchType as any,
        club: formData.club,
        courtNumber: formData.courtNumber,
        notes: formData.notes,
      });

      if (response.status === "ok") {
        showToast("Partido actualizado con éxito");
        router.push(`/match/${matchId}`);
      } else {
        showToast(response.message || "Error al actualizar el partido");
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
    <div className="relative flex flex-col gap-6 pb-20 min-h-screen">
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-primary/10 blur-[100px] -z-10" />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 px-6">
        <PageHeader
          size="lg"
          title="Editar detalles"
          description="Ajustá la información del partido."
          backHref={`/match/${matchId}`}
          descriptionClassName="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 px-6">
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 fill-mode-both">
          <Card className="rounded-[2.5rem] border-border/40 bg-card/50 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <CardHeader className="pb-8 pt-10">
               <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <CardTitle className="text-2xl font-black tracking-tight">Ubicación y Tiempo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pb-12">
              <div className="space-y-4">
                <Label htmlFor="club" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2">Club</Label>
                <Input
                  id="club"
                  value={formData.club}
                  onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                  className="h-14 rounded-2xl bg-background/50 border-border/40 font-bold px-6"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="courtNumber" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2">Cancha</Label>
                <Input
                  id="courtNumber"
                  value={formData.courtNumber}
                  onChange={(e) => setFormData({ ...formData, courtNumber: e.target.value })}
                  className="h-14 rounded-2xl bg-background/50 border-border/40 font-bold px-6"
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
                    className="h-14 rounded-2xl bg-background/50 border-border/40 font-bold px-4"
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="time" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="h-14 rounded-2xl bg-background/50 border-border/40 font-bold px-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 fill-mode-both">
          <Card className="rounded-[2.5rem] border-border/40 bg-card/50 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <CardHeader className="pb-8 pt-10">
               <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary fill-current" />
                <CardTitle className="text-2xl font-black tracking-tight">Formato</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pb-12">
              <div className="space-y-5">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2">Tipo de partido</Label>
                <div className="grid grid-cols-2 gap-3">
                  {MATCH_TYPE_OPTIONS.map((option) => {
                    const isSelected = formData.matchType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={isClosed}
                        onClick={() => setFormData({ ...formData, matchType: option.value })}
                        className={cn(
                          "flex items-center justify-center py-4 rounded-2xl border transition-all text-sm font-black active:scale-[0.96]",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-background/40 border-border/40 text-muted-foreground",
                          isClosed && isSelected && "opacity-50"
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-5">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2">Cantidad de sets</Label>
                <div className="grid grid-cols-3 gap-3">
                  {SETS_OPTIONS.map((option) => {
                    const isSelected = formData.sets === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={isClosed}
                        onClick={() => setFormData({ ...formData, sets: option.value })}
                        className={cn(
                          "flex items-center justify-center py-4 rounded-2xl border transition-all text-sm font-black active:scale-[0.96]",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-background/40 border-border/40 text-muted-foreground",
                          isClosed && isSelected && "opacity-50"
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 fill-mode-both">
          <Card className="rounded-[2.5rem] border-border/40 bg-card/50 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <CardHeader className="pb-8 pt-10">
               <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-primary" />
                <CardTitle className="text-2xl font-black tracking-tight">Notas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-12">
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="min-h-[120px] rounded-[2rem] bg-background/50 border-border/40 focus:bg-background transition-all resize-none px-6 py-6 font-medium"
              />
            </CardContent>
          </Card>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400 fill-mode-both">
          <Button
            type="submit"
            className="w-full rounded-[2rem] h-20 text-xl font-black shadow-2xl shadow-primary/30 transition-all active:scale-[0.98]"
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
          {isClosed && (
              <p className="text-center mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                El formato no puede editarse en un partido ya confirmado.
              </p>
          )}
        </div>
      </form>
    </div>
  );
}
