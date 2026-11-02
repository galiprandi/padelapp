import { Skeleton } from "@/components/ui/skeleton";
import {
  getRankingSkeletonAriaLabel,
  getRankingSkeletonContainerClasses,
  getRankingSkeletonTitleClasses,
  getRankingSkeletonSubtitleClasses,
  getRankingSkeletonSearchClasses,
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

export default function RankingLoading() {
  const podiumKeys = getRankingSkeletonPodiumKeys();
  const listItemKeys = getRankingSkeletonListItemKeys();

  return (
    <div
      role="region"
      aria-label={getRankingSkeletonAriaLabel()}
      aria-busy="true"
      className={getRankingSkeletonContainerClasses()}
    >
      <div>
        <Skeleton className={getRankingSkeletonTitleClasses()} />
        <Skeleton className={getRankingSkeletonSubtitleClasses()} />
      </div>

      {/* Search bar */}
      <Skeleton className={getRankingSkeletonSearchClasses()} />

      {/* User banner */}
      <div className={getRankingSkeletonBannerClasses()}>
        <Skeleton className={getRankingSkeletonBannerAvatarClasses()} />
        <div className={getRankingSkeletonBannerContentClasses()}>
          <Skeleton className={getRankingSkeletonBannerTitleClasses()} />
          <Skeleton className={getRankingSkeletonBannerSubtitleClasses()} />
        </div>
      </div>

      {/* Podium */}
      <div className={getRankingSkeletonPodiumGridClasses()}>
        {podiumKeys.map((key) => (
          <div key={key} className={getRankingSkeletonPodiumCardClasses()}>
            <Skeleton className={getRankingSkeletonPodiumAvatarClasses()} />
            <Skeleton className={getRankingSkeletonPodiumTextClasses()} />
            <Skeleton className={getRankingSkeletonPodiumBadgeClasses()} />
          </div>
        ))}
      </div>

      {/* List */}
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
