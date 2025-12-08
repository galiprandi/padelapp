import Link from "next/link";
import { auth } from "@/auth";
import { MatchResultCompact, type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockReputation } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

async function getUserMatches(userId: string, statusFilter?: "PENDING" | "CONFIRMED" | "DISPUTED") {
  const matches = await prisma.match.findMany({
    where: {
      status: statusFilter,
      players: {
        some: { userId },
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
    take: 10,
  });

  return matches.map<MatchResultCompactMatch>((match) => ({
    id: match.id,
    createdAt: match.updatedAt ?? match.createdAt,
    score: match.score,
    status: match.status,
    players: match.players.map((player: {
      id: string;
      position: number;
      displayName: string | null;
      user: {
        id: string;
        displayName: string | null;
        alias?: string | null;
        image: string | null;
      } | null;
    }) => {
      const preferredName = player.user && "alias" in player.user && player.user.alias
        ? player.user.alias
        : player.user?.displayName;
      return {
        id: player.id,
        position: player.position,
        displayName: player.displayName,
        user: player.user
          ? {
            id: player.user.id,
            displayName: preferredName ?? null,
            image: player.user.image ?? undefined,
          }
          : null,
      };
    }),
  }));
}

export default async function DashboardPage() {
  const session = await auth();
  const displayName = session?.user?.alias ?? session?.user?.displayName ?? "Jugador";
  const viewerId = session?.user?.id;

  const [upcomingMatches, recentMatches] = viewerId
    ? await Promise.all([
        getUserMatches(viewerId, "PENDING"),
        getUserMatches(viewerId, "CONFIRMED"),
      ])
    : [[], []];

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Hola, {displayName} 👋</h1>
        <p className="text-sm text-muted-foreground">
          Armá equipos rápido, seguí tu reputación y compartí resultados sin fricción.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/me/profile">Editar perfil</Link>
          </Button>
        </div>
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
          <h2 className="text-lg font-semibold">Próximos partidos</h2>
        </div>
        <div className="grid gap-3">
          {viewerId && upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <MatchResultCompact key={match.id} match={match} detailUrl={`/match/${match.id}`} label="Pendiente" />
            ))
          ) : (
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Sin partidos agendados</CardTitle>
                <CardDescription>Agendá un partido para coordinar jugadores y confirmar horarios.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/match/new">Crear partido</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Últimos partidos</h2>
        </div>
        <div className="space-y-3">
          {viewerId && recentMatches.length > 0 ? (
            recentMatches.map((match) => (
              <MatchResultCompact key={match.id} match={match} detailUrl={`/match/${match.id}`} />
            ))
          ) : (
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Sin resultados todavía</CardTitle>
                <CardDescription>Cuando registres un marcador, vas a verlo acá para compartirlo.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/match">Ver partidos</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
