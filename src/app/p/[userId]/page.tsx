import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
import { PlayerAvatar } from "@/components/players/player-avatar";
import {
  MatchResultCompact,
  type MatchResultCompactMatch,
} from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import {
  Trophy,
  Zap,
  Users,
  Swords,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn, getMatchWinner } from "@/lib/utils";
import { getHeadToHeadStats } from "@/lib/match-queries";

interface PublicProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
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
      const preferredName =
        player.user && player.user.alias
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
  const winRate =
    user.matchesPlayed > 0
      ? Math.round((user.wins / user.matchesPlayed) * 100)
      : 0;

  const recentForm = matches.map((match) => {
    if (!match.score) return "L";
    const winner = getMatchWinner(match.score);
    if (!winner) return "L";

    const playerPosition =
      match.players.find((p) => p.userId === userId)?.position ?? 0;
    const playerTeam = playerPosition < 2 ? "A" : "B";

    return winner === playerTeam ? "W" : "L";
  });

  let currentStreak = 0;
  for (const result of recentForm) {
    if (result === "W") {
      currentStreak++;
    } else {
      break;
    }
  }

  const h2h =
    viewerId && viewerId !== userId
      ? await getHeadToHeadStats(viewerId, userId)
      : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-10 pb-20 min-h-screen">
      <div className="flex items-center gap-4">
        <Link
          href={viewerId ? "/me" : "/"}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Perfil Público</h1>
          <p className="text-sm text-muted-foreground">Estadísticas de {displayName}</p>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <PlayerAvatar
              name={displayName}
              image={user.image ?? undefined}
              size={96}
              className="border-2 border-border"
            />
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm border-2 border-background">
              {user.level}
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {displayName}
            </h2>
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-semibold text-muted-foreground">
                Nivel {user.level}
              </p>
              {currentStreak >= 2 && (
                <Badge
                  variant="outline"
                  className="bg-orange-500/10 border-orange-500/20 text-orange-600 font-bold px-3 py-1"
                >
                  Racha: {currentStreak} Victorias 🔥
                </Badge>
              )}
            </div>
          </div>
        </div>

        <UserRankingBanner
          position={user.rankingPosition}
          score={user.rankingScore}
          delta={user.rankingDelta}
          wins={user.wins}
          losses={user.losses}
          level={user.level}
          matchesPlayed={user.matchesPlayed}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <div className="text-xs font-bold text-muted-foreground uppercase">
              Efectividad
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">
                {winRate}%
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                WR
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <div className="text-xs font-bold text-muted-foreground uppercase">
              Forma
            </div>
            <div className="flex gap-1.5 pt-1">
              {recentForm.length > 0 ? (
                recentForm.map((result, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      result === "W"
                        ? "bg-emerald-500"
                        : "bg-rose-500/30",
                    )}
                  />
                ))
              ) : (
                <span className="text-xs font-semibold text-muted-foreground">
                  —
                </span>
              )}
            </div>
          </div>
        </div>

        {h2h && (h2h.together.total > 0 || h2h.against.total > 0) && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase text-muted-foreground">
              Cara a Cara
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Como socios
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold">
                    {h2h.together.wins}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / {h2h.together.total}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Swords className="h-3.5 w-3.5" />
                  Como rivales
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-primary">
                    {h2h.against.wins}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / {h2h.against.total}
                  </span>
                </div>
              </div>
            </div>

            {h2h.lastMatch && (
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-muted-foreground">
                    Último duelo
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold",
                      h2h.lastMatch.winner === h2h.lastMatch.viewerTeam
                        ? "text-emerald-600"
                        : "text-rose-600",
                    )}
                  >
                    {h2h.lastMatch.winner === h2h.lastMatch.viewerTeam
                      ? "Victoria"
                      : "Derrota"}{" "}
                    • {h2h.lastMatch.score}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 rounded-lg text-xs font-bold"
                  asChild
                >
                  <Link href={`/match/${h2h.lastMatch.id}`}>Detalle</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            Historial Reciente
          </h2>
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <Zap className="h-3 w-3 fill-current" />
            {winRate}% WR
          </div>
        </div>
        <div className="grid gap-3">
          {formattedMatches.length > 0 ? (
            formattedMatches.map((match) => (
              <MatchResultCompact
                key={match.id}
                match={match}
                detailUrl={`/match/${match.id}`}
                viewerId={userId}
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
    </div>
  );
}
