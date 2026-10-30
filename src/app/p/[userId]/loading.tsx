import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import {
  getPublicProfileSkeletonAriaLabel,
  getPublicProfileHeaderTitle,
  getPublicProfileHeaderSubtitle,
  getPublicProfileMainClasses,
  getPublicProfileHeaderClasses,
  getPublicProfileHeaderSkeletonClasses,
  getPublicProfileSkeletonSummaryClasses,
  getPublicProfileSkeletonBannerClasses,
  getPublicProfileSkeletonGridClasses,
  getPublicProfileSkeletonHistoryClasses,
} from "./public-profile-utils";

export default function PublicProfileLoading() {
  return (
    <div
      className={getPublicProfileMainClasses()}
      role="region"
      aria-busy="true"
      aria-label={getPublicProfileSkeletonAriaLabel()}
    >
      {/* Header with back button */}
      <div className={getPublicProfileHeaderClasses()}>
        <div className={getPublicProfileHeaderSkeletonClasses()}>
          <ChevronLeft className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">
            {getPublicProfileHeaderTitle()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getPublicProfileHeaderSubtitle()}
          </p>
        </div>
      </div>

      {/* Profile summary skeleton */}
      <div className={getPublicProfileSkeletonSummaryClasses()}>
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-36 mx-auto" />
          <Skeleton className="h-5 w-28 mx-auto rounded-full" />
        </div>
      </div>

      {/* Ranking banner skeleton */}
      <div className={getPublicProfileSkeletonBannerClasses()}>
        <div className="grid grid-cols-3 gap-4 h-full items-center">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Metrics grid skeleton */}
      <div className={getPublicProfileSkeletonGridClasses()}>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>

      {/* History section skeleton */}
      <div className={getPublicProfileSkeletonHistoryClasses()}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
