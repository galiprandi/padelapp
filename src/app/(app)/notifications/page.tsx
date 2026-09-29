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
} from "@/components/navigation/nav-utils";

export default function NotificationsPage() {
  return (
    <div
      role="region"
      aria-label={getNotificationsRegionAriaLabel()}
      className="flex flex-col gap-6"
    >
      <div>
        <h1 className="text-xl font-bold text-foreground">
          {getNotificationsHeadingTitle()}
        </h1>
        <p className="text-sm text-muted-foreground">
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-foreground">
          {getNotificationsActionsTitle()}
        </h2>
        {pendingActions.length > 0 && (
          <span
            className="rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground"
            aria-label={getNotificationsActionsBadgeAriaLabel(
              pendingActions.length,
            )}
          >
            {pendingActions.length}
          </span>
        )}
      </div>

      {pendingActions.length > 0 ? (
        <div className="space-y-2">
          {pendingActions.map((match) => {
            const needsScore = !match.score;
            return (
              <MatchResultCompact
                key={match.id}
                match={match}
                detailUrl={
                  needsScore
                    ? `/match/${match.id}/result`
                    : `/match/${match.id}`
                }
                label={needsScore ? "Cargar resultado" : "Confirmar"}
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
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-8 rounded-md" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
