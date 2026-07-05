import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NeuralHub } from "@/components/navigation/neural-hub";
import { getPendingActions } from "@/lib/match-queries";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const pendingActions = await getPendingActions(userId);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <main className="flex-1 px-6 pt-6 pb-32">{children}</main>
      <NeuralHub notificationsCount={pendingActions.length} />
    </div>
  );
}
