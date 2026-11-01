import { Skeleton } from "@/components/ui/skeleton";
import {
  getLoginLoadingAriaLabel,
  getLoginLoadingMainClasses,
  getLoginLoadingContentContainerClasses,
  getLoginLoadingHeaderClasses,
  getLoginLoadingTextGroupClasses,
  getLoginLoadingLogoSkeletonClasses,
  getLoginLoadingTitleSkeletonClasses,
  getLoginLoadingSubtitleSkeletonClasses,
  getLoginLoadingCtaContainerClasses,
  getLoginLoadingCtaButtonSkeletonClasses,
  getLoginLoadingTermsSkeletonClasses,
  getLoginLoadingCtaButtonKeys,
} from "@/lib/auth-utils";

export default function LoginLoading() {
  const ctaKeys = getLoginLoadingCtaButtonKeys();

  return (
    <main
      role="region"
      aria-busy="true"
      aria-label={getLoginLoadingAriaLabel()}
      className={getLoginLoadingMainClasses()}
    >
      <div className={getLoginLoadingContentContainerClasses()}>
        {/* Logo + tagline skeleton */}
        <div className={getLoginLoadingHeaderClasses()}>
          <Skeleton className={getLoginLoadingLogoSkeletonClasses()} />
          <div className={getLoginLoadingTextGroupClasses()}>
            <Skeleton className={getLoginLoadingTitleSkeletonClasses()} />
            <Skeleton className={getLoginLoadingSubtitleSkeletonClasses()} />
          </div>
        </div>

        {/* CTA buttons skeleton */}
        <div className={getLoginLoadingCtaContainerClasses()}>
          {ctaKeys.map((key) => (
            <Skeleton key={key} className={getLoginLoadingCtaButtonSkeletonClasses()} />
          ))}
        </div>

        {/* Terms footer skeleton */}
        <Skeleton className={getLoginLoadingTermsSkeletonClasses()} />
      </div>
    </main>
  );
}
