import { Suspense } from "react";
import Link from "next/link";
import { getPendingActionsCount } from "@/lib/queries";

async function NotificationsCount({ userId }: { userId: string }) {
  const count = await getPendingActionsCount(userId);

  if (count === 0) return null;

  return (
    <Link
      href="/notifications"
      aria-label="Notificaciones"
      className="fixed bottom-12 right-6 z-50 flex h-7 min-w-[28px] items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground"
    >
      {count}
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
