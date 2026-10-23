import { Skeleton } from "@/components/ui/skeleton";
import {
  getRootLoadingAriaLabel,
  getRootLoadingClasses,
  getRootLoadingInnerContainerClasses,
  getRootLoadingHeroClasses,
  getRootLoadingHeroTextClasses,
  getRootLoadingCardClasses,
  getRootLoadingCtaClasses,
  getRootLoadingFeaturesListClasses,
  getRootLoadingCardContentClasses,
  getRootLoadingFeatureCardKeys,
  getRootLoadingHeroAvatarSkeletonClasses,
  getRootLoadingHeroTitleSkeletonClasses,
  getRootLoadingHeroSubtitleSkeletonClasses,
  getRootLoadingHeroTaglineSkeletonClasses,
  getRootLoadingCardIconSkeletonClasses,
  getRootLoadingCardTitleSkeletonClasses,
  getRootLoadingCardTextSkeletonClasses,
  getRootLoadingCardSubtextSkeletonClasses,
  getRootLoadingCtaButtonSkeletonClasses,
  getRootLoadingCtaFooterSkeletonClasses,
} from "@/lib/root-layout-utils";

export default function RootLoading() {
  const featureKeys = getRootLoadingFeatureCardKeys();

  return (
    <main
      className={getRootLoadingClasses()}
      aria-busy="true"
      aria-label={getRootLoadingAriaLabel()}
    >
      <div className={getRootLoadingInnerContainerClasses()}>
        {/* Hero Skeleton */}
        <div className={getRootLoadingHeroClasses()}>
          <Skeleton className={getRootLoadingHeroAvatarSkeletonClasses()} />
          <div className={getRootLoadingHeroTextClasses()}>
            <Skeleton className={getRootLoadingHeroTitleSkeletonClasses()} />
            <Skeleton className={getRootLoadingHeroSubtitleSkeletonClasses()} />
            <Skeleton className={getRootLoadingHeroTaglineSkeletonClasses()} />
          </div>
        </div>

        {/* Features Skeleton */}
        <div className={getRootLoadingFeaturesListClasses()}>
          {featureKeys.map((i) => (
            <div
              key={i}
              className={getRootLoadingCardClasses()}
            >
              <Skeleton className={getRootLoadingCardIconSkeletonClasses()} />
              <div className={getRootLoadingCardContentClasses()}>
                <Skeleton className={getRootLoadingCardTitleSkeletonClasses()} />
                <Skeleton className={getRootLoadingCardTextSkeletonClasses()} />
                <Skeleton className={getRootLoadingCardSubtextSkeletonClasses()} />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Skeleton */}
        <div className={getRootLoadingCtaClasses()}>
          <Skeleton className={getRootLoadingCtaButtonSkeletonClasses()} />
          <Skeleton className={getRootLoadingCtaButtonSkeletonClasses()} />
          <Skeleton className={getRootLoadingCtaFooterSkeletonClasses()} />
        </div>
      </div>
    </main>
  );
}
