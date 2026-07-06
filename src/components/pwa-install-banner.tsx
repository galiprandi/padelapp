"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Smartphone, X } from "lucide-react";

export function PwaInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar si ya está en modo standalone
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    // Verificar si el usuario ya lo cerró en esta sesión
    const isDismissed = sessionStorage.getItem("pwa-banner-dismissed");

    if (!isStandalone && !isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Smartphone className="h-4 w-4 text-primary" aria-hidden="true" />
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

      <Link
        href="/install"
        className="text-xs font-semibold text-primary whitespace-nowrap"
      >
        Ver cómo
      </Link>
    </div>
  );
}
