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
  getRankingSkeletonContainerClasses,
  getRankingSkeletonBannerClasses,
  getRankingSkeletonBannerAvatarClasses,
  getRankingSkeletonBannerContentClasses,
  getRankingSkeletonBannerTitleClasses,
  getRankingSkeletonBannerSubtitleClasses,
  getRankingSkeletonPodiumGridClasses,
  getRankingSkeletonPodiumCardClasses,
  getRankingSkeletonPodiumAvatarClasses,
  getRankingSkeletonPodiumTextClasses,
  getRankingSkeletonPodiumBadgeClasses,
  getRankingSkeletonListContainerClasses,
  getRankingSkeletonListItemClasses,
  getRankingSkeletonListItemPositionClasses,
  getRankingSkeletonListItemAvatarClasses,
  getRankingSkeletonListItemContentClasses,
  getRankingSkeletonListItemNameClasses,
  getRankingSkeletonListItemScoreClasses,
  getRankingSkeletonPodiumKeys,
  getRankingSkeletonListItemKeys,
} from "@/components/ranking/ranking-utils";

interface RankingPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default function RankingPage({ searchParams }: RankingPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{getRankingHeadingTitle()}</h1>
        <p className="text-sm text-muted-foreground">
          {getRankingHeadingDescription()}
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-12 w-full rounded-xl" aria-label="Cargando buscador de ranking..." />}>
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
    <div className="flex flex-col gap-6">
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
  const podiumKeys = getRankingSkeletonPodiumKeys();
  const listItemKeys = getRankingSkeletonListItemKeys();

  return (
    <div
      role="region"
      aria-label={getRankingSkeletonAriaLabel()}
      aria-busy="true"
      className={getRankingSkeletonContainerClasses()}
    >
      {/* User banner skeleton */}
      <div className={getRankingSkeletonBannerClasses()}>
        <Skeleton className={getRankingSkeletonBannerAvatarClasses()} />
        <div className={getRankingSkeletonBannerContentClasses()}>
          <Skeleton className={getRankingSkeletonBannerTitleClasses()} />
          <Skeleton className={getRankingSkeletonBannerSubtitleClasses()} />
        </div>
      </div>

      {/* Podium skeleton */}
      <div className={getRankingSkeletonPodiumGridClasses()}>
        {podiumKeys.map((key) => (
          <div key={key} className={getRankingSkeletonPodiumCardClasses()}>
            <Skeleton className={getRankingSkeletonPodiumAvatarClasses()} />
            <Skeleton className={getRankingSkeletonPodiumTextClasses()} />
            <Skeleton className={getRankingSkeletonPodiumBadgeClasses()} />
          </div>
        ))}
      </div>

      {/* List skeleton */}
      <div className={getRankingSkeletonListContainerClasses()}>
        {listItemKeys.map((key) => (
          <div key={key} className={getRankingSkeletonListItemClasses()}>
            <Skeleton className={getRankingSkeletonListItemPositionClasses()} />
            <Skeleton className={getRankingSkeletonListItemAvatarClasses()} />
            <div className={getRankingSkeletonListItemContentClasses()}>
              <Skeleton className={getRankingSkeletonListItemNameClasses()} />
              <Skeleton className={getRankingSkeletonListItemScoreClasses()} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
