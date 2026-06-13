import Link from "next/link";
import { auth } from "@/auth";
import { MatchResultCompact, type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { TurnCard } from "@/components/turns/turn-card";
import { UserRankingCard } from "@/components/ranking/user-ranking-stats";
import { prisma } from "@/lib/prisma";
import { CalendarDays, Trophy, ChevronRight } from "lucide-react";
import { getEnhancedUserMatches, getPendingActions } from "@/lib/match-queries";

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
  const pendingActionMatches = await getPendingActions(viewerId);

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
            <div className="flex items-center gap-2">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
                Acciones pendientes
              </h2>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground">
                {pendingActionMatches.length}
              </span>
            </div>
            {pendingActionMatches.length > 3 && (
              <Button variant="link" size="sm" asChild className="text-primary font-black uppercase tracking-widest text-[10px] h-auto p-0 flex items-center gap-1">
                <Link href="/notifications">
                  Ver todas
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
          <div className="grid gap-3">
            {pendingActionMatches.slice(0, 3).map((match) => {
              const needsScore = !match.score;
              return (
                <MatchResultCompact
                  key={match.id}
                  match={match}
                  detailUrl={needsScore ? `/match/${match.id}/result` : `/match/${match.id}`}
                  label={needsScore ? "Cargar resultado" : "Confirmación pendiente"}
                  viewerId={viewerId}
                />
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">Mi Agenda</h2>
          <Button variant="link" size="sm" asChild className="text-primary font-black uppercase tracking-widest text-[10px] h-auto p-0 flex items-center gap-1">
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
                  isCreator={item.data.creatorId === viewerId}
                />
              ) : (
                <MatchResultCompact
                  key={item.id}
                  match={item.data as MatchResultCompactMatch}
                  detailUrl={`/match/${item.id}`}
                  label="Próximo partido"
                  viewerId={viewerId}
                />
              )
            ))
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Tu agenda está vacía"
              description="Sumate a un turno abierto o creá un partido con amigos para empezar."
              action={
                <div className="flex flex-col w-full gap-3">
                  <Button className="w-full rounded-xl font-black h-12 shadow-lg shadow-primary/20" asChild>
                    <Link href="/turnos">Explorar turnos</Link>
                  </Button>
                  <Button variant="ghost" className="w-full rounded-xl font-black h-10 text-muted-foreground uppercase tracking-widest text-[11px]" asChild>
                    <Link href="/ranking">Ver ranking global</Link>
                  </Button>
                </div>
              }
            />
          )}
        </div>
      </section>

      {recommendedTurns.length > 0 && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">Turnos recomendados</h2>
          </div>
          <div className="grid gap-3">
            {recommendedTurns.map((turn) => (
              <TurnCard
                key={turn.id}
                turn={turn}
                variant="recommended"
                isJoined={turn.players.some((p: { userId: string }) => p.userId === viewerId)}
                isCreator={turn.creatorId === viewerId}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">Últimos resultados</h2>
        </div>
        <div className="space-y-3">
          {recentMatches.length > 0 ? (
            recentMatches.map((match) => (
              <MatchResultCompact
                key={match.id}
                match={match}
                detailUrl={`/match/${match.id}`}
                viewerId={viewerId}
              />
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
