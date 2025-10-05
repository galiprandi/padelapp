import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BottomNav } from "@/components/navigation/bottom-nav";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <main className="flex-1 px-5 pb-28 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}
