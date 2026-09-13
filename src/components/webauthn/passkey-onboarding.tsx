"use client";

import { useState, useEffect, useTransition } from "react";
import { Fingerprint, Loader2, X } from "lucide-react";
import {
  startRegistration,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@simplewebauthn/browser";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import {
  getRegistrationOptions,
  verifyRegistration,
} from "@/lib/webauthn/actions";

export const PASSKEY_ONBOARDING_DISMISS_KEY = "passkey-onboarding-dismissed";

export function isPasskeyOnboardingDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(PASSKEY_ONBOARDING_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissPasskeyOnboarding(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PASSKEY_ONBOARDING_DISMISS_KEY, "1");
  } catch {
    // Ignore storage errors
  }
}

export function clearPasskeyOnboardingDismissal(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PASSKEY_ONBOARDING_DISMISS_KEY);
  } catch {
    // Ignore storage errors
  }
}

interface PasskeyOnboardingProps {
  hasPasskeys: boolean;
}

export function PasskeyOnboarding({ hasPasskeys }: PasskeyOnboardingProps) {
  const { showToast } = useToast();
  const [isRegistering, startRegistering] = useTransition();
  const [visible, setVisible] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (hasPasskeys) return;
    if (isPasskeyOnboardingDismissed()) return;
    if (!browserSupportsWebAuthn()) return;

    platformAuthenticatorIsAvailable().then((available) => {
      if (available) {
        setSupported(true);
        setVisible(true);
      }
    });
  }, [hasPasskeys]);

  if (!visible || !supported) return null;

  function handleDismiss() {
    dismissPasskeyOnboarding();
    setVisible(false);
  }

  function handleRegister() {
    startRegistering(async () => {
      try {
        const result = await getRegistrationOptions();
        if ("error" in result) {
          showToast(String(result.error));
          return;
        }

        const response = await startRegistration({
          optionsJSON: result.options,
        });
        const verification = await verifyRegistration(response);

        if ("error" in verification) {
          showToast(String(verification.error));
          return;
        }

        showToast("Huella registrada");
        dismissPasskeyOnboarding();
        setVisible(false);
      } catch (err: unknown) {
        const error = err as { name?: string };
        if (error.name === "NotAllowedError") {
          showToast("Cancelaste el registro de huella");
        } else {
          showToast("No pudimos registrar la huella");
        }
      }
    });
  }

  return (
    <div
      role="region"
      aria-label="Sugerencia de acceso biométrico"
      className="relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        aria-label="Cerrar sugerencia de acceso biométrico"
        className="absolute right-2 top-2 h-8 w-8 rounded-md p-1 text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>

      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground border border-border shadow-xs">
          <Fingerprint className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-foreground">
            Entrá más rápido con huella
          </h2>
          <p className="text-xs text-muted-foreground">
            Activá el acceso biométrico y no vuelvas a escribir tu email. Tocá
            una vez para registrar tu huella o Face ID.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          className="h-10 flex-1 text-xs font-bold active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          disabled={isRegistering}
          aria-busy={isRegistering}
          aria-label={
            isRegistering
              ? "Registrando huella biométrica..."
              : "Activar acceso con huella"
          }
          onClick={handleRegister}
        >
          {isRegistering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Registrando…
            </>
          ) : (
            <>
              <Fingerprint className="mr-2 h-4 w-4" aria-hidden="true" />
              Activar huella
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 text-xs font-semibold active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          aria-label="Descartar sugerencia por ahora"
          onClick={handleDismiss}
        >
          Ahora no
        </Button>
      </div>
    </div>
  );
}
