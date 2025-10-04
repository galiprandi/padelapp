import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockMatches, mockReputation, mockTurns } from "@/lib/mock-data";

export default async function DashboardPage() {
  const session = await auth();
  const displayName = session?.user.displayName ?? "Jugador";

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Hola, {displayName} 👋</h1>
        <p className="text-sm text-muted-foreground">
          Agenda turnos, registra partidos y mira tu progreso en el ranking.
        </p>
      </section>

      <Card className="bg-gradient-to-br from-primary/10 via-card to-background">
        <CardHeader className="space-y-1">
          <CardTitle>Tu reputación</CardTitle>
          <CardDescription>{mockReputation.message}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-end justify-between">
          <div className="text-5xl font-black text-primary">{mockReputation.score}</div>
          <Button variant="secondary" className="rounded-full" asChild>
            <Link href="/ranking">Ver ranking</Link>
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Próximos turnos</h2>
          <Button size="sm" variant="ghost" className="gap-2" asChild>
            <Link href="/turnos/nuevo">Crear turno</Link>
          </Button>
        </div>
        <div className="grid gap-3">
          {mockTurns.map((turn) => (
            <Card key={turn.id} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-semibold">{turn.club}</CardTitle>
                  <CardDescription>
                    {turn.date} · {turn.time}
                  </CardDescription>
                </div>
                <Badge variant="success">Nivel {turn.level}</Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {turn.slots.taken}/{turn.slots.total} jugadores
                </span>
                <Button size="sm" variant="outline" className="rounded-full" asChild>
                  <Link href={`/t/${turn.id}`}>Ver turno</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Últimos partidos</h2>
          <Button size="sm" variant="ghost" className="gap-2" asChild>
            <Link href="/registro">Registrar resultado</Link>
          </Button>
        </div>
        <div className="space-y-3">
          {mockMatches.map((match) => (
            <Card key={match.id}>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {match.winners}
                </CardTitle>
                <CardDescription>vs {match.losers}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm">
                <span className="font-semibold text-primary">{match.score}</span>
                <Button size="sm" variant="ghost" className="rounded-full">
                  Compartir
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
