"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Smartphone, X, Download, Loader2 } from "lucide-react";
import { usePwaInstalled } from "@/lib/hooks/use-pwa-installed";
import { Button } from "@/components/ui/button";

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

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        aria-label="Cerrar aviso de instalación"
        className="rounded-md p-1.5 h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>

      {deferredPrompt ? (
        <Button
          onClick={handleInstall}
          disabled={isInstalling}
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary whitespace-nowrap disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background"
          aria-label="Instalar aplicación de pádel"
        >
          {isInstalling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
          ) : (
            <Download className="h-3.5 w-3.5 mr-1" />
          )}
          Instalar
        </Button>
      ) : (
        <Link
          href="/install"
          className="text-xs font-semibold text-primary hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background rounded px-1.5 py-1"
        >
          Ver cómo
        </Link>
      )}
    </div>
  );
}
