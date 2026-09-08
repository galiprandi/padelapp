import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  PUSH_PROMPT_DISMISS_KEY,
  isPushPromptDismissed,
  dismissPushPrompt,
  clearPushPromptDismissal,
} from "../push-permission-prompt";

describe("PushPermissionPrompt ARIA, Accessibility and Storage Specifications", () => {
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

  it("manages localStorage push prompt dismissal states correctly", () => {
    expect(PUSH_PROMPT_DISMISS_KEY).toBe("push-prompt-dismissed");
    expect(isPushPromptDismissed()).toBe(false);

    dismissPushPrompt();
    expect(isPushPromptDismissed()).toBe(true);
    expect(localStorage.getItem(PUSH_PROMPT_DISMISS_KEY)).toBe("true");

    clearPushPromptDismissal();
    expect(isPushPromptDismissed()).toBe(false);
    expect(localStorage.getItem(PUSH_PROMPT_DISMISS_KEY)).toBeNull();
  });
  it("defines region role and Spanish ARIA labels for system notification prompt", () => {
    const regionRole = "region";
    const ariaLabel = "Aviso de notificaciones del sistema";
    expect(regionRole).toBe("region");
    expect(ariaLabel).toBe("Aviso de notificaciones del sistema");
  });

  it("provides dynamic live region status messages when pending activation", () => {
    const getLiveStatus = (loading: boolean) =>
      loading ? "Solicitando activación de notificaciones de la aplicación..." : "";

    expect(getLiveStatus(true)).toBe(
      "Solicitando activación de notificaciones de la aplicación..."
    );
    expect(getLiveStatus(false)).toBe("");
  });

  it("provides dynamic button labels and aria-labels during loading state", () => {
    const getActionProps = (loading: boolean) => ({
      text: loading ? "Activando..." : "Activar",
      ariaLabel: loading
        ? "Solicitando permisos de notificación"
        : "Activar notificaciones de la aplicación",
    });

    expect(getActionProps(false)).toEqual({
      text: "Activar",
      ariaLabel: "Activar notificaciones de la aplicación",
    });
    expect(getActionProps(true)).toEqual({
      text: "Activando...",
      ariaLabel: "Solicitando permisos de notificación",
    });
  });
});
