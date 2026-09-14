import { describe, it, expect } from "vitest";
import {
  getOnboardingProgressCount,
  getOnboardingProgressAriaLabel,
  getGreetingAriaLabel,
  formatCategoryBadgeText,
} from "../greeting-utils";

describe("greeting-utils", () => {
  describe("getOnboardingProgressCount", () => {
    it("returns 0 when no steps are completed", () => {
      const count = getOnboardingProgressCount({
        hasAlias: false,
        hasActivity: false,
        isPwaInstalled: false,
        hasNotifications: false,
      });
      expect(count).toBe(0);
    });

    it("returns 1 when only alias is set", () => {
      const count = getOnboardingProgressCount({
        hasAlias: true,
        hasActivity: false,
        isPwaInstalled: false,
        hasNotifications: false,
      });
      expect(count).toBe(1);
    });

    it("returns 2 when alias and activity exist", () => {
      const count = getOnboardingProgressCount({
        hasAlias: true,
        hasActivity: true,
        isPwaInstalled: false,
        hasNotifications: false,
      });
      expect(count).toBe(2);
    });

    it("returns 3 when alias, activity, and PWA are completed", () => {
      const count = getOnboardingProgressCount({
        hasAlias: true,
        hasActivity: true,
        isPwaInstalled: true,
        hasNotifications: false,
      });
      expect(count).toBe(3);
    });

    it("returns 4 when all steps are completed", () => {
      const count = getOnboardingProgressCount({
        hasAlias: true,
        hasActivity: true,
        isPwaInstalled: true,
        hasNotifications: true,
      });
      expect(count).toBe(4);
    });
  });

  describe("getOnboardingProgressAriaLabel", () => {
    it("formats progress aria label in Argentine Spanish", () => {
      expect(getOnboardingProgressAriaLabel(1, 4)).toBe(
        "Progreso de preparación: 1 de 4 pasos completados"
      );
      expect(getOnboardingProgressAriaLabel(3, 4)).toBe(
        "Progreso de preparación: 3 de 4 pasos completados"
      );
    });
  });

  describe("getGreetingAriaLabel", () => {
    it("formats greeting aria label without category label", () => {
      expect(getGreetingAriaLabel("Hola", "Roby")).toBe("Saludo: Hola, Roby.");
    });

    it("formats greeting aria label with category label", () => {
      expect(getGreetingAriaLabel("Buenas tardes", "Roby", "6ª Cat.")).toBe(
        "Saludo: Buenas tardes, Roby. Categoría: 6ª Cat.."
      );
    });
  });

  describe("formatCategoryBadgeText", () => {
    it("returns null for undefined or null levels", () => {
      expect(formatCategoryBadgeText(undefined)).toBeNull();
      expect(formatCategoryBadgeText(null)).toBeNull();
    });

    it("returns formatted category label for valid numeric level", () => {
      expect(formatCategoryBadgeText(1)).toBe("1ª Cat.");
      expect(formatCategoryBadgeText(6)).toBe("6ª Cat.");
      expect(formatCategoryBadgeText(8)).toBe("8ª Cat.");
    });
  });
});
