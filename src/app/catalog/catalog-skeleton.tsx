import { Skeleton } from "@/components/ui/skeleton";
import {
  getCatalogSkeletonAriaLabel,
  getCatalogSkeletonContainerClasses,
  getCatalogSkeletonLayoutClasses,
  getCatalogSkeletonSidebarClasses,
  getCatalogSkeletonSidebarStickyClasses,
  getCatalogSkeletonMainContentClasses,
  getCatalogSkeletonHeaderClasses,
  getCatalogSkeletonSectionCardClasses,
  getCatalogSkeletonSidebarSectionClasses,
  getCatalogSkeletonSidebarTabContainerClasses,
  getCatalogSkeletonMainContentListClasses,
  getCatalogSkeletonSectionGroupClasses,
  getCatalogSkeletonCardSectionClasses,
  getCatalogSkeletonCardListClasses,
  getCatalogSkeletonSidebarHeadingTitleClasses,
  getCatalogSkeletonSidebarTabButtonClasses,
  getCatalogSkeletonSidebarItemListClasses,
  getCatalogSkeletonSidebarItemClasses,
  getCatalogSkeletonHeaderTitleClasses,
  getCatalogSkeletonHeaderSubtitleClasses,
  getCatalogSkeletonSectionTitleClasses,
  getCatalogSkeletonInputClasses,
  getCatalogSkeletonButtonClasses,
  getCatalogSkeletonChipGroupClasses,
  getCatalogSkeletonChipClasses,
  getCatalogSkeletonCardItemClasses,
  getCatalogSkeletonSidebarSectionLabelClasses,
  getCatalogSkeletonCardTitleClasses,
  getCatalogSkeletonCardSubtitleClasses,
  getCatalogSkeletonSubSectionTitleClasses,
  getCatalogSkeletonLabelClasses,
  getCatalogSkeletonChipSecondaryClasses,
} from "@/components/navigation/nav-utils";

export function CatalogSkeleton() {
  return (
    <div
      role="region"
      aria-busy="true"
      aria-label={getCatalogSkeletonAriaLabel()}
      className={getCatalogSkeletonContainerClasses()}
    >
      <div className={getCatalogSkeletonLayoutClasses()}>
        {/* Sidebar skeleton (desktop) */}
        <aside className={getCatalogSkeletonSidebarClasses()}>
          <div className={getCatalogSkeletonSidebarStickyClasses()}>
            <div className={getCatalogSkeletonSidebarSectionClasses()}>
              <Skeleton className={getCatalogSkeletonSidebarHeadingTitleClasses()} />
              <div className={getCatalogSkeletonSidebarTabContainerClasses()}>
                <Skeleton className={getCatalogSkeletonSidebarTabButtonClasses()} />
                <Skeleton className={getCatalogSkeletonSidebarTabButtonClasses()} />
              </div>
            </div>

            <div className={getCatalogSkeletonSidebarSectionClasses()}>
              <Skeleton className={getCatalogSkeletonSidebarSectionLabelClasses()} />
              <div className={getCatalogSkeletonSidebarItemListClasses()}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className={getCatalogSkeletonSidebarItemClasses()} />
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content skeleton */}
        <div className={getCatalogSkeletonMainContentClasses()}>
          <header className={getCatalogSkeletonHeaderClasses()}>
            <Skeleton className={getCatalogSkeletonHeaderTitleClasses()} />
            <Skeleton className={getCatalogSkeletonHeaderSubtitleClasses()} />
          </header>

          <div className={getCatalogSkeletonMainContentListClasses()}>
            {/* Encabezados section skeleton */}
            <div className={getCatalogSkeletonSectionGroupClasses()}>
              <Skeleton className={getCatalogSkeletonSectionTitleClasses()} />
              <div className={getCatalogSkeletonSectionCardClasses()}>
                <Skeleton className={getCatalogSkeletonCardTitleClasses()} />
                <Skeleton className={getCatalogSkeletonCardSubtitleClasses()} />
              </div>
            </div>

            {/* UI Básica section skeleton */}
            <div className={getCatalogSkeletonSectionGroupClasses()}>
              <Skeleton className={getCatalogSkeletonSubSectionTitleClasses()} />
              <div className={getCatalogSkeletonCardSectionClasses()}>
                <div className={getCatalogSkeletonSidebarSectionClasses()}>
                  <Skeleton className={getCatalogSkeletonSidebarSectionLabelClasses()} />
                  <Skeleton className={getCatalogSkeletonInputClasses()} />
                  <Skeleton className={getCatalogSkeletonButtonClasses()} />
                  <Skeleton className={getCatalogSkeletonButtonClasses()} />
                </div>
                <div className={getCatalogSkeletonSidebarSectionClasses()}>
                  <Skeleton className={getCatalogSkeletonLabelClasses()} />
                  <div className={getCatalogSkeletonChipGroupClasses()}>
                    <Skeleton className={getCatalogSkeletonChipClasses()} />
                    <Skeleton className={getCatalogSkeletonChipSecondaryClasses()} />
                    <Skeleton className={getCatalogSkeletonChipClasses()} />
                  </div>
                </div>
              </div>
            </div>

            {/* Jugadores section skeleton */}
            <div className={getCatalogSkeletonSectionGroupClasses()}>
              <Skeleton className={getCatalogSkeletonSubSectionTitleClasses()} />
              <div className={getCatalogSkeletonCardListClasses()}>
                <Skeleton className={getCatalogSkeletonCardItemClasses()} />
                <Skeleton className={getCatalogSkeletonCardItemClasses()} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
