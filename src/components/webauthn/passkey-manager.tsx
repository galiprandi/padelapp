"use client";

import { useState, useEffect, useTransition } from "react";
import { Fingerprint, Loader2, Plus, Trash2 } from "lucide-react";
import {
  startRegistration,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@simplewebauthn/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/toast/use-toast";
import {
  getRegistrationOptions,
  verifyRegistration,
  deletePasskey,
} from "@/lib/webauthn/actions";

interface Passkey {
  credentialId: string;
  nickname: string | null;
  deviceType: string | null;
  createdAt: Date;
}

interface PasskeyManagerProps {
  initialPasskeys: Passkey[];
}

export function PasskeyManager({ initialPasskeys }: PasskeyManagerProps) {
  const { showToast } = useToast();
  const [passkeys, setPasskeys] = useState(initialPasskeys);
  const [isRegistering, startRegistering] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (!browserSupportsWebAuthn()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupported(false);
      return;
    }
    platformAuthenticatorIsAvailable().then(setSupported);
  }, []);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Fingerprint className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-foreground">
              Acceso con huella
            </h2>
            <p className="text-xs text-muted-foreground">
              Tu dispositivo no soporta autenticación biométrica web.
            </p>
          </div>
        </div>
      </div>
    );
  }

  function handleRegister() {
    startRegistering(async () => {
      try {
        const result = await getRegistrationOptions();
        if ("error" in result) {
          showToast(result.error ?? "Error");
          return;
        }

        const response = await startRegistration({
          optionsJSON: result.options,
        });
        const verification = await verifyRegistration(response, nickname);

        if ("error" in verification) {
          showToast(verification.error ?? "Error");
          return;
        }

        showToast("Huella registrada");
        setNickname("");
        window.location.reload();
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

  function handleDelete(credentialId: string) {
    startDeleting(async () => {
      const result = await deletePasskey(credentialId);
      if ("error" in result) {
        showToast(result.error ?? "Error");
        return;
      }
      setPasskeys((prev) =>
        prev.filter((p) => p.credentialId !== credentialId),
      );
      showToast("Huella eliminada");
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Fingerprint className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-1">
          <h2 className="text-sm font-bold text-foreground">
            Acceso con huella
          </h2>
          <p className="text-xs text-muted-foreground">
            Entrá más rápido con huella o Face ID. Sin escribir tu email cada
            vez.
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <Label htmlFor="passkey-nickname" className="text-xs font-semibold text-foreground">
          Nombre del dispositivo (opcional)
        </Label>
        <Input
          id="passkey-nickname"
          type="text"
          placeholder="Ej: Mi Celular, Mi Computadora..."
          value={nickname}
          onChange={(e) => setNickname(e.target.value.slice(0, 30))}
          maxLength={30}
          disabled={isRegistering}
          className="h-10 text-sm"
        />
      </div>

      {passkeys.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {passkeys.map((passkey) => (
            <div
              key={passkey.credentialId}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted px-3 py-2"
            >
              <Fingerprint
                className="h-4 w-4 text-muted-foreground shrink-0"
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {passkey.nickname || "Huella registrada"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(passkey.createdAt).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => handleDelete(passkey.credentialId)}
                disabled={isDeleting}
                aria-label="Eliminar huella"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-card hover:text-destructive transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full h-10"
        disabled={isRegistering || supported === null}
        onClick={handleRegister}
      >
        {isRegistering ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registrando…
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Registrar huella
          </>
        )}
      </Button>
    </div>
  );
}
