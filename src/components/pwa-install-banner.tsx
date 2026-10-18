"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Smartphone, X, Download, Loader2 } from "lucide-react";
import { usePwaInstalled } from "@/lib/hooks/use-pwa-installed";
import { Button } from "@/components/ui/button";
import {
  PWA_BANNER_DISMISS_KEY,
  isPwaBannerDismissed,
  dismissPwaBanner,
  clearPwaBannerDismissal,
  getPwaBannerRegionAriaLabel,
  getInstallButtonAriaLabel,
  getInstallGuideAriaLabel,
  getDismissBannerAriaLabel,
  getPwaBannerTitleText,
  getPwaBannerDescriptionText,
  getPwaBannerIconAriaLabel,
  getPwaBannerInstallButtonText,
  getPwaBannerContainerClasses,
  getPwaBannerIconBadgeClasses,
  getPwaBannerDismissButtonClasses,
  getPwaBannerInstallButtonClasses,
  getPwaBannerGuideButtonClasses,
} from "./pwa-install-utils";

export {
  PWA_BANNER_DISMISS_KEY,
  isPwaBannerDismissed,
  dismissPwaBanner,
  clearPwaBannerDismissal,
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const isInstalled = usePwaInstalled();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isInstalled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(false);
      clearPwaBannerDismissal();
      return;
    }

    if (!isPwaBannerDismissed()) {
      setIsVisible(true);
    }
  }, [isInstalled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isInstalled) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isInstalled]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsVisible(false);
      }
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    dismissPwaBanner();
  }, []);

  useEffect(() => {
    if (!mounted || !isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, isVisible, handleDismiss]);

  if (!mounted || !isVisible) return null;

  return (
    <div
      role="region"
      aria-label={getPwaBannerRegionAriaLabel()}
      className={getPwaBannerContainerClasses()}
    >
      <div className={getPwaBannerIconBadgeClasses()}>
        <Smartphone className="h-4 w-4" aria-hidden="true" />
      </div>

      <div className="flex-1 space-y-0.5">
        <h3 className="text-sm font-semibold text-foreground">
          {getPwaBannerTitleText()}
        </h3>
        <p className="text-xs text-muted-foreground">
          {getPwaBannerDescriptionText()}
        </p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        aria-label={getDismissBannerAriaLabel()}
        className={getPwaBannerDismissButtonClasses()}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>

      {deferredPrompt ? (
        <Button
          onClick={handleInstall}
          disabled={isInstalling}
          aria-busy={isInstalling}
          variant="default"
          size="sm"
          className={getPwaBannerInstallButtonClasses()}
          aria-label={getInstallButtonAriaLabel(isInstalling)}
        >
          {isInstalling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" aria-hidden="true" />
          ) : (
            <Download className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          )}
          {getPwaBannerInstallButtonText()}
        </Button>
      ) : (
        <Button
          asChild
          variant="default"
          size="sm"
          className={getPwaBannerGuideButtonClasses()}
        >
          <Link href="/install" prefetch={true} aria-label={getInstallGuideAriaLabel()}>
            Ver cómo
          </Link>
        </Button>
      )}
    </div>
  );
}
