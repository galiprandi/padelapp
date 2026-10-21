import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Network, ChevronLeft } from "lucide-react";
import {
  getNetworkSkeletonAriaLabel,
  getNetworkSkeletonContainerClasses,
  getNetworkSkeletonTabBarClasses,
  getNetworkSkeletonActiveTabButtonClasses,
  getNetworkSkeletonInactiveTabButtonClasses,
  getNetworkSkeletonContentClasses,
  getNetworkSkeletonBackButtonClasses,
  getNetworkSkeletonCardClasses,
  getNetworkSkeletonGridTwoColsClasses,
  getNetworkSkeletonGridThreeColsClasses,
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
          <BarChart3 className="h-4 w-4" />
          Métricas
        </button>
        <button
          disabled
          className={getNetworkSkeletonInactiveTabButtonClasses()}
        >
          <Network className="h-4 w-4" />
          Grafo
        </button>
      </div>

      {/* Content skeleton */}
      <div className={getNetworkSkeletonContentClasses()}>
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className={getNetworkSkeletonBackButtonClasses()}>
            <ChevronLeft className="h-5 w-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full max-w-[240px]" />
          </div>
        </div>

        {/* Adoption stats grid skeleton */}
        <div className={getNetworkSkeletonGridTwoColsClasses()}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={getNetworkSkeletonCardClasses()}>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Network stats skeleton */}
        <div className={getNetworkSkeletonCardClasses()}>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className={getNetworkSkeletonGridThreeColsClasses()}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-6 w-10" />
              </div>
            ))}
          </div>
          <div className="space-y-1.5 pt-2 border-t border-border">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        {/* Engagement stats skeleton */}
        <div className={getNetworkSkeletonGridTwoColsClasses()}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={getNetworkSkeletonCardClasses()}>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Communities skeleton */}
        <div className={getNetworkSkeletonCardClasses()}>
          <Skeleton className="h-4 w-24" />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Top connected players skeleton */}
        <div className={getNetworkSkeletonCardClasses()}>
          <Skeleton className="h-4 w-28" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-3 w-4" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
