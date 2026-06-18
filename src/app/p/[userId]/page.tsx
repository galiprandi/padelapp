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
    <div className="mx-auto flex w-full max-w-md flex-col gap-12 px-6 py-10 pb-20 animate-in fade-in duration-700">
      <section className="space-y-6">
        <PageHeader
          title={displayName}
          description={`Perfil de jugador de pádel • Nivel ${user.level}`}
          size="lg"
          align="center"
        />

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <UserRankingBanner
            position={user.rankingPosition}
            score={user.rankingScore}
            delta={user.rankingDelta}
            wins={user.wins}
            losses={user.losses}
            level={user.level}
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

      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
            Últimos partidos
          </h2>
        </div>
        <div className="grid gap-3">
          {formattedMatches.length > 0 ? (
            formattedMatches.map((match) => (
              <MatchResultCompact
                key={match.id}
                match={match}
                detailUrl={`/match/${match.id}`}
              />
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

      <div className="flex flex-col gap-3 pt-4">
        <Button asChild variant="outline" className="w-full rounded-xl font-black">
          <Link href="/ranking">Volver al ranking</Link>
        </Button>
      </div>
    </div>
  );
}
