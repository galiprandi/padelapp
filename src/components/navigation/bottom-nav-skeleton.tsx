import { Skeleton } from "@/components/ui/skeleton";
import {
  getBottomNavSkeletonAriaLabel,
  getBottomNavContainerClasses,
  getBottomNavInnerContainerClasses,
  getBottomNavTabSkeletonClasses,
  getBottomNavFabSkeletonClasses,
} from "./nav-utils";

interface BottomNavSkeletonProps {
  position?: "fixed" | "static";
}

export function BottomNavSkeleton({
  position = "fixed",
}: BottomNavSkeletonProps) {
  return (
    <div
      role="status"
      aria-label={getBottomNavSkeletonAriaLabel()}
      className={getBottomNavContainerClasses(position)}
    >
      <div className={getBottomNavInnerContainerClasses()}>
        {/* Left tabs skeleton */}
        <div className={getBottomNavTabSkeletonClasses()}>
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>
        <div className={getBottomNavTabSkeletonClasses()}>
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>

        {/* Central FAB skeleton */}
        <div className={getBottomNavFabSkeletonClasses()}>
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>

        {/* Right tabs skeleton */}
        <div className={getBottomNavTabSkeletonClasses()}>
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>
        <div className={getBottomNavTabSkeletonClasses()}>
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
