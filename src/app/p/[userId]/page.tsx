import { notFound } from "next/navigation";
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
import {
  getHeadToHeadStats,
  getPublicProfileUser,
  getConfirmedMatchesForProfile,
} from "@/lib/queries";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { safeCallbackUrl } from "@/lib/auth-utils";
import { ShareButton } from "@/components/share/share-button";

interface PublicProfilePageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ backUrl?: string }>;
}

export default function PublicProfilePage({
  params,
  searchParams,
}: PublicProfilePageProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-10 pb-20 min-h-screen">
      <div className="flex items-center gap-4">
        <Suspense
          fallback={
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <ChevronLeft className="h-5 w-5" />
            </div>
          }
        >
          <DynamicBackButton searchParams={searchParams} />
        </Suspense>
        <div>
          <h1 className="text-xl font-bold text-foreground">Perfil Público</h1>
          <p className="text-sm text-muted-foreground">Estadísticas de jugador</p>
        </div>
      </div>

      <Suspense fallback={<PublicProfileSkeleton />}>
        <PublicProfileContent params={params} />
      </Suspense>
    </div>
  );
}

async function DynamicBackButton({
  searchParams,
}: {
  searchParams: Promise<{ backUrl?: string }>;
}) {
  const resolved = await searchParams;
  const backUrl = safeCallbackUrl(resolved.backUrl, "/me");
  return (
    <Link
      href={backUrl}
      className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
    >
      <ChevronLeft className="h-5 w-5" />
    </Link>
  );
}

async function PublicProfileContent({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await auth();
  const viewerId = session?.user?.id;

  const user = await getPublicProfileUser(userId);

  if (!user) {
    notFound();
  }

  const matches_result = await getConfirmedMatchesForProfile(userId, 5);

  const formattedMatches = matches_result.map<MatchResultCompactMatch>((match) => ({
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

  const recentForm = matches_result.map((match) => {
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
    <>
      <section className="space-y-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <PlayerAvatar
              name={displayName}
              image={user.image ?? undefined}
              size={96}
              className="border-2 border-border"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-bold text-foreground pl-8">
                {displayName}
              </h2>
              <ShareButton
                url={`/p/${userId}`}
                title={`Perfil de ${displayName}`}
                text={`Mirá las estadísticas de ${displayName} en Padel Red.`}
                variant="ghost"
                size="sm"
                iconOnly
                className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
              />
            </div>
            <div className="flex flex-col items-center gap-2">
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
            <div className="text-xs font-bold text-muted-foreground">
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
            <div className="text-xs font-bold text-muted-foreground">
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
                        : "bg-rose-500",
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
            <h3 className="text-xs font-bold text-muted-foreground">
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
                  <span className="text-xs font-bold text-muted-foreground">
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
    </>
  );
}

function PublicProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile summary skeleton */}
      <div className="flex flex-col items-center gap-4 text-center">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      </div>

      {/* Ranking banner skeleton */}
      <div className="h-24 rounded-xl bg-card border border-border p-4">
        <div className="grid grid-cols-3 gap-4 h-full items-center">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>

      {/* History section skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
