import { Skeleton } from "@/components/ui/skeleton";
import {
  getNotificationsSkeletonAriaLabel,
  getNotificationsSkeletonContainerClasses,
  getNotificationsContainerClasses,
  getNotificationsListClasses,
  getNotificationsSectionHeaderClasses,
  getNotificationsSkeletonHeadingTitleClasses,
  getNotificationsSkeletonHeadingSubtitleClasses,
  getNotificationsSkeletonSectionBadgeClasses,
  getNotificationsSkeletonItemClasses,
} from "@/components/navigation/nav-utils";

export default function NotificationsLoading() {
  return (
    <div
      role="region"
      aria-busy="true"
      aria-label={getNotificationsSkeletonAriaLabel()}
      className={getNotificationsSkeletonContainerClasses()}
    >
      <div>
        <Skeleton className={getNotificationsSkeletonHeadingTitleClasses()} />
        <Skeleton className={getNotificationsSkeletonHeadingSubtitleClasses()} />
      </div>

      <div className={getNotificationsContainerClasses()}>
        <div className={getNotificationsSectionHeaderClasses()}>
          <Skeleton className="h-4 w-32" />
          <Skeleton className={getNotificationsSkeletonSectionBadgeClasses()} />
        </div>
        <div className={getNotificationsListClasses()}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className={getNotificationsSkeletonItemClasses()} />
          ))}
        </div>
      </div>
    </div>
  );
}
