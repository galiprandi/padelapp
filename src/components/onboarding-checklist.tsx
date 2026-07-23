"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Check,
  Loader2,
  X,
  User,
  Smartphone,
  Bell,
  CalendarDays,
} from "lucide-react";
import { usePwaInstalled } from "@/lib/hooks/use-pwa-installed";
import { usePushNotifications } from "@/lib/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "onboarding-checklist-dismissed";

interface OnboardingChecklistProps {
  initialAlias: string | null;
  hasActivity: boolean;
}

export function OnboardingChecklist({
  initialAlias,
  hasActivity,
}: OnboardingChecklistProps) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  const isPwaInstalled = usePwaInstalled();
  const { permission, requestPermission, loading: notificationLoading } =
    usePushNotifications();

  // 1. Checkmount
  useEffect(() => {
    setMounted(true);
    const isDismissed = localStorage.getItem(DISMISS_KEY);
    if (isDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  // 2. Capture PWA BeforeInstallPrompt Event
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isPwaInstalled) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isPwaInstalled]);

  // 3. Handle PWA direct installation
  const handleInstallPwa = useCallback(async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error("PWA install prompt error:", err);
    } finally {
      setIsInstalling(false);
    }
  }, [deferredPrompt]);

  if (!mounted || dismissed) return null;

  // Evaluate each step's completion status
  const stepAliasCompleted = Boolean(initialAlias && initialAlias.trim().length > 0);
  const stepPwaCompleted = isPwaInstalled;
  const stepNotificationsCompleted = permission === "granted";
  const stepActivityCompleted = hasActivity;

  const completedCount =
    (stepAliasCompleted ? 1 : 0) +
    (stepPwaCompleted ? 1 : 0) +
    (stepNotificationsCompleted ? 1 : 0) +
    (stepActivityCompleted ? 1 : 0);

  const progressPercent = Math.round((completedCount / 4) * 100);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-5">
      {/* Header section with progress bar */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">
            Guía de bienvenida 🎾
          </h2>
          <p className="text-xs text-muted-foreground leading-normal">
            Completá estos 4 simples pasos para empezar a disfrutar de la red sin fricciones.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          aria-label="Descartar guía de bienvenida"
          className="rounded-md p-1.5 h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background shrink-0 active:scale-[0.98]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Progress display */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-foreground">
            Progreso de preparación
          </span>
          <span className="font-bold text-primary tabular-nums">
            {completedCount} de 4 ({progressPercent}%)
          </span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4 pt-1">
        {/* Step 1: Profile Alias */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                stepAliasCompleted
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              {stepAliasCompleted ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                "1"
              )}
            </div>
            <div className="w-px flex-1 bg-border my-1 min-h-[16px]" />
          </div>
          <div className="flex-1 space-y-1 pb-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-xs font-bold text-foreground">
                Configurá tu alias en la cancha
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Elegí tu nombre de juego para aparecer en los partidos y el ranking.
            </p>
            {!stepAliasCompleted && (
              <div className="pt-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-9 text-xs font-bold border-primary/30 hover:bg-muted"
                  aria-label="Ir a configurar alias"
                >
                  <Link href="/me/profile">Configurar alias</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Install App (PWA) */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                stepPwaCompleted
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              {stepPwaCompleted ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                "2"
              )}
            </div>
            <div className="w-px flex-1 bg-border my-1 min-h-[16px]" />
          </div>
          <div className="flex-1 space-y-1 pb-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-xs font-bold text-foreground">
                Instalá la aplicación (PWA)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Accedé al instante a tus partidos desde tu pantalla de inicio en el celular.
            </p>
            {!stepPwaCompleted && (
              <div className="pt-1.5">
                {deferredPrompt ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleInstallPwa}
                    disabled={isInstalling}
                    className="h-9 text-xs font-bold border-primary/30 hover:bg-muted"
                    aria-label="Instalar aplicación de pádel directamente"
                  >
                    {isInstalling ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : (
                      <Smartphone className="h-3.5 w-3.5 mr-1" />
                    )}
                    Instalar ahora
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-9 text-xs font-bold border-primary/30 hover:bg-muted"
                    aria-label="Ver cómo instalar la aplicación"
                  >
                    <Link href="/install">Ver cómo instalar</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Enable Push Notifications */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                stepNotificationsCompleted
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              {stepNotificationsCompleted ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                "3"
              )}
            </div>
            <div className="w-px flex-1 bg-border my-1 min-h-[16px]" />
          </div>
          <div className="flex-1 space-y-1 pb-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-xs font-bold text-foreground">
                Activá las notificaciones
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Recibí alertas al instante cuando falten jugadores o confirmen resultados.
            </p>
            {!stepNotificationsCompleted && (
              <div className="pt-1.5">
                {permission === "unsupported" ? (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    No soportado en este navegador
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => requestPermission()}
                    disabled={notificationLoading}
                    className="h-9 text-xs font-bold border-primary/30 hover:bg-muted"
                    aria-label="Solicitar permisos para notificaciones"
                  >
                    {notificationLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : (
                      <Bell className="h-3.5 w-3.5 mr-1" />
                    )}
                    Activar notificaciones
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Step 4: First Game/Turn */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                stepActivityCompleted
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              {stepActivityCompleted ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                "4"
              )}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-xs font-bold text-foreground">
                Sumate a tu primer partido
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Buscá un turno con cupos libres en la red o creá uno para jugar con amigos.
            </p>
            {!stepActivityCompleted && (
              <div className="pt-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-9 text-xs font-bold border-primary/30 hover:bg-muted"
                  aria-label="Ver turnos de pádel disponibles"
                >
                  <Link href="/turnos">Explorar turnos</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Congratulatory / All Done Message */}
      {completedCount === 4 && (
        <div className="rounded-lg bg-muted border border-primary/40 p-3 text-center">
          <p className="text-xs font-bold text-primary">
            ¡Felicitaciones! Completaste tu preparación al 100%. Ya estás listo para jugar y salvar turnos en Padel Red. 🏆
          </p>
        </div>
      )}
    </div>
  );
}
