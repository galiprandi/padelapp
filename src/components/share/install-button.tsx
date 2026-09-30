"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Download, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import { usePwaInstalled } from "@/lib/hooks/use-pwa-installed";
import {
  getInstallActionAriaLabel,
  getInstallButtonLabel,
  getInstallButtonClasses,
  getInstallStatusInstalledClasses,
  getInstallInstalledLabel,
  getInstallSuccessToast,
  getInstallInitErrorToast,
  getInstallValidationErrorToast,
} from "@/components/share/install-utils";

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      showToast(getInstallSuccessToast());
    };
    const handleDismiss = () => {
      setIsInstalling(false);
    };
    const handleValidation = (e: Event) => {
      const target = e.target as HTMLInstallElement;
      if (target.invalidReason === "install_data_invalid") {
        setIsInstalling(false);
        showToast(getInstallValidationErrorToast());
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
        showToast(getInstallSuccessToast());
      }
    } catch {
      showToast(getInstallInitErrorToast());
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, showToast]);

  if (isInstalled || hasInstalled) {
    return (
      <div className={getInstallStatusInstalledClasses()}>
        <Check className="h-4 w-4" aria-hidden="true" />
        {getInstallInstalledLabel()}
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
        className={getInstallButtonClasses()}
        onClick={handleNativePrompt}
        disabled={isInstalling}
        aria-busy={isInstalling}
        aria-label={getInstallActionAriaLabel()}
      >
        {isInstalling ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="h-4 w-4" aria-hidden="true" />
        )}
        {getInstallButtonLabel(isInstalling)}
      </Button>
    );
  }

  // <install> element (experimental, origin trial)
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {isInstalling && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {getInstallButtonLabel(true)}
        </div>
      )}
      <install
        ref={installRef}
        {...(installUrl ? { installurl: installUrl } : {})}
        {...(manifestId ? { manifestid: manifestId } : {})}
        className="w-full"
      >
        <Button
          className={getInstallButtonClasses()}
          onClick={() => setIsInstalling(true)}
          aria-busy={isInstalling}
          aria-label={getInstallActionAriaLabel()}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {getInstallButtonLabel(isInstalling)}
        </Button>
      </install>
    </div>
  );
}
