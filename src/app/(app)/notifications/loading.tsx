import { Skeleton } from "@/components/ui/skeleton";
import {
  getNotificationsSkeletonAriaLabel,
  getNotificationsSkeletonContainerClasses,
  getNotificationsContainerClasses,
  getNotificationsListClasses,
  getNotificationsSectionHeaderClasses,
  getNotificationsSkeletonHeadingTitleClasses,
  getNotificationsSkeletonHeadingSubtitleClasses,
  getNotificationsSkeletonSectionTitleClasses,
  getNotificationsSkeletonSectionBadgeClasses,
  getNotificationsSkeletonItemClasses,
  getNotificationsSkeletonItemKeys,
} from "@/components/navigation/nav-utils";

export default function NotificationsLoading() {
  const itemKeys = getNotificationsSkeletonItemKeys();

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
          <Skeleton className={getNotificationsSkeletonSectionTitleClasses()} />
          <Skeleton className={getNotificationsSkeletonSectionBadgeClasses()} />
        </div>
        <div className={getNotificationsListClasses()}>
          {itemKeys.map((key) => (
            <Skeleton key={key} className={getNotificationsSkeletonItemClasses()} />
          ))}
        </div>
      </div>
    </div>
  );
}
