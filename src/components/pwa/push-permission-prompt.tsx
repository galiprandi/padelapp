"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2, Check } from "lucide-react";
import { usePushNotifications } from "@/lib/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";

export function PushPermissionPrompt() {
  const { permission, requestPermission, loading } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary shrink-0">
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground">
            Activar notificaciones
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Recibí avisos cuando abran un cupo en tu red o necesiten confirmar
            un resultado.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              onClick={() => requestPermission()}
              disabled={loading}
              size="sm"
              aria-label="Activar notificaciones de la aplicación"
              className="h-9 font-bold"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Bell className="h-3.5 w-3.5" />
              )}
              Activar
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDismissed(true)}
              size="sm"
              aria-label="Descartar solicitud de notificaciones"
              className="h-9 font-semibold text-muted-foreground hover:bg-muted"
            >
              Ahora no
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
