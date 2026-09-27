import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { BottomNavSkeleton } from "@/components/navigation/bottom-nav-skeleton";
import { NotificationsBadge } from "@/components/navigation/notifications-badge";
import {
  getAppLayoutClasses,
  getAppMainClasses,
  getAppLayoutAriaAttributes,
  getAppMainAriaAttributes,
} from "@/components/navigation/nav-utils";

export default function AppLayout({ children }: { children: ReactNode }) {
  const layoutAria = getAppLayoutAriaAttributes();
  const mainAria = getAppMainAriaAttributes();

  return (
    <div className={getAppLayoutClasses()} {...layoutAria}>
      <Suspense fallback={<main className={getAppMainClasses()} {...mainAria} />}>
        <AppLayoutContent>{children}</AppLayoutContent>
      </Suspense>
      <Suspense fallback={<BottomNavSkeleton />}>
        <BottomNav />
      </Suspense>
    </div>
  );
}

async function AppLayoutContent({ children }: { children: ReactNode }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const mainAria = getAppMainAriaAttributes();

  return (
    <>
      <main className={getAppMainClasses()} {...mainAria}>
        {children}
      </main>
      <NotificationsBadge userId={userId} />
    </>
  );
}
