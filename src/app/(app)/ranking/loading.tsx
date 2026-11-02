import { Skeleton } from "@/components/ui/skeleton";
import {
  getRankingSkeletonAriaLabel,
  getRankingPageContainerClasses,
  getRankingSearchSkeletonClasses,
  getRankingSearchSkeletonAriaLabel,
  getRankingSkeletonHeaderTitleClasses,
  getRankingSkeletonHeaderSubtitleClasses,
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

export default function RankingLoading() {
  return (
    <div
      role="region"
      aria-label={getRankingSkeletonAriaLabel()}
      aria-busy="true"
      className={getRankingPageContainerClasses()}
    >
      <div>
        <Skeleton className={getRankingSkeletonHeaderTitleClasses()} />
        <Skeleton className={getRankingSkeletonHeaderSubtitleClasses()} />
      </div>

      {/* Search bar */}
      <Skeleton className={getRankingSearchSkeletonClasses()} aria-label={getRankingSearchSkeletonAriaLabel()} />

      {/* User banner */}
      <div className={getRankingSkeletonBannerCardClasses()}>
        <Skeleton className={getRankingSkeletonBannerAvatarClasses()} />
        <div className={getRankingSkeletonBannerTextGroupClasses()}>
          <Skeleton className={getRankingSkeletonBannerNameClasses()} />
          <Skeleton className={getRankingSkeletonBannerSubtitleClasses()} />
        </div>
      </div>

      {/* Podium */}
      <div className={getRankingSkeletonPodiumGridClasses()}>
        {getRankingSkeletonPodiumKeys().map((key) => (
          <div key={key} className={getRankingSkeletonPodiumItemClasses()}>
            <Skeleton className={getRankingSkeletonPodiumAvatarClasses()} />
            <Skeleton className={getRankingSkeletonPodiumNameClasses()} />
            <Skeleton className={getRankingSkeletonPodiumScoreClasses()} />
          </div>
        ))}
      </div>

      {/* List */}
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
