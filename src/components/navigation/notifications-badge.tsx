import { Suspense } from "react";
import Link from "next/link";
import { getCachedPendingActionsCount } from "@/lib/queries";
import {
  getNotificationsBadgeLinkProps,
  formatNotificationsDisplayCount,
  shouldRenderNotificationsBadge,
} from "./nav-utils";

async function NotificationsCount({ userId }: { userId: string }) {
  const count = await getCachedPendingActionsCount(userId);

  if (!shouldRenderNotificationsBadge(count)) return null;

  const linkProps = getNotificationsBadgeLinkProps(count);

  return (
    <Link {...linkProps}>
      {formatNotificationsDisplayCount(count)}
    </Link>
  );
}

export function NotificationsBadge({ userId }: { userId: string }) {
  return (
    <Suspense fallback={null}>
      <NotificationsCount userId={userId} />
    </Suspense>
  );
}
