import { Skeleton } from "@/components/ui/skeleton";
import {
  getBottomNavSkeletonAriaLabel,
  getBottomNavContainerClasses,
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
      <div className="relative flex h-16 w-full items-stretch justify-evenly border-t border-border bg-background">
        {/* Left tabs skeleton */}
        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>

        {/* Central FAB skeleton */}
        <div className="relative -mt-6 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted shadow-xs">
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>

        {/* Right tabs skeleton */}
        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
