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
  getPublicProfileSkeletonContainerClasses,
  getPublicProfileSkeletonSummaryClasses,
  getPublicProfileSkeletonBannerClasses,
  getPublicProfileSkeletonGridClasses,
  getPublicProfileSkeletonHistoryClasses,
  getPublicProfileHeaderTitleClasses,
  getPublicProfileHeaderSubtitleClasses,
  getPublicProfileBackIconClasses,
  getPublicProfileContentSectionClasses,
  getPublicProfileAvatarSectionClasses,
  getPublicProfileAvatarWrapperClasses,
  getPublicProfileAvatarClasses,
  getPublicProfileDetailsContainerClasses,
  getPublicProfileNameRowClasses,
  getPublicProfileNameClasses,
  getPublicProfileShareWrapperClasses,
  getPublicProfileBadgesContainerClasses,
  getPublicProfileStatsGridClasses,
  getPublicProfileCardLabelClasses,
  getPublicProfileCardValueRowClasses,
  getPublicProfileCardValueClasses,
  getPublicProfileCardUnitClasses,
  getPublicProfileRecentFormContainerClasses,
  getPublicProfileRecentFormEmptyClasses,
  getPublicProfileNetworkGridClasses,
  getPublicProfileNetworkColClasses,
  getPublicProfileNetworkLabelClasses,
  getPublicProfileNetworkIconClasses,
  getPublicProfileNetworkValueRowClasses,
  getPublicProfileNetworkValueClasses,
  getPublicProfileNetworkSubtextClasses,
  getPublicProfilePreferredSideRowClasses,
  getPublicProfilePreferredSideTextGroupClasses,
  getPublicProfilePreferredSideValueClasses,
  getPublicProfilePreferredSideSummaryClasses,
  getPublicProfileNetworkListContainerClasses,
  getPublicProfileNetworkItemRowClasses,
  getPublicProfileNetworkItemInfoClasses,
  getPublicProfileNetworkItemLabelClasses,
  getPublicProfileNetworkItemLinkClasses,
  getPublicProfileNetworkItemAvatarClasses,
  getPublicProfileNetworkItemNameClasses,
  getPublicProfileH2HGridClasses,
  getPublicProfileH2HColClasses,
  getPublicProfileH2HLabelClasses,
  getPublicProfileH2HIconClasses,
  getPublicProfileH2HValueRowClasses,
  getPublicProfileH2HValueClasses,
  getPublicProfileH2HTotalClasses,
  getPublicProfileH2HLastMatchRowClasses,
  getPublicProfileH2HLastMatchInfoClasses,
  getPublicProfileH2HLastMatchButtonClasses,
  getPublicProfileHistorySectionClasses,
  getPublicProfileHistoryHeaderClasses,
  getPublicProfileHistoryTitleClasses,
  getPublicProfileHistoryBadgeClasses,
  getPublicProfileHistoryBadgeIconClasses,
  getPublicProfileHistoryListClasses,
  getPublicProfileSkeletonSummaryAvatarClasses,
  getPublicProfileSkeletonSummaryGroupClasses,
  getPublicProfileSkeletonSummaryNameClasses,
  getPublicProfileSkeletonSummaryBadgeClasses,
  getPublicProfileSkeletonBannerGridClasses,
  getPublicProfileSkeletonBannerItemClasses,
  getPublicProfileSkeletonGridItemClasses,
  getPublicProfileSkeletonHistoryTitleClasses,
  getPublicProfileSkeletonHistoryItemClasses,
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
              <ChevronLeft className={getPublicProfileBackIconClasses()} />
            </div>
          }
        >
          <DynamicBackButton searchParams={searchParams} />
        </Suspense>
        <div>
          <h1 className={getPublicProfileHeaderTitleClasses()}>
            {getPublicProfileHeaderTitle()}
          </h1>
          <p className={getPublicProfileHeaderSubtitleClasses()}>
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
      <ChevronLeft className={getPublicProfileBackIconClasses()} />
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
      <section className={getPublicProfileContentSectionClasses()} role="region" aria-label={getPublicProfileHeaderAriaLabel(displayName)}>
        <div className={getPublicProfileAvatarSectionClasses()}>
          <div className={getPublicProfileAvatarWrapperClasses()}>
            <PlayerAvatar
              name={displayName}
              image={user.image ?? undefined}
              size={96}
              className={getPublicProfileAvatarClasses()}
            />
          </div>

          <div className={getPublicProfileDetailsContainerClasses()}>
            <div className={getPublicProfileNameRowClasses()}>
              <h2 className={getPublicProfileNameClasses()}>
                {displayName}
              </h2>
              <div className={getPublicProfileShareWrapperClasses()}>
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
            <div className={getPublicProfileBadgesContainerClasses()}>
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

        <div className={getPublicProfileStatsGridClasses()}>
          <div
            className={getPublicProfileStatCardClasses()}
            aria-label={getWinRateAriaLabel(winRate, user.matchesPlayed)}
          >
            <div className={getPublicProfileCardLabelClasses()}>
              {getPublicProfileWinRateLabel()}
            </div>
            <div className={getPublicProfileCardValueRowClasses()}>
              <span className={getPublicProfileCardValueClasses()}>
                {winRate}%
              </span>
              <span className={getPublicProfileCardUnitClasses()}>
                WR
              </span>
            </div>
          </div>

          <div className={getPublicProfileStatCardClasses()}>
            <div className={getPublicProfileCardLabelClasses()}>
              {getPublicProfileRecentFormLabel()}
            </div>
            {recentForm.length > 0 ? (
              <div
                className={getPublicProfileRecentFormContainerClasses()}
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
              <div className={getPublicProfileRecentFormContainerClasses()} aria-label="Sin partidos">
                <span className={getPublicProfileRecentFormEmptyClasses()} aria-hidden="true">
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
          <h3 className={getPublicProfileCardLabelClasses()}>
            Red y Posición
          </h3>

          <div className={getPublicProfileNetworkGridClasses()}>
            <div className={getPublicProfileNetworkColClasses()}>
              <div className={getPublicProfileNetworkLabelClasses()}>
                <Network className={getPublicProfileNetworkIconClasses()} />
                {getPublicProfileNetworkContactsLabel()}
              </div>
              <div className={getPublicProfileNetworkValueRowClasses()}>
                <span className={getPublicProfileNetworkValueClasses()}>
                  {networkStats.networkSize}
                </span>
                <span className={getPublicProfileNetworkSubtextClasses()}>jugadores</span>
              </div>
            </div>

            <div className={getPublicProfileNetworkColClasses()}>
              <div className={getPublicProfileNetworkLabelClasses()}>
                <Activity className={getPublicProfileNetworkIconClasses()} />
                {getPublicProfilePreferredSideHeadingText()}
              </div>
              <div className={getPublicProfilePreferredSideRowClasses()}>
                <div className={getPublicProfilePreferredSideTextGroupClasses()}>
                  <span className={getPublicProfilePreferredSideValueClasses()}>
                    {getPublicProfileSideLabel(networkStats.preferredSide)}
                  </span>
                  <span className={getPublicProfilePreferredSideSummaryClasses()}>
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
            <div className={getPublicProfileNetworkListContainerClasses()}>
              {networkStats.successfulPartner && networkStats.successfulPartner.user && (
                <div className={getPublicProfileNetworkItemRowClasses()}>
                  <div className={getPublicProfileNetworkItemInfoClasses()}>
                    <span className={getPublicProfileNetworkItemLabelClasses()}>{getPublicProfileSuccessfulPartnerLabel()}</span>
                    <Link
                      href={`/p/${networkStats.successfulPartner.user.id}?backUrl=/p/${userId}`}
                      prefetch={true}
                      className={getPublicProfileNetworkItemLinkClasses()}
                    >
                      <PlayerAvatar
                        name={networkStats.successfulPartner.user.alias ?? networkStats.successfulPartner.user.displayName}
                        image={networkStats.successfulPartner.user.image ?? undefined}
                        size={20}
                        className={getPublicProfileNetworkItemAvatarClasses()}
                      />
                      <span className={getPublicProfileNetworkItemNameClasses()}>
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
                <div className={getPublicProfileNetworkItemRowClasses()}>
                  <div className={getPublicProfileNetworkItemInfoClasses()}>
                    <span className={getPublicProfileNetworkItemLabelClasses()}>{getPublicProfileFrequentRivalLabel()}</span>
                    <Link
                      href={`/p/${networkStats.frequentRival.user.id}?backUrl=/p/${userId}`}
                      prefetch={true}
                      className={getPublicProfileNetworkItemLinkClasses()}
                    >
                      <PlayerAvatar
                        name={networkStats.frequentRival.user.alias ?? networkStats.frequentRival.user.displayName}
                        image={networkStats.frequentRival.user.image ?? undefined}
                        size={20}
                        className={getPublicProfileNetworkItemAvatarClasses()}
                      />
                      <span className={getPublicProfileNetworkItemNameClasses()}>
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
            <h3 className={getPublicProfileCardLabelClasses()}>
              {getPublicProfileHeadToHeadHeadingText()}
            </h3>

            <div className={getPublicProfileH2HGridClasses()}>
              <div className={getPublicProfileH2HColClasses()}>
                <div className={getPublicProfileH2HLabelClasses()}>
                  <Users className={getPublicProfileH2HIconClasses()} />
                  {getPublicProfileAsPartnersLabel()}
                </div>
                <div className={getPublicProfileH2HValueRowClasses()}>
                  <span className={getPublicProfileH2HValueClasses()}>
                    {h2h.together.wins}
                  </span>
                  <span className={getPublicProfileH2HTotalClasses()}>
                    / {h2h.together.total}
                  </span>
                </div>
              </div>

              <div className={getPublicProfileH2HColClasses()}>
                <div className={getPublicProfileH2HLabelClasses()}>
                  <Swords className={getPublicProfileH2HIconClasses()} />
                  {getPublicProfileAsRivalsLabel()}
                </div>
                <div className={getPublicProfileH2HValueRowClasses()}>
                  <span className={getPublicProfileH2HValueClasses(true)}>
                    {h2h.against.wins}
                  </span>
                  <span className={getPublicProfileH2HTotalClasses()}>
                    / {h2h.against.total}
                  </span>
                </div>
              </div>
            </div>

            {h2h.lastMatch && (
              <div className={getPublicProfileH2HLastMatchRowClasses()}>
                <div className={getPublicProfileH2HLastMatchInfoClasses()}>
                  <span className={getPublicProfileCardLabelClasses()}>
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
                  className={getPublicProfileH2HLastMatchButtonClasses()}
                  asChild
                >
                  <Link href={`/match/${h2h.lastMatch.id}`} prefetch={true}>Detalle</Link>
                </Button>
              </div>
            )}
          </section>
        )}
      </section>

      <section className={getPublicProfileHistorySectionClasses()} role="region" aria-label={getMatchHistoryRegionAriaLabel()}>
        <div className={getPublicProfileHistoryHeaderClasses()}>
          <h2 className={getPublicProfileHistoryTitleClasses()}>
            {getPublicProfileMatchHistoryHeadingText()}
          </h2>
          <div className={getPublicProfileHistoryBadgeClasses()}>
            <Zap className={getPublicProfileHistoryBadgeIconClasses()} aria-hidden="true" />
            {winRate}% WR
          </div>
        </div>
        <div className={getPublicProfileHistoryListClasses()}>
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
      className={getPublicProfileSkeletonContainerClasses()}
      role="region"
      aria-busy="true"
      aria-label={getPublicProfileSkeletonAriaLabel()}
    >
      {/* Profile summary skeleton */}
      <div className={getPublicProfileSkeletonSummaryClasses()}>
        <Skeleton className={getPublicProfileSkeletonSummaryAvatarClasses()} />
        <div className={getPublicProfileSkeletonSummaryGroupClasses()}>
          <Skeleton className={getPublicProfileSkeletonSummaryNameClasses()} />
          <Skeleton className={getPublicProfileSkeletonSummaryBadgeClasses()} />
        </div>
      </div>

      {/* Ranking banner skeleton */}
      <div className={getPublicProfileSkeletonBannerClasses()}>
        <div className={getPublicProfileSkeletonBannerGridClasses()}>
          <Skeleton className={getPublicProfileSkeletonBannerItemClasses()} />
          <Skeleton className={getPublicProfileSkeletonBannerItemClasses()} />
          <Skeleton className={getPublicProfileSkeletonBannerItemClasses()} />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className={getPublicProfileSkeletonGridClasses()}>
        <Skeleton className={getPublicProfileSkeletonGridItemClasses()} />
        <Skeleton className={getPublicProfileSkeletonGridItemClasses()} />
      </div>

      {/* History section skeleton */}
      <div className={getPublicProfileSkeletonHistoryClasses()}>
        <Skeleton className={getPublicProfileSkeletonHistoryTitleClasses()} />
        <div className={getPublicProfileSkeletonSummaryGroupClasses()}>
          <Skeleton className={getPublicProfileSkeletonHistoryItemClasses()} />
          <Skeleton className={getPublicProfileSkeletonHistoryItemClasses()} />
        </div>
      </div>
    </div>
  );
}
