import { describe, expect, it } from "vitest";
import {
  DEFAULT_TOAST_DURATION,
  createToastItem,
  formatToastAriaLabel,
  getToastActionClasses,
  getToastAriaAttributes,
  getToastClasses,
  getToastContainerClasses,
  getToastDuration,
  getToastIconClasses,
  isErrorToast,
} from "../toast-utils";

describe("toast-utils", () => {
  describe("getToastDuration", () => {
    it("returns default duration when no options or duration provided", () => {
      expect(getToastDuration()).toBe(DEFAULT_TOAST_DURATION);
      expect(getToastDuration({})).toBe(DEFAULT_TOAST_DURATION);
    });

    it("returns explicit duration when provided", () => {
      expect(getToastDuration({ duration: 5000 })).toBe(5000);
    });
  });

  describe("isErrorToast", () => {
    it("returns true for error type", () => {
      expect(isErrorToast("error")).toBe(true);
    });

    it("returns false for success or undefined type", () => {
      expect(isErrorToast("success")).toBe(false);
      expect(isErrorToast()).toBe(false);
    });
  });

  describe("CSS Class Helpers", () => {
    it("returns fixed top-right container classes", () => {
      const containerClasses = getToastContainerClasses();
      expect(containerClasses).toContain("fixed");
      expect(containerClasses).toContain("top-6");
      expect(containerClasses).toContain("right-6");
      expect(containerClasses).toContain("z-[60]");
    });

    it("returns primary border styling for success toasts", () => {
      const classes = getToastClasses("success");
      expect(classes).toContain("border-primary");
      expect(classes).toContain("text-primary");
    });

    it("returns destructive border styling for error toasts", () => {
      const classes = getToastClasses("error");
      expect(classes).toContain("border-destructive");
      expect(classes).toContain("text-destructive");
    });

    it("returns correct icon container background classes", () => {
      expect(getToastIconClasses("success")).toContain("bg-primary/10");
      expect(getToastIconClasses("error")).toContain("bg-destructive/10");
    });

    it("returns action button classes with focus rings and tactile press scaling", () => {
      const actionClasses = getToastActionClasses();
      expect(actionClasses).toContain("focus-visible:ring-2");
      expect(actionClasses).toContain("active:scale-[0.98]");
    });
  });

  describe("ARIA and Accessibility Helpers", () => {
    it("returns role status and aria-live polite attributes", () => {
      const attrs = getToastAriaAttributes();
      expect(attrs).toEqual({
        role: "status",
        "aria-live": "polite",
      });
    });

    it("formats localized Argentine Spanish screen reader labels", () => {
      expect(formatToastAriaLabel("Turno reservado", "success")).toBe(
        "Notificación de éxito: Turno reservado"
      );
      expect(formatToastAriaLabel("Error de conexión", "error")).toBe(
        "Notificación de error: Error de conexión"
      );
    });
  });

  describe("createToastItem", () => {
    it("constructs ToastItem with provided parameters", () => {
      const item = createToastItem(12345, "Test message", { type: "success" });
      expect(item).toEqual({
        id: 12345,
        message: "Test message",
        options: { type: "success" },
      });
    });

    it("defaults options object when undefined", () => {
      const item = createToastItem(12345, "Test message");
      expect(item.options).toEqual({});
    });
  });
});
