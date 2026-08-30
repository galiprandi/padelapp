import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  PWA_BANNER_DISMISS_KEY,
  isPwaBannerDismissed,
  dismissPwaBanner,
  clearPwaBannerDismissal,
} from "../pwa-install-banner";

describe("PwaInstallBanner Storage Helpers", () => {
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

  it("should return false when banner has not been dismissed", () => {
    expect(isPwaBannerDismissed()).toBe(false);
  });

  it("should store dismissed state in localStorage when dismissPwaBanner is called", () => {
    dismissPwaBanner();
    expect(localStorage.getItem(PWA_BANNER_DISMISS_KEY)).toBe("true");
    expect(isPwaBannerDismissed()).toBe(true);
  });

  it("should remove dismissal key when clearPwaBannerDismissal is called", () => {
    dismissPwaBanner();
    expect(isPwaBannerDismissed()).toBe(true);

    clearPwaBannerDismissal();
    expect(localStorage.getItem(PWA_BANNER_DISMISS_KEY)).toBeNull();
    expect(isPwaBannerDismissed()).toBe(false);
  });
});
