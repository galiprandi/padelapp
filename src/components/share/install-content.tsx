"use client";

import { useState, useCallback } from "react";
import { Share, PlusSquare, Smartphone, Check } from "lucide-react";
import { InstallButton } from "@/components/share/install-button";
import { usePwaInstalled } from "@/lib/hooks/use-pwa-installed";

export function InstallContent() {
  const isInstalled = usePwaInstalled();
  const [hasInstallButton, setHasInstallButton] = useState(false);

  const handleAvailability = useCallback((available: boolean) => {
    setHasInstallButton(available);
  }, []);

  if (isInstalled) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <Check className="h-6 w-6 text-emerald-500" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Padel Red ya está instalada
        </p>
        <p className="text-xs text-muted-foreground text-center max-w-[240px]">
          Buscala en tu pantalla de inicio.
        </p>
      </div>
    );
  }

  const steps = [
    {
      icon: <Share className="h-5 w-5 text-primary" />,
      text: "Abrí el menú de compartir de tu navegador.",
    },
    {
      icon: <PlusSquare className="h-5 w-5 text-primary" />,
      text: (
        <>
          Seleccioná <strong>"Agregar a inicio"</strong> (iOS) o{" "}
          <strong>"Instalar app"</strong> (Android).
        </>
      ),
    },
    {
      icon: <Smartphone className="h-5 w-5 text-primary" />,
      text: "¡Listo! Ya podés usar Padel Red como una app nativa.",
    },
  ];

  return (
    <div className="space-y-6">
      <InstallButton onAvailabilityChange={handleAvailability} />

      {hasInstallButton && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground font-semibold">
              O instalá manualmente
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-xl bg-muted p-4 border border-border"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/10">
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
