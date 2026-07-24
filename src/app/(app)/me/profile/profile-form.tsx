"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { updateUserProfileAction } from "@/app/(app)/me/actions";
import { useToast } from "@/components/toast/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle } from "lucide-react";
import Image from "next/image";

const MIN_ALIAS_LENGTH = 2;
const MAX_ALIAS_LENGTH = 30;
const AUTOSAVE_DEBOUNCE_MS = 800;

interface ProfileFormProps {
  initialAlias: string;
  initialImage: string | null;
  googleAvatarUrl?: string | null;
  displayName?: string | null;
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
}: ProfileFormProps) {
  const { showToast } = useToast();
  const [alias, setAlias] = useState(initialAlias);
  const [image, setImage] = useState<string | null>(initialImage);
  const [isSaving, startSaving] = useTransition();

  const lastSavedAlias = useRef(initialAlias);
  const previousAliasRef = useRef(initialAlias);

  const isAliasDirty = alias !== lastSavedAlias.current;
  const isPendingSave = isAliasDirty && !isSaving;

  // Show "Usar foto de Google" only if Google photo exists and isn't the current image
  const canRestoreGooglePhoto =
    googleAvatarUrl && image !== googleAvatarUrl;

  const initials = getInitials(displayName);

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

  const aliasError = validateAlias(alias) ?? undefined;

  return (
    <div className="space-y-6">
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
          {canRestoreGooglePhoto ? (
            <button
              type="button"
              onClick={handleRestoreGooglePhoto}
              disabled={isSaving}
              className="text-xs text-primary underline underline-offset-2 hover:no-underline disabled:opacity-50 min-h-[1.75rem] py-1"
            >
              Usar mi foto de Google
            </button>
          ) : (
            <p className="text-xs text-muted-foreground">
              Tu foto viene de tu cuenta de Google.
            </p>
          )}
        </div>
      </div>

      {/* Alias */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="alias" className="text-sm font-semibold text-foreground">
            Alias en la cancha
          </Label>
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
    </div>
  );
}
