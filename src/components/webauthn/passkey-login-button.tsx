"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Loader2 } from "lucide-react";
import {
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@simplewebauthn/browser";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import { getAuthOptions, verifyAuth } from "@/lib/webauthn/actions";

export function PasskeyLoginButton() {
  const { showToast } = useToast();
  const router = useRouter();
  const [isAuthenticating, startAuthenticating] = useTransition();
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (!browserSupportsWebAuthn()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupported(false);
      return;
    }
    platformAuthenticatorIsAvailable().then(setSupported);
  }, []);

  if (supported === null || supported === false) {
    return null;
  }

  function handlePasskeyLogin() {
    startAuthenticating(async () => {
      try {
        const result = await getAuthOptions();
        if ("error" in result) {
          showToast(String(result.error));
          return;
        }

        const response = await startAuthentication({
          optionsJSON: result.options,
        });
        const verification = await verifyAuth(response);

        if ("error" in verification) {
          showToast(String(verification.error));
          return;
        }

        router.push("/me");
        router.refresh();
      } catch (err: unknown) {
        const error = err as { name?: string };
        if (error.name === "NotAllowedError") {
          return;
        }
        if (error.name === "InvalidStateError") {
          showToast(
            "No se encontró huella registrada. Entrá con Google y activá la huella desde tu perfil.",
          );
          return;
        }
        console.error("[passkey-login] unexpected error:", err);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-12 w-full rounded-lg text-base font-semibold active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
      disabled={isAuthenticating}
      onClick={handlePasskeyLogin}
    >
      {isAuthenticating ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Verificando…
        </>
      ) : (
        <>
          <Fingerprint className="mr-2 h-5 w-5" />
          Entrar con huella
        </>
      )}
    </Button>
  );
}
