import { Skeleton } from "@/components/ui/skeleton";
import {
  getInstallSkeletonAriaLabel,
  getInstallPageMainClasses,
  getInstallPageContainerClasses,
  getInstallLoadingLogoSkeletonClasses,
  getInstallLoadingHeaderClasses,
  getInstallLoadingTitleSkeletonClasses,
  getInstallLoadingSubtitleSkeletonClasses,
  getInstallLoadingCardSkeletonClasses,
  getInstallLoadingButtonSkeletonClasses,
} from "@/components/share/install-utils";

export default function InstallLoading() {
  return (
    <main
      role="region"
      aria-busy="true"
      aria-label={getInstallSkeletonAriaLabel()}
      className={getInstallPageMainClasses()}
    >
      <div className={getInstallPageContainerClasses()}>
        {/* Logo skeleton */}
        <Skeleton className={getInstallLoadingLogoSkeletonClasses()} />

        {/* Title & subtitle skeleton */}
        <div className={getInstallLoadingHeaderClasses()}>
          <Skeleton className={getInstallLoadingTitleSkeletonClasses()} />
          <Skeleton className={getInstallLoadingSubtitleSkeletonClasses()} />
        </div>

        {/* Install content guide card skeleton */}
        <Skeleton className={getInstallLoadingCardSkeletonClasses()} />

        {/* Back button skeleton */}
        <Skeleton className={getInstallLoadingButtonSkeletonClasses()} />
      </div>
    </main>
  );
}
