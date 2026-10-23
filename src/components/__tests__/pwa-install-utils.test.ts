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
  getInstallLinkClasses,
  getDismissBannerAriaLabel,
  getPwaBannerTitleText,
  getPwaBannerDescriptionText,
  getPwaBannerIconAriaLabel,
  getPwaBannerInstallButtonText,
  getPwaBannerContainerClasses,
  getPwaBannerIconBadgeClasses,
  getPwaBannerDismissButtonClasses,
  getPwaBannerInstallButtonClasses,
  getPwaBannerGuideButtonClasses,
  getPwaBannerTextContainerClasses,
  getPwaBannerTitleClasses,
  getPwaBannerDescriptionClasses,
  getPwaBannerIconClasses,
  getPwaBannerDismissIconClasses,
  getPwaBannerButtonSpinnerClasses,
  getPwaBannerButtonIconClasses,
  getPwaBannerGuideButtonText,
  getPwaInstallLinkText,
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

  describe("UI banner text and CSS class pure helper formatters", () => {
    it("returns expected PWA banner header title text", () => {
      expect(getPwaBannerTitleText()).toBe("Instalá la App");
    });

    it("returns expected InstallLinkButton CSS classes", () => {
      expect(getInstallLinkClasses()).toContain("h-10 w-full rounded-xl text-xs font-semibold");
      expect(getInstallLinkClasses()).toContain("focus-visible:ring-2");
    });

    it("returns expected PWA banner description text", () => {
      expect(getPwaBannerDescriptionText()).toBe("Accedé más rápido desde tu inicio.");
    });

    it("returns expected PWA banner mobile icon ARIA label", () => {
      expect(getPwaBannerIconAriaLabel()).toBe("Icono de aplicación móvil");
    });

    it("returns expected PWA banner primary install button text", () => {
      expect(getPwaBannerInstallButtonText()).toBe("Instalar");
    });

    it("returns expected container and badge CSS classes for PWA install banner", () => {
      expect(getPwaBannerContainerClasses()).toContain("flex items-center gap-3 rounded-xl border");
      expect(getPwaBannerIconBadgeClasses()).toContain("flex h-9 w-9 shrink-0 items-center");
    });

    it("returns expected dismiss and action button CSS classes for PWA install banner", () => {
      expect(getPwaBannerDismissButtonClasses()).toContain("rounded-md p-1.5 h-8 w-8");
      expect(getPwaBannerInstallButtonClasses()).toContain("h-8 px-3 text-xs font-bold bg-primary");
      expect(getPwaBannerGuideButtonClasses()).toContain("h-8 px-3 text-xs font-bold bg-primary");
    });

    it("returns expected text container, title and description CSS classes for PWA banner", () => {
      expect(getPwaBannerTextContainerClasses()).toBe("flex-1 space-y-0.5");
      expect(getPwaBannerTitleClasses()).toBe("text-sm font-semibold text-foreground");
      expect(getPwaBannerDescriptionClasses()).toBe("text-xs text-muted-foreground");
    });

    it("returns expected icon, spinner and guide button text helpers for PWA banner", () => {
      expect(getPwaBannerIconClasses()).toBe("h-4 w-4");
      expect(getPwaBannerDismissIconClasses()).toBe("h-4 w-4");
      expect(getPwaBannerButtonSpinnerClasses()).toBe("h-3.5 w-3.5 animate-spin mr-1");
      expect(getPwaBannerButtonIconClasses()).toBe("h-3.5 w-3.5 mr-1");
      expect(getPwaBannerGuideButtonText()).toBe("Ver cómo");
      expect(getPwaInstallLinkText()).toBe("Instalar App");
    });
  });
});
