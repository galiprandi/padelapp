import { describe, it, expect } from "vitest";
import {
  getErrorTitle,
  getErrorMessage,
  getErrorRetryAriaLabel,
  getErrorHomeAriaLabel,
  getErrorRegionAriaLabel,
  getErrorContainerClasses,
  getRootErrorContainerClasses,
  getAppErrorContainerClasses,
  getErrorIconContainerClasses,
  getErrorActionButtonClasses,
  formatErrorDetails,
} from "../error-utils";

describe("error-utils", () => {
  describe("getErrorTitle", () => {
    it("returns default title when no section is provided", () => {
      expect(getErrorTitle()).toBe("Ocurrió un error inesperado");
    });

    it("returns formatted title when section is provided", () => {
      expect(getErrorTitle("el catálogo")).toBe("No pudimos cargar el catálogo");
      expect(getErrorTitle("la red")).toBe("No pudimos cargar la red");
    });
  });

  describe("getErrorMessage", () => {
    it("returns fallback message if provided", () => {
      const error = new Error("System error");
      expect(getErrorMessage(error, "Mensaje personalizado")).toBe("Mensaje personalizado");
    });

    it("returns error message if error is Error instance and no fallback provided", () => {
      const error = new Error("Fallo de conexión a la base de datos");
      expect(getErrorMessage(error)).toBe("Fallo de conexión a la base de datos");
    });

    it("returns default message if non-Error or empty Error is provided", () => {
      expect(getErrorMessage(null)).toBe(
        "Ocurrió un problema al procesar la solicitud. Podés reintentar o volver al inicio.",
      );
      expect(getErrorMessage({})).toBe(
        "Ocurrió un problema al procesar la solicitud. Podés reintentar o volver al inicio.",
      );
      expect(getErrorMessage(new Error(""))).toBe(
        "Ocurrió un problema al procesar la solicitud. Podés reintentar o volver al inicio.",
      );
    });
  });

  describe("getErrorRetryAriaLabel", () => {
    it("returns default retry label when no section is specified", () => {
      expect(getErrorRetryAriaLabel()).toBe("Reintentar cargar la página");
    });

    it("returns section-specific retry label when section is specified", () => {
      expect(getErrorRetryAriaLabel("el mapa de la red")).toBe(
        "Reintentar cargar el mapa de la red",
      );
    });
  });

  describe("getErrorHomeAriaLabel", () => {
    it("returns default accessible home navigation label", () => {
      expect(getErrorHomeAriaLabel()).toBe("Volver al panel principal de Padel Red");
    });

    it("returns customized destination label when specified", () => {
      expect(getErrorHomeAriaLabel("explorar turnos")).toBe("Volver a explorar turnos");
    });
  });

  describe("getErrorRegionAriaLabel", () => {
    it("returns default region label when no section is specified", () => {
      expect(getErrorRegionAriaLabel()).toBe("Mensaje de error inesperado de Padel Red");
    });

    it("returns section-specific region label when section is specified", () => {
      expect(getErrorRegionAriaLabel("esta sección")).toBe("Mensaje de error en esta sección");
    });
  });

  describe("getErrorContainerClasses", () => {
    it("returns base error container flexbox and spacing classes", () => {
      const classes = getErrorContainerClasses();
      expect(classes).toContain("flex");
      expect(classes).toContain("flex-col");
      expect(classes).toContain("items-center");
      expect(classes).toContain("py-16");
    });

    it("combines custom container class names when provided", () => {
      const classes = getErrorContainerClasses("max-w-md min-h-[60vh]");
      expect(classes).toContain("max-w-md");
      expect(classes).toContain("min-h-[60vh]");
    });
  });

  describe("getRootErrorContainerClasses", () => {
    it("returns full viewport height and background classes for root error container", () => {
      const classes = getRootErrorContainerClasses();
      expect(classes).toContain("flex");
      expect(classes).toContain("min-h-[100dvh]");
      expect(classes).toContain("bg-background");
      expect(classes).toContain("items-center");
    });

    it("appends custom class names if provided", () => {
      const classes = getRootErrorContainerClasses("custom-root-error");
      expect(classes).toContain("custom-root-error");
    });
  });

  describe("getAppErrorContainerClasses", () => {
    it("returns layout and gap classes for app-level error container", () => {
      const classes = getAppErrorContainerClasses();
      expect(classes).toContain("flex");
      expect(classes).toContain("flex-col");
      expect(classes).toContain("gap-4");
      expect(classes).toContain("py-16");
    });

    it("appends custom class names if provided", () => {
      const classes = getAppErrorContainerClasses("custom-app-error");
      expect(classes).toContain("custom-app-error");
    });
  });

  describe("getErrorIconContainerClasses", () => {
    it("returns destructive background and dimension classes for icon badge", () => {
      const classes = getErrorIconContainerClasses();
      expect(classes).toContain("flex");
      expect(classes).toContain("h-12");
      expect(classes).toContain("w-12");
      expect(classes).toContain("bg-destructive/10");
    });

    it("appends custom class names if provided", () => {
      const classes = getErrorIconContainerClasses("custom-icon-bg");
      expect(classes).toContain("custom-icon-bg");
    });
  });

  describe("getErrorActionButtonClasses", () => {
    it("returns active tactile scale and accessible focus ring classes", () => {
      const classes = getErrorActionButtonClasses();
      expect(classes).toContain("active:scale-[0.98]");
      expect(classes).toContain("focus-visible:ring-2");
      expect(classes).toContain("focus-visible:ring-ring");
    });

    it("appends custom class names if provided", () => {
      const classes = getErrorActionButtonClasses("custom-btn");
      expect(classes).toContain("custom-btn");
    });
  });

  describe("formatErrorDetails", () => {
    it("generates default error details when no options are provided", () => {
      const details = formatErrorDetails(null);
      expect(details.title).toBe("Ocurrió un error inesperado");
      expect(details.message).toContain("Ocurrió un problema al procesar la solicitud");
      expect(details.retryAriaLabel).toBe("Reintentar cargar la página");
      expect(details.homeAriaLabel).toBe("Volver al panel principal de Padel Red");
      expect(details.regionAriaLabel).toBe("Mensaje de error inesperado de Padel Red");
      expect(details.containerClasses).toContain("flex flex-col");
    });

    it("generates customized error details when options are specified", () => {
      const error = new Error("Network timeout");
      const details = formatErrorDetails(error, {
        section: "la guía de instalación",
        fallbackMessage: "Ocurrió un problema al obtener los pasos de instalación.",
        homeDestinationLabel: "explorar la app",
        customContainerClassName: "max-w-lg min-h-screen",
      });

      expect(details.title).toBe("No pudimos cargar la guía de instalación");
      expect(details.message).toBe("Ocurrió un problema al obtener los pasos de instalación.");
      expect(details.retryAriaLabel).toBe("Reintentar cargar la guía de instalación");
      expect(details.homeAriaLabel).toBe("Volver a explorar la app");
      expect(details.regionAriaLabel).toBe("Mensaje de error en la guía de instalación");
      expect(details.containerClasses).toContain("max-w-lg");
      expect(details.containerClasses).toContain("min-h-screen");
    });
  });
});
