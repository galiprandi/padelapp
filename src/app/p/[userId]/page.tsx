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
  Network,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn, getMatchWinner, getLevelBadgeLabel } from "@/lib/utils";
import {
  getCachedHeadToHeadStats,
  getCachedPublicProfileUser,
  getCachedConfirmedMatchesForProfile,
  getCachedPlayerNetworkStats,
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
      prefetch={true}
      className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
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

  const user = await getCachedPublicProfileUser(userId);

  if (!user) {
    notFound();
  }

  const [matches_result, networkStats] = await Promise.all([
    getCachedConfirmedMatchesForProfile(userId, 5),
    getCachedPlayerNetworkStats(userId),
  ]);

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
        side: player.side,
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
      ? await getCachedHeadToHeadStats(viewerId, userId)
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
            <div className="relative flex items-center justify-center w-full min-h-[32px]">
              <h2 className="text-2xl font-bold text-foreground px-10 truncate max-w-full">
                {displayName}
              </h2>
              <div className="absolute right-0">
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
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" className="border-border bg-muted text-muted-foreground font-bold px-2.5 py-0.5 text-xs">
                {getLevelBadgeLabel(user.level)}
              </Badge>
              {currentStreak >= 2 && (
                <Badge
                  variant="outline"
                  className="bg-orange-500/10 border-orange-500/20 text-orange-600 font-bold px-3 py-0.5 text-xs"
                >
                  Racha: {currentStreak} Victorias 🔥
                </Badge>
              )}
            </div>
          </div>
        </div>

        <UserRankingBanner
          userId={user.id}
          position={user.rankingPosition}
          score={user.rankingScore}
          delta={user.rankingDelta}
          wins={user.wins}
          losses={user.losses}
          matchesPlayed={user.matchesPlayed}
          lastMatchAt={user.lastMatchAt}
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
            {recentForm.length > 0 ? (
              <div
                className="flex gap-1.5 pt-1"
                aria-label={`Forma reciente: ${recentForm
                  .map((r) => (r === "W" ? "G" : "P"))
                  .join(", ")}`}
              >
                {recentForm.map((result, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      result === "W"
                        ? "bg-emerald-500"
                        : "bg-rose-500",
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-1.5 pt-1" aria-label="Sin partidos">
                <span className="text-xs font-semibold text-muted-foreground" aria-hidden="true">
                  —
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Network & Position Stats Card */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground">
            Red y Posición
          </h3>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Network className="h-3.5 w-3.5 text-primary" />
                Contactos
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold">
                  {networkStats.networkSize}
                </span>
                <span className="text-xs text-muted-foreground">jugadores</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Activity className="h-3.5 w-3.5 text-primary" />
                Lado preferido
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-bold text-foreground leading-tight">
                    {networkStats.preferredSide === "RIGHT"
                      ? "Derecha"
                      : networkStats.preferredSide === "LEFT"
                        ? "Revés"
                        : "Alterno"}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                    {networkStats.winRateRight !== null && `Der: ${Math.round(networkStats.winRateRight * 100)}% WR `}
                    {networkStats.winRateLeft !== null && `Rev: ${Math.round(networkStats.winRateLeft * 100)}% WR`}
                    {networkStats.winRateRight === null && networkStats.winRateLeft === null && "Sin partidos"}
                  </span>
                </div>
                <MiniCourtIndicator preferredSide={networkStats.preferredSide} />
              </div>
            </div>
          </div>

          {(networkStats.successfulPartner || networkStats.frequentRival) && (
            <div className="pt-3 border-t border-border space-y-3">
              {networkStats.successfulPartner && networkStats.successfulPartner.user && (
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-muted-foreground">Pareja más exitosa</span>
                    <Link
                      href={`/p/${networkStats.successfulPartner.user.id}?backUrl=/p/${userId}`}
                          prefetch={true}
                      className="flex items-center gap-2 hover:underline text-foreground group mt-0.5"
                    >
                      <PlayerAvatar
                        name={networkStats.successfulPartner.user.alias ?? networkStats.successfulPartner.user.displayName}
                        image={networkStats.successfulPartner.user.image ?? undefined}
                        size={20}
                        className="group-hover:scale-105 transition-transform"
                      />
                      <span className="font-bold text-primary">
                        {networkStats.successfulPartner.user.alias ?? networkStats.successfulPartner.user.displayName}
                      </span>
                    </Link>
                  </div>
                  <span className="font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">
                    {networkStats.successfulPartner.wins} {networkStats.successfulPartner.wins === 1 ? 'victoria' : 'victorias'} 🔥
                  </span>
                </div>
              )}

              {networkStats.frequentRival && networkStats.frequentRival.user && (
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-muted-foreground">Rival más frecuente</span>
                    <Link
                      href={`/p/${networkStats.frequentRival.user.id}?backUrl=/p/${userId}`}
                          prefetch={true}
                      className="flex items-center gap-2 hover:underline text-foreground group mt-0.5"
                    >
                      <PlayerAvatar
                        name={networkStats.frequentRival.user.alias ?? networkStats.frequentRival.user.displayName}
                        image={networkStats.frequentRival.user.image ?? undefined}
                        size={20}
                        className="group-hover:scale-105 transition-transform"
                      />
                      <span className="font-bold text-primary">
                        {networkStats.frequentRival.user.alias ?? networkStats.frequentRival.user.displayName}
                      </span>
                    </Link>
                  </div>
                  <span className="font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">
                    {networkStats.frequentRival.matches} {networkStats.frequentRival.matches === 1 ? 'partido' : 'partidos'} ⚔️
                  </span>
                </div>
              )}
            </div>
          )}
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
                  <Link href={`/match/${h2h.lastMatch.id}`} prefetch={true}>Detalle</Link>
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

function MiniCourtIndicator({
  preferredSide,
}: {
  preferredSide: "LEFT" | "RIGHT" | "BOTH" | null;
}) {
  const isLeft = preferredSide === "LEFT" || preferredSide === "BOTH";
  const isRight = preferredSide === "RIGHT" || preferredSide === "BOTH";

  return (
    <div
      className="flex items-center justify-center shrink-0 w-10 h-7 rounded border border-border bg-card p-1 shadow-xs"
      aria-hidden="true"
    >
      <div className="grid grid-cols-2 gap-0.5 w-full h-full rounded-[2px] overflow-hidden border border-border/80 bg-muted/40">
        {/* Left side (Revés) */}
        <div
          className={cn(
            "h-full rounded-[1px] transition-colors",
            isLeft ? "bg-primary" : "bg-muted"
          )}
        />
        {/* Right side (Derecha) */}
        <div
          className={cn(
            "h-full rounded-[1px] transition-colors",
            isRight ? "bg-primary" : "bg-muted"
          )}
        />
      </div>
    </div>
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
