import { describe, expect, it } from "vitest";
import {
  getProvidersRegionAriaLabel,
  getProvidersRegionAriaAttributes,
  isPwaRegistrarEnabled,
  getProvidersContainerClasses,
} from "../providers-utils";

describe("providers-utils", () => {
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
});
