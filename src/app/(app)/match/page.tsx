import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockMatches } from "@/lib/mock-data";

export default function MatchListPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Partidos</h1>
          <p className="text-sm text-muted-foreground">
            Revisá tus partidos jugados y compartí el marcador con tu equipo.
          </p>
        </div>
      </header>

      <div className="grid gap-3">
        {mockMatches.length > 0 ? (
          mockMatches.map((match) => (
            <Card key={match.id}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">{match.score}</CardTitle>
                <CardDescription>
                  {match.winners} vs {match.losers}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/match/${match.id}`}>Ver detalles</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Aún no tenés partidos</CardTitle>
              <CardDescription>Creá tu primer match para invitar a tus compañeros.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/match/new">Crear match ahora</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <footer className="mt-2 pb-4">
        <Button asChild className="w-full">
          <Link href="/match/new">Crear match</Link>
        </Button>
      </footer>
    </div>
  );
}
