import { describe, it, expect } from "vitest";
import {
  isAccessibleSkeletonContainer,
  getSkeletonAriaAttributes,
  getSkeletonClasses,
  getSkeletonRegionAriaLabel,
} from "../skeleton-utils";

describe("skeleton-utils", () => {
  describe("isAccessibleSkeletonContainer", () => {
    it("returns false for empty props or missing accessible attributes", () => {
      expect(isAccessibleSkeletonContainer({})).toBe(false);
      expect(
        isAccessibleSkeletonContainer({
          role: "",
          "aria-label": "   ",
          "aria-labelledby": "",
        }),
      ).toBe(false);
    });

    it("returns true when role is provided", () => {
      expect(isAccessibleSkeletonContainer({ role: "status" })).toBe(true);
      expect(isAccessibleSkeletonContainer({ role: "region" })).toBe(true);
    });

    it("returns true when aria-label is provided", () => {
      expect(
        isAccessibleSkeletonContainer({
          "aria-label": "Cargando lista de partidos",
        }),
      ).toBe(true);
    });

    it("returns true when aria-labelledby is provided", () => {
      expect(
        isAccessibleSkeletonContainer({
          "aria-labelledby": "heading-section-id",
        }),
      ).toBe(true);
    });
  });

  describe("getSkeletonAriaAttributes", () => {
    it("returns aria-hidden='true' by default for decorative skeletons", () => {
      const attrs = getSkeletonAriaAttributes({});
      expect(attrs).toEqual({ "aria-hidden": "true" });
    });

    it("returns aria-hidden=undefined for accessible containers", () => {
      const attrsWithRole = getSkeletonAriaAttributes({ role: "status" });
      expect(attrsWithRole).toEqual({ "aria-hidden": undefined });

      const attrsWithLabel = getSkeletonAriaAttributes({
        "aria-label": "Cargando perfil",
      });
      expect(attrsWithLabel).toEqual({ "aria-hidden": undefined });
    });

    it("honors explicit aria-hidden overrides", () => {
      const explicitFalse = getSkeletonAriaAttributes({ "aria-hidden": "false" });
      expect(explicitFalse).toEqual({ "aria-hidden": "false" });

      const explicitTrueWithRole = getSkeletonAriaAttributes({
        role: "status",
        "aria-hidden": "true",
      });
      expect(explicitTrueWithRole).toEqual({ "aria-hidden": "true" });
    });
  });

  describe("getSkeletonClasses", () => {
    it("returns standard default skeleton classes when no custom className is passed", () => {
      const classes = getSkeletonClasses();
      expect(classes).toContain("animate-pulse");
      expect(classes).toContain("rounded-md");
      expect(classes).toContain("bg-muted");
    });

    it("combines default skeleton classes with custom className", () => {
      const classes = getSkeletonClasses("h-12 w-full rounded-lg shadow-xs");
      expect(classes).toContain("animate-pulse");
      expect(classes).toContain("h-12");
      expect(classes).toContain("w-full");
      expect(classes).toContain("rounded-lg");
      expect(classes).toContain("shadow-xs");
    });
  });

  describe("getSkeletonRegionAriaLabel", () => {
    it("returns default generic loading aria label when section name is empty or undefined", () => {
      expect(getSkeletonRegionAriaLabel()).toBe("Cargando contenido...");
      expect(getSkeletonRegionAriaLabel("")).toBe("Cargando contenido...");
      expect(getSkeletonRegionAriaLabel("   ")).toBe("Cargando contenido...");
    });

    it("formats localized Argentine Spanish loading label when section name is provided", () => {
      expect(getSkeletonRegionAriaLabel("partidos del ranking")).toBe(
        "Cargando partidos del ranking...",
      );
      expect(getSkeletonRegionAriaLabel(" perfil de jugador ")).toBe(
        "Cargando perfil de jugador...",
      );
    });
  });
});
