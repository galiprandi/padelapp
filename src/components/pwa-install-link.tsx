"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePwaInstalled } from "@/lib/hooks/use-pwa-installed";

export function InstallLinkButton() {
  const isInstalled = usePwaInstalled();

  if (isInstalled) return null;

  return (
    <Button
      variant="ghost"
      className="h-10 w-full rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
      asChild
    >
      <Link href="/install" prefetch={true}>Instalar App</Link>
    </Button>
  );
}
