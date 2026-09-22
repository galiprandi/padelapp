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
