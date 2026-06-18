import Link from "next/link";
import { auth } from "@/auth";
import { MatchResultCompact, type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { TurnCard } from "@/components/turns/turn-card";
import { UserRankingCard } from "@/components/ranking/user-ranking-stats";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { prisma } from "@/lib/prisma";
import { CalendarDays, Trophy, ChevronRight, PlusCircle } from "lucide-react";
import { getEnhancedUserMatches, getPendingActions } from "@/lib/match-queries";
import { getGreeting } from "@/lib/utils";

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

  const greeting = getGreeting();

  return (
    <div className="flex flex-col gap-12 pb-8">
      <section className="space-y-6">
        <PageHeader
          title={`${greeting}, ${displayName} 👋`}
          description="Tu actividad central: turnos, partidos y progreso en el ranking."
          size="lg"
          action={
            <div className="flex flex-col gap-3 w-full">
              <Button size="lg" asChild className="w-full rounded-2xl font-black h-14 shadow-lg shadow-primary/20 active:scale-[0.98]">
                <Link href="/match/new">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Nuevo Partido
                </Link>
              </Button>
              <div className="flex gap-2 w-full">
                <Button size="sm" variant="outline" asChild className="flex-1 rounded-xl font-black">
                  <Link href="/me/profile">Mi Perfil</Link>
                </Button>
                <Button size="sm" variant="secondary" asChild className="flex-1 rounded-xl font-black">
                  <Link href="/ranking">Ranking</Link>
                </Button>
              </div>
            </div>
          }
        />

        <PwaInstallBanner />

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
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                Acciones pendientes
              </h2>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground animate-in zoom-in duration-300">
                {pendingActionMatches.length}
              </span>
            </div>
            {pendingActionMatches.length > 3 && (
              <Button variant="link" size="sm" asChild className="text-primary font-black uppercase tracking-widest text-[10px] h-auto p-0 flex items-center gap-1 active:scale-95 transition-transform">
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

      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Mi Agenda</h2>
          <Button variant="link" size="sm" asChild className="text-primary font-black uppercase tracking-[0.2em] text-[10px] h-auto p-0 flex items-center gap-1 active:scale-95 transition-transform">
            <Link href="/turnos">Ver todos</Link>
          </Button>
        </div>
        <div className="grid gap-3">
          {agendaItems.length > 0 ? (
            agendaItems.map((item, index) => (
              <div
                key={item.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.type === "turn" ? (
                  <TurnCard
                    turn={item.data}
                    isJoined={item.data.players.some((p: { userId: string }) => p.userId === viewerId)}
                    isCreator={item.data.creatorId === viewerId}
                  />
                ) : (
                  <MatchResultCompact
                    match={item.data as MatchResultCompactMatch}
                    detailUrl={`/match/${item.id}`}
                    label="Próximo partido"
                    viewerId={viewerId}
                  />
                )}
              </div>
            ))
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
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
            </div>
          )}
        </div>
      </section>

      {recommendedTurns.length > 0 && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Turnos recomendados</h2>
          </div>
          <div className="grid gap-3">
            {recommendedTurns.map((turn, index) => (
              <div
                key={turn.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <TurnCard
                  turn={turn}
                  variant="recommended"
                  isJoined={turn.players.some((p: { userId: string }) => p.userId === viewerId)}
                  isCreator={turn.creatorId === viewerId}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Últimos resultados</h2>
        </div>
        <div className="space-y-3">
          {recentMatches.length > 0 ? (
            recentMatches.map((match, index) => (
              <div
                key={match.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MatchResultCompact
                  match={match}
                  detailUrl={`/match/${match.id}`}
                  viewerId={viewerId}
                />
              </div>
            ))
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
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
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
