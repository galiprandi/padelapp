import { Suspense } from "react";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
import { RankingSearch } from "@/components/ranking/ranking-search";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCachedRanking,
  getCachedRankingSearch,
  getCachedCurrentUserRankingData,
  getPendingActions,
} from "@/lib/queries";
import { auth } from "@/auth";
import { RankingFilter } from "@/components/ranking/ranking-filter";
import { RankingInfo } from "@/components/ranking/ranking-info";
import { PendingConfirmationsAlert } from "@/components/ranking/pending-confirmations-alert";
import {
  getRankingHeadingTitle,
  getRankingHeadingDescription,
  getRankingSkeletonAriaLabel,
  getRankingPageContainerClasses,
  getRankingHeadingTitleClasses,
  getRankingHeadingDescriptionClasses,
  getRankingSearchSkeletonClasses,
  getRankingSearchSkeletonAriaLabel,
  getRankingSkeletonBannerCardClasses,
  getRankingSkeletonBannerAvatarClasses,
  getRankingSkeletonBannerTextGroupClasses,
  getRankingSkeletonBannerNameClasses,
  getRankingSkeletonBannerSubtitleClasses,
  getRankingSkeletonPodiumGridClasses,
  getRankingSkeletonPodiumItemClasses,
  getRankingSkeletonPodiumAvatarClasses,
  getRankingSkeletonPodiumNameClasses,
  getRankingSkeletonPodiumScoreClasses,
  getRankingSkeletonPodiumKeys,
  getRankingSkeletonListClasses,
  getRankingSkeletonListItemClasses,
  getRankingSkeletonListRankClasses,
  getRankingSkeletonListAvatarClasses,
  getRankingSkeletonListTextGroupClasses,
  getRankingSkeletonListNameClasses,
  getRankingSkeletonListSubtitleClasses,
  getRankingSkeletonListItemKeys,
} from "@/components/ranking/ranking-utils";

interface RankingPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default function RankingPage({ searchParams }: RankingPageProps) {
  return (
    <div className={getRankingPageContainerClasses()}>
      <div>
        <h1 className={getRankingHeadingTitleClasses()}>{getRankingHeadingTitle()}</h1>
        <p className={getRankingHeadingDescriptionClasses()}>
          {getRankingHeadingDescription()}
        </p>
      </div>

      <Suspense fallback={<Skeleton className={getRankingSearchSkeletonClasses()} aria-label={getRankingSearchSkeletonAriaLabel()} />}>
        <RankingSearch />
      </Suspense>

      <Suspense fallback={<RankingContentSkeleton />}>
        <RankingContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function RankingContent({ searchParams }: RankingPageProps) {
  const session = await auth();
  const viewerId = session?.user?.id;
  const { q: query } = await searchParams;

  const players = query
    ? await getCachedRankingSearch(query)
    : await getCachedRanking();

  const currentUser = viewerId
    ? await getCachedCurrentUserRankingData(viewerId)
    : null;

  const pendingActions = viewerId ? await getPendingActions(viewerId) : [];

  return (
    <div className={getRankingPageContainerClasses()}>
      {!query && <RankingInfo />}

      {viewerId && pendingActions.length > 0 && !query && (
        <PendingConfirmationsAlert
          pendingActions={pendingActions}
          viewerId={viewerId}
        />
      )}

      {currentUser && currentUser.matchesPlayed > 0 && !query && (
        <UserRankingBanner
          userId={currentUser.id}
          position={currentUser.rankingPosition}
          score={currentUser.rankingScore}
          delta={currentUser.rankingDelta}
          wins={currentUser.wins}
          losses={currentUser.losses}
          attendanceScore={currentUser.attendanceScore}
          matchesPlayed={currentUser.matchesPlayed}
          lastMatchAt={currentUser.lastMatchAt}
        />
      )}

      <RankingFilter
        players={players}
        viewerId={viewerId}
        query={query}
      />
    </div>
  );
}

function RankingContentSkeleton() {
  return (
    <div
      role="region"
      aria-label={getRankingSkeletonAriaLabel()}
      aria-busy="true"
      className={getRankingPageContainerClasses()}
    >
      {/* User banner skeleton */}
      <div className={getRankingSkeletonBannerCardClasses()}>
        <Skeleton className={getRankingSkeletonBannerAvatarClasses()} />
        <div className={getRankingSkeletonBannerTextGroupClasses()}>
          <Skeleton className={getRankingSkeletonBannerNameClasses()} />
          <Skeleton className={getRankingSkeletonBannerSubtitleClasses()} />
        </div>
      </div>

      {/* Podium skeleton */}
      <div className={getRankingSkeletonPodiumGridClasses()}>
        {getRankingSkeletonPodiumKeys().map((key) => (
          <div key={key} className={getRankingSkeletonPodiumItemClasses()}>
            <Skeleton className={getRankingSkeletonPodiumAvatarClasses()} />
            <Skeleton className={getRankingSkeletonPodiumNameClasses()} />
            <Skeleton className={getRankingSkeletonPodiumScoreClasses()} />
          </div>
        ))}
      </div>

      {/* List skeleton */}
      <div className={getRankingSkeletonListClasses()}>
        {getRankingSkeletonListItemKeys().map((key) => (
          <div key={key} className={getRankingSkeletonListItemClasses()}>
            <Skeleton className={getRankingSkeletonListRankClasses()} />
            <Skeleton className={getRankingSkeletonListAvatarClasses()} />
            <div className={getRankingSkeletonListTextGroupClasses()}>
              <Skeleton className={getRankingSkeletonListNameClasses()} />
              <Skeleton className={getRankingSkeletonListSubtitleClasses()} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
