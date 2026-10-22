import { Suspense } from "react";
import { auth } from "@/auth";
import { getPendingActions } from "@/lib/queries";
import { MatchResultCompact } from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  getNotificationsRegionAriaLabel,
  getNotificationsHeadingTitle,
  getNotificationsHeadingDescription,
  getNotificationsActionsTitle,
  getNotificationsActionsBadgeAriaLabel,
  getNotificationsEmptyStateProps,
  getNotificationsSkeletonAriaLabel,
  getPendingActionMatchDetailProps,
  getNotificationsHeaderClasses,
  getNotificationsContainerClasses,
  getNotificationsActionsBadgeClasses,
  getNotificationsListClasses,
  getNotificationsHeadingTitleClasses,
  getNotificationsHeadingDescriptionClasses,
  getNotificationsSectionHeaderClasses,
  getNotificationsSectionTitleClasses,
  getNotificationsSkeletonSectionBadgeClasses,
  getNotificationsSkeletonItemClasses,
} from "@/components/navigation/nav-utils";

export default function NotificationsPage() {
  return (
    <div
      role="region"
      aria-label={getNotificationsRegionAriaLabel()}
      className={getNotificationsHeaderClasses()}
    >
      <div>
        <h1 className={getNotificationsHeadingTitleClasses()}>
          {getNotificationsHeadingTitle()}
        </h1>
        <p className={getNotificationsHeadingDescriptionClasses()}>
          {getNotificationsHeadingDescription()}
        </p>
      </div>

      <Suspense fallback={<NotificationsListSkeleton />}>
        <NotificationsList />
      </Suspense>
    </div>
  );
}

async function NotificationsList() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const pendingActions = await getPendingActions(userId);
  const emptyStateProps = getNotificationsEmptyStateProps();

  return (
    <div className={getNotificationsContainerClasses()}>
      <div className={getNotificationsSectionHeaderClasses()}>
        <h2 className={getNotificationsSectionTitleClasses()}>
          {getNotificationsActionsTitle()}
        </h2>
        {pendingActions.length > 0 && (
          <span
            className={getNotificationsActionsBadgeClasses()}
            aria-label={getNotificationsActionsBadgeAriaLabel(
              pendingActions.length,
            )}
          >
            {pendingActions.length}
          </span>
        )}
      </div>

      {pendingActions.length > 0 ? (
        <div className={getNotificationsListClasses()}>
          {pendingActions.map((match) => {
            const { detailUrl, label } = getPendingActionMatchDetailProps(match);
            return (
              <MatchResultCompact
                key={match.id}
                match={match}
                detailUrl={detailUrl}
                label={label}
                viewerId={userId}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BellOff}
          title={emptyStateProps.title}
          description={emptyStateProps.description}
          action={
            <Button asChild className="w-full">
              <Link href={emptyStateProps.actionHref} prefetch={true}>
                {emptyStateProps.actionText}
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}

function NotificationsListSkeleton() {
  return (
    <div
      role="region"
      aria-busy="true"
      aria-label={getNotificationsSkeletonAriaLabel()}
      className={getNotificationsContainerClasses()}
    >
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
  );
}
