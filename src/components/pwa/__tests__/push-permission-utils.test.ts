import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  PUSH_PROMPT_DISMISS_KEY,
  isPushPromptDismissed,
  dismissPushPrompt,
  clearPushPromptDismissal,
  getPushPermissionRegionAriaLabel,
  getPushPermissionActionButtonLabel,
  getPushPermissionActionButtonAriaLabel,
  getPushPermissionDismissButtonAriaLabel,
  getPushPermissionLiveStatus,
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

    it("returns dismiss button ARIA label", () => {
      expect(getPushPermissionDismissButtonAriaLabel()).toBe(
        "Descartar solicitud de notificaciones por ahora"
      );
    });

    it("returns live region status text based on loading state", () => {
      expect(getPushPermissionLiveStatus(false)).toBe("");
      expect(getPushPermissionLiveStatus(true)).toBe(
        "Solicitando activación de notificaciones de la aplicación..."
      );
    });
  });
});
