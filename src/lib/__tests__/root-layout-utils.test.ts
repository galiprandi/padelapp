import { describe, expect, it } from "vitest";
import {
  getRootBodyClasses,
  getRootHtmlAttributes,
  getRootLoadingAriaLabel,
  getRootLoadingClasses,
  getRootLoadingInnerContainerClasses,
  getRootLoadingHeroClasses,
  getRootLoadingHeroTextClasses,
  getRootLoadingCardClasses,
  getRootLoadingCtaClasses,
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
      expect(classes).toContain("relative flex min-h-dvh flex-col bg-background px-6 py-10");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingClasses("custom-root-loading");
      expect(classes).toContain("custom-root-loading");
    });
  });

  describe("getRootLoadingInnerContainerClasses", () => {
    it("returns inner container classes", () => {
      const classes = getRootLoadingInnerContainerClasses();
      expect(classes).toContain("flex w-full max-w-sm mx-auto flex-col gap-6");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingInnerContainerClasses("custom-inner-container");
      expect(classes).toContain("custom-inner-container");
    });
  });

  describe("getRootLoadingHeroClasses", () => {
    it("returns hero section layout classes", () => {
      const classes = getRootLoadingHeroClasses();
      expect(classes).toContain("flex flex-col items-center gap-4 pt-6");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingHeroClasses("custom-hero");
      expect(classes).toContain("custom-hero");
    });
  });

  describe("getRootLoadingHeroTextClasses", () => {
    it("returns hero text container classes", () => {
      const classes = getRootLoadingHeroTextClasses();
      expect(classes).toContain("space-y-2 text-center flex flex-col items-center w-full");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingHeroTextClasses("custom-hero-text");
      expect(classes).toContain("custom-hero-text");
    });
  });

  describe("getRootLoadingCardClasses", () => {
    it("returns feature card container classes", () => {
      const classes = getRootLoadingCardClasses();
      expect(classes).toContain("flex items-start gap-3 rounded-xl border border-border bg-card p-4");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingCardClasses("custom-card");
      expect(classes).toContain("custom-card");
    });
  });

  describe("getRootLoadingCtaClasses", () => {
    it("returns CTA section container classes", () => {
      const classes = getRootLoadingCtaClasses();
      expect(classes).toContain("flex flex-col gap-3 pt-2");
    });

    it("applies custom class overrides", () => {
      const classes = getRootLoadingCtaClasses("custom-cta");
      expect(classes).toContain("custom-cta");
    });
  });
});
