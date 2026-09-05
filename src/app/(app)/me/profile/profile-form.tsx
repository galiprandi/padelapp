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
import { cn } from "@/lib/utils";
import { CATEGORIES, getCategoryDefinition } from "@/lib/constants/categories";
import {
  MAX_ALIAS_LENGTH,
  AUTOSAVE_DEBOUNCE_MS,
  COURT_SIDE_OPTIONS,
  PreferredSideOption,
  validateAlias,
  getNextSideOption,
  getNextCategoryLevel,
  getSideOptionLabel,
  getInitials,
} from "./profile-utils";

interface ProfileFormProps {
  initialAlias: string;
  initialImage: string | null;
  initialLevel?: number;
  initialPreferredSide?: PreferredSideOption | null;
  googleAvatarUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  matchesPlayed?: number;
}

function FormMiniCourtIndicator({
  preferredSide,
}: {
  preferredSide: PreferredSideOption | null;
}) {
  const isLeft = preferredSide === "LEFT" || preferredSide === "BOTH";
  const isRight = preferredSide === "RIGHT" || preferredSide === "BOTH";

  return (
    <div
      className="flex items-center justify-center shrink-0 w-10 h-7 rounded border border-border bg-card p-1 shadow-xs"
      aria-hidden="true"
    >
      <div className="grid grid-cols-2 gap-0.5 w-full h-full rounded-[2px] overflow-hidden border border-border/80 bg-muted/40">
        <div
          className={cn(
            "h-full rounded-[1px] transition-colors",
            isLeft ? "bg-primary" : "bg-muted"
          )}
        />
        <div
          className={cn(
            "h-full rounded-[1px] transition-colors",
            isRight ? "bg-primary" : "bg-muted"
          )}
        />
      </div>
    </div>
  );
}

export function ProfileForm({
  initialAlias,
  initialImage,
  initialLevel = 6,
  initialPreferredSide = "BOTH",
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
  const [level, setLevel] = useState(initialLevel);
  const [preferredSide, setPreferredSide] = useState<PreferredSideOption | null>(
    initialPreferredSide ?? "BOTH"
  );
  const [isSaving, startSaving] = useTransition();

  const levelRef = useRef(level);
  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  const preferredSideRef = useRef(preferredSide);
  useEffect(() => {
    preferredSideRef.current = preferredSide;
  }, [preferredSide]);

  const sideContainerRef = useRef<HTMLDivElement>(null);
  const categoryContainerRef = useRef<HTMLDivElement>(null);

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
        const response = await updateUserProfileAction(
          targetAlias,
          targetImage,
          levelRef.current,
          preferredSideRef.current
        );
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
      const response = await updateUserProfileAction(
        alias,
        null,
        levelRef.current,
        preferredSideRef.current
      );
      if (response.status === "ok") {
        showToast("Foto eliminada", {
          duration: 4000,
          action: {
            label: "Deshacer",
            onClick: () => {
              setImage(previousImage);
              startSaving(async () => {
                const undoResponse = await updateUserProfileAction(
                  alias,
                  previousImage,
                  levelRef.current,
                  preferredSideRef.current
                );
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

  function handleLevelChange(newLevel: number) {
    if (newLevel === level || isSaving) return;
    const previousLevel = level;
    setLevel(newLevel);
    startSaving(async () => {
      const response = await updateUserProfileAction(
        alias,
        image,
        newLevel,
        preferredSideRef.current
      );
      if (response.status === "ok") {
        const cat = getCategoryDefinition(newLevel);
        showToast(`Categoría actualizada a ${cat.shortLabel}`, { duration: 3000 });
      } else {
        showToast(response.message || "No pudimos guardar la categoría.", { type: "error" });
        setLevel(previousLevel);
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
      const response = await updateUserProfileAction(
        alias,
        googleAvatarUrl,
        levelRef.current,
        preferredSideRef.current
      );
      if (response.status === "ok") {
        showToast("Foto actualizada", {
          duration: 4000,
          action: {
            label: "Deshacer",
            onClick: () => {
              setImage(previousImage);
              startSaving(async () => {
                const undoResponse = await updateUserProfileAction(
                  alias,
                  previousImage,
                  levelRef.current,
                  preferredSideRef.current
                );
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

  function handlePreferredSideChange(newSide: PreferredSideOption | null) {
    if (newSide === preferredSide || isSaving) return;
    const previousSide = preferredSide;
    setPreferredSide(newSide);
    startSaving(async () => {
      const response = await updateUserProfileAction(
        alias,
        image,
        levelRef.current,
        newSide
      );
      if (response.status === "ok") {
        showToast(`Lado preferido actualizado a ${getSideOptionLabel(newSide)}`, { duration: 3000 });
      } else {
        showToast(response.message || "No pudimos guardar el lado preferido.", { type: "error" });
        setPreferredSide(previousSide);
      }
    });
  }

  const handleSideKeyDown = (e: React.KeyboardEvent) => {
    const nextSide = getNextSideOption(preferredSide, e.key);
    if (nextSide) {
      e.preventDefault();
      handlePreferredSideChange(nextSide);
      setTimeout(() => {
        const btn = sideContainerRef.current?.querySelector<HTMLButtonElement>(
          `button[data-side="${nextSide}"]`
        );
        btn?.focus();
      }, 0);
    }
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent) => {
    const nextLevel = getNextCategoryLevel(level, e.key);
    if (nextLevel !== null) {
      e.preventDefault();
      handleLevelChange(nextLevel);
      setTimeout(() => {
        const btn = categoryContainerRef.current?.querySelector<HTMLButtonElement>(
          `button[data-level="${nextLevel}"]`
        );
        btn?.focus();
      }, 0);
    }
  };

  const aliasError = validateAlias(alias) ?? undefined;

  return (
    <div className="space-y-6 pb-16">
      {/* Onboarding Welcome Banner */}
      {isOnboarding && (
        <div
          className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-sm"
          role="region"
          aria-label="Bienvenida a Padel Red"
        >
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
          <div className="w-16 h-16 rounded-xl bg-muted text-foreground flex items-center justify-center border border-border shadow-xs shrink-0 text-xl font-bold">
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
                className="text-xs text-primary underline underline-offset-2 hover:no-underline disabled:opacity-50 min-h-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all rounded px-1"
                aria-label="Restablecer a la foto original de tu cuenta de Google"
              >
                Usar mi foto de Google
              </button>
            )}
            {image !== null ? (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isSaving}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:no-underline disabled:opacity-50 min-h-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all rounded px-1"
                aria-label="Quitar foto de perfil y mostrar iniciales"
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

      {/* Lado preferido en la cancha */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-foreground">
            Lado preferido en la cancha
          </Label>
          <div className="flex items-center gap-2">
            <FormMiniCourtIndicator preferredSide={preferredSide} />
            <span className="text-xs font-bold text-foreground bg-muted border border-border px-2.5 py-0.5 rounded-full">
              {getSideOptionLabel(preferredSide)}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Indicá tu posición habitual para armar mejores parejas y sugerencias de partidos en la red.
        </p>

        {/* Chips de selección Derecha / Revés / Ambos */}
        <div
          ref={sideContainerRef}
          className="grid grid-cols-3 gap-2 pt-1"
          role="radiogroup"
          aria-label="Lado preferido en la cancha"
          onKeyDown={handleSideKeyDown}
        >
          {COURT_SIDE_OPTIONS.map((sideOption) => {
            const isSelected = preferredSide === sideOption.id;
            return (
              <button
                key={sideOption.id}
                data-side={sideOption.id}
                type="button"
                onClick={() => handlePreferredSideChange(sideOption.id)}
                disabled={isSaving}
                aria-checked={isSelected}
                role="radio"
                tabIndex={isSelected ? 0 : -1}
                aria-label={`Lado ${sideOption.label}: ${sideOption.desc}`}
                className={cn(
                  "h-10 rounded-lg text-xs font-bold transition-all border flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                )}
              >
                {sideOption.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categoría de Juego */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-foreground">
            Categoría de juego
          </Label>
          <span className="text-xs font-bold text-foreground bg-muted border border-border px-2.5 py-0.5 rounded-full">
            {getCategoryDefinition(level).shortLabel}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Seleccioná tu categoría habitual para buscar partidos, armar turnos y medir tu nivel en la red.
        </p>

        {/* Chips de selección 1ª a 8ª Cat. */}
        <div
          ref={categoryContainerRef}
          className="grid grid-cols-4 gap-2 pt-1"
          role="radiogroup"
          aria-label="Categoría de juego"
          aria-describedby="category-description"
          onKeyDown={handleCategoryKeyDown}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = level === cat.level;
            return (
              <button
                key={cat.level}
                data-level={cat.level}
                type="button"
                onClick={() => handleLevelChange(cat.level)}
                disabled={isSaving}
                aria-checked={isSelected}
                role="radio"
                tabIndex={isSelected ? 0 : -1}
                aria-label={`${cat.label}: ${cat.description}`}
                className={cn(
                  "h-10 rounded-lg text-xs font-bold transition-all border flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                )}
              >
                {cat.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Categoría actual descripción */}
        <div
          id="category-description"
          className="mt-2 rounded-lg bg-muted/60 border border-border/60 p-3 space-y-1"
        >
          <p className="text-xs font-bold text-foreground">
            {getCategoryDefinition(level).label}
          </p>
          <p className="text-xs text-muted-foreground leading-normal">
            {getCategoryDefinition(level).description}
          </p>
        </div>
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
                className="w-full h-10 text-xs font-bold border-border hover:bg-muted active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
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
                className="w-full h-10 text-xs font-bold border-border hover:bg-muted active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
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
                className="w-full h-10 text-xs font-bold border-border hover:bg-muted active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
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
