import { Skeleton } from "@/components/ui/skeleton";
import {
  getProfileSkeletonAriaLabel,
  getProfileSkeletonContainerClasses,
  getProfileSkeletonHeaderCardClasses,
  getProfileSkeletonAccountCardClasses,
} from "./profile-utils";

export default function ProfileLoading() {
  return (
    <div
      role="region"
      aria-busy="true"
      aria-label={getProfileSkeletonAriaLabel()}
      className={getProfileSkeletonContainerClasses()}
    >
      <div>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-1 h-4 w-48" />
      </div>

      <div className={getProfileSkeletonHeaderCardClasses()}>
        <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      <div className={getProfileSkeletonAccountCardClasses()}>
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    </div>
  );
}
