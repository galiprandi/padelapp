import { Suspense } from "react";
import { auth } from "@/auth";
import { MatchResultCompact, type MatchResultCompactMatch, type MatchResultCompactPlayer } from "@/components/matches/match-result-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getPendingActions, getCachedConfirmedMatches } from "@/lib/queries";
import Link from "next/link";
import { CalendarOff, Plus, ChevronRight } from "lucide-react";
import { calculateWinRate, getMatchWinner } from "@/lib/utils";

export default function MatchListPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Partidos</h1>
          <p className="text-sm text-muted-foreground">
            Tus partidos y resultados pendientes.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/match/new" prefetch={true}>
            <Plus className="mr-1 h-4 w-4" />
            Crear
          </Link>
        </Button>
      </div>

      <Suspense fallback={<MatchListSkeleton />}>
        <MatchList />
      </Suspense>
    </div>
  );
}

interface RawMatch {
  id: string;
  date: Date | string;
  score: string | null;
  status: string;
  players: Array<{
    id: string;
    position: number;
    displayName: string | null;
    resultConfirmed: boolean;
    side: "RIGHT" | "LEFT" | null;
    user: {
      id: string;
      displayName: string | null;
      alias: string | null;
      image: string | null;
    } | null;
  }>;
}

async function MatchList() {
  const session = await auth();
  const viewerId = session?.user?.id;

  const [confirmedMatchesRaw, pendingActions] = await Promise.all([
    viewerId ? getCachedConfirmedMatches(viewerId) : Promise.resolve([]),
    viewerId ? getPendingActions(viewerId) : Promise.resolve([]),
  ]);

  // Map to the same shape that getEnhancedUserMatches returns
  const confirmedMatches: MatchResultCompactMatch[] = (confirmedMatchesRaw as RawMatch[]).map((match: RawMatch) => ({
    id: match.id,
    createdAt: match.date,
    score: match.score,
    status: match.status,
    date: match.date,
    players: match.players.map((player) => {
      return {
        id: player.id,
        position: player.position,
        displayName: player.displayName,
        resultConfirmed: player.resultConfirmed,
        side: player.side,
        user: player.user
          ? {
            id: player.user.id,
            displayName: player.user.displayName ?? null,
            alias: player.user.alias ?? null,
            image: player.user.image ?? undefined,
          }
          : null,
      };
    }),
  }));

  const totalMatches = confirmedMatches.length;

  const matchResults = confirmedMatches.map((match: MatchResultCompactMatch) => {
    const winner = getMatchWinner(match.score ?? null);
    if (!winner) return "L";
    const player = match.players.find((p: MatchResultCompactPlayer) => p.user?.id === viewerId);
    const playerTeam = (player?.position ?? 0) < 2 ? "A" : "B";
    return winner === playerTeam ? "W" : "L";
  });

  const wins = matchResults.filter((r) => r === "W").length;
  const winRate = calculateWinRate(wins, totalMatches);

  let currentStreak = 0;
  for (let i = 0; i < matchResults.length; i++) {
    if (matchResults[i] === "W") currentStreak++;
    else break;
  }

  const partnersWins: Record<string, { id: string; name: string; wins: number }> = {};
  const rivalsLosses: Record<string, { id: string; name: string; losses: number }> = {};

  confirmedMatches.forEach((match, idx) => {
    const viewer = match.players.find((p) => p.user?.id === viewerId);
    if (!viewer) return;
    const viewerTeamIdx = viewer.position < 2 ? 0 : 1;

    if (matchResults[idx] === "W") {
      const partner = match.players.find(
        (p: MatchResultCompactPlayer) =>
          p.user?.id !== viewerId &&
          (viewerTeamIdx === 0 ? p.position < 2 : p.position >= 2),
      );
      if (partner && partner.user) {
        const pId = partner.user.id;
        const pName = partner.user.displayName || "Compañero";
        if (!partnersWins[pId]) partnersWins[pId] = { id: pId, name: pName, wins: 0 };
        partnersWins[pId].wins += 1;
      }
    } else if (matchResults[idx] === "L") {
      const rivals = match.players.filter(
        (p) =>
          p.user?.id !== viewerId &&
          (viewerTeamIdx === 0 ? p.position >= 2 : p.position < 2),
      );
      rivals.forEach((rival) => {
        if (rival.user) {
          const rId = rival.user.id;
          const rName = rival.user.displayName || "Rival";
          if (!rivalsLosses[rId]) rivalsLosses[rId] = { id: rId, name: rName, losses: 0 };
          rivalsLosses[rId].losses += 1;
        }
      });
    }
  });

  const bestPartner = Object.values(partnersWins).sort(
    (a, b) => b.wins - a.wins,
  )[0];

  const nemesis = Object.values(rivalsLosses).sort(
    (a, b) => b.losses - a.losses,
  )[0];

  const groupedMatches = confirmedMatches.reduce(
    (groups: Record<string, MatchResultCompactMatch[]>, match: MatchResultCompactMatch) => {
      const date = new Date(match.date || match.createdAt);
      const month = date.toLocaleString("es-AR", { month: "long" });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(match);
      return groups;
    },
    {},
  );

  return (
    <div className="flex flex-col gap-6">
      {viewerId && totalMatches > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-bold text-foreground mb-3">Resumen</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Partidos</p>
              <p className="text-xl font-bold text-foreground">
                {totalMatches}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <p className="text-xl font-bold text-primary">{winRate}%</p>
            </div>
            {currentStreak >= 2 && (
              <div>
                <p className="text-xs text-muted-foreground">Racha</p>
                <p className="text-xl font-bold text-primary">
                  {currentStreak}W
                </p>
              </div>
            )}
          </div>
          {(bestPartner || nemesis) && (
            <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1.5">
              {bestPartner && (
                <p className="text-xs text-muted-foreground">
                  Mejor socio:{" "}
                  <Link
                    href={`/p/${bestPartner.id}`}
                    prefetch={true}
                    className="text-foreground font-semibold hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm active:scale-[0.98]"
                  >
                    {bestPartner.name}
                  </Link>{" "}
                  ({bestPartner.wins} {bestPartner.wins === 1 ? "victoria" : "victorias"})
                </p>
              )}
              {nemesis && (
                <p className="text-xs text-muted-foreground">
                  Némesis ⚔️:{" "}
                  <Link
                    href={`/p/${nemesis.id}`}
                    prefetch={true}
                    className="text-foreground font-semibold hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm active:scale-[0.98]"
                  >
                    {nemesis.name}
                  </Link>{" "}
                  ({nemesis.losses} {nemesis.losses === 1 ? "derrota" : "derrotas"})
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {pendingActions.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Pendientes</h2>
              <span className="rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
                {pendingActions.length}
              </span>
            </div>
            {pendingActions.length > 3 && (
              <Link
                href="/notifications"
                prefetch={true}
                className="flex items-center gap-0.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Ver todas <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {pendingActions.slice(0, 3).map((match) => {
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
                  label={needsScore ? "Cargar resultado" : "Confirmar"}
                  viewerId={viewerId}
                />
              );
            })}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-foreground">Historial</h2>
        {viewerId ? (
          confirmedMatches.length > 0 ? (
            <div className="flex flex-col gap-4">
              {Object.entries(groupedMatches).map(
                ([monthYear, monthMatches]) => (
                  <div key={monthYear} className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold text-muted-foreground capitalize">
                      {monthYear}
                    </h3>
                    <div className="flex flex-col gap-2">
                      {(monthMatches as MatchResultCompactMatch[]).map((match: MatchResultCompactMatch) => (
                        <MatchResultCompact
                          key={match.id}
                          match={match}
                          detailUrl={`/match/${match.id}`}
                          viewerId={viewerId}
                        />
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <EmptyState
              title="Sin partidos"
              description="Todavía no participaste en ningún partido."
              icon={CalendarOff}
              action={
                <Button asChild className="w-full">
                  <Link href="/match/new" prefetch={true}>Crear primer partido</Link>
                </Button>
              }
            />
          )
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Iniciá sesión para ver tus partidos.
            </p>
            <Button asChild className="w-full">
              <Link href="/login" prefetch={true}>Ir al login</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function MatchListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Resumen skeleton */}
      <div className="rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-4 w-20 mb-3" />
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-6 w-8" />
          </div>
          <div>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-6 w-12" />
          </div>
          <div>
            <Skeleton className="h-3 w-10 mb-1" />
            <Skeleton className="h-6 w-8" />
          </div>
        </div>
      </div>

      {/* Historial/Pendientes list skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
