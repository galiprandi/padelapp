import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { MatchResultCompact, type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { Trophy, CalendarDays, Target, TrendingUp, Zap, Flame, Users, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn, getMatchWinner } from "@/lib/utils";
import { getHeadToHeadStats } from "@/lib/match-queries";

interface PublicProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { userId } = await params;
  const session = await auth();
  const viewerId = session?.user?.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      alias: true,
      image: true,
      level: true,
      rankingScore: true,
      rankingPosition: true,
      rankingDelta: true,
      wins: true,
      losses: true,
      matchesPlayed: true,
    },
  });

  if (!user) {
    notFound();
  }

  const matches = await prisma.match.findMany({
    where: {
      status: "CONFIRMED",
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
    take: 5,
  });


  const formattedMatches = matches.map<MatchResultCompactMatch>((match) => ({
    id: match.id,
    createdAt: match.date,
    score: match.score,
    status: match.status,
    date: match.date,
    players: match.players.map((player) => {
      const preferredName = player.user && player.user.alias
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

  const displayName = user.alias ?? user.displayName ?? "Jugador";
  const winRate = user.matchesPlayed > 0 ? Math.round((user.wins / user.matchesPlayed) * 100) : 0;

  // Determinar forma reciente (W/L) de los últimos 5 partidos
  const recentForm = matches.map(match => {
    if (!match.score) return 'L';
    const winner = getMatchWinner(match.score);
    if (!winner) return 'L';

    const playerPosition = match.players.find(p => p.userId === userId)?.position ?? 0;
    const playerTeam = playerPosition < 2 ? 'A' : 'B';

    return winner === playerTeam ? 'W' : 'L';
  });

  // Calcular racha actual
  let currentStreak = 0;
  for (const result of recentForm) {
    if (result === 'W') {
      currentStreak++;
    } else {
      break;
    }
  }

  const h2h = (viewerId && viewerId !== userId) ? await getHeadToHeadStats(viewerId, userId) : null;

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col gap-12 px-6 py-10 pb-20 overflow-hidden min-h-screen">
      {/* Ambient Light Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <section className="relative z-10 space-y-8 text-center animate-in fade-in slide-in-from-top-8 duration-1000">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <PlayerAvatar
              name={displayName}
              image={user.image ?? undefined}
              size={128}
              className="border-4 border-background shadow-2xl ring-1 ring-primary/20"
            />
            <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-lg border-4 border-background ring-1 ring-primary/20">
              {user.level}
            </div>
            {currentStreak >= 2 && (
              <div className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg border-4 border-background animate-bounce">
                <Flame className="h-5 w-5 fill-current" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-foreground">{displayName}</h1>
            <div className="flex flex-col items-center gap-2">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 leading-none">
                Jugador de Pádel • Nivel {user.level}
              </p>
              {currentStreak >= 2 && (
                <Badge variant="outline" className="bg-orange-500/10 border-orange-500/20 text-orange-600 font-black uppercase tracking-[0.2em] text-[9px] px-3 py-1 animate-pulse">
                   Racha: {currentStreak} Victorias 🔥
                </Badge>
              )}
            </div>
          </div>

        </div>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 px-2">
          <UserRankingBanner
            position={user.rankingPosition}
            score={user.rankingScore}
            delta={user.rankingDelta}
            wins={user.wins}
            losses={user.losses}
            level={user.level}
            matchesPlayed={user.matchesPlayed}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-400 px-2">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-border/40 bg-card/60 p-6 backdrop-blur-2xl shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target className="h-16 w-16 text-primary" />
            </div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 relative z-10">
              Efectividad
            </div>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-4xl font-black tracking-tighter">{winRate}%</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">WR</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[2rem] border border-border/40 bg-card/60 p-6 backdrop-blur-2xl shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="h-16 w-16 text-primary" />
            </div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 relative z-10">
              Forma
            </div>
            <div className="flex gap-2 pt-2 relative z-10">
              {recentForm.length > 0 ? (
                recentForm.map((result, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full shadow-sm transition-transform hover:scale-125",
                      result === "W" ? "bg-emerald-500 shadow-[0_0_8px_theme(colors.emerald.500/0.4)]" : "bg-rose-500/30"
                    )}
                  />
                ))
              ) : (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">—</span>
              )}
            </div>
          </div>
        </div>

        {h2h && (h2h.together.total > 0 || h2h.against.total > 0) && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
            <div className="relative overflow-hidden rounded-[2rem] border border-border/40 bg-card/60 p-6 backdrop-blur-2xl shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Swords className="h-16 w-16 text-primary" />
              </div>

              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-6 text-left">
                Inteligencia Cara a Cara
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <Users className="h-3 w-3" />
                    Socios
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black">{h2h.together.wins}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">de {h2h.together.total} ganados</span>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <Swords className="h-3 w-3" />
                    Rivales
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-primary">{h2h.against.wins}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">de {h2h.against.total} ganados</span>
                  </div>
                </div>
              </div>

              {h2h.lastMatch && (
                <div className="mt-6 pt-4 border-t border-border/20 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Último duelo</span>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      h2h.lastMatch.winner === h2h.lastMatch.viewerTeam ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {h2h.lastMatch.winner === h2h.lastMatch.viewerTeam ? "Victoria" : "Derrota"} • {h2h.lastMatch.score}
                    </span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 rounded-xl font-black uppercase tracking-[0.2em] text-[8px] active:scale-95" asChild>
                    <Link href={`/match/${h2h.lastMatch.id}`}>Ver detalle</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            Historial Reciente
          </h2>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">
            <Zap className="h-3 w-3 fill-current" />
            {winRate}% WR
          </div>
        </div>
        <div className="grid gap-4">
          {formattedMatches.length > 0 ? (
            formattedMatches.map((match, index) => (
              <div
                key={match.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${400 + (index * 100)}ms` }}
              >
                <MatchResultCompact
                  match={match}
                  detailUrl={`/match/${match.id}`}
                  viewerId={userId}
                />
              </div>
            ))
          ) : (
            <EmptyState
              icon={Trophy}
              title="Sin resultados todavía"
              description="Este jugador aún no tiene partidos confirmados."
            />
          )}
        </div>
      </section>

      <div className="relative z-10 flex flex-col gap-3 pt-6 px-2 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-700">
        <Button asChild variant="outline" className="w-full rounded-[2rem] h-16 font-black uppercase tracking-[0.2em] text-[11px] border-border/40 bg-card/60 backdrop-blur-2xl active:scale-[0.98] shadow-sm transition-all duration-300">
          <Link href="/ranking">Volver al ranking global</Link>
        </Button>
      </div>
    </div>
  );
}
