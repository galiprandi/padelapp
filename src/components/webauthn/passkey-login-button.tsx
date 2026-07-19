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
      } catch (err: any) {
        if (err.name === "NotAllowedError") {
          return;
        }
        showToast(
          "No se encontró huella registrada. Entrá con Google y activá la huella desde tu perfil.",
        );
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-12 w-full rounded-xl text-base font-semibold"
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
