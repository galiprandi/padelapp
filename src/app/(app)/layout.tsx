import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const now = new Date();

  // Count pending actions: matches that already happened and are still PENDING
  const pendingCount = await prisma.match.count({
    where: {
      status: "PENDING",
      date: { lt: now },
      players: {
        some: { userId },
      },
    },
  });

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <main className="flex-1 px-5 pt-6 pb-16">{children}</main>
      <BottomNav notificationsCount={pendingCount} />
    </div>
  );
}
