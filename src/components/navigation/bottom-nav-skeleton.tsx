import { Skeleton } from "@/components/ui/skeleton";
import {
  getBottomNavSkeletonAriaAttributes,
  getBottomNavSkeletonTabsConfig,
  getBottomNavContainerClasses,
  getBottomNavInnerContainerClasses,
  getBottomNavTabItemSkeletonClasses,
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
  const { leftTabs, rightTabs } = getBottomNavSkeletonTabsConfig();

  return (
    <div
      {...ariaAttrs}
      className={getBottomNavContainerClasses(position)}
    >
      <div className={getBottomNavInnerContainerClasses()}>
        {/* Left tabs skeleton */}
        {leftTabs.map((key) => (
          <div key={key} className={getBottomNavTabItemSkeletonClasses()}>
            <Skeleton className={getBottomNavTabIconSkeletonClasses()} />
            <Skeleton className={getBottomNavTabLabelSkeletonClasses()} />
          </div>
        ))}

        {/* Central FAB skeleton */}
        <div className={getBottomNavFabSkeletonClasses()}>
          <Skeleton className={getBottomNavFabIconSkeletonClasses()} />
        </div>

        {/* Right tabs skeleton */}
        {rightTabs.map((key) => (
          <div key={key} className={getBottomNavTabItemSkeletonClasses()}>
            <Skeleton className={getBottomNavTabIconSkeletonClasses()} />
            <Skeleton className={getBottomNavTabLabelSkeletonClasses()} />
          </div>
        ))}
      </div>
    </div>
  );
}
