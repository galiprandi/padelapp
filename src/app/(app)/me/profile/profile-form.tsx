"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { updateUserProfileAction } from "@/app/(app)/me/actions";
import { useToast } from "@/components/toast/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

const MIN_ALIAS_LENGTH = 2;
const MAX_ALIAS_LENGTH = 30;
const AUTOSAVE_DEBOUNCE_MS = 800;

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
  const searchParams = useSearchParams();
  const isOnboarding = searchParams ? searchParams.get("onboarding") === "true" : false;

  const [alias, setAlias] = useState(initialAlias);
  const [image, setImage] = useState<string | null>(initialImage);
  const [isSaving, startSaving] = useTransition();
  const [checklistDismissed, setChecklistDismissed] = useState(false);

  const lastSavedAlias = useRef(initialAlias);
  const previousAliasRef = useRef(initialAlias);

  // eslint-disable-next-line react-hooks/refs -- intentional: tracks dirty state without causing re-render
  const isAliasDirty = alias !== lastSavedAlias.current;
  const isPendingSave = isAliasDirty && !isSaving;

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
              updateUserProfileAction(alias, previousImage);
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

    const trimmed = alias.trim();
    if (
      trimmed.length > 0 &&
      (trimmed.length < MIN_ALIAS_LENGTH || trimmed.length > MAX_ALIAS_LENGTH)
    ) {
      return;
    }

    const timer = setTimeout(() => {
      previousAliasRef.current = lastSavedAlias.current;
      startSaving(async () => {
        const response = await updateUserProfileAction(alias, image);
        if (response.status === "ok") {
          lastSavedAlias.current = response.alias ?? "";
          showToast("Perfil actualizado", {
            duration: 4000,
            action: {
              label: "Deshacer",
              onClick: () => setAlias(previousAliasRef.current),
            },
          });
        } else {
          showToast("No pudimos guardar. Probá de nuevo.", { type: "error" });
        }
      });
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [alias, image, isAliasDirty, showToast]);

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
              updateUserProfileAction(alias, previousImage);
            },
          },
        });
      } else {
        showToast("No pudimos actualizar la foto.", { type: "error" });
        setImage(previousImage);
      }
    });
  }

  function validateAlias(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    if (
      trimmed.length < MIN_ALIAS_LENGTH ||
      trimmed.length > MAX_ALIAS_LENGTH
    ) {
      return `Usá entre ${MIN_ALIAS_LENGTH} y ${MAX_ALIAS_LENGTH} caracteres.`;
    }
    return null;
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecklistDismissed(localStorage.getItem("onboarding-checklist-dismissed") === "true");
    }
  }, []);

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
    <div className="space-y-6">
      {/* Onboarding Welcome Banner */}
      {isOnboarding && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
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

      {/* Guía de bienvenida / Onboarding restoration */}
      {matchesPlayed === 0 && checklistDismissed && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">
            Guía de bienvenida
          </h3>
          <p className="text-xs text-muted-foreground leading-normal">
            Descartaste la guía de bienvenida en tu panel de inicio. Restablecela para seguir tu progreso de preparación (alias, instalación, notificaciones, primer turno).
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleRestoreChecklist}
            className="w-full h-10 text-xs font-bold border-primary/30 hover:bg-muted"
          >
            Restablecer guía de bienvenida
          </Button>
        </div>
      )}
    </div>
  );
}
