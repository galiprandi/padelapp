"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  async function triggerInstall() {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch (error) {
      console.error("Installation prompt error", error);
    } finally {
      setDeferredPrompt(null);
      setVisible(false);
    }
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex justify-center pb-6",
        "pointer-events-none"
      )}
    >
      <div className="pointer-events-auto w-full max-w-md px-5">
        <div className="flex items-start gap-3 rounded-3xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
          <div className="flex-1 space-y-1 text-sm">
            <p className="text-base font-semibold text-foreground">Instala PadelApp</p>
            <p className="text-muted-foreground">
              Añade la app a tu pantalla de inicio para abrirla como si fuera nativa.
            </p>
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="rounded-full" onClick={triggerInstall}>
                Instalar ahora
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => setVisible(false)}
              >
                Más tarde
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="rounded-full p-1 text-muted-foreground transition hover:bg-muted"
            aria-label="Cerrar sugerencia de instalación"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
