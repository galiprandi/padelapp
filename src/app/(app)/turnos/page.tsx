import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { levelOptions, mockTurns } from "@/lib/mock-data";
import Link from "next/link";

export default function TurnsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Turnos abiertos</h1>
        <p className="text-sm text-muted-foreground">
          Compartí el link con tu equipo o únete al vuelo a partidos de tu nivel.
        </p>
      </header>

      <Card className="space-y-4 p-5">
        <CardHeader className="space-y-1 p-0">
          <CardTitle className="text-base">Filtrar por nivel</CardTitle>
          <CardDescription>Elegí una categoría para ver turnos sugeridos.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-0">
          <select className="h-10 rounded-full border border-input bg-background px-4 text-sm">
            {levelOptions.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          <Input placeholder="Buscar club o ciudad" />
        </CardContent>
        <Button asChild className="w-full rounded-full">
          <Link href="/(app)/turnos/nuevo">Crear turno</Link>
        </Button>
      </Card>

      <div className="grid gap-3">
        {mockTurns.map((turn) => (
          <Card key={turn.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{turn.club}</CardTitle>
                <CardDescription>
                  {turn.date} · {turn.time}
                </CardDescription>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                Nivel {turn.level}
              </span>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {turn.slots.taken}/{turn.slots.total} jugadores
              </span>
              <Button size="sm" variant="outline" className="rounded-full" asChild>
                <Link href={`/t/${turn.id}`}>Ver detalles</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
