"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePwaInstalled } from "@/lib/hooks/use-pwa-installed";
import {
  getPwaInstallLinkAriaLabel,
  getInstallLinkClasses,
} from "./pwa-install-utils";

export function InstallLinkButton() {
  const isInstalled = usePwaInstalled();

  if (isInstalled) return null;

  return (
    <Button variant="ghost" className={getInstallLinkClasses()} asChild>
      <Link href="/install" prefetch={true} aria-label={getPwaInstallLinkAriaLabel()}>
        Instalar App
      </Link>
    </Button>
  );
}
