"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2, Check } from "lucide-react";
import { usePushNotifications } from "@/lib/hooks/use-push-notifications";

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
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
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
            <button
              onClick={() => requestPermission()}
              disabled={loading}
              className="h-9 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Bell className="h-3.5 w-3.5" />
              )}
              Activar
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="h-9 rounded-lg px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
