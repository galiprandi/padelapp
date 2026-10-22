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
import { CATEGORIES, getCategoryDefinition } from "@/lib/constants/categories";
import {
  isOnboardingChecklistDismissed,
  clearOnboardingChecklistDismissal,
} from "@/components/onboarding-checklist";
import {
  isPwaBannerDismissed,
  clearPwaBannerDismissal,
} from "@/components/pwa-install-banner";
import {
  isPushPromptDismissed,
  clearPushPromptDismissal,
} from "@/components/pwa/push-permission-prompt";
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
  getProfileRegionAriaLabel,
  getAliasCharacterCountText,
  getProfileSaveSuccessToast,
  getProfileSaveErrorToast,
  getPhotoDeleteSuccessToast,
  getPhotoRestoreSuccessToast,
  getCategoryUpdateSuccessToast,
  getPreferredSideUpdateSuccessToast,
  getMiniCourtContainerClasses,
  getMiniCourtGridClasses,
  getMiniCourtCellClasses,
  getProfileWelcomeBannerClasses,
  getProfileWelcomeTitleText,
  getProfileWelcomeDescriptionText,
  getProfileAvatarCardClasses,
  getProfileAvatarImageClasses,
  getProfileAvatarInitialsClasses,
  getProfileAvatarPlaceholderClasses,
  getProfileRestoreGoogleButtonClasses,
  getProfileRestoreGoogleButtonText,
  getProfileRestoreGoogleButtonAriaLabel,
  getProfileRemovePhotoButtonClasses,
  getProfileRemovePhotoButtonText,
  getProfileRemovePhotoButtonAriaLabel,
  getProfileInitialsNoticeText,
  getProfileGooglePhotoNoticeText,
  getProfileAliasLabelText,
  getProfileAliasPlaceholderText,
  getProfileAliasDescriptionText,
  getProfileAliasUnsavedNoticeText,
  getProfileAliasSavingNoticeText,
  getProfileSideCardClasses,
  getProfileSideTitleText,
  getProfileSideBadgeClasses,
  getProfileSideDescriptionText,
  getProfileSideChipClasses,
  getProfileSideChipAriaLabel,
  getProfileCategoryCardClasses,
  getProfileCategoryTitleText,
  getProfileCategoryBadgeClasses,
  getProfileCategoryDescriptionText,
  getProfileCategoryChipClasses,
  getProfileCategoryChipAriaLabel,
  getProfileCategoryBoxClasses,
  getProfileAccountCardClasses,
  getProfileAccountHeadingTitle,
  getProfileAccountNameLabel,
  getProfileAccountEmailLabel,
  getProfileOnboardingContinueButtonClasses,
  getProfileOnboardingContinueButtonText,
  getProfileNoticesCardClasses,
  getProfileNoticesHeadingTitle,
  getProfileNoticesDescriptionText,
  getProfileNoticeButtonClasses,
  getProfileRestoreChecklistButtonText,
  getProfileRestorePwaButtonText,
  getProfileRestorePushButtonText,
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
      className={getMiniCourtContainerClasses()}
      aria-hidden="true"
    >
      <div className={getMiniCourtGridClasses()}>
        <div className={getMiniCourtCellClasses(isLeft)} />
        <div className={getMiniCourtCellClasses(isRight)} />
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
    return isOnboardingChecklistDismissed();
  });
  const [pwaDismissed, setPwaDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return isPwaBannerDismissed();
  });
  const [pushDismissed, setPushDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return isPushPromptDismissed();
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
          const toastInfo = getProfileSaveSuccessToast();
          showToast(toastInfo.title, {
            duration: 4000,
            action: {
              label: toastInfo.label,
              onClick: () => {
                setAlias(previousAliasRef.current);
              },
            },
          });
          resolve(true);
        } else {
          showToast(getProfileSaveErrorToast(), { type: "error" });
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
        const toastInfo = getPhotoDeleteSuccessToast();
        showToast(toastInfo.title, {
          duration: 4000,
          action: {
            label: toastInfo.label,
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
                  showToast(getPhotoRestoreSuccessToast(), { duration: 2000 });
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
        showToast(getCategoryUpdateSuccessToast(cat.shortLabel), { duration: 3000 });
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
      clearOnboardingChecklistDismissal();
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
        showToast(getPreferredSideUpdateSuccessToast(getSideOptionLabel(newSide)), { duration: 3000 });
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
          className={getProfileWelcomeBannerClasses()}
          role="region"
          aria-label={getProfileRegionAriaLabel("welcome")}
        >
          <div className="flex items-center gap-2">
            <span className="text-base" role="img" aria-label="Mano saludando">👋</span>
            <h3 className="text-sm font-bold text-foreground">
              {getProfileWelcomeTitleText()}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-normal">
            {getProfileWelcomeDescriptionText()}
          </p>
        </div>
      )}

      {/* Avatar — static display, Google photo or initials */}
      <section
        role="region"
        aria-label={getProfileRegionAriaLabel("avatar")}
        className={getProfileAvatarCardClasses()}
      >
        {image ? (
          <Image
            src={image}
            alt={displayName ?? "Avatar"}
            width={64}
            height={64}
            className={getProfileAvatarImageClasses()}
            referrerPolicy="no-referrer"
            unoptimized
          />
        ) : initials ? (
          <div className={getProfileAvatarInitialsClasses()}>
            {initials}
          </div>
        ) : (
          <div className={getProfileAvatarPlaceholderClasses()}>
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
                className={getProfileRestoreGoogleButtonClasses()}
                aria-label={getProfileRestoreGoogleButtonAriaLabel()}
              >
                {getProfileRestoreGoogleButtonText()}
              </button>
            )}
            {image !== null ? (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isSaving}
                className={getProfileRemovePhotoButtonClasses()}
                aria-label={getProfileRemovePhotoButtonAriaLabel()}
              >
                {getProfileRemovePhotoButtonText()}
              </button>
            ) : (
              <p className="text-xs text-muted-foreground">
                {getProfileInitialsNoticeText()}
              </p>
            )}
            {!canRestoreGooglePhoto && image !== null && (
              <p className="text-xs text-muted-foreground">
                {getProfileGooglePhotoNoticeText()}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Alias */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="alias" className="text-sm font-semibold text-foreground">
            {getProfileAliasLabelText()}
          </Label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {getAliasCharacterCountText(alias.length, MAX_ALIAS_LENGTH)}
            </span>
            {(isPendingSave || isSaving) && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {isPendingSave ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                    {getProfileAliasUnsavedNoticeText()}
                  </>
                ) : (
                  getProfileAliasSavingNoticeText()
                )}
              </span>
            )}
          </div>
        </div>
        <Input
          id="alias"
          name="alias"
          placeholder={getProfileAliasPlaceholderText()}
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
            } else if (event.key === "Escape") {
              event.preventDefault();
              setAlias(lastSavedAlias.current);
            }
          }}
          disabled={isSaving}
          autoSelect
          className="h-12"
          aria-invalid={Boolean(aliasError)}
          aria-describedby={aliasError ? "alias-error" : undefined}
        />
        <p className="text-xs text-muted-foreground">
          {getProfileAliasDescriptionText()}
        </p>
        {aliasError && (
          <p id="alias-error" className="text-sm text-destructive">
            {aliasError}
          </p>
        )}
      </div>

      {/* Lado preferido en la cancha */}
      <section
        role="region"
        aria-label={getProfileRegionAriaLabel("side")}
        className={getProfileSideCardClasses()}
      >
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-foreground">
            {getProfileSideTitleText()}
          </Label>
          <div className="flex items-center gap-2">
            <FormMiniCourtIndicator preferredSide={preferredSide} />
            <span className={getProfileSideBadgeClasses()}>
              {getSideOptionLabel(preferredSide)}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {getProfileSideDescriptionText()}
        </p>

        {/* Chips de selección Derecha / Revés / Ambos */}
        <div
          ref={sideContainerRef}
          className="grid grid-cols-3 gap-2 pt-1"
          role="radiogroup"
          aria-label={getProfileSideTitleText()}
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
                aria-label={getProfileSideChipAriaLabel(sideOption.label, sideOption.desc)}
                className={getProfileSideChipClasses(isSelected)}
              >
                {sideOption.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Categoría de Juego */}
      <section
        role="region"
        aria-label={getProfileRegionAriaLabel("category")}
        className={getProfileCategoryCardClasses()}
      >
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-foreground">
            {getProfileCategoryTitleText()}
          </Label>
          <span className={getProfileCategoryBadgeClasses()}>
            {getCategoryDefinition(level).shortLabel}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {getProfileCategoryDescriptionText()}
        </p>

        {/* Chips de selección 1ª a 8ª Cat. */}
        <div
          ref={categoryContainerRef}
          className="grid grid-cols-4 gap-2 pt-1"
          role="radiogroup"
          aria-label={getProfileCategoryTitleText()}
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
                aria-label={getProfileCategoryChipAriaLabel(cat.label, cat.description)}
                className={getProfileCategoryChipClasses(isSelected)}
              >
                {cat.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Categoría actual descripción */}
        <div
          id="category-description"
          className={getProfileCategoryBoxClasses()}
        >
          <p className="text-xs font-bold text-foreground">
            {getCategoryDefinition(level).label}
          </p>
          <p className="text-xs text-muted-foreground leading-normal">
            {getCategoryDefinition(level).description}
          </p>
        </div>
      </section>

      {/* Datos de la cuenta (solo lectura) */}
      <section
        role="region"
        aria-label={getProfileRegionAriaLabel("account")}
        className={getProfileAccountCardClasses()}
      >
        <h3 className="text-sm font-bold text-foreground">
          {getProfileAccountHeadingTitle()}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-muted-foreground">{getProfileAccountNameLabel()}</span>
            <span className="font-semibold text-foreground">{displayName}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-muted-foreground">{getProfileAccountEmailLabel()}</span>
            <span className="font-semibold text-foreground">{email}</span>
          </div>
        </div>
      </section>

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
          className={getProfileOnboardingContinueButtonClasses()}
        >
          {getProfileOnboardingContinueButtonText(isSaving)}
        </Button>
      )}

      {/* Avisos de la aplicación / Suggestion & checklist restoration */}
      {((matchesPlayed === 0 && checklistDismissed) || pwaDismissed || pushDismissed) && (
        <section
          role="region"
          aria-label={getProfileRegionAriaLabel("notices")}
          className={getProfileNoticesCardClasses()}
        >
          <h3 className="text-sm font-bold text-foreground">
            {getProfileNoticesHeadingTitle()}
          </h3>
          <p className="text-xs text-muted-foreground leading-normal">
            {getProfileNoticesDescriptionText()}
          </p>
          <div className="space-y-2 pt-1">
            {matchesPlayed === 0 && checklistDismissed && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRestoreChecklist}
                className={getProfileNoticeButtonClasses()}
              >
                {getProfileRestoreChecklistButtonText()}
              </Button>
            )}
            {pwaDismissed && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    clearPwaBannerDismissal();
                    setPwaDismissed(false);
                    showToast("Sugerencia de instalación restablecida", {
                      duration: 4000,
                    });
                  }
                }}
                className={getProfileNoticeButtonClasses()}
              >
                {getProfileRestorePwaButtonText()}
              </Button>
            )}
            {pushDismissed && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    clearPushPromptDismissal();
                    setPushDismissed(false);
                    showToast("Sugerencia de notificaciones restablecida", {
                      duration: 4000,
                    });
                  }
                }}
                className={getProfileNoticeButtonClasses()}
              >
                {getProfileRestorePushButtonText()}
              </Button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
