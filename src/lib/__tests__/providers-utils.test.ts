import { describe, expect, it } from "vitest";
import {
  formatProvidersRegionAriaLabel,
  getProvidersRegionAriaLabel,
  getProvidersRegionAriaAttributes,
  isPwaRegistrarEnabled,
  getProvidersContainerClasses,
  getSessionProviderProps,
  isAnalyticsEnabled,
  getProvidersToastProviderProps,
} from "../providers-utils";

describe("providers-utils", () => {
  describe("formatProvidersRegionAriaLabel", () => {
    it("returns default ARIA region label when custom label is omitted or empty", () => {
      expect(formatProvidersRegionAriaLabel()).toBe("Contexto global de aplicación y servicios");
      expect(formatProvidersRegionAriaLabel("")).toBe("Contexto global de aplicación y servicios");
      expect(formatProvidersRegionAriaLabel("   ")).toBe("Contexto global de aplicación y servicios");
    });

    it("returns trimmed custom ARIA region label when provided", () => {
      expect(formatProvidersRegionAriaLabel("  Contexto de pruebas  ")).toBe("Contexto de pruebas");
    });
  });

  describe("getProvidersRegionAriaLabel", () => {
    it("returns localized Argentine Spanish ARIA label for providers region", () => {
      const label = getProvidersRegionAriaLabel();
      expect(label).toBe("Contexto global de aplicación y servicios");
    });
  });

  describe("getProvidersRegionAriaAttributes", () => {
    it("returns role region and corresponding aria-label", () => {
      const attrs = getProvidersRegionAriaAttributes();
      expect(attrs).toEqual({
        role: "region",
        "aria-label": "Contexto global de aplicación y servicios",
      });
    });

    it("supports custom label parameter", () => {
      const attrs = getProvidersRegionAriaAttributes("Contexto personalizado");
      expect(attrs).toEqual({
        role: "region",
        "aria-label": "Contexto personalizado",
      });
    });
  });

  describe("isPwaRegistrarEnabled", () => {
    it("returns true when disable flag is undefined or empty", () => {
      expect(isPwaRegistrarEnabled()).toBe(true);
      expect(isPwaRegistrarEnabled(undefined)).toBe(true);
      expect(isPwaRegistrarEnabled("")).toBe(true);
      expect(isPwaRegistrarEnabled("false")).toBe(true);
    });

    it("returns false when disable flag is true or string 'true'", () => {
      expect(isPwaRegistrarEnabled("true")).toBe(false);
      expect(isPwaRegistrarEnabled(true)).toBe(false);
    });
  });

  describe("getProvidersContainerClasses", () => {
    it("returns default contents class when no custom classes provided", () => {
      expect(getProvidersContainerClasses()).toBe("contents");
    });

    it("appends custom classes to base contents class", () => {
      expect(getProvidersContainerClasses("my-custom-class")).toBe(
        "contents my-custom-class",
      );
    });
  });

  describe("getSessionProviderProps", () => {
    it("returns default session provider props with refetchOnWindowFocus false", () => {
      const props = getSessionProviderProps();
      expect(props).toEqual({
        refetchInterval: undefined,
        refetchOnWindowFocus: false,
      });
    });

    it("preserves custom refetch interval and refetchOnWindowFocus settings", () => {
      const props = getSessionProviderProps({
        refetchInterval: 300,
        refetchOnWindowFocus: true,
      });
      expect(props).toEqual({
        refetchInterval: 300,
        refetchOnWindowFocus: true,
      });
    });
  });

  describe("isAnalyticsEnabled", () => {
    it("returns true by default when disable flag is omitted or false", () => {
      expect(isAnalyticsEnabled()).toBe(true);
      expect(isAnalyticsEnabled(undefined)).toBe(true);
      expect(isAnalyticsEnabled("false")).toBe(true);
      expect(isAnalyticsEnabled(false)).toBe(true);
    });

    it("returns false when disable flag is true or string 'true'", () => {
      expect(isAnalyticsEnabled("true")).toBe(false);
      expect(isAnalyticsEnabled(true)).toBe(false);
    });
  });

  describe("getProvidersToastProviderProps", () => {
    it("returns default toast provider options (duration 4000ms, swipe direction right)", () => {
      const props = getProvidersToastProviderProps();
      expect(props).toEqual({
        duration: 4000,
        swipeDirection: "right",
      });
    });

    it("allows custom overrides for duration and swipe direction", () => {
      const props = getProvidersToastProviderProps({
        duration: 5000,
        swipeDirection: "down",
      });
      expect(props).toEqual({
        duration: 5000,
        swipeDirection: "down",
      });
    });
  });
});
