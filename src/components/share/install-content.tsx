"use client";

import { useState, useCallback, useEffect } from "react";
import { Share, PlusSquare, Smartphone, Check, HelpCircle } from "lucide-react";
import { InstallButton } from "@/components/share/install-button";
import { usePwaInstalled } from "@/lib/hooks/use-pwa-installed";
import { cn } from "@/lib/utils";

export function InstallContent() {
  const isInstalled = usePwaInstalled();
  const [hasInstallButton, setHasInstallButton] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios">("android");

  // Auto-detect operating system on mount to improve conversion & user onboarding
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(window.navigator.userAgent) ||
      (window.navigator.userAgent.includes("Mac") && "ontouchend" in document);
    if (isIOSDevice) {
      setPlatform("ios");
    }
  }, []);

  const handleAvailability = useCallback((available: boolean) => {
    setHasInstallButton(available);
  }, []);

  if (isInstalled) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted border border-emerald-500/30">
          <Check className="h-6 w-6 text-emerald-500" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Padel Red ya está instalada
        </p>
        <p className="text-xs text-muted-foreground text-center max-w-[240px]">
          Buscala en tu pantalla de inicio para jugar con un solo toque.
        </p>
      </div>
    );
  }

  const iosSteps = [
    {
      icon: <Share className="h-5 w-5 text-primary" />,
      text: (
        <>
          Abrí el menú de <strong>compartir</strong> (ícono <Share className="h-4 w-4 inline mb-1" />) abajo en Safari.
        </>
      ),
    },
    {
      icon: <PlusSquare className="h-5 w-5 text-primary" />,
      text: (
        <>
          Seleccioná la opción <strong>"Agregar a inicio"</strong> o <strong>"Add to Home Screen"</strong>.
        </>
      ),
    },
    {
      icon: <Smartphone className="h-5 w-5 text-primary" />,
      text: (
        <>
          Pulsá <strong>"Agregar"</strong> en la esquina superior derecha para finalizar.
        </>
      ),
    },
  ];

  const androidSteps = [
    {
      icon: <Smartphone className="h-5 w-5 text-primary" />,
      text: (
        <>
          Pulsá el botón superior de <strong>"Instalar app"</strong> si te aparece disponible.
        </>
      ),
    },
    {
      icon: <PlusSquare className="h-5 w-5 text-primary" />,
      text: (
        <>
          O abrí el menú de tu navegador (tres puntos <span className="font-bold">⋮</span>) y elegí <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.
        </>
      ),
    },
    {
      icon: <Check className="h-5 w-5 text-primary" />,
      text: "¡Y listo! Ya podés disfrutar de Padel Red como una aplicación nativa.",
    },
  ];

  const activeSteps = platform === "ios" ? iosSteps : androidSteps;

  return (
    <div className="space-y-6">
      {/* Platform Toggle (Custom selection button group standardizing h-12 and active:scale-[0.98]) */}
      <div className="space-y-2">
        <span
          id="platform-selector-label"
          className="text-xs font-bold text-muted-foreground"
        >
          Elegí tu sistema operativo:
        </span>
        <div
          role="radiogroup"
          aria-labelledby="platform-selector-label"
          className="grid grid-cols-2 gap-2"
        >
          <button
            type="button"
            role="radio"
            aria-checked={platform === "android"}
            onClick={() => setPlatform("android")}
            className={cn(
              "h-12 rounded-lg border text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background",
              platform === "android"
                ? "bg-primary border-primary text-primary-foreground font-bold"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            )}
          >
            Android / Chrome
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={platform === "ios"}
            onClick={() => setPlatform("ios")}
            className={cn(
              "h-12 rounded-lg border text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background",
              platform === "ios"
                ? "bg-primary border-primary text-primary-foreground font-bold"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            )}
          >
            iOS / Safari
          </button>
        </div>
      </div>

      {platform === "android" && (
        <>
          <InstallButton onAvailabilityChange={handleAvailability} />

          {hasInstallButton && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground font-bold">
                  O instalá manualmente
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Platform-Specific Steps */}
      <div className="space-y-3">
        {activeSteps.map((step, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-xl bg-card p-4 border border-border"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted border border-border">
              {step.icon}
            </div>
            <p className="text-sm font-semibold leading-snug text-foreground">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
