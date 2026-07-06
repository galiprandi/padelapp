import { auth } from "@/auth";
import { MatchResultCompact } from "@/components/matches/match-result-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { getEnhancedUserMatches, getPendingActions } from "@/lib/match-queries";
import Link from "next/link";
import { CalendarOff, Plus, ChevronRight } from "lucide-react";
import { calculateWinRate, getMatchWinner } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MatchListPage() {
  const session = await auth();
  const viewerId = session?.user?.id;

  const [matches, pendingActions] = await Promise.all([
    viewerId ? getEnhancedUserMatches(viewerId) : Promise.resolve([]),
    viewerId ? getPendingActions(viewerId) : Promise.resolve([]),
  ]);

  const confirmedMatches = matches.filter((m) => m.status === "CONFIRMED");
  const totalMatches = confirmedMatches.length;

  const matchResults = confirmedMatches.map((match) => {
    const winner = getMatchWinner(match.score ?? null);
    if (!winner) return "L";
    const player = match.players.find((p) => p.user?.id === viewerId);
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

  const partnersWins: Record<string, { name: string; wins: number }> = {};
  confirmedMatches.forEach((match, idx) => {
    if (matchResults[idx] === "W") {
      const viewer = match.players.find((p) => p.user?.id === viewerId);
      if (!viewer) return;
      const viewerTeamIdx = viewer.position < 2 ? 0 : 1;
      const partner = match.players.find(
        (p) =>
          p.user?.id !== viewerId &&
          (viewerTeamIdx === 0 ? p.position < 2 : p.position >= 2),
      );
      if (partner && partner.user) {
        const pId = partner.user.id;
        const pName = partner.user.displayName || "Compañero";
        if (!partnersWins[pId]) partnersWins[pId] = { name: pName, wins: 0 };
        partnersWins[pId].wins += 1;
      }
    }
  });

  const bestPartner = Object.values(partnersWins).sort(
    (a, b) => b.wins - a.wins,
  )[0];

  const groupedMatches = matches.reduce(
    (groups: Record<string, typeof matches>, match) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Partidos</h1>
          <p className="text-sm text-muted-foreground">
            Tus partidos y resultados pendientes.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/match/new">
            <Plus className="mr-1 h-4 w-4" />
            Crear
          </Link>
        </Button>
      </div>

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
          {bestPartner && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Mejor socio:{" "}
                <span className="text-foreground font-semibold">
                  {bestPartner.name}
                </span>{" "}
                ({bestPartner.wins} victorias)
              </p>
            </div>
          )}
        </div>
      )}

      {pendingActions.length > 0 && (
        <div className="space-y-2">
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
                className="flex items-center gap-0.5 text-xs font-semibold text-primary"
              >
                Ver todas <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          <div className="space-y-2">
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
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground">Historial</h2>
        {viewerId ? (
          matches.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedMatches).map(
                ([monthYear, monthMatches]) => (
                  <div key={monthYear} className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground capitalize">
                      {monthYear}
                    </h3>
                    <div className="space-y-2">
                      {monthMatches.map((match) => (
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
                  <Link href="/match/new">Crear primer partido</Link>
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
              <Link href="/login">Ir al login</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
