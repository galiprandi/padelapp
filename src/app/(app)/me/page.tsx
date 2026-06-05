import Link from "next/link";
import { auth } from "@/auth";
import { MatchResultCompact, type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { TurnCard } from "@/components/turns/turn-card";
import { UserRankingCard } from "@/components/ranking/user-ranking-stats";
import { prisma } from "@/lib/prisma";
import { CalendarDays, Trophy, AlertCircle, Clock, FileText, CheckCircle2 } from "lucide-react";

async function getEnhancedUserMatches(userId: string, statusFilter?: "PENDING" | "CONFIRMED" | "DISPUTED") {
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
      date: "desc", // Default to newest for results and pending actions
    },
    take: 20,
  });

  return matches.map<MatchResultCompactMatch>((match) => ({
    id: match.id,
    createdAt: match.date,
    score: match.score,
    status: match.status,
    date: match.date,
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
}

export default async function DashboardPage() {
  const session = await auth();
  const viewerId = session?.user?.id;

  if (!viewerId) return null;

  const [user, allPendingMatches, recentMatches] = await Promise.all([
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
    getEnhancedUserMatches(viewerId, "PENDING"),
    getEnhancedUserMatches(viewerId, "CONFIRMED"),
  ]);

  const now = new Date();

  // Categorizar partidos PENDING
  const pendingActionMatches = allPendingMatches
    .filter(m => new Date(m.date || m.createdAt) < now)
    .sort((a, b) => {
      // Priorizar los que TIENEN score (necesitan confirmación) sobre los que NO tienen score (necesitan carga)
      if (a.score && !b.score) return -1;
      if (!a.score && b.score) return 1;
      // Secundario: fecha más reciente primero
      return new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime();
    });

  const upcomingMatches = allPendingMatches
    .filter(m => new Date(m.date || m.createdAt) >= now)
    .sort((a, b) => new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime());

  const displayName = user?.alias ?? user?.displayName ?? session?.user?.name ?? "Jugador";

  const myTurns = await prisma.turn.findMany({
    where: {
      players: { some: { userId: viewerId } },
      date: { gte: now },
      status: { in: ["OPEN", "FULL"] },
    },
    include: { players: true },
    orderBy: { date: "asc" },
    take: 3,
  });

  const recommendedTurns = await prisma.turn.findMany({
    where: {
      players: { none: { userId: viewerId } },
      date: { gte: now },
      status: "OPEN",
    },
    include: { players: true },
    orderBy: { date: "asc" },
    take: 3,
  });

  // Consolidar agenda: turnos y partidos futuros solamente
  const agendaItems = [
    ...myTurns.map((turn) => ({
      id: turn.id,
      type: "turn" as const,
      date: new Date(turn.date),
      data: turn,
    })),
    ...upcomingMatches.map((match) => ({
      id: match.id,
      type: "match" as const,
      date: new Date(match.date ?? match.createdAt),
      data: match,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="flex flex-col gap-12 pb-8">
      <section className="space-y-6">
        <PageHeader
          title={`Hola, ${displayName} 👋`}
          description="Tu actividad central: turnos, partidos y progreso en el ranking."
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

      {/* NUEVA SECCIÓN: Acciones Pendientes */}
      {pendingActionMatches.length > 0 && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              Acciones pendientes
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
                {pendingActionMatches.length}
              </span>
            </h2>
          </div>
          <div className="grid gap-3">
            {pendingActionMatches.map((match) => {
              const needsScore = !match.score;
              return (
                <MatchResultCompact
                  key={match.id}
                  match={match}
                  detailUrl={needsScore ? `/match/${match.id}/result` : `/match/${match.id}`}
                  label={needsScore ? "Cargar resultado" : "Confirmación pendiente"}
                />
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold tracking-tight">Mi Agenda</h2>
          <Button variant="link" size="sm" asChild className="text-primary font-bold uppercase tracking-widest text-[10px] h-auto p-0">
            <Link href="/turnos">Ver todos</Link>
          </Button>
        </div>
        <div className="grid gap-3">
          {agendaItems.length > 0 ? (
            agendaItems.map((item) => (
              item.type === "turn" ? (
                <TurnCard
                  key={item.id}
                  turn={item.data}
                  isJoined={item.data.players.some((p: { userId: string }) => p.userId === viewerId)}
                />
              ) : (
                <MatchResultCompact
                  key={item.id}
                  match={item.data as MatchResultCompactMatch}
                  detailUrl={`/match/${item.id}`}
                  label="Próximo partido"
                />
              )
            ))
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Tu agenda está vacía"
              description="Sumate a un turno abierto o creá un partido con amigos para empezar."
              action={
                <Button className="w-full rounded-xl" asChild>
                  <Link href="/turnos">Explorar turnos</Link>
                </Button>
              }
            />
          )}
        </div>
      </section>

      {recommendedTurns.length > 0 && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold tracking-tight">Turnos recomendados</h2>
          </div>
          <div className="grid gap-3">
            {recommendedTurns.map((turn) => (
              <TurnCard
                key={turn.id}
                turn={turn}
                variant="recommended"
                isJoined={turn.players.some((p: { userId: string }) => p.userId === viewerId)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold tracking-tight">Últimos resultados</h2>
        </div>
        <div className="space-y-3">
          {recentMatches.length > 0 ? (
            recentMatches.map((match) => (
              <MatchResultCompact key={match.id} match={match} detailUrl={`/match/${match.id}`} />
            ))
          ) : (
            <EmptyState
              icon={Trophy}
              title="Sin resultados todavía"
              description="Cuando registres un marcador, vas a verlo acá para compartirlo."
              action={
                <Button className="w-full rounded-xl" variant="secondary" asChild>
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
