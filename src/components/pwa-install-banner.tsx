"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Smartphone, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/5 p-5 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 shadow-inner">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1 space-y-1 pr-6">
          <h3 className="text-sm font-black uppercase tracking-tight text-foreground">
            Instalá la App
          </h3>
          <p className="text-[13px] font-medium leading-snug text-muted-foreground">
            Accedé más rápido y recibí notificaciones instalando PadelApp en tu inicio.
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground/50 hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <Button
          variant="link"
          size="sm"
          asChild
          className="h-auto p-0 text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:no-underline"
        >
          <Link href="/install">
            Ver cómo instalar
            <ChevronRight className="h-3 w-3 ml-0.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
