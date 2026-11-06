import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  ONBOARDING_CHECKLIST_DISMISS_KEY,
  ONBOARDING_REDIRECT_KEY,
  isOnboardingChecklistDismissed,
  dismissOnboardingChecklist,
  clearOnboardingChecklistDismissal,
  hasOnboardingBeenRedirected,
  setOnboardingRedirected,
  clearOnboardingRedirect,
  calculateOnboardingProgress,
  getStepStatusAriaLabel,
  getOnboardingStepButtonAriaLabel,
  getOnboardingRegionAriaLabel,
  getOnboardingTitleText,
  getOnboardingDescriptionText,
  getOnboardingDismissAriaLabel,
  getOnboardingProgressTitleText,
  getOnboardingProgressText,
  getOnboardingCompletedSuccessText,
  getOnboardingNotificationToastMessage,
  getOnboardingStepTitleText,
  getOnboardingStepDescriptionText,
  getOnboardingStepButtonText,
  getOnboardingContainerClasses,
  getOnboardingDismissButtonClasses,
  getOnboardingStepBadgeClasses,
  getOnboardingStepButtonClasses,
  getOnboardingHeaderClasses,
  getOnboardingHeaderTextContainerClasses,
  getOnboardingHeaderTitleClasses,
  getOnboardingHeaderDescriptionClasses,
  getOnboardingDismissIconClasses,
  getOnboardingProgressContainerClasses,
  getOnboardingProgressHeaderClasses,
  getOnboardingProgressTitleClasses,
  getOnboardingProgressValueClasses,
  getOnboardingProgressBarBackgroundClasses,
  getOnboardingProgressBarFillClasses,
  getOnboardingStepsListClasses,
  getOnboardingStepItemClasses,
  getOnboardingStepBadgeColumnClasses,
  getOnboardingStepConnectorLineClasses,
  getOnboardingStepContentClasses,
  getOnboardingStepHeaderRowClasses,
  getOnboardingStepTitleClasses,
  getOnboardingStepDescriptionClasses,
  getOnboardingStepActionWrapperClasses,
  getOnboardingStepCheckIconClasses,
  getOnboardingStepActionSpinnerClasses,
  getOnboardingStepActionDeviceIconClasses,
  getOnboardingStepActionBellIconClasses,
  getOnboardingUnsupportedNoticeClasses,
  getOnboardingSuccessBannerClasses,
  getOnboardingSuccessTextClasses,
} from "../onboarding-checklist-utils";

describe("calculateOnboardingProgress", () => {
  it("returns 0 count and 0% progress when no steps are completed", () => {
    const result = calculateOnboardingProgress({
      stepAliasCompleted: false,
      stepActivityCompleted: false,
      stepPwaCompleted: false,
      stepNotificationsCompleted: false,
    });
    expect(result.completedCount).toBe(0);
    expect(result.progressPercent).toBe(0);
  });

  it("returns 1 count and 25% progress when alias is set", () => {
    const result = calculateOnboardingProgress({
      stepAliasCompleted: true,
      stepActivityCompleted: false,
      stepPwaCompleted: false,
      stepNotificationsCompleted: false,
    });
    expect(result.completedCount).toBe(1);
    expect(result.progressPercent).toBe(25);
  });

  it("returns 2 count and 50% progress when alias and PWA are completed", () => {
    const result = calculateOnboardingProgress({
      stepAliasCompleted: true,
      stepActivityCompleted: false,
      stepPwaCompleted: true,
      stepNotificationsCompleted: false,
    });
    expect(result.completedCount).toBe(2);
    expect(result.progressPercent).toBe(50);
  });

  it("returns 4 count and 100% progress when all onboarding steps are completed", () => {
    const result = calculateOnboardingProgress({
      stepAliasCompleted: true,
      stepActivityCompleted: true,
      stepPwaCompleted: true,
      stepNotificationsCompleted: true,
    });
    expect(result.completedCount).toBe(4);
    expect(result.progressPercent).toBe(100);
  });
});

describe("getStepStatusAriaLabel", () => {
  it("formats completed step status ARIA label correctly", () => {
    const label = getStepStatusAriaLabel(1, "Configurá tu alias", true);
    expect(label).toBe("Paso 1: Configurá tu alias (completado)");
  });

  it("formats pending step status ARIA label correctly", () => {
    const label = getStepStatusAriaLabel(2, "Creá tu primer turno", false);
    expect(label).toBe("Paso 2: Creá tu primer turno (pendiente)");
  });
});

describe("getOnboardingStepButtonAriaLabel", () => {
  it("returns static action labels correctly", () => {
    expect(getOnboardingStepButtonAriaLabel("alias")).toBe("Ir a configurar alias");
    expect(getOnboardingStepButtonAriaLabel("activity")).toBe("Crear tu primer turno de pádel");
    expect(getOnboardingStepButtonAriaLabel("pwa-guide")).toBe("Ver cómo instalar la aplicación");
  });

  it("returns dynamic loading state labels for pwa-install and notifications", () => {
    expect(getOnboardingStepButtonAriaLabel("pwa-install", false)).toBe("Instalar aplicación de pádel directamente");
    expect(getOnboardingStepButtonAriaLabel("pwa-install", true)).toBe("Instalando aplicación de pádel...");
    expect(getOnboardingStepButtonAriaLabel("notifications", false)).toBe("Solicitar permisos para notificaciones");
    expect(getOnboardingStepButtonAriaLabel("notifications", true)).toBe("Activando notificaciones de la aplicación...");
  });
});

describe("Onboarding text and ARIA pure helpers", () => {
  it("returns correct region landmark ARIA label", () => {
    expect(getOnboardingRegionAriaLabel()).toBe("Guía de bienvenida de Padel Red");
  });

  it("returns correct header title and description strings", () => {
    expect(getOnboardingTitleText()).toBe("Guía de bienvenida 🎾");
    expect(getOnboardingDescriptionText()).toBe("Completá estos 4 simples pasos para empezar a disfrutar de la red sin fricciones.");
    expect(getOnboardingDismissAriaLabel()).toBe("Descartar guía de bienvenida");
  });

  it("returns correct progress headers and formatted count text", () => {
    expect(getOnboardingProgressTitleText()).toBe("Progreso de preparación");
    expect(getOnboardingProgressText(2, 50)).toBe("2 de 4 (50%)");
    expect(getOnboardingProgressText(4, 100)).toBe("4 de 4 (100%)");
  });

  it("returns correct congratulatory success text", () => {
    expect(getOnboardingCompletedSuccessText()).toBe("¡Felicitaciones! Completaste tu preparación al 100%. Ya estás listo para jugar y salvar turnos en Padel Red.");
  });

  it("returns correct notification toast feedback messages", () => {
    expect(getOnboardingNotificationToastMessage("enabled")).toBe("Activaste las notificaciones.");
    expect(getOnboardingNotificationToastMessage("denied")).toBe("Las notificaciones están bloqueadas.");
    expect(getOnboardingNotificationToastMessage("unsupported")).toBe("No soportado en este navegador");
  });

  it("returns correct step title text for all onboarding steps", () => {
    expect(getOnboardingStepTitleText("alias")).toBe("Configurá tu alias en la cancha");
    expect(getOnboardingStepTitleText("activity")).toBe("Creá tu primer turno");
    expect(getOnboardingStepTitleText("pwa")).toBe("Instalá la aplicación (PWA)");
    expect(getOnboardingStepTitleText("notifications")).toBe("Activá las notificaciones");
  });

  it("returns correct step description text for all onboarding steps", () => {
    expect(getOnboardingStepDescriptionText("alias")).toBe("Elegí tu nombre de juego para aparecer en los partidos y el ranking.");
    expect(getOnboardingStepDescriptionText("activity")).toBe("Armá un turno, compartilo por WhatsApp y dejá que la red llene los cupos.");
    expect(getOnboardingStepDescriptionText("pwa")).toBe("Accedé al instante a tus partidos desde tu pantalla de inicio en el celular.");
    expect(getOnboardingStepDescriptionText("notifications")).toBe("Recibí alertas al instante cuando falten jugadores o confirmen resultados.");
  });

  it("returns correct step button text for all onboarding step actions", () => {
    expect(getOnboardingStepButtonText("alias")).toBe("Configurar alias");
    expect(getOnboardingStepButtonText("activity")).toBe("Crear turno");
    expect(getOnboardingStepButtonText("pwa-install")).toBe("Instalar ahora");
    expect(getOnboardingStepButtonText("pwa-guide")).toBe("Ver cómo instalar");
    expect(getOnboardingStepButtonText("notifications")).toBe("Activar notificaciones");
  });

  it("returns correct CSS class string for onboarding container and dismiss button", () => {
    expect(getOnboardingContainerClasses()).toContain("rounded-xl border border-border bg-card");
    expect(getOnboardingDismissButtonClasses()).toContain("rounded-md p-1.5 h-8 w-8");
  });

  it("returns correct badge classes for completed and pending step states", () => {
    expect(getOnboardingStepBadgeClasses(true)).toContain("bg-primary border-primary text-primary-foreground");
    expect(getOnboardingStepBadgeClasses(false)).toContain("bg-muted border-border text-muted-foreground");
  });

  it("returns correct onboarding step CTA button CSS classes", () => {
    expect(getOnboardingStepButtonClasses()).toContain("h-9 text-xs font-bold border-border");
  });
});

describe("Onboarding pure layout and styling helpers", () => {
  it("returns correct header classes and merges custom class names", () => {
    expect(getOnboardingHeaderClasses()).toBe("flex items-start justify-between gap-4");
    expect(getOnboardingHeaderClasses("custom-header")).toContain("custom-header");

    expect(getOnboardingHeaderTextContainerClasses()).toBe("space-y-1");
    expect(getOnboardingHeaderTextContainerClasses("custom-container")).toContain("custom-container");

    expect(getOnboardingHeaderTitleClasses()).toBe("text-base font-bold text-foreground");
    expect(getOnboardingHeaderTitleClasses("custom-title")).toContain("custom-title");

    expect(getOnboardingHeaderDescriptionClasses()).toBe("text-xs text-muted-foreground leading-normal");
    expect(getOnboardingHeaderDescriptionClasses("custom-desc")).toContain("custom-desc");

    expect(getOnboardingDismissIconClasses()).toBe("h-4 w-4");
    expect(getOnboardingDismissIconClasses("custom-icon")).toContain("custom-icon");
  });

  it("returns correct progress container and bar classes", () => {
    expect(getOnboardingProgressContainerClasses()).toBe("space-y-2");
    expect(getOnboardingProgressContainerClasses("custom-progress")).toContain("custom-progress");

    expect(getOnboardingProgressHeaderClasses()).toBe("flex justify-between items-center text-xs");
    expect(getOnboardingProgressHeaderClasses("custom-pheader")).toContain("custom-pheader");

    expect(getOnboardingProgressTitleClasses()).toBe("font-semibold text-foreground");
    expect(getOnboardingProgressTitleClasses("custom-ptitle")).toContain("custom-ptitle");

    expect(getOnboardingProgressValueClasses()).toBe("font-bold text-primary tabular-nums");
    expect(getOnboardingProgressValueClasses("custom-pvalue")).toContain("custom-pvalue");

    expect(getOnboardingProgressBarBackgroundClasses()).toBe("h-1.5 w-full bg-muted rounded-full overflow-hidden");
    expect(getOnboardingProgressBarBackgroundClasses("custom-barbg")).toContain("custom-barbg");

    expect(getOnboardingProgressBarFillClasses()).toBe("h-full bg-primary transition-all duration-500 ease-out rounded-full");
    expect(getOnboardingProgressBarFillClasses("custom-barfill")).toContain("custom-barfill");
  });

  it("returns correct steps list, item and connector line classes", () => {
    expect(getOnboardingStepsListClasses()).toBe("space-y-4 pt-1");
    expect(getOnboardingStepsListClasses("custom-list")).toContain("custom-list");

    expect(getOnboardingStepItemClasses()).toBe("flex gap-3");
    expect(getOnboardingStepItemClasses("custom-item")).toContain("custom-item");

    expect(getOnboardingStepBadgeColumnClasses()).toBe("flex flex-col items-center");
    expect(getOnboardingStepBadgeColumnClasses("custom-badgecol")).toContain("custom-badgecol");

    expect(getOnboardingStepConnectorLineClasses()).toBe("w-px flex-1 bg-border my-1 min-h-[16px]");
    expect(getOnboardingStepConnectorLineClasses("custom-line")).toContain("custom-line");
  });

  it("returns correct step content classes with conditional padding", () => {
    expect(getOnboardingStepContentClasses(false)).toBe("flex-1 space-y-1");
    expect(getOnboardingStepContentClasses(true)).toBe("flex-1 space-y-1 pb-2");
    expect(getOnboardingStepContentClasses(true, "custom-content")).toContain("custom-content");
  });

  it("returns correct step header, title, description and action wrapper classes", () => {
    expect(getOnboardingStepHeaderRowClasses()).toBe("flex items-baseline justify-between gap-2");
    expect(getOnboardingStepHeaderRowClasses("custom-row")).toContain("custom-row");

    expect(getOnboardingStepTitleClasses()).toBe("text-xs font-bold text-foreground");
    expect(getOnboardingStepTitleClasses("custom-stitle")).toContain("custom-stitle");

    expect(getOnboardingStepDescriptionClasses()).toBe("text-xs text-muted-foreground leading-normal");
    expect(getOnboardingStepDescriptionClasses("custom-sdesc")).toContain("custom-sdesc");

    expect(getOnboardingStepActionWrapperClasses()).toBe("pt-1.5");
    expect(getOnboardingStepActionWrapperClasses("custom-action")).toContain("custom-action");
  });

  it("returns correct step icon and spinner classes", () => {
    expect(getOnboardingStepCheckIconClasses()).toBe("h-4 w-4");
    expect(getOnboardingStepCheckIconClasses("custom-check")).toContain("custom-check");

    expect(getOnboardingStepActionSpinnerClasses()).toBe("h-3.5 w-3.5 animate-spin mr-1");
    expect(getOnboardingStepActionSpinnerClasses("custom-spin")).toContain("custom-spin");

    expect(getOnboardingStepActionDeviceIconClasses()).toBe("h-3.5 w-3.5 mr-1");
    expect(getOnboardingStepActionDeviceIconClasses("custom-dev")).toContain("custom-dev");

    expect(getOnboardingStepActionBellIconClasses()).toBe("h-3.5 w-3.5 mr-1");
    expect(getOnboardingStepActionBellIconClasses("custom-bell")).toContain("custom-bell");
  });

  it("returns correct unsupported notice and success banner classes", () => {
    expect(getOnboardingUnsupportedNoticeClasses()).toBe("text-xs text-muted-foreground font-medium");
    expect(getOnboardingUnsupportedNoticeClasses("custom-unsup")).toContain("custom-unsup");

    expect(getOnboardingSuccessBannerClasses()).toBe("rounded-lg bg-muted border border-primary p-3 text-center shadow-xs");
    expect(getOnboardingSuccessBannerClasses("custom-banner")).toContain("custom-banner");

    expect(getOnboardingSuccessTextClasses()).toBe("text-xs font-bold text-foreground");
    expect(getOnboardingSuccessTextClasses("custom-stext")).toContain("custom-stext");
  });
});

describe("Onboarding checklist storage helpers", () => {
  let localStorageData: Record<string, string> = {};
  let sessionStorageData: Record<string, string> = {};

  beforeEach(() => {
    localStorageData = {};
    sessionStorageData = {};

    const mockLocalStorage = {
      getItem: (key: string) => localStorageData[key] ?? null,
      setItem: (key: string, value: string) => {
        localStorageData[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageData[key];
      },
      clear: () => {
        localStorageData = {};
      },
    };

    const mockSessionStorage = {
      getItem: (key: string) => sessionStorageData[key] ?? null,
      setItem: (key: string, value: string) => {
        sessionStorageData[key] = value;
      },
      removeItem: (key: string) => {
        delete sessionStorageData[key];
      },
      clear: () => {
        sessionStorageData = {};
      },
    };

    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", mockLocalStorage);
    vi.stubGlobal("sessionStorage", mockSessionStorage);
  });

  it("exports correct storage key constants", () => {
    expect(ONBOARDING_CHECKLIST_DISMISS_KEY).toBe("onboarding-checklist-dismissed");
    expect(ONBOARDING_REDIRECT_KEY).toBe("onboarding-redirected");
  });

  it("handles checklist dismissal in localStorage correctly", () => {
    expect(isOnboardingChecklistDismissed()).toBe(false);
    dismissOnboardingChecklist();
    expect(isOnboardingChecklistDismissed()).toBe(true);
    expect(localStorage.getItem(ONBOARDING_CHECKLIST_DISMISS_KEY)).toBe("true");

    clearOnboardingChecklistDismissal();
    expect(isOnboardingChecklistDismissed()).toBe(false);
  });

  it("handles onboarding redirect in sessionStorage correctly", () => {
    expect(hasOnboardingBeenRedirected()).toBe(false);
    setOnboardingRedirected();
    expect(hasOnboardingBeenRedirected()).toBe(true);
    expect(sessionStorage.getItem(ONBOARDING_REDIRECT_KEY)).toBe("true");

    clearOnboardingRedirect();
    expect(hasOnboardingBeenRedirected()).toBe(false);
  });
});
