import { Skeleton } from "@/components/ui/skeleton";
import {
  getBottomNavSkeletonAriaAttributes,
  getBottomNavContainerClasses,
  getBottomNavInnerContainerClasses,
  getBottomNavTabSkeletonClasses,
  getBottomNavFabSkeletonClasses,
  getBottomNavTabIconSkeletonClasses,
  getBottomNavTabLabelSkeletonClasses,
  getBottomNavFabIconSkeletonClasses,
} from "./nav-utils";

interface BottomNavSkeletonProps {
  position?: "fixed" | "static";
}

export function BottomNavSkeleton({
  position = "fixed",
}: BottomNavSkeletonProps) {
  const ariaAttrs = getBottomNavSkeletonAriaAttributes();

  return (
    <div
      {...ariaAttrs}
      className={getBottomNavContainerClasses(position)}
    >
      <div className={getBottomNavInnerContainerClasses()}>
        {/* Left tabs skeleton */}
        <div className={getBottomNavTabSkeletonClasses()}>
          <Skeleton className={getBottomNavTabIconSkeletonClasses()} />
          <Skeleton className={getBottomNavTabLabelSkeletonClasses()} />
        </div>
        <div className={getBottomNavTabSkeletonClasses()}>
          <Skeleton className={getBottomNavTabIconSkeletonClasses()} />
          <Skeleton className={getBottomNavTabLabelSkeletonClasses()} />
        </div>

        {/* Central FAB skeleton */}
        <div className={getBottomNavFabSkeletonClasses()}>
          <Skeleton className={getBottomNavFabIconSkeletonClasses()} />
        </div>

        {/* Right tabs skeleton */}
        <div className={getBottomNavTabSkeletonClasses()}>
          <Skeleton className={getBottomNavTabIconSkeletonClasses()} />
          <Skeleton className={getBottomNavTabLabelSkeletonClasses()} />
        </div>
        <div className={getBottomNavTabSkeletonClasses()}>
          <Skeleton className={getBottomNavTabIconSkeletonClasses()} />
          <Skeleton className={getBottomNavTabLabelSkeletonClasses()} />
        </div>
      </div>
    </div>
  );
}
