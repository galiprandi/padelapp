import { Skeleton } from "@/components/ui/skeleton";
import {
  getDashboardSkeletonAriaLabel,
  getDashboardSkeletonContainerClasses,
  getDashboardSkeletonGreetingClasses,
  getDashboardSkeletonStatsGridClasses,
  getDashboardSkeletonStatCardClasses,
  getDashboardSkeletonHeroContainerClasses,
  getDashboardSkeletonSectionClasses,
} from "./dashboard-utils";

export default function DashboardLoading() {
  return (
    <div
      className={getDashboardSkeletonContainerClasses()}
      role="region"
      aria-busy="true"
      aria-label={getDashboardSkeletonAriaLabel()}
    >
      {/* Greeting */}
      <div className={getDashboardSkeletonGreetingClasses()}>
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* Stats grid */}
      <div className={getDashboardSkeletonStatsGridClasses()}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={getDashboardSkeletonStatCardClasses()}>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>

      {/* Hero activity */}
      <div className={getDashboardSkeletonHeroContainerClasses()}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>

      {/* Agenda */}
      <div className={getDashboardSkeletonSectionClasses()}>
        <Skeleton className="h-4 w-24" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Recent results */}
      <div className={getDashboardSkeletonSectionClasses()}>
        <Skeleton className="h-4 w-28" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
