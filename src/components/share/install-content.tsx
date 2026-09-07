"use client";

import { useState, useCallback, useEffect } from "react";
import { Share, PlusSquare, Smartphone, Check } from "lucide-react";
import { InstallButton } from "@/components/share/install-button";
import { usePwaInstalled } from "@/lib/hooks/use-pwa-installed";
import { cn } from "@/lib/utils";
import {
  isIOSDeviceUserAgent,
  getPlatformSteps,
  PlatformType,
  InstallStep,
} from "@/components/share/install-utils";

export function InstallContent() {
  const isInstalled = usePwaInstalled();
  const [hasInstallButton, setHasInstallButton] = useState(false);
  const [platform, setPlatform] = useState<PlatformType>("android");

  // Auto-detect operating system on mount to improve conversion & user onboarding
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isIOS = isIOSDeviceUserAgent(
      window.navigator.userAgent,
      "ontouchend" in document
    );
    if (isIOS) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlatform("ios");
    }
  }, []);

  const handleAvailability = useCallback((available: boolean) => {
    setHasInstallButton(available);
  }, []);

  if (isInstalled) {
    return (
      <div
        role="region"
        aria-label="Estado de instalación de Padel Red"
        className="flex flex-col items-center gap-3 py-6"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted border border-emerald-500/30">
          <Check className="h-6 w-6 text-emerald-500" aria-hidden="true" />
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

  const steps = getPlatformSteps(platform);

  const renderIcon = (iconName: InstallStep["iconName"]) => {
    switch (iconName) {
      case "share":
        return <Share className="h-5 w-5 text-primary" aria-hidden="true" />;
      case "plus-square":
        return <PlusSquare className="h-5 w-5 text-primary" aria-hidden="true" />;
      case "smartphone":
        return <Smartphone className="h-5 w-5 text-primary" aria-hidden="true" />;
      case "check":
        return <Check className="h-5 w-5 text-primary" aria-hidden="true" />;
    }
  };

  return (
    <div
      role="region"
      aria-label="Instrucciones de instalación de Padel Red"
      className="space-y-6"
    >
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
          onKeyDown={(e) => {
            const buttons = Array.from(
              e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')
            );
            if (buttons.length < 2) return;
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
              e.preventDefault();
              setPlatform("ios");
              buttons[1]?.focus();
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
              e.preventDefault();
              setPlatform("android");
              buttons[0]?.focus();
            }
          }}
        >
          <button
            type="button"
            role="radio"
            aria-checked={platform === "android"}
            tabIndex={platform === "android" ? 0 : -1}
            aria-label="Ver instrucciones de instalación para Android o Chrome"
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
            tabIndex={platform === "ios" ? 0 : -1}
            aria-label="Ver instrucciones de instalación para iOS o Safari"
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
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-center gap-4 rounded-xl bg-card p-4 border border-border shadow-xs"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted border border-border">
              {renderIcon(step.iconName)}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-muted-foreground">
                {step.title}
              </p>
              <p className="text-sm font-semibold leading-snug text-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
