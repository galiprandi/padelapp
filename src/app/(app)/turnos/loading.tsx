import { Skeleton } from "@/components/ui/skeleton";
import {
  getTurnosLoadingAriaLabel,
  getTurnosLoadingContainerClasses,
  getTurnsPageHeaderClasses,
  getTurnsListSkeletonContainerClasses,
  getTurnsListSkeletonHeaderClasses,
  getTurnsListSkeletonCardListClasses,
} from "@/components/turns/turn-utils";

export default function TurnosLoading() {
  return (
    <div
      role="region"
      aria-busy="true"
      aria-label={getTurnosLoadingAriaLabel()}
      className={getTurnosLoadingContainerClasses()}
    >
      <div className={getTurnsPageHeaderClasses()}>
        <div>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-1 h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>

      <div className={getTurnsListSkeletonContainerClasses()}>
        <div className={getTurnsListSkeletonHeaderClasses()}>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <div className={getTurnsListSkeletonCardListClasses()}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
