import { describe, it, expect } from "vitest";
import {
  validateAlias,
  getNextSideOption,
  getNextCategoryLevel,
  getSideOptionLabel,
  getInitials,
  MIN_ALIAS_LENGTH,
  MAX_ALIAS_LENGTH,
  getProfileRegionAriaLabel,
  getAliasCharacterCountText,
  getProfileSaveSuccessToast,
  getProfileSaveErrorToast,
  getPhotoDeleteSuccessToast,
  getPhotoRestoreSuccessToast,
  getCategoryUpdateSuccessToast,
  getPreferredSideUpdateSuccessToast,
  getProfileHeadingTitle,
  getProfileHeadingDescription,
  getProfileBackAriaLabel,
  getProfileSecurityTitle,
  getProfileSecurityDescription,
  getProfileSkeletonAriaLabel,
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
} from "../profile-utils";

describe("validateAlias", () => {
  it("allows empty or whitespace-only alias strings without validation error", () => {
    expect(validateAlias("")).toBeNull();
    expect(validateAlias("   ")).toBeNull();
  });

  it("returns an error for aliases shorter than MIN_ALIAS_LENGTH", () => {
    expect(validateAlias("A")).toBe(`Usá entre ${MIN_ALIAS_LENGTH} y ${MAX_ALIAS_LENGTH} caracteres.`);
  });

  it("returns an error for aliases longer than MAX_ALIAS_LENGTH", () => {
    const longAlias = "A".repeat(MAX_ALIAS_LENGTH + 1);
    expect(validateAlias(longAlias)).toBe(`Usá entre ${MIN_ALIAS_LENGTH} y ${MAX_ALIAS_LENGTH} caracteres.`);
  });

  it("returns an error for aliases with invalid characters", () => {
    expect(validateAlias("Gero_01")).toBe("El alias solo puede tener letras, números, espacios y guiones.");
    expect(validateAlias("Muro!")).toBe("El alias solo puede tener letras, números, espacios y guiones.");
    expect(validateAlias("Padel@Red")).toBe("El alias solo puede tener letras, números, espacios y guiones.");
  });

  it("accepts valid aliases with letters, numbers, accents, spaces, and hyphens", () => {
    expect(validateAlias("El Muro")).toBeNull();
    expect(validateAlias("Gero-01")).toBeNull();
    expect(validateAlias("María José")).toBeNull();
    expect(validateAlias("Ñandú 10")).toBeNull();
  });
});

describe("getNextSideOption", () => {
  it("cycles forward on ArrowRight and ArrowDown", () => {
    expect(getNextSideOption("RIGHT", "ArrowRight")).toBe("LEFT");
    expect(getNextSideOption("LEFT", "ArrowDown")).toBe("BOTH");
    expect(getNextSideOption("BOTH", "ArrowRight")).toBe("RIGHT");
  });

  it("cycles backward on ArrowLeft and ArrowUp", () => {
    expect(getNextSideOption("RIGHT", "ArrowLeft")).toBe("BOTH");
    expect(getNextSideOption("BOTH", "ArrowUp")).toBe("LEFT");
    expect(getNextSideOption("LEFT", "ArrowLeft")).toBe("RIGHT");
  });

  it("returns null for non-navigation keys", () => {
    expect(getNextSideOption("RIGHT", "Enter")).toBeNull();
    expect(getNextSideOption("RIGHT", "Tab")).toBeNull();
    expect(getNextSideOption("RIGHT", "Escape")).toBeNull();
  });
});

describe("getNextCategoryLevel", () => {
  it("cycles forward through category levels 1 through 8", () => {
    expect(getNextCategoryLevel(1, "ArrowRight")).toBe(2);
    expect(getNextCategoryLevel(6, "ArrowDown")).toBe(7);
    expect(getNextCategoryLevel(8, "ArrowRight")).toBe(1);
  });

  it("cycles backward through category levels 1 through 8", () => {
    expect(getNextCategoryLevel(1, "ArrowLeft")).toBe(8);
    expect(getNextCategoryLevel(6, "ArrowUp")).toBe(5);
    expect(getNextCategoryLevel(8, "ArrowLeft")).toBe(7);
  });

  it("returns null for non-navigation keys", () => {
    expect(getNextCategoryLevel(6, "Enter")).toBeNull();
    expect(getNextCategoryLevel(6, "Space")).toBeNull();
  });
});

describe("getSideOptionLabel", () => {
  it("returns correct localized Argentine Spanish labels for court sides", () => {
    expect(getSideOptionLabel("RIGHT")).toBe("Derecha");
    expect(getSideOptionLabel("LEFT")).toBe("Revés");
    expect(getSideOptionLabel("BOTH")).toBe("Ambos lados");
    expect(getSideOptionLabel(null)).toBe("Sin preferencia");
  });
});

describe("getInitials", () => {
  it("returns first two letters for single-word names", () => {
    expect(getInitials("Agustín")).toBe("AG");
  });

  it("returns first and last initials for multi-word names", () => {
    expect(getInitials("Fernando Belasteguín")).toBe("FB");
    expect(getInitials("Juan Martín Díaz")).toBe("JD");
  });

  it("returns empty string for null or empty input", () => {
    expect(getInitials(null)).toBe("");
    expect(getInitials("")).toBe("");
  });
});

describe("profile region landmark and toast helpers", () => {
  it("returns correct region landmark ARIA labels", () => {
    expect(getProfileRegionAriaLabel("welcome")).toBe("Bienvenida a Padel Red");
    expect(getProfileRegionAriaLabel("avatar")).toBe("Foto de perfil de usuario");
    expect(getProfileRegionAriaLabel("side")).toBe("Lado preferido en la cancha");
    expect(getProfileRegionAriaLabel("category")).toBe("Categoría de juego");
    expect(getProfileRegionAriaLabel("account")).toBe("Información de cuenta de Google");
    expect(getProfileRegionAriaLabel("notices")).toBe("Avisos y sugerencias de la aplicación");
  });

  it("formats character count text", () => {
    expect(getAliasCharacterCountText(7, 30)).toBe("7/30");
  });

  it("returns structured profile save and photo deletion toasts", () => {
    expect(getProfileSaveSuccessToast()).toEqual({
      title: "Perfil actualizado",
      label: "Deshacer",
    });
    expect(getProfileSaveErrorToast()).toBe("No pudimos guardar. Probá de nuevo.");
    expect(getPhotoDeleteSuccessToast()).toEqual({
      title: "Foto eliminada",
      label: "Deshacer",
    });
    expect(getPhotoRestoreSuccessToast()).toBe("Foto restablecida");
  });

  it("formats category and preferred side update success toasts", () => {
    expect(getCategoryUpdateSuccessToast("6ª Cat.")).toBe("Categoría actualizada a 6ª Cat.");
    expect(getPreferredSideUpdateSuccessToast("Revés")).toBe("Lado preferido actualizado a Revés");
  });

  it("returns correct page header, back navigation, security, and skeleton ARIA labels", () => {
    expect(getProfileHeadingTitle()).toBe("Mi Perfil");
    expect(getProfileHeadingDescription()).toBe("Cómo te ven los demás jugadores en el ranking y los partidos.");
    expect(getProfileBackAriaLabel()).toBe("Volver a mi perfil");
    expect(getProfileSecurityTitle()).toBe("Seguridad");
    expect(getProfileSecurityDescription()).toBe("Huella y Face ID para entrar más rápido");
    expect(getProfileSkeletonAriaLabel()).toBe("Cargando formulario de perfil...");
  });
});

describe("FormMiniCourtIndicator helpers", () => {
  it("returns mini court container, grid, and cell classes", () => {
    expect(getMiniCourtContainerClasses()).toContain("flex items-center justify-center");
    expect(getMiniCourtGridClasses()).toContain("grid grid-cols-2");
    expect(getMiniCourtCellClasses(true)).toContain("bg-primary");
    expect(getMiniCourtCellClasses(false)).toContain("bg-muted");
  });
});

describe("Profile welcome banner helpers", () => {
  it("returns banner container classes, title, and description text", () => {
    expect(getProfileWelcomeBannerClasses()).toContain("rounded-xl border border-border bg-card");
    expect(getProfileWelcomeTitleText()).toBe("¡Te damos la bienvenida a Padel Red!");
    expect(getProfileWelcomeDescriptionText()).toContain("Antes de empezar, configúrate un alias.");
  });
});

describe("Profile avatar section helpers", () => {
  it("returns avatar card, image, initials, and placeholder classes", () => {
    expect(getProfileAvatarCardClasses()).toContain("flex items-center gap-4");
    expect(getProfileAvatarImageClasses()).toContain("w-16 h-16 rounded-xl object-cover");
    expect(getProfileAvatarInitialsClasses()).toContain("w-16 h-16 rounded-xl bg-muted");
    expect(getProfileAvatarPlaceholderClasses()).toContain("w-16 h-16 rounded-xl bg-muted");
  });

  it("returns restore google photo button classes, text, and ARIA label", () => {
    expect(getProfileRestoreGoogleButtonClasses()).toContain("text-xs text-primary");
    expect(getProfileRestoreGoogleButtonText()).toBe("Usar mi foto de Google");
    expect(getProfileRestoreGoogleButtonAriaLabel()).toBe("Restablecer a la foto original de tu cuenta de Google");
  });

  it("returns remove photo button classes, text, and ARIA label", () => {
    expect(getProfileRemovePhotoButtonClasses()).toContain("text-xs text-muted-foreground");
    expect(getProfileRemovePhotoButtonText()).toBe("Quitar foto");
    expect(getProfileRemovePhotoButtonAriaLabel()).toBe("Quitar foto de perfil y mostrar iniciales");
  });

  it("returns avatar notice strings", () => {
    expect(getProfileInitialsNoticeText()).toBe("Se mostrarán las iniciales de tu nombre.");
    expect(getProfileGooglePhotoNoticeText()).toBe("Tu foto viene de tu cuenta de Google.");
  });
});

describe("Profile alias section helpers", () => {
  it("returns alias label, placeholder, description, and status notice strings", () => {
    expect(getProfileAliasLabelText()).toBe("Alias en la cancha");
    expect(getProfileAliasPlaceholderText()).toBe("Ej: El Muro, Gero...");
    expect(getProfileAliasDescriptionText()).toBe("Este nombre verán tus rivales en partidos y ranking.");
    expect(getProfileAliasUnsavedNoticeText()).toBe("Sin guardar");
    expect(getProfileAliasSavingNoticeText()).toBe("Guardando…");
  });
});

describe("Profile preferred side section helpers", () => {
  it("returns side card classes, title, badge classes, and description text", () => {
    expect(getProfileSideCardClasses()).toContain("space-y-3 rounded-xl");
    expect(getProfileSideTitleText()).toBe("Lado preferido en la cancha");
    expect(getProfileSideBadgeClasses()).toContain("bg-muted border border-border");
    expect(getProfileSideDescriptionText()).toContain("Indicá tu posición habitual");
  });

  it("returns side chip classes and ARIA labels", () => {
    expect(getProfileSideChipClasses(true)).toContain("bg-primary text-primary-foreground");
    expect(getProfileSideChipClasses(false)).toContain("bg-card text-muted-foreground");
    expect(getProfileSideChipAriaLabel("Derecha", "Juego en el drive")).toBe("Lado Derecha: Juego en el drive");
  });
});

describe("Profile playing category section helpers", () => {
  it("returns category card classes, title, badge classes, description text, and box classes", () => {
    expect(getProfileCategoryCardClasses()).toContain("space-y-3 rounded-xl");
    expect(getProfileCategoryTitleText()).toBe("Categoría de juego");
    expect(getProfileCategoryBadgeClasses()).toContain("bg-muted border border-border");
    expect(getProfileCategoryDescriptionText()).toContain("Seleccioná tu categoría habitual");
    expect(getProfileCategoryBoxClasses()).toContain("bg-muted/60 border border-border/60");
  });

  it("returns category chip classes and ARIA labels", () => {
    expect(getProfileCategoryChipClasses(true)).toContain("bg-primary text-primary-foreground");
    expect(getProfileCategoryChipClasses(false)).toContain("bg-card text-muted-foreground");
    expect(getProfileCategoryChipAriaLabel("6ª Cat.", "Intermedio")).toBe("6ª Cat.: Intermedio");
  });
});

describe("Profile google account section helpers", () => {
  it("returns google account card classes, title, and label strings", () => {
    expect(getProfileAccountCardClasses()).toContain("rounded-xl border border-border");
    expect(getProfileAccountHeadingTitle()).toBe("Cuenta de Google");
    expect(getProfileAccountNameLabel()).toBe("Nombre");
    expect(getProfileAccountEmailLabel()).toBe("Email");
  });
});

describe("Profile onboarding button helpers", () => {
  it("returns continue button classes and saving/idle button text", () => {
    expect(getProfileOnboardingContinueButtonClasses()).toContain("w-full h-12 text-sm font-bold");
    expect(getProfileOnboardingContinueButtonText(true)).toBe("Guardando…");
    expect(getProfileOnboardingContinueButtonText(false)).toBe("Continuar al inicio");
  });
});

describe("Profile notices section helpers", () => {
  it("returns notices card classes, heading, description, button classes, and restore button texts", () => {
    expect(getProfileNoticesCardClasses()).toContain("rounded-xl border border-border bg-card");
    expect(getProfileNoticesHeadingTitle()).toBe("Avisos de la aplicación");
    expect(getProfileNoticesDescriptionText()).toContain("Restablecé los carteles o sugerencias");
    expect(getProfileNoticeButtonClasses()).toContain("w-full h-10 text-xs font-bold");
    expect(getProfileRestoreChecklistButtonText()).toBe("Restablecer guía de bienvenida");
    expect(getProfileRestorePwaButtonText()).toBe("Restablecer sugerencia de instalación");
    expect(getProfileRestorePushButtonText()).toBe("Restablecer sugerencia de notificaciones");
  });
});
