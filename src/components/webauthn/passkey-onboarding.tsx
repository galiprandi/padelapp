"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
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
import {
  getPasskeyErrorMessage,
  getPasskeyOnboardingContainerClasses,
  getPasskeyOnboardingDescription,
  getPasskeyOnboardingDismissAriaLabel,
  getPasskeyOnboardingDismissButtonClasses,
  getPasskeyOnboardingIconBadgeClasses,
  getPasskeyOnboardingLaterAriaLabel,
  getPasskeyOnboardingLaterButtonClasses,
  getPasskeyOnboardingLaterLabel,
  getPasskeyOnboardingRegionAriaLabel,
  getPasskeyOnboardingRegisterActionAriaLabel,
  getPasskeyOnboardingRegisterButtonClasses,
  getPasskeyOnboardingRegisterButtonText,
  getPasskeyOnboardingTitle,
  getPasskeyRegisterAriaLabel,
  getPasskeyRegisterErrorFallbackMessage,
  getPasskeyRegisterSuccessToast,
} from "./passkey-utils";

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

  const handleDismiss = useCallback(() => {
    dismissPasskeyOnboarding();
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible || !supported) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, supported, handleDismiss]);

  if (!visible || !supported) return null;

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

        showToast(getPasskeyRegisterSuccessToast());
        dismissPasskeyOnboarding();
        setVisible(false);
      } catch (err: unknown) {
        showToast(getPasskeyErrorMessage(err, getPasskeyRegisterErrorFallbackMessage()));
      }
    });
  }

  return (
    <div
      role="region"
      aria-label={getPasskeyOnboardingRegionAriaLabel()}
      className={getPasskeyOnboardingContainerClasses()}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        aria-label={getPasskeyOnboardingDismissAriaLabel()}
        className={getPasskeyOnboardingDismissButtonClasses()}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>

      <div className="flex items-start gap-3 pr-6">
        <div className={getPasskeyOnboardingIconBadgeClasses()}>
          <Fingerprint className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-foreground">
            {getPasskeyOnboardingTitle()}
          </h2>
          <p className="text-xs text-muted-foreground">
            {getPasskeyOnboardingDescription()}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          className={getPasskeyOnboardingRegisterButtonClasses()}
          disabled={isRegistering}
          aria-busy={isRegistering}
          aria-label={getPasskeyRegisterAriaLabel(isRegistering, getPasskeyOnboardingRegisterActionAriaLabel())}
          onClick={handleRegister}
        >
          {isRegistering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {getPasskeyOnboardingRegisterButtonText(true)}
            </>
          ) : (
            <>
              <Fingerprint className="mr-2 h-4 w-4" aria-hidden="true" />
              {getPasskeyOnboardingRegisterButtonText(false)}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className={getPasskeyOnboardingLaterButtonClasses()}
          aria-label={getPasskeyOnboardingLaterAriaLabel()}
          onClick={handleDismiss}
        >
          {getPasskeyOnboardingLaterLabel()}
        </Button>
      </div>
    </div>
  );
}
