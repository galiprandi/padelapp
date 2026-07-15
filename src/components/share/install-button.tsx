"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Download, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import { usePwaInstalled } from "@/lib/hooks/use-pwa-installed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallButtonProps {
  installUrl?: string;
  manifestId?: string;
  onAvailabilityChange?: (available: boolean) => void;
}

type InstallMethod = "install-element" | "beforeinstallprompt" | null;

export function InstallButton({
  installUrl,
  manifestId,
  onAvailabilityChange,
}: InstallButtonProps) {
  const { showToast } = useToast();
  const isInstalled = usePwaInstalled();
  const installRef = useRef<HTMLInstallElement>(null);
  const [method, setMethod] = useState<InstallMethod>(null);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [hasInstalled, setHasInstalled] = useState(false);

  // Detect available install method
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("HTMLInstallElement" in window) {
      setMethod("install-element");
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setMethod("beforeinstallprompt");
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Notify parent about availability
  const isAvailable = method !== null || deferredPrompt !== null;
  useEffect(() => {
    onAvailabilityChange?.(isAvailable);
  }, [isAvailable, onAvailabilityChange]);

  // Wire up <install> element events
  useEffect(() => {
    if (method !== "install-element") return;
    const el = installRef.current;
    if (!el) return;

    const handleAction = () => {
      setIsInstalling(false);
      setHasInstalled(true);
      showToast("App instalada");
    };
    const handleDismiss = () => {
      setIsInstalling(false);
    };
    const handleValidation = (e: Event) => {
      const target = e.target as HTMLInstallElement;
      if (target.invalidReason === "install_data_invalid") {
        setIsInstalling(false);
        showToast("No se pudo validar la instalación");
      }
    };

    el.addEventListener("promptaction", handleAction);
    el.addEventListener("promptdismiss", handleDismiss);
    el.addEventListener("validationstatuschanged", handleValidation);

    return () => {
      el.removeEventListener("promptaction", handleAction);
      el.removeEventListener("promptdismiss", handleDismiss);
      el.removeEventListener("validationstatuschanged", handleValidation);
    };
  }, [method, showToast]);

  const handleNativePrompt = useCallback(async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setHasInstalled(true);
        showToast("App instalada");
      }
    } catch {
      showToast("No se pudo iniciar la instalación");
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, showToast]);

  if (isInstalled || hasInstalled) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-emerald-500">
        <Check className="h-4 w-4" />
        ¡Instalada!
      </div>
    );
  }

  // No install method available — let the caller show manual steps only
  if (!method && !deferredPrompt) {
    return null;
  }

  // beforeinstallprompt (standard, widely supported)
  if (method === "beforeinstallprompt" || deferredPrompt) {
    return (
      <Button
        className="w-full h-12 rounded-lg font-semibold text-sm"
        onClick={handleNativePrompt}
        disabled={isInstalling}
      >
        {isInstalling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Instalar app
      </Button>
    );
  }

  // <install> element (experimental, origin trial)
  return (
    <div className="flex flex-col items-center gap-2">
      {isInstalling && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Instalando…
        </div>
      )}
      <install
        ref={installRef}
        {...(installUrl ? { installurl: installUrl } : {})}
        {...(manifestId ? { manifestid: manifestId } : {})}
      >
        <Button
          className="w-full h-12 rounded-lg font-semibold text-sm"
          onClick={() => setIsInstalling(true)}
        >
          <Download className="h-4 w-4" />
          Instalar app
        </Button>
      </install>
    </div>
  );
}
