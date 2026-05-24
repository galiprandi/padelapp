import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { levelOptions } from "@/lib/mock-data";
import Link from "next/link";
import { CalendarOff, Plus, Search } from "lucide-react";

export default function TurnsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Turnos abiertos"
        description="Compartí el link con tu equipo o únete al vuelo a partidos de tu nivel."
        action={
          <Button asChild className="rounded-full">
            <Link href="/turnos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Crear turno
            </Link>
          </Button>
        }
      />

      <div className="rounded-3xl border border-border/60 bg-muted/20 p-5 backdrop-blur-sm space-y-4">
        <div className="space-y-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 px-1">Filtrar por nivel</h3>
          <select className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70">
            {levelOptions.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 px-1">Ubicación</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar club o ciudad"
              className="rounded-xl pl-9 h-11 bg-background"
              autoSelect
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <EmptyState
          title="Sin turnos abiertos"
          description="No hay turnos disponibles en este momento. ¡Sé el primero en crear uno!"
          icon={CalendarOff}
          action={
            <Button asChild size="sm" className="w-full max-w-xs rounded-full">
              <Link href="/turnos/nuevo">Crear turno ahora</Link>
            </Button>
          }
        />
      </div>
    </div>
  );
}
