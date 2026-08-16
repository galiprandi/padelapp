"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { updateUserProfileAction } from "@/app/(app)/me/actions";
import { useToast } from "@/components/toast/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

const MIN_ALIAS_LENGTH = 2;
const MAX_ALIAS_LENGTH = 30;
const AUTOSAVE_DEBOUNCE_MS = 800;

function validateAlias(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (
    trimmed.length < MIN_ALIAS_LENGTH ||
    trimmed.length > MAX_ALIAS_LENGTH
  ) {
    return `Usá entre ${MIN_ALIAS_LENGTH} y ${MAX_ALIAS_LENGTH} caracteres.`;
  }

  // Permitir letras (con acentos, diéresis y eñes), números, espacios y guiones comunes
  const aliasRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]+$/;
  if (!aliasRegex.test(trimmed)) {
    return "El alias solo puede tener letras, números, espacios y guiones.";
  }
  return null;
}

interface ProfileFormProps {
  initialAlias: string;
  initialImage: string | null;
  googleAvatarUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  matchesPlayed?: number;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ProfileForm({
  initialAlias,
  initialImage,
  googleAvatarUrl,
  displayName,
  email,
  matchesPlayed = 0,
}: ProfileFormProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams ? searchParams.get("onboarding") === "true" : false;

  const [alias, setAlias] = useState(initialAlias);
  const [image, setImage] = useState<string | null>(initialImage);
  const [isSaving, startSaving] = useTransition();
  const [checklistDismissed, setChecklistDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("onboarding-checklist-dismissed") === "true";
  });
  const [pwaDismissed, setPwaDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("pwa-banner-dismissed") === "true";
  });
  const [pushDismissed, setPushDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("push-prompt-dismissed") === "true";
  });

  const lastSavedAlias = useRef(initialAlias);
  const previousAliasRef = useRef(initialAlias);

  // eslint-disable-next-line react-hooks/refs -- intentional: tracks dirty state without causing re-render
  const isAliasDirty = alias !== lastSavedAlias.current;
  const isPendingSave = isAliasDirty && !isSaving;

  const saveAlias = useCallback((targetAlias: string, targetImage: string | null): Promise<boolean> => {
    previousAliasRef.current = lastSavedAlias.current;
    return new Promise((resolve) => {
      startSaving(async () => {
        const response = await updateUserProfileAction(targetAlias, targetImage);
        if (response.status === "ok") {
          const savedAlias = response.alias ?? "";
          lastSavedAlias.current = savedAlias;
          setAlias(savedAlias);
          showToast("Perfil actualizado", {
            duration: 4000,
            action: {
              label: "Deshacer",
              onClick: () => {
                setAlias(previousAliasRef.current);
              },
            },
          });
          resolve(true);
        } else {
          showToast("No pudimos guardar. Probá de nuevo.", { type: "error" });
          resolve(false);
        }
      });
    });
  }, [showToast]);

  // Show "Usar foto de Google" only if Google photo exists and isn't the current image
  const canRestoreGooglePhoto =
    googleAvatarUrl && image !== googleAvatarUrl;

  const initials = getInitials(displayName);

  function handleRemovePhoto() {
    const previousImage = image;
    setImage(null);
    startSaving(async () => {
      const response = await updateUserProfileAction(alias, null);
      if (response.status === "ok") {
        showToast("Foto eliminada", {
          duration: 4000,
          action: {
            label: "Deshacer",
            onClick: () => {
              setImage(previousImage);
              startSaving(async () => {
                const undoResponse = await updateUserProfileAction(alias, previousImage);
                if (undoResponse.status === "ok") {
                  showToast("Foto restablecida", { duration: 2000 });
                } else {
                  showToast("No pudimos restablecer la foto.", { type: "error" });
                  setImage(null);
                }
              });
            },
          },
        });
      } else {
        showToast("No pudimos eliminar la foto.", { type: "error" });
        setImage(previousImage);
      }
    });
  }

  // Debounced auto-save for alias
  useEffect(() => {
    if (!isAliasDirty) return;

    if (validateAlias(alias) !== null) {
      return;
    }

    const timer = setTimeout(() => {
      if (alias !== lastSavedAlias.current) {
        saveAlias(alias, image);
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [alias, image, isAliasDirty, saveAlias]);

  function handleRestoreGooglePhoto() {
    if (!googleAvatarUrl) return;
    const previousImage = image;
    setImage(googleAvatarUrl);
    startSaving(async () => {
      const response = await updateUserProfileAction(alias, googleAvatarUrl);
      if (response.status === "ok") {
        showToast("Foto actualizada", {
          duration: 4000,
          action: {
            label: "Deshacer",
            onClick: () => {
              setImage(previousImage);
              startSaving(async () => {
                const undoResponse = await updateUserProfileAction(alias, previousImage);
                if (undoResponse.status === "ok") {
                  showToast("Foto restablecida", { duration: 2000 });
                } else {
                  showToast("No pudimos restablecer la foto.", { type: "error" });
                  setImage(googleAvatarUrl);
                }
              });
            },
          },
        });
      } else {
        showToast("No pudimos actualizar la foto.", { type: "error" });
        setImage(previousImage);
      }
    });
  }


  function handleRestoreChecklist() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("onboarding-checklist-dismissed");
      setChecklistDismissed(false);
      showToast("Guía de bienvenida restablecida", {
        duration: 4000,
      });
    }
  }

  const aliasError = validateAlias(alias) ?? undefined;

  return (
    <div className="space-y-6 pb-16">
      {/* Onboarding Welcome Banner */}
      {isOnboarding && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base" role="img" aria-label="Mano saludando">👋</span>
            <h3 className="text-sm font-bold text-foreground">
              ¡Te damos la bienvenida a Padel Red!
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-normal">
            Antes de empezar, configúrate un alias. Este es el nombre con el que aparecerás en los partidos, turnos y ranking para que otros jugadores puedan identificarte.
          </p>
        </div>
      )}

      {/* Avatar — static display, Google photo or initials */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        {image ? (
          <Image
            src={image}
            alt={displayName ?? "Avatar"}
            width={64}
            height={64}
            className="w-16 h-16 rounded-xl object-cover border border-border shrink-0"
            referrerPolicy="no-referrer"
            unoptimized
          />
        ) : initials ? (
          <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-border shrink-0 text-xl font-bold">
            {initials}
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl bg-muted text-muted-foreground flex items-center justify-center border border-border shrink-0">
            <UserCircle className="w-10 h-10" aria-hidden="true" />
          </div>
        )}
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {displayName}
          </p>
          <div className="flex flex-col items-start gap-1">
            {canRestoreGooglePhoto && (
              <button
                type="button"
                onClick={handleRestoreGooglePhoto}
                disabled={isSaving}
                className="text-xs text-primary underline underline-offset-2 hover:no-underline disabled:opacity-50 min-h-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
              >
                Usar mi foto de Google
              </button>
            )}
            {image !== null ? (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isSaving}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:no-underline disabled:opacity-50 min-h-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
              >
                Quitar foto
              </button>
            ) : (
              <p className="text-xs text-muted-foreground">
                Se mostrarán las iniciales de tu nombre.
              </p>
            )}
            {!canRestoreGooglePhoto && image !== null && (
              <p className="text-xs text-muted-foreground">
                Tu foto viene de tu cuenta de Google.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Alias */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="alias" className="text-sm font-semibold text-foreground">
            Alias en la cancha
          </Label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {alias.length}/{MAX_ALIAS_LENGTH}
            </span>
            {(isPendingSave || isSaving) && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {isPendingSave ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                    Sin guardar
                  </>
                ) : (
                  "Guardando…"
                )}
              </span>
            )}
          </div>
        </div>
        <Input
          id="alias"
          name="alias"
          placeholder="Ej: El Muro, Gero..."
          value={alias}
          onChange={(event) => setAlias(event.target.value)}
          onBlur={() => {
            if (isAliasDirty && !aliasError && !isSaving) {
              saveAlias(alias, image);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (isAliasDirty && !aliasError && !isSaving) {
                saveAlias(alias, image);
              }
            }
          }}
          disabled={isSaving}
          autoSelect
          className="h-12"
          aria-invalid={Boolean(aliasError)}
          aria-describedby={aliasError ? "alias-error" : undefined}
        />
        <p className="text-xs text-muted-foreground">
          Este nombre verán tus rivales en partidos y ranking.
        </p>
        {aliasError && (
          <p id="alias-error" className="text-sm text-destructive">
            {aliasError}
          </p>
        )}
      </div>

      {/* Datos de la cuenta (solo lectura) */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">
          Cuenta de Google
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-muted-foreground">Nombre</span>
            <span className="font-semibold text-foreground">{displayName}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-muted-foreground">Email</span>
            <span className="font-semibold text-foreground">{email}</span>
          </div>
        </div>
      </div>

      {isOnboarding && (
        <Button
          type="button"
          disabled={isSaving}
          onClick={async () => {
            if (isAliasDirty && !aliasError && !isSaving) {
              const success = await saveAlias(alias, image);
              if (success) {
                router.push("/me");
              }
            } else if (!aliasError) {
              router.push("/me");
            }
          }}
          className="w-full h-12 text-sm font-bold active:scale-[0.98] transition-all"
        >
          {isSaving ? "Guardando…" : "Continuar al inicio"}
        </Button>
      )}

      {/* Avisos de la aplicación / Suggestion & checklist restoration */}
      {((matchesPlayed === 0 && checklistDismissed) || pwaDismissed || pushDismissed) && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">
            Avisos de la aplicación
          </h3>
          <p className="text-xs text-muted-foreground leading-normal">
            Restablecé los carteles o sugerencias que ocultaste anteriormente para volver a verlos en tu panel de inicio.
          </p>
          <div className="space-y-2 pt-1">
            {matchesPlayed === 0 && checklistDismissed && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRestoreChecklist}
                className="w-full h-10 text-xs font-bold border-primary/30 hover:bg-muted active:scale-[0.98] transition-all"
              >
                Restablecer guía de bienvenida
              </Button>
            )}
            {pwaDismissed && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("pwa-banner-dismissed");
                    setPwaDismissed(false);
                    showToast("Sugerencia de instalación restablecida", {
                      duration: 4000,
                    });
                  }
                }}
                className="w-full h-10 text-xs font-bold border-primary/30 hover:bg-muted active:scale-[0.98] transition-all"
              >
                Restablecer sugerencia de instalación
              </Button>
            )}
            {pushDismissed && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("push-prompt-dismissed");
                    setPushDismissed(false);
                    showToast("Sugerencia de notificaciones restablecida", {
                      duration: 4000,
                    });
                  }
                }}
                className="w-full h-10 text-xs font-bold border-primary/30 hover:bg-muted active:scale-[0.98] transition-all"
              >
                Restablecer sugerencia de notificaciones
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
