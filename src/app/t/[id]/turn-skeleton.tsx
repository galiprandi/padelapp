import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import {
  getTurnSkeletonAriaLabel,
  getTurnSkeletonContainerClasses,
  getTurnSkeletonHeaderClasses,
  getTurnSkeletonHeaderBackBadgeClasses,
  getTurnSkeletonHeaderTitleContainerClasses,
  getTurnSkeletonCardClasses,
  getTurnSkeletonCardHeaderClasses,
  getTurnSkeletonGridClasses,
  getTurnSkeletonTimeCardClasses,
  getTurnSkeletonLocationCardClasses,
  getTurnSkeletonLocationIconBadgeClasses,
  getTurnSkeletonPlayersSectionClasses,
  getTurnSkeletonPlayersHeaderClasses,
  getTurnSkeletonPlayersListClasses,
  getTurnSkeletonPlayerItemClasses,
  getTurnSkeletonBottomBarClasses,
  getTurnSkeletonBottomBarInnerClasses,
} from "@/components/turns/turn-utils";

export function TurnSkeleton() {
  return (
    <div
      role="region"
      aria-label={getTurnSkeletonAriaLabel()}
      aria-busy="true"
      className={getTurnSkeletonContainerClasses()}
    >
      {/* Header Skeleton */}
      <div className={getTurnSkeletonHeaderClasses()}>
        <div className={getTurnSkeletonHeaderBackBadgeClasses()}>
          <ChevronLeft className="h-5 w-5 opacity-40" />
        </div>
        <div className={getTurnSkeletonHeaderTitleContainerClasses()}>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>

      {/* Information Card Skeleton */}
      <div className={getTurnSkeletonCardClasses()}>
        <div className={getTurnSkeletonCardHeaderClasses()}>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground opacity-40" />
            <Skeleton className="h-4 w-36 inline-block" />
          </h2>
        </div>

        <div className={getTurnSkeletonGridClasses()}>
          {/* Horario Row */}
          <div className={getTurnSkeletonTimeCardClasses()}>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 opacity-40" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-7 w-32" />
          </div>

          {/* Club & Fecha Row */}
          <div className={getTurnSkeletonLocationCardClasses()}>
            <div className={getTurnSkeletonLocationIconBadgeClasses()}>
              <MapPin className="h-5 w-5 text-muted-foreground opacity-40" />
            </div>
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Players List Skeleton */}
      <section className={getTurnSkeletonPlayersSectionClasses()}>
        <div className={getTurnSkeletonPlayersHeaderClasses()}>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground opacity-40" />
            <Skeleton className="h-4 w-28" />
          </h2>
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>

        <div className={getTurnSkeletonPlayersListClasses()}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={getTurnSkeletonPlayerItemClasses()}
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </section>

      {/* Fixed Bottom Bar Skeleton */}
      <div className={getTurnSkeletonBottomBarClasses()}>
        <div className={getTurnSkeletonBottomBarInnerClasses()}>
          <Skeleton className="w-full h-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
