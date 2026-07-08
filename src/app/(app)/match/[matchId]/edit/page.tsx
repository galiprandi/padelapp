"use client";

import { useState, useTransition, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMatchByIdAction, updateMatchDetailsAction } from "../../actions";
import { useToast } from "@/components/toast/use-toast";
import { Loader2, MapPin, Zap, Info, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex flex-col gap-4">
        <Link
          href={`/match/${matchId}`}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Editar detalles</h1>
          <p className="text-sm text-muted-foreground">Ajustá la información del partido.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="rounded-xl border border-border bg-card">
          <CardHeader className="pb-4">
             <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-bold">Ubicación y Tiempo</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="club" className="text-sm font-semibold">Club</Label>
              <Input
                id="club"
                value={formData.club}
                onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                className="h-10 rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="courtNumber" className="text-sm font-semibold">Cancha</Label>
              <Input
                id="courtNumber"
                value={formData.courtNumber}
                onChange={(e) => setFormData({ ...formData, courtNumber: e.target.value })}
                className="h-10 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date" className="text-sm font-semibold">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-10 rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="time" className="text-sm font-semibold">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="h-10 rounded-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border bg-card">
          <CardHeader className="pb-4">
             <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-bold">Formato</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-semibold">Tipo de partido</Label>
              <div className="grid grid-cols-2 gap-2">
                {MATCH_TYPE_OPTIONS.map((option) => {
                  const isSelected = formData.matchType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isClosed}
                      onClick={() => setFormData({ ...formData, matchType: option.value })}
                      className={cn(
                        "flex items-center justify-center h-10 rounded-lg border text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted",
                        isClosed && isSelected && "opacity-50"
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-sm font-semibold">Cantidad de sets</Label>
              <div className="grid grid-cols-3 gap-2">
                {SETS_OPTIONS.map((option) => {
                  const isSelected = formData.sets === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isClosed}
                      onClick={() => setFormData({ ...formData, sets: option.value })}
                      className={cn(
                        "flex items-center justify-center h-10 rounded-lg border text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted",
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

        <Card className="rounded-xl border border-border bg-card">
          <CardHeader className="pb-4">
             <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-bold">Notas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-[100px] rounded-lg resize-none"
              placeholder="Notas adicionales sobre el partido..."
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full h-12 text-base font-bold rounded-lg"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
          {isClosed && (
              <p className="text-center text-xs text-muted-foreground">
                El formato no puede editarse en un partido ya confirmado.
              </p>
          )}
        </div>
      </form>
    </div>
  );
}
