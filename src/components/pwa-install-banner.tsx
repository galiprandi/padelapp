"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Smartphone, X, Download, Loader2 } from "lucide-react";
import { usePwaInstalled } from "@/lib/hooks/use-pwa-installed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-banner-dismissed";

export function PwaInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const isInstalled = usePwaInstalled();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isInstalled) {
      setIsVisible(false);
      localStorage.removeItem(DISMISS_KEY);
      return;
    }

    const isDismissed = localStorage.getItem(DISMISS_KEY);
    if (!isDismissed) {
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

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  if (!mounted || !isVisible) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Smartphone className="h-4 w-4" aria-hidden="true" />
      </div>

      <div className="flex-1 space-y-0.5">
        <h3 className="text-sm font-semibold text-foreground">
          Instalá la App
        </h3>
        <p className="text-xs text-muted-foreground">
          Accedé más rápido desde tu inicio.
        </p>
      </div>

      <button
        onClick={handleDismiss}
        aria-label="Cerrar"
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      {deferredPrompt ? (
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary whitespace-nowrap disabled:opacity-50"
        >
          {isInstalling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Instalar
        </button>
      ) : (
        <Link
          href="/install"
          className="text-xs font-semibold text-primary whitespace-nowrap"
        >
          Ver cómo
        </Link>
      )}
    </div>
  );
}
