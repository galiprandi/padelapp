import Link from "next/link";
import { auth } from "@/auth";
import { MatchResultCompact, type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { TurnCard } from "@/components/turns/turn-card";
import { UserRankingCard } from "@/components/ranking/user-ranking-stats";
import { prisma } from "@/lib/prisma";
import { CalendarDays, Trophy } from "lucide-react";
import { levelOptions } from "@/lib/mock-data";

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
  const viewerId = session?.user?.id;

  const [user, upcomingMatches, recentMatches] = viewerId
    ? await Promise.all([
        prisma.user.findUnique({
          where: { id: viewerId },
          select: {
            displayName: true,
            alias: true,
            rankingScore: true,
            rankingPosition: true,
            rankingDelta: true,
            level: true,
            matchesPlayed: true,
          },
        }),
        getUserMatches(viewerId, "PENDING"),
        getUserMatches(viewerId, "CONFIRMED"),
      ])
    : [null, [], []];

  const displayName = user?.alias ?? user?.displayName ?? session?.user?.name ?? "Jugador";

  const myTurns = viewerId
    ? await prisma.turn.findMany({
        where: {
          players: { some: { userId: viewerId } },
          date: { gte: new Date() },
          status: { in: ["OPEN", "FULL"] },
        },
        include: { players: true },
        orderBy: { date: "asc" },
        take: 3,
      })
    : [];

  const recommendedTurns = viewerId
    ? await prisma.turn.findMany({
        where: {
          players: { none: { userId: viewerId } },
          date: { gte: new Date() },
          status: "OPEN",
        },
        include: { players: true },
        orderBy: { date: "asc" },
        take: 3,
      })
    : [];

  return (
    <div className="flex flex-col gap-8 pb-8">
      <section className="space-y-6">
        <PageHeader
          title={`Hola, ${displayName} 👋`}
          description="Armá equipos rápido, registrá tus resultados y escalá en la comunidad."
          size="lg"
          action={
            <div className="flex gap-2 w-full">
              <Button size="sm" variant="outline" asChild className="flex-1 rounded-xl">
                <Link href="/me/profile">Editar perfil</Link>
              </Button>
              <Button size="sm" variant="secondary" asChild className="flex-1 rounded-xl">
                <Link href="/ranking">Ver ranking</Link>
              </Button>
            </div>
          }
        />

        {user && user.matchesPlayed > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <Link href="/ranking">
              <UserRankingCard
                position={user.rankingPosition}
                score={user.rankingScore}
                delta={user.rankingDelta}
                level={user.level}
              />
            </Link>
          </div>
        )}
      </section>

      {myTurns.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Mis próximos turnos</h2>
            <Button variant="link" size="sm" asChild className="text-primary font-bold uppercase tracking-widest text-[10px]">
              <Link href="/turnos">Ver todos</Link>
            </Button>
          </div>
          <div className="grid gap-3">
            {myTurns.map((turn) => (
              <TurnCard key={turn.id} turn={turn} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Próximos partidos</h2>
        </div>
        <div className="grid gap-3">
          {viewerId && upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <MatchResultCompact key={match.id} match={match} detailUrl={`/match/${match.id}`} label="Pendiente" />
            ))
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Sin partidos agendados"
              description="Agendá un partido para coordinar jugadores y confirmar horarios."
              action={
                <Button className="w-full" asChild>
                  <Link href="/match/new">Crear partido</Link>
                </Button>
              }
            />
          )}
        </div>
      </section>

      {recommendedTurns.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Turnos recomendados</h2>
          </div>
          <div className="grid gap-3">
            {recommendedTurns.map((turn) => (
              <TurnCard
                key={turn.id}
                turn={turn}
                variant="recommended"
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Últimos partidos</h2>
        </div>
        <div className="space-y-3">
          {viewerId && recentMatches.length > 0 ? (
            recentMatches.map((match) => (
              <MatchResultCompact key={match.id} match={match} detailUrl={`/match/${match.id}`} />
            ))
          ) : (
            <EmptyState
              icon={Trophy}
              title="Sin resultados todavía"
              description="Cuando registres un marcador, vas a verlo acá para compartirlo."
              action={
                <Button className="w-full" variant="secondary" asChild>
                  <Link href="/match">Ver partidos</Link>
                </Button>
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}
