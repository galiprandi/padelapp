import { Suspense } from "react";
import Link from "next/link";
import { getPendingActionsCount } from "@/lib/queries";

async function NotificationsCount({ userId }: { userId: string }) {
  const count = await getPendingActionsCount(userId);

  if (count === 0) return null;

  return (
    <Link
      href="/notifications"
      aria-label={
        count === 1
          ? "1 notificación pendiente"
          : `${count} notificaciones pendientes`
      }
      className="fixed bottom-12 right-6 z-50 flex h-7 min-w-[28px] items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground shadow-md transition-all duration-100 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
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
