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
