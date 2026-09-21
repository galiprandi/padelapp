import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  PWA_BANNER_DISMISS_KEY,
  isPwaBannerDismissed,
  dismissPwaBanner,
  clearPwaBannerDismissal,
  getPwaBannerRegionAriaLabel,
  getInstallButtonAriaLabel,
  getInstallGuideAriaLabel,
  getPwaInstallLinkAriaLabel,
  getDismissBannerAriaLabel,
} from "../pwa-install-utils";

describe("pwa-install-utils", () => {
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

  describe("localStorage banner dismissal state helpers", () => {
    it("returns false when banner has not been dismissed", () => {
      expect(isPwaBannerDismissed()).toBe(false);
    });

    it("persists dismiss state in localStorage and returns true", () => {
      dismissPwaBanner();
      expect(localStorage.getItem(PWA_BANNER_DISMISS_KEY)).toBe("true");
      expect(isPwaBannerDismissed()).toBe(true);
    });

    it("clears dismiss state from localStorage", () => {
      dismissPwaBanner();
      expect(isPwaBannerDismissed()).toBe(true);

      clearPwaBannerDismissal();
      expect(localStorage.getItem(PWA_BANNER_DISMISS_KEY)).toBeNull();
      expect(isPwaBannerDismissed()).toBe(false);
    });
  });

  describe("ARIA accessibility label formatters", () => {
    it("returns expected region landmark ARIA label", () => {
      expect(getPwaBannerRegionAriaLabel()).toBe(
        "Aviso de instalación de Padel Red"
      );
    });

    it("returns expected install button ARIA labels for idle and installing states", () => {
      expect(getInstallButtonAriaLabel(false)).toBe(
        "Instalar aplicación de pádel"
      );
      expect(getInstallButtonAriaLabel(true)).toBe(
        "Instalando aplicación de pádel..."
      );
    });

    it("returns expected install guide link ARIA label", () => {
      expect(getInstallGuideAriaLabel()).toBe(
        "Ver cómo instalar la aplicación de pádel"
      );
    });

    it("returns expected PWA install link ARIA label", () => {
      expect(getPwaInstallLinkAriaLabel()).toBe(
        "Ver instrucciones de instalación de Padel Red"
      );
    });

    it("returns expected banner dismiss button ARIA label", () => {
      expect(getDismissBannerAriaLabel()).toBe("Cerrar aviso de instalación");
    });
  });
});
