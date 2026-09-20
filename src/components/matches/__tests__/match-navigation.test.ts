import { describe, it, expect } from "vitest";
import {
  getMatchNavigationAriaLabel,
  getPrimaryButtonAriaLabel,
  getSecondaryButtonAriaLabel,
  getSecondaryButtonClasses,
} from "../match-navigation-utils";

describe("match-navigation-utils", () => {
  describe("getMatchNavigationAriaLabel", () => {
    it("returns localized Spanish landmark region ARIA label", () => {
      expect(getMatchNavigationAriaLabel()).toBe(
        "Navegación de pasos del partido",
      );
    });
  });

  describe("getPrimaryButtonAriaLabel", () => {
    it("returns plain button text when loading is false", () => {
      expect(getPrimaryButtonAriaLabel("Siguiente")).toBe("Siguiente");
      expect(getPrimaryButtonAriaLabel("Crear partido", false)).toBe(
        "Crear partido",
      );
    });

    it("appends processing state suffix when loading is true", () => {
      expect(getPrimaryButtonAriaLabel("Creando partido...", true)).toBe(
        "Creando partido... - Procesando",
      );
    });
  });

  describe("getSecondaryButtonAriaLabel", () => {
    it("returns secondary button text", () => {
      expect(getSecondaryButtonAriaLabel("Cancelar")).toBe("Cancelar");
      expect(getSecondaryButtonAriaLabel("Atrás")).toBe("Atrás");
    });
  });

  describe("getSecondaryButtonClasses", () => {
    it("includes ghost text styling by default or when ghost variant is passed", () => {
      const ghostClasses = getSecondaryButtonClasses("ghost");
      expect(ghostClasses).toContain("text-muted-foreground");
      expect(ghostClasses).toContain("active:scale-[0.98]");
      expect(ghostClasses).toContain("ring-offset-background");
    });

    it("applies outline base styling when outline variant is passed", () => {
      const outlineClasses = getSecondaryButtonClasses("outline");
      expect(outlineClasses).not.toContain("text-muted-foreground hover:text-foreground");
      expect(outlineClasses).toContain("active:scale-[0.98]");
      expect(outlineClasses).toContain("ring-offset-background");
    });
  });
});
