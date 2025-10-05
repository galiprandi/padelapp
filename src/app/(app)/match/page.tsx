import Link from "next/link";

import { MatchResultCompact, type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getUserMatches(userId: string): Promise<MatchResultCompactMatch[]> {
  const matches = await prisma.match.findMany({
    where: {
      players: {
        some: {
          userId,
        },
      },
    },
    include: {
      players: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 20,
  });

  return matches.map((match) => ({
    id: match.id,
    createdAt: match.updatedAt ?? match.createdAt,
    score: match.score,
    status: match.status,
    players: match.players.map((player) => ({
      id: player.id,
      position: player.position,
      user: player.user
        ? {
            id: player.user.id,
            displayName: player.user.displayName,
            image: player.user.image,
          }
        : null,
    })),
  }));
}

export default async function MatchListPage() {
  const session = await auth();
  const viewerId = session?.user?.id;

  const matches = viewerId ? await getUserMatches(viewerId) : [];

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Partidos</h1>
          <p className="text-sm text-muted-foreground">
            Revisá tus partidos jugados y compartí el marcador con tu equipo.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href="/match/new">Crear Partido</Link>
        </Button>
      </header>

      <div className="grid gap-3">
        {viewerId ? (
          matches.length > 0 ? (
            matches.map((match) => (
              <MatchResultCompact key={match.id} match={match} detailUrl={`/match/${match.id}`} />
            ))
          ) : (
            <EmptyState
              title="Sin partidos todavía"
              description="Todavía no participaste de ningún partido. Cuando quieras, podés crear uno nuevo y gestionarlo desde acá."
            />
          )
        ) : (
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Iniciá sesión</CardTitle>
              <CardDescription>Ingresá con Google para ver tus partidos recientes.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/login">Ir al login</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
