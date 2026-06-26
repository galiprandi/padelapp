import { auth } from "@/auth";
import { MatchResultCompact } from "@/components/matches/match-result-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getEnhancedUserMatches, getPendingActions } from "@/lib/match-queries";
import Link from "next/link";
import { PlusCircle, CalendarOff, Plus, ChevronRight, Trophy, Zap, Users, Target, Activity } from "lucide-react";
import { cn, calculateWinRate, getMatchWinner } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MatchListPage() {
  const session = await auth();
  const viewerId = session?.user?.id;

  const [matches, pendingActions] = await Promise.all([
    viewerId ? getEnhancedUserMatches(viewerId) : Promise.resolve([]),
    viewerId ? getPendingActions(viewerId) : Promise.resolve([]),
  ]);

  // Cálculos para el Career Summary
  const confirmedMatches = matches.filter(m => m.status === 'CONFIRMED');
  const totalMatches = confirmedMatches.length;

  const matchResults = confirmedMatches.map(match => {
    const winner = getMatchWinner(match.score ?? null);
    if (!winner) return 'L';
    const player = match.players.find(p => p.user?.id === viewerId);
    const playerTeam = (player?.position ?? 0) < 2 ? 'A' : 'B';
    return winner === playerTeam ? 'W' : 'L';
  });

  const wins = matchResults.filter(r => r === 'W').length;
  const winRate = calculateWinRate(wins, totalMatches);

  // Racha actual
  let currentStreak = 0;
  for (let i = 0; i < matchResults.length; i++) {
    if (matchResults[i] === 'W') currentStreak++;
    else break;
  }

  // Mejor Compañero (socio con más victorias)
  const partnersWins: Record<string, { name: string, wins: number }> = {};
  confirmedMatches.forEach((match, idx) => {
    if (matchResults[idx] === 'W') {
      const viewer = match.players.find(p => p.user?.id === viewerId);
      if (!viewer) return;
      const viewerTeamIdx = viewer.position < 2 ? 0 : 1;
      const partner = match.players.find(p =>
        p.user?.id !== viewerId &&
        (viewerTeamIdx === 0 ? p.position < 2 : p.position >= 2)
      );

      if (partner && partner.user) {
        const pId = partner.user.id;
        const pName = partner.user.displayName || "Compañero";
        if (!partnersWins[pId]) partnersWins[pId] = { name: pName, wins: 0 };
        partnersWins[pId].wins += 1;
      }
    }
  });

  const bestPartner = Object.values(partnersWins).sort((a, b) => b.wins - a.wins)[0];

  // Agrupar partidos por mes y año
  const groupedMatches = matches.reduce((groups: Record<string, typeof matches>, match) => {
    const date = new Date(match.date || match.createdAt);
    const month = date.toLocaleString("es-AR", { month: "long" });
    const year = date.getFullYear();
    const key = `${month} ${year}`;

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(match);
    return groups;
  }, {});

  return (
    <div className="flex flex-col gap-12 pb-8 animate-in fade-in duration-700">
      <PageHeader
        title="Partidos"
        description="Revisá tus partidos jugados y gestioná tus resultados pendientes."
        size="lg"
        backHref="/me"
        action={
          <Button asChild className="w-full rounded-2xl font-black h-14 shadow-lg shadow-primary/20 active:scale-[0.98]">
            <Link href="/match/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              Crear Partido
            </Link>
          </Button>
        }
      />

      {viewerId && totalMatches > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/40 p-8 backdrop-blur-md shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Trophy className="h-32 w-32 text-primary" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                  Resumen de Carrera
                </h2>
                {currentStreak >= 2 && (
                  <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full border border-orange-500/20 animate-pulse">
                    <Zap className="h-3 w-3 fill-current" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{currentStreak} en racha</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground/60">
                    <Target className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Partidos</span>
                  </div>
                  <p className="text-3xl font-black tabular-nums">{totalMatches}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground/60">
                    <Activity className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Win Rate</span>
                  </div>
                  <p className="text-3xl font-black tabular-nums text-primary">{winRate}%</p>
                </div>

                {bestPartner && (
                  <div className="space-y-1 col-span-2 md:col-span-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground/60">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Mejor Socio</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-black truncate max-w-[150px]">{bestPartner.name}</p>
                      <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                        {bestPartner.wins} victorias
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {pendingActions.length > 0 && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                Acciones pendientes
              </h2>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground animate-in zoom-in duration-300">
                {pendingActions.length}
              </span>
            </div>
            {pendingActions.length > 3 && (
              <Button variant="link" size="sm" asChild className="text-primary font-black uppercase tracking-widest text-[10px] h-auto p-0 flex items-center gap-1 active:scale-95 transition-transform">
                <Link href="/notifications">
                  Ver todas
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
          <div className="grid gap-3">
            {pendingActions.slice(0, 3).map((match) => {
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

      <section className="space-y-8">
        <div className="flex items-center justify-between px-1 border-b border-border/10 pb-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Historial de partidos</h2>
        </div>

        <div className="space-y-12">
          {viewerId ? (
            matches.length > 0 ? (
              Object.entries(groupedMatches).map(([monthYear, monthMatches], groupIdx) => (
                <div key={monthYear} className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000" style={{ animationDelay: `${groupIdx * 100}ms` }}>
                  <div className="flex items-center gap-4 px-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/20 to-transparent" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 whitespace-nowrap">
                      {monthYear}
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/20 to-transparent" />
                  </div>
                  <div className="grid gap-4">
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
              ))
            ) : (
              <EmptyState
                title="Sin partidos todavía"
                description="Todavía no participaste de ningún partido. Cuando quieras, podés crear uno nuevo y gestionarlo desde acá."
                icon={CalendarOff}
                className="rounded-[2.5rem]"
                action={
                  <div className="flex flex-col w-full gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                    <Button asChild className="w-full rounded-2xl font-black h-14 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all text-sm">
                      <Link href="/match/new">Crear primer partido</Link>
                    </Button>
                  </div>
                }
              />
            )
          ) : (
            <Card className="rounded-[2.5rem] border-primary/10 bg-card/50 backdrop-blur-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-500 border">
              <CardHeader className="space-y-4 pt-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[2rem] bg-primary/10 text-3xl shadow-inner mb-2 animate-pulse">
                  🎾
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-black tracking-tight">Iniciá sesión</CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground/80 px-6">
                    Ingresá con Google para ver tus partidos recientes, el ranking y estadísticas detalladas.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-10 px-8">
                <Button asChild className="w-full rounded-2xl font-black h-14 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all text-lg">
                  <Link href="/login">Ir al login</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {viewerId && (
        <div className="fixed bottom-24 right-6 md:hidden z-40 animate-in slide-in-from-bottom-8 duration-700">
          <Button asChild size="icon" className="h-16 w-16 rounded-[1.25rem] shadow-2xl shadow-primary/40 active:scale-90 transition-all border-4 border-background">
            <Link href="/match/new">
              <Plus className="h-8 w-8 stroke-[3]" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
