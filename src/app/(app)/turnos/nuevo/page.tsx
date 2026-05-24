import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { levelOptions } from "@/lib/mock-data";
import { Calendar, Clock, MapPin, Users, Trophy, MessageSquare } from "lucide-react";

export default function NewTurnPage() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader
        title="Nuevo turno"
        description="Configurá cancha, nivel y cupos. Al guardar tendrás un link listo para compartir."
      />

      <div className="space-y-6">
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
                placeholder="Padel City · Cancha 3"
                className="rounded-xl h-11 bg-background shadow-sm focus:ring-primary/20"
                autoSelect
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
                type="date"
                className="rounded-xl h-11 bg-background shadow-sm focus:ring-primary/20"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Hora</h3>
              </div>
              <Input
                id="time"
                type="time"
                className="rounded-xl h-11 bg-background shadow-sm focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Duración</h3>
              </div>
              <select id="duration" className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 shadow-sm">
                <option>60 min</option>
                <option>90 min</option>
                <option>120 min</option>
              </select>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Cupos</h3>
              </div>
              <select id="players" className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 shadow-sm">
                <option>4 jugadores</option>
                <option>6 jugadores</option>
                <option>8 jugadores</option>
                <option>10 jugadores</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Trophy className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Nivel sugerido</h3>
            </div>
            <select id="level" className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 shadow-sm">
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
              placeholder="Traer pelotas nuevas. Punto de encuentro en recepción."
              className="rounded-xl min-h-[100px] bg-background shadow-sm focus:ring-primary/20"
            />
          </div>
        </section>

        <div className="pt-2">
          <Button className="w-full rounded-full shadow-lg" size="lg">
            Generar link compartible
          </Button>
          <Button variant="ghost" className="w-full mt-2 text-muted-foreground" size="sm">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
