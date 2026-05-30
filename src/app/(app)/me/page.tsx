import Link from "next/link";
import { auth } from "@/auth";
import { MatchResultCompact, type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { TurnCard } from "@/components/turns/turn-card";
import { UserRankingCard } from "@/components/ranking/user-ranking-stats";
import { prisma } from "@/lib/prisma";
import { CalendarDays, Trophy, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

async function getEnhancedUserMatches(userId: string) {
  const allMatches = await prisma.match.findMany({
    where: {
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
      date: "desc",
    },
    take: 20,
  });

  const formattedMatches = allMatches.map<MatchResultCompactMatch & { date: Date; playersRaw: any[] }>((match) => ({
    id: match.id,
    createdAt: match.createdAt,
    date: match.date,
    score: match.score,
    status: match.status,
    playersRaw: match.players,
    players: match.players.map((player) => {
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

  const now = new Date();

  const pendingAction = formattedMatches.filter(m => {
    if (m.status === "CONFIRMED") return false;

    const userPlayer = m.playersRaw.find(p => p.userId === userId);
    const isPast = m.date < now;
    const needsScore = !m.score && isPast;
    const needsConfirmation = m.score && userPlayer && !userPlayer.resultConfirmed;

    return needsScore || needsConfirmation;
  }).sort((a, b) => {
    const userPlayerA = a.playersRaw.find(p => p.userId === userId);
    const userPlayerB = b.playersRaw.find(p => p.userId === userId);
    const aNeedsConfirmation = a.score && userPlayerA && !userPlayerA.resultConfirmed;
    const bNeedsConfirmation = b.score && userPlayerB && !userPlayerB.resultConfirmed;

    if (aNeedsConfirmation && !bNeedsConfirmation) return -1;
    if (!aNeedsConfirmation && bNeedsConfirmation) return 1;
    return a.date.getTime() - b.date.getTime();
  });

  const upcoming = formattedMatches.filter(m => m.date >= now);

  const recent = formattedMatches
    .filter(m => m.date < now && !pendingAction.find(p => p.id === m.id))
    .slice(0, 5);

  return { pendingAction, upcoming, recent };
}

export default async function DashboardPage() {
  const session = await auth();
  const viewerId = session?.user?.id;

  if (!viewerId) {
    return redirect("/login");
  }

  const [user, matchesData] = await Promise.all([
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
    getEnhancedUserMatches(viewerId),
  ]);

  const { pendingAction, upcoming, recent } = matchesData;
  const displayName = user?.alias ?? user?.displayName ?? session?.user?.name ?? "Jugador";

  const myTurns = await prisma.turn.findMany({
    where: {
      players: { some: { userId: viewerId } },
      date: { gte: new Date() },
      status: { in: ["OPEN", "FULL"] },
    },
    include: { players: true },
    orderBy: { date: "asc" },
    take: 5,
  });

  const recommendedTurns = await prisma.turn.findMany({
    where: {
      players: { none: { userId: viewerId } },
      date: { gte: new Date() },
      status: "OPEN",
    },
    include: { players: true },
    orderBy: { date: "asc" },
    take: 3,
  });

  // Consolidate Agenda
  const agendaItems = [
    ...myTurns.map(t => ({ type: 'turn' as const, date: new Date(t.date), data: t })),
    ...upcoming.map(m => ({ type: 'match' as const, date: new Date(m.date), data: m }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

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

      {pendingAction.length > 0 && (
        <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2 px-1">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">Acciones pendientes</h2>
          </div>
          <div className="grid gap-3">
            {pendingAction.map((match) => (
              <MatchResultCompact
                key={match.id}
                match={match}
                matchDate={match.date}
                detailUrl={`/match/${match.id}`}
                label={!match.score ? "Cargar resultado" : "Confirmar resultado"}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">Mi Agenda</h2>
          </div>
          <Button variant="link" size="sm" asChild className="text-primary font-bold uppercase tracking-widest text-[10px]">
            <Link href="/turnos">Explorar turnos</Link>
          </Button>
        </div>

        <div className="grid gap-3">
          {agendaItems.length > 0 ? (
            agendaItems.map((item, idx) => (
              item.type === 'turn' ? (
                <TurnCard key={`turn-${item.data.id}`} turn={item.data} />
              ) : (
                <MatchResultCompact
                  key={`match-${item.data.id}`}
                  match={item.data}
                  matchDate={item.data.date}
                  detailUrl={`/match/${item.data.id}`}
                  label="Partido"
                />
              )
            ))
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Tu agenda está vacía"
              description="Sumate a un turno abierto o creá un partido con amigos."
              action={
                <div className="flex flex-col gap-2 w-full">
                  <Button className="w-full rounded-xl" asChild>
                    <Link href="/turnos">Ver turnos disponibles</Link>
                  </Button>
                  <Button className="w-full rounded-xl" variant="outline" asChild>
                    <Link href="/match/new">Crear partido</Link>
                  </Button>
                </div>
              }
            />
          )}
        </div>
      </section>

      {recommendedTurns.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
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

      {recent.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold tracking-tight">Últimos resultados</h2>
          </div>
          <div className="space-y-3">
            {recent.map((match) => (
              <MatchResultCompact
                key={match.id}
                match={match}
                matchDate={match.date}
                detailUrl={`/match/${match.id}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
