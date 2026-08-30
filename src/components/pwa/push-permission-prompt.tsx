"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import { usePushNotifications } from "@/lib/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";

const DISMISS_KEY = "push-prompt-dismissed";

export function PushPermissionPrompt() {
  const { showToast } = useToast();
  const { permission, requestPermission, loading } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (typeof window !== "undefined") {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
    }
  }, []);

  // Don't render during SSR — permission state is only known on the client.
  if (
    !mounted ||
    dismissed ||
    permission === "granted" ||
    permission === "denied" ||
    permission === "unsupported"
  ) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Aviso de notificaciones del sistema"
      aria-busy={loading}
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary shrink-0">
          <Bell className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground">
            Activar notificaciones
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-normal">
            Recibí avisos cuando abran un cupo en tu red o necesiten confirmar
            un resultado.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              onClick={async () => {
                const token = await requestPermission();
                if (token) {
                  showToast("Activaste las notificaciones.");
                }
              }}
              disabled={loading}
              size="sm"
              aria-label={
                loading
                  ? "Solicitando permisos de notificación"
                  : "Activar notificaciones de la aplicación"
              }
              className="h-9 font-bold active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {loading ? "Activando..." : "Activar"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setDismissed(true);
                localStorage.setItem(DISMISS_KEY, "true");
              }}
              disabled={loading}
              size="sm"
              aria-label="Descartar solicitud de notificaciones por ahora"
              className="h-9 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            >
              Ahora no
            </Button>
          </div>
        </div>
      </div>
      <div className="sr-only" aria-live="polite">
        {loading
          ? "Solicitando activación de notificaciones de la aplicación..."
          : ""}
      </div>
    </div>
  );
}
