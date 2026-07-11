import Link from "next/link";
import { auth } from "@/auth";
import {
  MatchResultCompact,
  type MatchResultCompactMatch,
} from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { TurnCard } from "@/components/turns/turn-card";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { prisma } from "@/lib/prisma";
import { CalendarDays, Trophy, ChevronRight } from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { getEnhancedUserMatches, getPendingActions } from "@/lib/match-queries";
import { getGreeting, cn, getMatchWinner } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const viewerId = session?.user?.id;

  if (!viewerId) return null;

  const [user, allPendingMatches, recentMatches] = await Promise.all([
    prisma.user.findUnique({
      where: { id: viewerId },
      select: {
        id: true,
        displayName: true,
        alias: true,
        rankingScore: true,
        rankingPosition: true,
        rankingDelta: true,
        level: true,
        matchesPlayed: true,
        wins: true,
        losses: true,
        image: true,
      },
    }),
    getEnhancedUserMatches(viewerId, "PENDING"),
    getEnhancedUserMatches(viewerId, "CONFIRMED"),
  ]);

  const now = new Date();

  const pendingActionMatches = await getPendingActions(viewerId);

  const upcomingMatches = allPendingMatches
    .filter((m) => new Date(m.date || m.createdAt) >= now)
    .sort(
      (a, b) =>
        new Date(a.date || a.createdAt).getTime() -
        new Date(b.date || b.createdAt).getTime(),
    );

  const displayName =
    user?.alias ?? user?.displayName ?? session?.user?.name ?? "Jugador";

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

  const recentForm = recentMatches.slice(0, 5).map((match) => {
    const winner = getMatchWinner(match.score ?? null);
    if (!winner) return "L";
    const player = match.players.find((p) => p.user?.id === viewerId);
    if (!player) return "L";
    const playerTeam = player.position < 2 ? "A" : "B";
    return winner === playerTeam ? "W" : "L";
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <PlayerAvatar
          name={displayName}
          image={user?.image ?? undefined}
          size={44}
        />
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-foreground">
            {greeting}, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Tu actividad de pádel en un solo lugar.
          </p>
        </div>
      </div>

      {/* Stats row */}
      {user && (
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/ranking"
            className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.02]"
          >
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary/70 transition-colors">Ranking</span>
            <span className="text-xl font-bold text-foreground">
              #{user.rankingPosition ?? "-"}
            </span>
          </Link>
          <Link
            href="/match"
            className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.02]"
          >
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary/70 transition-colors">Partidos</span>
            <span className="text-xl font-bold text-foreground">
              {user.matchesPlayed}
            </span>
          </Link>
          <Link
            href="/ranking"
            className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.02]"
          >
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary/70 transition-colors">Victorias</span>
            <span className="text-xl font-bold text-primary">{user.wins}</span>
          </Link>
        </div>
      )}

      <PwaInstallBanner />

      {/* Pending actions */}
      {pendingActionMatches.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                Acciones pendientes
              </h2>
              <span className="rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
                {pendingActionMatches.length}
              </span>
            </div>
            {pendingActionMatches.length > 3 && (
              <Link
                href="/notifications"
                className="flex items-center text-xs text-muted-foreground hover:text-foreground"
              >
                Ver todas <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          <div className="space-y-2">
            {pendingActionMatches.slice(0, 3).map((match) => {
              const needsScore = !match.score;
              return (
                <MatchResultCompact
                  key={match.id}
                  match={match}
                  detailUrl={
                    needsScore
                      ? `/match/${match.id}/result`
                      : `/match/${match.id}`
                  }
                  label={
                    needsScore ? "Cargar resultado" : "Confirmación pendiente"
                  }
                  viewerId={viewerId}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* My Agenda */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Mi Agenda</h2>
          <Link
            href="/turnos"
            className="flex items-center text-xs text-muted-foreground hover:text-foreground"
          >
            Ver todos <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {agendaItems.length > 0 ? (
            agendaItems.map((item) => {
              return item.type === "turn" ? (
                <TurnCard
                  key={item.id}
                  turn={item.data}
                  isJoined={item.data.players.some(
                    (p: { userId: string }) => p.userId === viewerId,
                  )}
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
              );
            })
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Tu agenda está vacía"
              description="Sumate a un turno abierto o creá un partido con amigos."
              action={
                <Button className="w-full" asChild>
                  <Link href="/turnos">Explorar turnos</Link>
                </Button>
              }
            />
          )}
        </div>
      </section>

      {/* Recommended turns */}
      {recommendedTurns.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">
            Turnos disponibles
          </h2>
          <div className="space-y-2">
            {recommendedTurns.map((turn) => (
              <TurnCard
                key={turn.id}
                turn={turn}
                variant="recommended"
                isJoined={turn.players.some(
                  (p: { userId: string }) => p.userId === viewerId,
                )}
                isCreator={turn.creatorId === viewerId}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent results */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">
              Últimos resultados
            </h2>
            {recentForm.length > 0 && (
              <div
                className="flex gap-1"
                aria-label={`Forma reciente: ${recentForm
                  .map((r) => (r === "W" ? "G" : "P"))
                  .join(", ")}`}
              >
                {recentForm.map((result, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    className={cn(
                      "h-2 w-2 rounded-full",
                      result === "W" ? "bg-emerald-500" : "bg-rose-500",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
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
              description="Cuando registres un marcador, vas a verlo acá."
              action={
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/match">Ver historial</Link>
                </Button>
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}
