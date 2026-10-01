import { describe, expect, it } from "vitest";
import {
  getRootBodyClasses,
  getRootHtmlAttributes,
  getRootLoadingAriaLabel,
  getRootLoadingClasses,
} from "../root-layout-utils";

describe("root-layout-utils", () => {
  describe("getRootBodyClasses", () => {
    it("returns body classes including font variable when provided", () => {
      const classes = getRootBodyClasses("--font-geist-sans");
      expect(classes).toContain("--font-geist-sans");
      expect(classes).toContain("min-h-screen bg-background font-sans text-foreground");
    });

    it("returns body classes without font variable when omitted or empty", () => {
      const classes = getRootBodyClasses();
      expect(classes).toBe("min-h-screen bg-background font-sans text-foreground");
    });

    it("trims whitespace correctly when font variable has trailing spaces", () => {
      const classes = getRootBodyClasses("  --custom-font  ");
      expect(classes).toBe("--custom-font min-h-screen bg-background font-sans text-foreground");
    });
  });

  describe("getRootHtmlAttributes", () => {
    it("returns Spanish language attribute for root html element", () => {
      const attrs = getRootHtmlAttributes();
      expect(attrs).toEqual({ lang: "es" });
    });
  });

  describe("getRootLoadingAriaLabel", () => {
    it("returns localized Spanish screen reader text for root loading state", () => {
      const label = getRootLoadingAriaLabel();
      expect(label).toBe("Cargando Padel Red");
    });
  });

  describe("getRootLoadingClasses", () => {
    it("returns CSS layout classes for root loading skeleton container", () => {
      const classes = getRootLoadingClasses();
      expect(classes).toBe("relative flex min-h-dvh flex-col bg-background px-6 py-10");
    });
  });
});
