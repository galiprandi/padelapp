import { Suspense } from "react";
import Link from "next/link";
import { getCachedPendingActionsCount } from "@/lib/queries";
import {
  getNotificationsBadgeAriaAttributes,
  formatNotificationsDisplayCount,
  getFloatingNotificationsBadgeClasses,
} from "./nav-utils";

async function NotificationsCount({ userId }: { userId: string }) {
  const count = await getCachedPendingActionsCount(userId);

  if (count <= 0) return null;

  const ariaAttrs = getNotificationsBadgeAriaAttributes(count);

  return (
    <Link
      href="/notifications"
      prefetch={true}
      {...ariaAttrs}
      className={getFloatingNotificationsBadgeClasses()}
    >
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
