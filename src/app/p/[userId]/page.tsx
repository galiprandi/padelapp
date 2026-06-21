import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
import { MatchResultCompact, type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { Trophy, CalendarDays, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PublicProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { userId } = await params;

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

  const recentForm = matches.map(match => {
    const winner = getMatchWinner(match.score);
    const player = match.players.find(p => p.userId === userId);
    if (!winner || !player) return null;

    const playerTeam = player.position < 2 ? "A" : "B";
    return playerTeam === winner ? "W" : "L";
  }).filter(Boolean) as Array<"W" | "L">;

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
    const sets = match.score.split(",").map(s => {
      const parts = s.trim().split("-");
      return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
    });

    let teamASets = 0;
    let teamBSets = 0;

    sets.forEach(([scoreA, scoreB]) => {
      if (isNaN(scoreA) || isNaN(scoreB)) return;
      if (scoreA > scoreB) teamASets++;
      else if (scoreB > scoreA) teamBSets++;
    });

    if (teamASets === teamBSets) return 'L';

    const winnerIndex = teamASets > teamBSets ? 0 : 1;
    const playerPosition = match.players.find(p => p.userId === userId)?.position ?? 0;
    const playerTeamIndex = playerPosition < 2 ? 0 : 1;

    return winnerIndex === playerTeamIndex ? 'W' : 'L';
  });

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col gap-12 px-6 py-10 pb-20 overflow-hidden min-h-screen">
      {/* Ambient Light Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full animate-pulse" />
      </div>

      <section className="relative z-10 space-y-8 text-center animate-in fade-in slide-in-from-top-8 duration-700">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <PlayerAvatar
              name={displayName}
              image={user.image ?? undefined}
              size={120}
              className="border-4 border-background shadow-2xl ring-1 ring-primary/20"
            />
            <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-lg border-4 border-background ring-1 ring-primary/20">
              {user.level}
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-foreground">{displayName}</h1>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
              Jugador de Pádel • Nivel {user.level}
            </p>
          </div>

          {recentForm.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-md shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mr-2">Forma:</span>
              <div className="flex gap-1.5">
                {recentForm.map((result, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5 rounded-full flex items-center justify-center text-[7px] font-black shadow-sm",
                      result === "W" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                    )}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 px-2">
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

        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex flex-col gap-3 rounded-3xl border border-border/40 bg-card/40 p-5 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <Target className="h-3 w-3 text-primary" />
              Efectividad
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black">{winRate}%</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Win Rate</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-border/40 bg-card/40 p-5 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <TrendingUp className="h-3 w-3 text-primary" />
              Forma Reciente
            </div>
            <div className="flex gap-1.5 pt-1">
              {recentForm.length > 0 ? (
                recentForm.map((result, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black shadow-sm transition-transform hover:scale-110",
                      result === 'W'
                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                        : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 shadow-zinc-500/10"
                    )}
                  >
                    {result}
                  </div>
                ))
              ) : (
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">—</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
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

      <div className="relative z-10 flex flex-col gap-3 pt-6 px-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700">
        <Button asChild variant="outline" className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[11px] border-border/40 bg-card/40 backdrop-blur-sm active:scale-[0.98] shadow-sm">
          <Link href="/ranking">Volver al ranking global</Link>
        </Button>
      </div>
    </div>
  );
}
