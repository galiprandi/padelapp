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
import { getLevelBadgeLabel } from "@/lib/utils";
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
import {
  getPublicProfileSideLabel,
  formatSideWinRateSummary,
  calculateWinningStreak,
  formatPartnerWinsText,
  formatRivalMatchesText,
  calculateRecentForm,
  getRecentFormAriaLabel,
  getStreakBadgeText,
  getWinRateAriaLabel,
  getPublicProfileBackAriaLabel,
  getPublicProfileHeaderAriaLabel,
  getPublicProfileShareTitle,
  getPublicProfileShareText,
  getNetworkPositionRegionAriaLabel,
  getHeadToHeadRegionAriaLabel,
  formatH2HLastMatchResultText,
  getMatchHistoryRegionAriaLabel,
  getPublicProfileSkeletonAriaLabel,
  getPublicProfileHeaderTitle,
  getPublicProfileHeaderSubtitle,
  getMiniCourtIndicatorClasses,
  getRecentFormDotClasses,
  getPublicProfileWinRateLabel,
  getPublicProfileRecentFormLabel,
  getPublicProfileNetworkContactsLabel,
  getPublicProfilePreferredSideHeadingText,
  getPublicProfileSuccessfulPartnerLabel,
  getPublicProfileFrequentRivalLabel,
  getPublicProfileHeadToHeadHeadingText,
  getPublicProfileAsPartnersLabel,
  getPublicProfileAsRivalsLabel,
  getPublicProfileLastMatchLabel,
  getPublicProfileMatchHistoryHeadingText,
  getPublicProfileEmptyStateProps,
  getPublicProfileMainClasses,
  getPublicProfileHeaderClasses,
  getPublicProfileBackButtonClasses,
  getPublicProfileHeaderSkeletonClasses,
  getPublicProfileAvatarBadgeClasses,
  getPublicProfileStreakBadgeClasses,
  getPublicProfileStatCardClasses,
  getPublicProfileNetworkCardClasses,
  getPublicProfileNetworkBadgeClasses,
  getPublicProfileH2HCardClasses,
  getPublicProfileH2HResultClasses,
  getPublicProfileMiniCourtContainerClasses,
  getPublicProfileMiniCourtGridClasses,
  getPublicProfileShareButtonClasses,
} from "./public-profile-utils";

interface PublicProfilePageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ backUrl?: string }>;
}

export default function PublicProfilePage({
  params,
  searchParams,
}: PublicProfilePageProps) {
  return (
    <div className={getPublicProfileMainClasses()}>
      <div className={getPublicProfileHeaderClasses()}>
        <Suspense
          fallback={
            <div className={getPublicProfileHeaderSkeletonClasses()}>
              <ChevronLeft className="h-5 w-5" />
            </div>
          }
        >
          <DynamicBackButton searchParams={searchParams} />
        </Suspense>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {getPublicProfileHeaderTitle()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getPublicProfileHeaderSubtitle()}
          </p>
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
      aria-label={getPublicProfileBackAriaLabel()}
      className={getPublicProfileBackButtonClasses()}
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

  const recentForm = calculateRecentForm(matches_result, userId);
  const currentStreak = calculateWinningStreak(recentForm);

  const h2h =
    viewerId && viewerId !== userId
      ? await getCachedHeadToHeadStats(viewerId, userId)
      : null;

  return (
    <>
      <section className="space-y-6" role="region" aria-label={getPublicProfileHeaderAriaLabel(displayName)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <PlayerAvatar
              name={displayName}
              image={user.image ?? undefined}
              size={96}
              className="border-2 border-border shadow-xs"
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
                  title={getPublicProfileShareTitle(displayName)}
                  text={getPublicProfileShareText(displayName)}
                  variant="ghost"
                  size="sm"
                  iconOnly
                  className={getPublicProfileShareButtonClasses()}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" className={getPublicProfileAvatarBadgeClasses()}>
                {getLevelBadgeLabel(user.level)}
              </Badge>
              {currentStreak >= 2 && (
                <Badge
                  variant="outline"
                  className={getPublicProfileStreakBadgeClasses()}
                >
                  {getStreakBadgeText(currentStreak)}
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
          <div
            className={getPublicProfileStatCardClasses()}
            aria-label={getWinRateAriaLabel(winRate, user.matchesPlayed)}
          >
            <div className="text-xs font-bold text-muted-foreground">
              {getPublicProfileWinRateLabel()}
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

          <div className={getPublicProfileStatCardClasses()}>
            <div className="text-xs font-bold text-muted-foreground">
              {getPublicProfileRecentFormLabel()}
            </div>
            {recentForm.length > 0 ? (
              <div
                className="flex gap-1.5 pt-1"
                aria-label={getRecentFormAriaLabel(recentForm)}
              >
                {recentForm.map((result, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    className={getRecentFormDotClasses(result)}
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
        <section
          role="region"
          aria-label={getNetworkPositionRegionAriaLabel()}
          className={getPublicProfileNetworkCardClasses()}
        >
          <h3 className="text-xs font-bold text-muted-foreground">
            Red y Posición
          </h3>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Network className="h-3.5 w-3.5 text-primary" />
                {getPublicProfileNetworkContactsLabel()}
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
                {getPublicProfilePreferredSideHeadingText()}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-bold text-foreground leading-tight">
                    {getPublicProfileSideLabel(networkStats.preferredSide)}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                    {formatSideWinRateSummary(
                      networkStats.winRateRight,
                      networkStats.winRateLeft,
                    )}
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
                    <span className="font-semibold text-muted-foreground">{getPublicProfileSuccessfulPartnerLabel()}</span>
                    <Link
                      href={`/p/${networkStats.successfulPartner.user.id}?backUrl=/p/${userId}`}
                      prefetch={true}
                      className="flex items-center gap-2 hover:underline text-foreground group mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-xs active:scale-[0.98] transition-all"
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
                  <span className={getPublicProfileNetworkBadgeClasses()}>
                    {formatPartnerWinsText(networkStats.successfulPartner.wins)}
                  </span>
                </div>
              )}

              {networkStats.frequentRival && networkStats.frequentRival.user && (
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-muted-foreground">{getPublicProfileFrequentRivalLabel()}</span>
                    <Link
                      href={`/p/${networkStats.frequentRival.user.id}?backUrl=/p/${userId}`}
                      prefetch={true}
                      className="flex items-center gap-2 hover:underline text-foreground group mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-xs active:scale-[0.98] transition-all"
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
                  <span className={getPublicProfileNetworkBadgeClasses()}>
                    {formatRivalMatchesText(networkStats.frequentRival.matches)}
                  </span>
                </div>
              )}
            </div>
          )}
        </section>

        {h2h && (h2h.together.total > 0 || h2h.against.total > 0) && (
          <section
            role="region"
            aria-label={getHeadToHeadRegionAriaLabel()}
            className={getPublicProfileH2HCardClasses()}
          >
            <h3 className="text-xs font-bold text-muted-foreground">
              {getPublicProfileHeadToHeadHeadingText()}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {getPublicProfileAsPartnersLabel()}
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
                  {getPublicProfileAsRivalsLabel()}
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
                    {getPublicProfileLastMatchLabel()}
                  </span>
                  <span
                    className={getPublicProfileH2HResultClasses(
                      h2h.lastMatch.winner === h2h.lastMatch.viewerTeam
                    )}
                  >
                    {formatH2HLastMatchResultText(
                      h2h.lastMatch.winner === h2h.lastMatch.viewerTeam,
                      h2h.lastMatch.score,
                    )}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 rounded-lg text-xs font-bold focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all"
                  asChild
                >
                  <Link href={`/match/${h2h.lastMatch.id}`} prefetch={true}>Detalle</Link>
                </Button>
              </div>
            )}
          </section>
        )}
      </section>

      <section className="space-y-4" role="region" aria-label={getMatchHistoryRegionAriaLabel()}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            {getPublicProfileMatchHistoryHeadingText()}
          </h2>
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground bg-muted px-2.5 py-1 rounded-full border border-border shadow-xs">
            <Zap className="h-3 w-3 text-primary fill-current" aria-hidden="true" />
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
            (() => {
              const emptyProps = getPublicProfileEmptyStateProps();
              return (
                <EmptyState
                  icon={Trophy}
                  title={emptyProps.title}
                  description={emptyProps.description}
                />
              );
            })()
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
      className={getPublicProfileMiniCourtContainerClasses()}
      aria-hidden="true"
    >
      <div className={getPublicProfileMiniCourtGridClasses()}>
        {/* Left side (Revés) */}
        <div className={getMiniCourtIndicatorClasses(isLeft)} />
        {/* Right side (Derecha) */}
        <div className={getMiniCourtIndicatorClasses(isRight)} />
      </div>
    </div>
  );
}

function PublicProfileSkeleton() {
  return (
    <div
      className="space-y-6"
      role="region"
      aria-busy="true"
      aria-label={getPublicProfileSkeletonAriaLabel()}
    >
      {/* Profile summary skeleton */}
      <div className="flex flex-col items-center gap-4 text-center">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      </div>

      {/* Ranking banner skeleton */}
      <div className="h-24 rounded-xl bg-card border border-border p-4 shadow-xs">
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
