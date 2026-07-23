import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { NotificationsBadge } from "@/components/navigation/notifications-badge";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Suspense fallback={<main className="flex-1 px-5 pt-4 pb-20" />}>
        <AppLayoutContent>{children}</AppLayoutContent>
      </Suspense>
      <Suspense fallback={null}>
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

  return (
    <>
      <main className="flex-1 px-5 pt-4 pb-20">{children}</main>
      <NotificationsBadge userId={userId} />
    </>
  );
}
