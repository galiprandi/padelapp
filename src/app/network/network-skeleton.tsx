import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Network, ChevronLeft } from "lucide-react";
import {
  getNetworkSkeletonAriaLabel,
  getNetworkSkeletonContainerClasses,
  getNetworkSkeletonTabBarClasses,
  getNetworkSkeletonActiveTabButtonClasses,
  getNetworkSkeletonInactiveTabButtonClasses,
  getNetworkSkeletonMetricsTabLabel,
  getNetworkSkeletonGraphTabLabel,
  getNetworkSkeletonTabIconClasses,
  getNetworkSkeletonContentClasses,
  getNetworkSkeletonHeaderClasses,
  getNetworkSkeletonBackButtonClasses,
  getNetworkSkeletonBackIconClasses,
  getNetworkSkeletonHeaderTextContainerClasses,
  getNetworkSkeletonHeaderTitleClasses,
  getNetworkSkeletonHeaderSubtitleClasses,
  getNetworkSkeletonGridTwoColsClasses,
  getNetworkSkeletonGridThreeColsClasses,
  getNetworkSkeletonCardClasses,
  getNetworkSkeletonAdoptionItemKeys,
  getNetworkSkeletonNetworkStatItemKeys,
  getNetworkSkeletonEngagementItemKeys,
  getNetworkSkeletonCommunityItemKeys,
  getNetworkSkeletonTopPlayerItemKeys,
  getNetworkSkeletonStatHeaderClasses,
  getNetworkSkeletonStatLabelClasses,
  getNetworkSkeletonStatIconClasses,
  getNetworkSkeletonStatValueGroupClasses,
  getNetworkSkeletonStatValueClasses,
  getNetworkSkeletonStatBadgeClasses,
  getNetworkSkeletonStatSubtextClasses,
  getNetworkSkeletonNetworkHeaderClasses,
  getNetworkSkeletonNetworkIconClasses,
  getNetworkSkeletonNetworkTitleClasses,
  getNetworkSkeletonNetworkStatItemClasses,
  getNetworkSkeletonNetworkStatLabelClasses,
  getNetworkSkeletonNetworkStatValueClasses,
  getNetworkSkeletonNetworkFooterClasses,
  getNetworkSkeletonNetworkFooterLabelClasses,
  getNetworkSkeletonNetworkFooterValueClasses,
  getNetworkSkeletonEngagementLabelClasses,
  getNetworkSkeletonEngagementIconClasses,
  getNetworkSkeletonEngagementValueClasses,
  getNetworkSkeletonEngagementSubtextClasses,
  getNetworkSkeletonCommunityTitleClasses,
  getNetworkSkeletonCommunityListClasses,
  getNetworkSkeletonCommunityItemClasses,
  getNetworkSkeletonCommunityRowClasses,
  getNetworkSkeletonCommunityNameClasses,
  getNetworkSkeletonCommunitySizeClasses,
  getNetworkSkeletonCommunityBarClasses,
  getNetworkSkeletonTopPlayerTitleClasses,
  getNetworkSkeletonTopPlayerListClasses,
  getNetworkSkeletonTopPlayerItemClasses,
  getNetworkSkeletonTopPlayerRankClasses,
  getNetworkSkeletonTopPlayerAvatarClasses,
  getNetworkSkeletonTopPlayerInfoClasses,
  getNetworkSkeletonTopPlayerNameClasses,
  getNetworkSkeletonTopPlayerSubtextClasses,
  getNetworkSkeletonTopPlayerScoreClasses,
} from "./graph-utils";

export function NetworkSkeleton() {
  return (
    <div
      role="region"
      aria-busy="true"
      aria-label={getNetworkSkeletonAriaLabel()}
      className={getNetworkSkeletonContainerClasses()}
    >
      {/* Tab bar skeleton */}
      <div className={getNetworkSkeletonTabBarClasses()}>
        <button
          disabled
          className={getNetworkSkeletonActiveTabButtonClasses()}
        >
          <BarChart3 className={getNetworkSkeletonTabIconClasses()} />
          {getNetworkSkeletonMetricsTabLabel()}
        </button>
        <button
          disabled
          className={getNetworkSkeletonInactiveTabButtonClasses()}
        >
          <Network className={getNetworkSkeletonTabIconClasses()} />
          {getNetworkSkeletonGraphTabLabel()}
        </button>
      </div>

      {/* Content skeleton */}
      <div className={getNetworkSkeletonContentClasses()}>
        {/* Header skeleton */}
        <div className={getNetworkSkeletonHeaderClasses()}>
          <div className={getNetworkSkeletonBackButtonClasses()}>
            <ChevronLeft className={getNetworkSkeletonBackIconClasses()} />
          </div>
          <div className={getNetworkSkeletonHeaderTextContainerClasses()}>
            <Skeleton className={getNetworkSkeletonHeaderTitleClasses()} />
            <Skeleton className={getNetworkSkeletonHeaderSubtitleClasses()} />
          </div>
        </div>

        {/* Adoption stats grid skeleton */}
        <div className={getNetworkSkeletonGridTwoColsClasses()}>
          {getNetworkSkeletonAdoptionItemKeys().map((key) => (
            <div key={key} className={getNetworkSkeletonCardClasses()}>
              <div className={getNetworkSkeletonStatHeaderClasses()}>
                <Skeleton className={getNetworkSkeletonStatLabelClasses()} />
                <Skeleton className={getNetworkSkeletonStatIconClasses()} />
              </div>
              <div className={getNetworkSkeletonStatValueGroupClasses()}>
                <Skeleton className={getNetworkSkeletonStatValueClasses()} />
                <Skeleton className={getNetworkSkeletonStatBadgeClasses()} />
              </div>
              <Skeleton className={getNetworkSkeletonStatSubtextClasses()} />
            </div>
          ))}
        </div>

        {/* Network stats skeleton */}
        <div className={getNetworkSkeletonCardClasses()}>
          <div className={getNetworkSkeletonNetworkHeaderClasses()}>
            <Skeleton className={getNetworkSkeletonNetworkIconClasses()} />
            <Skeleton className={getNetworkSkeletonNetworkTitleClasses()} />
          </div>
          <div className={getNetworkSkeletonGridThreeColsClasses()}>
            {getNetworkSkeletonNetworkStatItemKeys().map((key) => (
              <div key={key} className={getNetworkSkeletonNetworkStatItemClasses()}>
                <Skeleton className={getNetworkSkeletonNetworkStatLabelClasses()} />
                <Skeleton className={getNetworkSkeletonNetworkStatValueClasses()} />
              </div>
            ))}
          </div>
          <div className={getNetworkSkeletonNetworkFooterClasses()}>
            <Skeleton className={getNetworkSkeletonNetworkFooterLabelClasses()} />
            <Skeleton className={getNetworkSkeletonNetworkFooterValueClasses()} />
          </div>
        </div>

        {/* Engagement stats skeleton */}
        <div className={getNetworkSkeletonGridTwoColsClasses()}>
          {getNetworkSkeletonEngagementItemKeys().map((key) => (
            <div key={key} className={getNetworkSkeletonCardClasses()}>
              <div className={getNetworkSkeletonStatHeaderClasses()}>
                <Skeleton className={getNetworkSkeletonEngagementLabelClasses()} />
                <Skeleton className={getNetworkSkeletonEngagementIconClasses()} />
              </div>
              <Skeleton className={getNetworkSkeletonEngagementValueClasses()} />
              <Skeleton className={getNetworkSkeletonEngagementSubtextClasses()} />
            </div>
          ))}
        </div>

        {/* Communities skeleton */}
        <div className={getNetworkSkeletonCardClasses()}>
          <Skeleton className={getNetworkSkeletonCommunityTitleClasses()} />
          <div className={getNetworkSkeletonCommunityListClasses()}>
            {getNetworkSkeletonCommunityItemKeys().map((key) => (
              <div key={key} className={getNetworkSkeletonCommunityItemClasses()}>
                <div className={getNetworkSkeletonCommunityRowClasses()}>
                  <Skeleton className={getNetworkSkeletonCommunityNameClasses()} />
                  <Skeleton className={getNetworkSkeletonCommunitySizeClasses()} />
                </div>
                <Skeleton className={getNetworkSkeletonCommunityBarClasses()} />
              </div>
            ))}
          </div>
        </div>

        {/* Top connected players skeleton */}
        <div className={getNetworkSkeletonCardClasses()}>
          <Skeleton className={getNetworkSkeletonTopPlayerTitleClasses()} />
          <div className={getNetworkSkeletonTopPlayerListClasses()}>
            {getNetworkSkeletonTopPlayerItemKeys().map((key) => (
              <div key={key} className={getNetworkSkeletonTopPlayerItemClasses()}>
                <Skeleton className={getNetworkSkeletonTopPlayerRankClasses()} />
                <Skeleton className={getNetworkSkeletonTopPlayerAvatarClasses()} />
                <div className={getNetworkSkeletonTopPlayerInfoClasses()}>
                  <Skeleton className={getNetworkSkeletonTopPlayerNameClasses()} />
                  <Skeleton className={getNetworkSkeletonTopPlayerSubtextClasses()} />
                </div>
                <Skeleton className={getNetworkSkeletonTopPlayerScoreClasses()} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
