import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { NotificationsBadge } from "@/components/navigation/notifications-badge";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <main className="flex-1 px-5 pt-4 pb-20">{children}</main>
      <BottomNav notificationsCount={0} />
      <NotificationsBadge userId={userId} />
    </div>
  );
}
