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
      className="h-10 w-full rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
      asChild
    >
      <Link href="/install">Instalar App</Link>
    </Button>
  );
}
