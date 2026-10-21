import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  PUSH_PROMPT_DISMISS_KEY,
  isPushPromptDismissed,
  dismissPushPrompt,
  clearPushPromptDismissal,
  getPushPermissionRegionAriaLabel,
  getPushPermissionTitle,
  getPushPermissionDescription,
  getPushPermissionActionButtonLabel,
  getPushPermissionActionButtonAriaLabel,
  getPushPermissionDismissButtonText,
  getPushPermissionDismissButtonAriaLabel,
  getPushPermissionSuccessToast,
  getPushPermissionLiveStatus,
  getPushPermissionContainerClasses,
  getPushPermissionIconBadgeClasses,
  getPushPermissionActionButtonClasses,
  getPushPermissionDismissButtonClasses,
  getPushPermissionInnerLayoutClasses,
  getPushPermissionTextContainerClasses,
  getPushPermissionTitleClasses,
  getPushPermissionDescriptionClasses,
  getPushPermissionActionGroupClasses,
  getPushPermissionBellIconClasses,
  getPushPermissionActionBellIconClasses,
  getPushPermissionActionSpinnerClasses,
} from "../push-permission-utils";

describe("push-permission-utils Pure Helper Specifications", () => {
  let storage: Record<string, string> = {};

  beforeEach(() => {
    storage = {};
    const localStorageMock = {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        storage = {};
      },
    };

    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", localStorageMock);
  });

  describe("storage management helpers", () => {
    it("manages PUSH_PROMPT_DISMISS_KEY in localStorage", () => {
      expect(PUSH_PROMPT_DISMISS_KEY).toBe("push-prompt-dismissed");
      expect(isPushPromptDismissed()).toBe(false);

      dismissPushPrompt();
      expect(isPushPromptDismissed()).toBe(true);
      expect(localStorage.getItem(PUSH_PROMPT_DISMISS_KEY)).toBe("true");

      clearPushPromptDismissal();
      expect(isPushPromptDismissed()).toBe(false);
      expect(localStorage.getItem(PUSH_PROMPT_DISMISS_KEY)).toBeNull();
    });

    it("returns false for isPushPromptDismissed when window is undefined during SSR", () => {
      vi.stubGlobal("window", undefined);
      expect(isPushPromptDismissed()).toBe(false);
    });
  });

  describe("ARIA and UI text helper functions", () => {
    it("returns static region landmark ARIA label", () => {
      expect(getPushPermissionRegionAriaLabel()).toBe(
        "Aviso de notificaciones del sistema"
      );
    });

    it("returns title and description text", () => {
      expect(getPushPermissionTitle()).toBe("Activar notificaciones");
      expect(getPushPermissionDescription()).toBe(
        "Recibí avisos cuando abran un cupo en tu red o necesiten confirmar un resultado."
      );
    });

    it("returns correct action button labels based on loading state", () => {
      expect(getPushPermissionActionButtonLabel(false)).toBe("Activar");
      expect(getPushPermissionActionButtonLabel(true)).toBe("Activando...");
    });

    it("returns correct action button ARIA labels based on loading state", () => {
      expect(getPushPermissionActionButtonAriaLabel(false)).toBe(
        "Activar notificaciones de la aplicación"
      );
      expect(getPushPermissionActionButtonAriaLabel(true)).toBe(
        "Solicitando permisos de notificación"
      );
    });

    it("returns dismiss button text and ARIA label", () => {
      expect(getPushPermissionDismissButtonText()).toBe("Ahora no");
      expect(getPushPermissionDismissButtonAriaLabel()).toBe(
        "Descartar solicitud de notificaciones por ahora"
      );
    });

    it("returns success toast message", () => {
      expect(getPushPermissionSuccessToast()).toBe(
        "Activaste las notificaciones."
      );
    });

    it("returns live region status text based on loading state", () => {
      expect(getPushPermissionLiveStatus(false)).toBe("");
      expect(getPushPermissionLiveStatus(true)).toBe(
        "Solicitando activación de notificaciones de la aplicación..."
      );
    });
  });

  describe("CSS styling class helpers", () => {
    it("returns container classes", () => {
      expect(getPushPermissionContainerClasses()).toContain("bg-card");
      expect(getPushPermissionContainerClasses()).toContain("rounded-xl");
      expect(getPushPermissionContainerClasses("custom-class")).toContain("custom-class");
    });

    it("returns icon badge classes", () => {
      expect(getPushPermissionIconBadgeClasses()).toContain("bg-muted");
      expect(getPushPermissionIconBadgeClasses()).toContain("h-10 w-10");
      expect(getPushPermissionIconBadgeClasses("custom-class")).toContain("custom-class");
    });

    it("returns action button classes with focus and active states", () => {
      expect(getPushPermissionActionButtonClasses()).toContain("font-bold");
      expect(getPushPermissionActionButtonClasses()).toContain("active:scale-[0.98]");
      expect(getPushPermissionActionButtonClasses()).toContain("focus-visible:ring-2");
      expect(getPushPermissionActionButtonClasses("custom-class")).toContain("custom-class");
    });

    it("returns dismiss button classes with focus and hover states", () => {
      expect(getPushPermissionDismissButtonClasses()).toContain("hover:bg-muted");
      expect(getPushPermissionDismissButtonClasses()).toContain("active:scale-[0.98]");
      expect(getPushPermissionDismissButtonClasses()).toContain("focus-visible:ring-2");
      expect(getPushPermissionDismissButtonClasses("custom-class")).toContain("custom-class");
    });

    it("returns inner layout classes", () => {
      expect(getPushPermissionInnerLayoutClasses()).toContain("flex");
      expect(getPushPermissionInnerLayoutClasses()).toContain("items-start");
      expect(getPushPermissionInnerLayoutClasses()).toContain("gap-3");
      expect(getPushPermissionInnerLayoutClasses("custom-class")).toContain("custom-class");
    });

    it("returns text container classes", () => {
      expect(getPushPermissionTextContainerClasses()).toContain("flex-1");
      expect(getPushPermissionTextContainerClasses()).toContain("min-w-0");
      expect(getPushPermissionTextContainerClasses("custom-class")).toContain("custom-class");
    });

    it("returns title classes", () => {
      expect(getPushPermissionTitleClasses()).toContain("text-sm");
      expect(getPushPermissionTitleClasses()).toContain("font-bold");
      expect(getPushPermissionTitleClasses()).toContain("text-foreground");
      expect(getPushPermissionTitleClasses("custom-class")).toContain("custom-class");
    });

    it("returns description classes", () => {
      expect(getPushPermissionDescriptionClasses()).toContain("text-xs");
      expect(getPushPermissionDescriptionClasses()).toContain("text-muted-foreground");
      expect(getPushPermissionDescriptionClasses("custom-class")).toContain("custom-class");
    });

    it("returns action group classes", () => {
      expect(getPushPermissionActionGroupClasses()).toContain("mt-3");
      expect(getPushPermissionActionGroupClasses()).toContain("flex");
      expect(getPushPermissionActionGroupClasses()).toContain("items-center");
      expect(getPushPermissionActionGroupClasses("custom-class")).toContain("custom-class");
    });

    it("returns icon sizing classes", () => {
      expect(getPushPermissionBellIconClasses()).toContain("h-5 w-5");
      expect(getPushPermissionActionBellIconClasses()).toContain("h-3.5 w-3.5");
      expect(getPushPermissionActionSpinnerClasses()).toContain("animate-spin");
    });
  });
});
