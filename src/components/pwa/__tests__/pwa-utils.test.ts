import { describe, it, expect, vi } from "vitest";
import {
  SERVICE_WORKER_SCRIPT_URL,
  isBadgingSupported,
  isServiceWorkerSupported,
  sanitizeBadgeCount,
  updateAppBadge,
  clearAppBadge,
  getServiceWorkerRegistrationUrl,
  formatAppBadgeAriaLabel,
} from "../pwa-utils";

describe("pwa-utils", () => {
  describe("isBadgingSupported", () => {
    it("returns false if navigator is undefined or null", () => {
      expect(isBadgingSupported(undefined)).toBe(false);
    });

    it("returns false if setAppBadge is not present in navigator", () => {
      const mockNav = {} as Navigator;
      expect(isBadgingSupported(mockNav)).toBe(false);
    });

    it("returns true if setAppBadge is present in navigator", () => {
      const mockNav = { setAppBadge: vi.fn() } as unknown as Navigator;
      expect(isBadgingSupported(mockNav)).toBe(true);
    });
  });

  describe("isServiceWorkerSupported", () => {
    it("returns false if navigator is undefined or null", () => {
      expect(isServiceWorkerSupported(undefined)).toBe(false);
    });

    it("returns false if serviceWorker is not present in navigator", () => {
      const mockNav = {} as Navigator;
      expect(isServiceWorkerSupported(mockNav)).toBe(false);
    });

    it("returns true if serviceWorker is present in navigator", () => {
      const mockNav = { serviceWorker: {} } as unknown as Navigator;
      expect(isServiceWorkerSupported(mockNav)).toBe(true);
    });
  });

  describe("sanitizeBadgeCount", () => {
    it("preserves positive integer badge counts", () => {
      expect(sanitizeBadgeCount(5)).toBe(5);
      expect(sanitizeBadgeCount(1)).toBe(1);
    });

    it("floors positive floating point badge counts", () => {
      expect(sanitizeBadgeCount(3.8)).toBe(3);
    });

    it("converts negative counts or zero to 0", () => {
      expect(sanitizeBadgeCount(0)).toBe(0);
      expect(sanitizeBadgeCount(-4)).toBe(0);
    });

    it("handles NaN or non-numeric values safely", () => {
      expect(sanitizeBadgeCount(NaN)).toBe(0);
      // @ts-expect-error - testing runtime non-number argument
      expect(sanitizeBadgeCount("3")).toBe(0);
    });
  });

  describe("updateAppBadge", () => {
    it("returns false if Badging API is unsupported", async () => {
      const mockNav = {} as Navigator;
      const result = await updateAppBadge(3, mockNav);
      expect(result).toBe(false);
    });

    it("calls setAppBadge with sanitized count if > 0", async () => {
      const setAppBadge = vi.fn().mockResolvedValue(undefined);
      const clearAppBadgeFn = vi.fn().mockResolvedValue(undefined);
      const mockNav = {
        setAppBadge,
        clearAppBadge: clearAppBadgeFn,
      } as unknown as Navigator;

      const result = await updateAppBadge(4.7, mockNav);
      expect(result).toBe(true);
      expect(setAppBadge).toHaveBeenCalledWith(4);
      expect(clearAppBadgeFn).not.toHaveBeenCalled();
    });

    it("calls clearAppBadge if sanitized count is 0 or negative", async () => {
      const setAppBadge = vi.fn().mockResolvedValue(undefined);
      const clearAppBadgeFn = vi.fn().mockResolvedValue(undefined);
      const mockNav = {
        setAppBadge,
        clearAppBadge: clearAppBadgeFn,
      } as unknown as Navigator;

      const result = await updateAppBadge(-2, mockNav);
      expect(result).toBe(true);
      expect(clearAppBadgeFn).toHaveBeenCalled();
      expect(setAppBadge).not.toHaveBeenCalled();
    });

    it("returns false if setAppBadge throws an error", async () => {
      const setAppBadge = vi.fn().mockRejectedValue(new Error("Permission denied"));
      const mockNav = {
        setAppBadge,
        clearAppBadge: vi.fn(),
      } as unknown as Navigator;

      const result = await updateAppBadge(3, mockNav);
      expect(result).toBe(false);
    });
  });

  describe("clearAppBadge", () => {
    it("returns false if Badging API is unsupported", async () => {
      const mockNav = {} as Navigator;
      const result = await clearAppBadge(mockNav);
      expect(result).toBe(false);
    });

    it("calls clearAppBadge and returns true if supported", async () => {
      const clearAppBadgeFn = vi.fn().mockResolvedValue(undefined);
      const mockNav = {
        setAppBadge: vi.fn(),
        clearAppBadge: clearAppBadgeFn,
      } as unknown as Navigator;

      const result = await clearAppBadge(mockNav);
      expect(result).toBe(true);
      expect(clearAppBadgeFn).toHaveBeenCalled();
    });

    it("returns false if clearAppBadge throws an error", async () => {
      const clearAppBadgeFn = vi.fn().mockRejectedValue(new Error("Failed"));
      const mockNav = {
        setAppBadge: vi.fn(),
        clearAppBadge: clearAppBadgeFn,
      } as unknown as Navigator;

      const result = await clearAppBadge(mockNav);
      expect(result).toBe(false);
    });
  });

  describe("getServiceWorkerRegistrationUrl", () => {
    it("returns the service worker script URL constant", () => {
      expect(getServiceWorkerRegistrationUrl()).toBe(SERVICE_WORKER_SCRIPT_URL);
      expect(getServiceWorkerRegistrationUrl()).toBe("/firebase-messaging-sw.js");
    });
  });

  describe("formatAppBadgeAriaLabel", () => {
    it("formats 0 or negative counts as no pending actions", () => {
      expect(formatAppBadgeAriaLabel(0)).toBe("Sin acciones pendientes");
      expect(formatAppBadgeAriaLabel(-1)).toBe("Sin acciones pendientes");
    });

    it("formats 1 count in singular", () => {
      expect(formatAppBadgeAriaLabel(1)).toBe("1 acción pendiente");
    });

    it("formats counts greater than 1 in plural", () => {
      expect(formatAppBadgeAriaLabel(2)).toBe("2 acciones pendientes");
      expect(formatAppBadgeAriaLabel(5)).toBe("5 acciones pendientes");
    });
  });
});
