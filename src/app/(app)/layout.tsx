import type { ReactNode } from "react";
import { MobileNav } from "@/components/navigation/mobile-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <main className="flex-1 px-5 pb-28 pt-6">{children}</main>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center pb-4">
        <div className="pointer-events-auto w-full max-w-md px-4">
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
