import { cn } from "@/lib/utils";

export const MIN_ALIAS_LENGTH = 2;
export const MAX_ALIAS_LENGTH = 30;
export const AUTOSAVE_DEBOUNCE_MS = 800;

export type PreferredSideOption = "RIGHT" | "LEFT" | "BOTH";

export const COURT_SIDE_OPTIONS: Array<{
  id: PreferredSideOption;
  label: string;
  desc: string;
}> = [
  { id: "RIGHT", label: "Derecha", desc: "Juego en el drive o lado derecho" },
  { id: "LEFT", label: "Revés", desc: "Juego en el lado izquierdo de revés" },
  { id: "BOTH", label: "Ambos", desc: "Me adapto indistintamente a ambos lados" },
];

/**
 * Validates alias input string. Returns error message in Argentine Spanish or null if valid.
 */
export function validateAlias(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < MIN_ALIAS_LENGTH || trimmed.length > MAX_ALIAS_LENGTH) {
    return `Usá entre ${MIN_ALIAS_LENGTH} y ${MAX_ALIAS_LENGTH} caracteres.`;
  }

  // Permitir letras (con acentos, diéresis y eñes), números, espacios y guiones comunes
  const aliasRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]+$/;
  if (!aliasRegex.test(trimmed)) {
    return "El alias solo puede tener letras, números, espacios y guiones.";
  }
  return null;
}

/**
 * Calculates the next preferred court side selection for keyboard arrow key navigation.
 */
export function getNextSideOption(
  currentSide: PreferredSideOption | null,
  key: string
): PreferredSideOption | null {
  if (key !== "ArrowRight" && key !== "ArrowDown" && key !== "ArrowLeft" && key !== "ArrowUp") {
    return null;
  }

  const ids: PreferredSideOption[] = COURT_SIDE_OPTIONS.map((opt) => opt.id);
  const currentIndex = ids.indexOf((currentSide ?? "BOTH") as PreferredSideOption);
  const activeIndex = currentIndex >= 0 ? currentIndex : 2;

  let nextIndex = activeIndex;
  if (key === "ArrowRight" || key === "ArrowDown") {
    nextIndex = (activeIndex + 1) % ids.length;
  } else if (key === "ArrowLeft" || key === "ArrowUp") {
    nextIndex = (activeIndex - 1 + ids.length) % ids.length;
  }

  return ids[nextIndex];
}

/**
 * Calculates the next category level (1-8) for keyboard arrow key navigation.
 */
export function getNextCategoryLevel(currentLevel: number, key: string): number | null {
  if (key !== "ArrowRight" && key !== "ArrowDown" && key !== "ArrowLeft" && key !== "ArrowUp") {
    return null;
  }

  const levels = [1, 2, 3, 4, 5, 6, 7, 8];
  const currentIndex = levels.indexOf(currentLevel);
  const activeIndex = currentIndex >= 0 ? currentIndex : 5; // Default to 6th Cat (index 5)

  let nextIndex = activeIndex;
  if (key === "ArrowRight" || key === "ArrowDown") {
    nextIndex = (activeIndex + 1) % levels.length;
  } else if (key === "ArrowLeft" || key === "ArrowUp") {
    nextIndex = (activeIndex - 1 + levels.length) % levels.length;
  }

  return levels[nextIndex];
}

/**
 * Returns localized Argentine Spanish label for preferred side selection.
 */
export function getSideOptionLabel(side: PreferredSideOption | null): string {
  switch (side) {
    case "RIGHT":
      return "Derecha";
    case "LEFT":
      return "Revés";
    case "BOTH":
      return "Ambos lados";
    default:
      return "Sin preferencia";
  }
}

/**
 * Computes uppercase 1-2 character player initials from display name.
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export type ProfileRegionKind =
  | "welcome"
  | "avatar"
  | "side"
  | "category"
  | "account"
  | "notices";

export function getProfileRegionAriaLabel(kind: ProfileRegionKind): string {
  switch (kind) {
    case "welcome":
      return "Bienvenida a Padel Red";
    case "avatar":
      return "Foto de perfil de usuario";
    case "side":
      return "Lado preferido en la cancha";
    case "category":
      return "Categoría de juego";
    case "account":
      return "Información de cuenta de Google";
    case "notices":
      return "Avisos y sugerencias de la aplicación";
  }
}

export function getAliasCharacterCountText(
  currentLength: number,
  maxLength: number = MAX_ALIAS_LENGTH,
): string {
  return `${currentLength}/${maxLength}`;
}

export function getProfileSaveSuccessToast(): { title: string; label: string } {
  return {
    title: "Perfil actualizado",
    label: "Deshacer",
  };
}

export function getProfileSaveErrorToast(): string {
  return "No pudimos guardar. Probá de nuevo.";
}

export function getPhotoDeleteSuccessToast(): { title: string; label: string } {
  return {
    title: "Foto eliminada",
    label: "Deshacer",
  };
}

export function getPhotoRestoreSuccessToast(): string {
  return "Foto restablecida";
}

export function getCategoryUpdateSuccessToast(categoryName: string): string {
  return `Categoría actualizada a ${categoryName}`;
}

export function getPreferredSideUpdateSuccessToast(sideLabel: string): string {
  return `Lado preferido actualizado a ${sideLabel}`;
}

export function getProfileHeadingTitle(): string {
  return "Mi Perfil";
}

export function getProfileHeadingDescription(): string {
  return "Cómo te ven los demás jugadores en el ranking y los partidos.";
}

export function getProfileBackAriaLabel(): string {
  return "Volver a mi perfil";
}

export function getProfileSecurityTitle(): string {
  return "Seguridad";
}

export function getProfileSecurityDescription(): string {
  return "Huella y Face ID para entrar más rápido";
}

export function getProfileSkeletonAriaLabel(): string {
  return "Cargando formulario de perfil...";
}

export function getMiniCourtContainerClasses(): string {
  return "flex items-center justify-center shrink-0 w-10 h-7 rounded border border-border bg-card p-1 shadow-xs";
}

export function getMiniCourtGridClasses(): string {
  return "grid grid-cols-2 gap-0.5 w-full h-full rounded-[2px] overflow-hidden border border-border/80 bg-muted/40";
}

export function getMiniCourtCellClasses(isActive: boolean): string {
  return cn("h-full rounded-[1px] transition-colors", isActive ? "bg-primary" : "bg-muted");
}

export function getProfileWelcomeBannerClasses(): string {
  return "rounded-xl border border-border bg-card p-4 space-y-2 shadow-sm";
}

export function getProfileWelcomeTitleText(): string {
  return "¡Te damos la bienvenida a Padel Red!";
}

export function getProfileWelcomeDescriptionText(): string {
  return "Antes de empezar, configúrate un alias. Este es el nombre con el que aparecerás en los partidos, turnos y ranking para que otros jugadores puedan identificarte.";
}

export function getProfileAvatarCardClasses(): string {
  return "flex items-center gap-4 rounded-xl border border-border bg-card p-4";
}

export function getProfileAvatarImageClasses(): string {
  return "w-16 h-16 rounded-xl object-cover border border-border shrink-0";
}

export function getProfileAvatarInitialsClasses(): string {
  return "w-16 h-16 rounded-xl bg-muted text-foreground flex items-center justify-center border border-border shadow-xs shrink-0 text-xl font-bold";
}

export function getProfileAvatarPlaceholderClasses(): string {
  return "w-16 h-16 rounded-xl bg-muted text-muted-foreground flex items-center justify-center border border-border shrink-0";
}

export function getProfileRestoreGoogleButtonClasses(): string {
  return "text-xs text-primary underline underline-offset-2 hover:no-underline disabled:opacity-50 min-h-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all rounded px-1";
}

export function getProfileRestoreGoogleButtonText(): string {
  return "Usar mi foto de Google";
}

export function getProfileRestoreGoogleButtonAriaLabel(): string {
  return "Restablecer a la foto original de tu cuenta de Google";
}

export function getProfileRemovePhotoButtonClasses(): string {
  return "text-xs text-muted-foreground underline underline-offset-2 hover:no-underline disabled:opacity-50 min-h-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all rounded px-1";
}

export function getProfileRemovePhotoButtonText(): string {
  return "Quitar foto";
}

export function getProfileRemovePhotoButtonAriaLabel(): string {
  return "Quitar foto de perfil y mostrar iniciales";
}

export function getProfileInitialsNoticeText(): string {
  return "Se mostrarán las iniciales de tu nombre.";
}

export function getProfileGooglePhotoNoticeText(): string {
  return "Tu foto viene de tu cuenta de Google.";
}

export function getProfileAliasLabelText(): string {
  return "Alias en la cancha";
}

export function getProfileAliasPlaceholderText(): string {
  return "Ej: El Muro, Gero...";
}

export function getProfileAliasDescriptionText(): string {
  return "Este nombre verán tus rivales en partidos y ranking.";
}

export function getProfileAliasUnsavedNoticeText(): string {
  return "Sin guardar";
}

export function getProfileAliasSavingNoticeText(): string {
  return "Guardando…";
}

export function getProfileSideCardClasses(): string {
  return "space-y-3 rounded-xl border border-border bg-card p-4";
}

export function getProfileSideTitleText(): string {
  return "Lado preferido en la cancha";
}

export function getProfileSideBadgeClasses(): string {
  return "text-xs font-bold text-foreground bg-muted border border-border px-2.5 py-0.5 rounded-full";
}

export function getProfileSideDescriptionText(): string {
  return "Indicá tu posición habitual para armar mejores parejas y sugerencias de partidos en la red.";
}

export function getProfileSideChipClasses(isSelected: boolean): string {
  return cn(
    "h-10 rounded-lg text-xs font-bold transition-all border flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]",
    isSelected
      ? "bg-primary text-primary-foreground border-primary shadow-sm"
      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
  );
}

export function getProfileSideChipAriaLabel(label: string, desc: string): string {
  return `Lado ${label}: ${desc}`;
}

export function getProfileCategoryCardClasses(): string {
  return "space-y-3 rounded-xl border border-border bg-card p-4";
}

export function getProfileCategoryTitleText(): string {
  return "Categoría de juego";
}

export function getProfileCategoryBadgeClasses(): string {
  return "text-xs font-bold text-foreground bg-muted border border-border px-2.5 py-0.5 rounded-full";
}

export function getProfileCategoryDescriptionText(): string {
  return "Seleccioná tu categoría habitual para buscar partidos, armar turnos y medir tu nivel en la red.";
}

export function getProfileCategoryChipClasses(isSelected: boolean): string {
  return cn(
    "h-10 rounded-lg text-xs font-bold transition-all border flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]",
    isSelected
      ? "bg-primary text-primary-foreground border-primary shadow-sm"
      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
  );
}

export function getProfileCategoryChipAriaLabel(label: string, desc: string): string {
  return `${label}: ${desc}`;
}

export function getProfileCategoryBoxClasses(): string {
  return "mt-2 rounded-lg bg-muted/60 border border-border/60 p-3 space-y-1";
}

export function getProfileAccountCardClasses(): string {
  return "rounded-xl border border-border bg-card p-4 space-y-3";
}

export function getProfileAccountHeadingTitle(): string {
  return "Cuenta de Google";
}

export function getProfileAccountNameLabel(): string {
  return "Nombre";
}

export function getProfileAccountEmailLabel(): string {
  return "Email";
}

export function getProfileOnboardingContinueButtonClasses(): string {
  return "w-full h-12 text-sm font-bold active:scale-[0.98] transition-all";
}

export function getProfileOnboardingContinueButtonText(isSaving: boolean): string {
  return isSaving ? "Guardando…" : "Continuar al inicio";
}

export function getProfileNoticesCardClasses(): string {
  return "rounded-xl border border-border bg-card p-4 space-y-3";
}

export function getProfileNoticesHeadingTitle(): string {
  return "Avisos de la aplicación";
}

export function getProfileNoticesDescriptionText(): string {
  return "Restablecé los carteles o sugerencias que ocultaste anteriormente para volver a verlos en tu panel de inicio.";
}

export function getProfileNoticeButtonClasses(): string {
  return "w-full h-10 text-xs font-bold border-border hover:bg-muted active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

export function getProfileRestoreChecklistButtonText(): string {
  return "Restablecer guía de bienvenida";
}

export function getProfileRestorePwaButtonText(): string {
  return "Restablecer sugerencia de instalación";
}

export function getProfileRestorePushButtonText(): string {
  return "Restablecer sugerencia de notificaciones";
}
