import { describe, it, expect } from "vitest";
import {
  getErrorTitle,
  getErrorMessage,
  getErrorRetryAriaLabel,
  getErrorHomeAriaLabel,
  getErrorRegionAriaLabel,
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
    it("returns consistent accessible home navigation label", () => {
      expect(getErrorHomeAriaLabel()).toBe("Volver al panel principal de Padel Red");
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
});
