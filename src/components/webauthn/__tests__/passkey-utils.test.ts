import { describe, it, expect } from "vitest";
import {
  getPasskeyLoginAriaLabel,
  getPasskeyRegisterAriaLabel,
  getPasskeyDeleteAriaLabel,
  formatPasskeyDate,
  sanitizePasskeyNickname,
  getPasskeyErrorMessage,
} from "../passkey-utils";

describe("passkey-utils", () => {
  describe("getPasskeyLoginAriaLabel", () => {
    it("returns pending authenticating ARIA label when authenticating", () => {
      expect(getPasskeyLoginAriaLabel(true)).toBe("Verificando huella biométrica...");
    });

    it("returns default passkey login ARIA label when idle", () => {
      expect(getPasskeyLoginAriaLabel(false)).toBe("Entrar con huella o Face ID");
    });
  });

  describe("getPasskeyRegisterAriaLabel", () => {
    it("returns registering ARIA label when transition is pending", () => {
      expect(getPasskeyRegisterAriaLabel(true)).toBe("Registrando huella biométrica...");
    });

    it("returns custom action label when idle", () => {
      expect(getPasskeyRegisterAriaLabel(false, "Activar huella")).toBe("Activar huella");
    });

    it("returns fallback action label when idle and no custom label provided", () => {
      expect(getPasskeyRegisterAriaLabel(false)).toBe("Registrar nueva huella biométrica");
    });
  });

  describe("getPasskeyDeleteAriaLabel", () => {
    it("returns descriptive delete ARIA label with nickname", () => {
      expect(getPasskeyDeleteAriaLabel("Mi Celular")).toBe('Eliminar huella "Mi Celular"');
    });

    it("returns default delete ARIA label when nickname is empty or missing", () => {
      expect(getPasskeyDeleteAriaLabel(null)).toBe("Eliminar huella registrada");
      expect(getPasskeyDeleteAriaLabel("   ")).toBe("Eliminar huella registrada");
      expect(getPasskeyDeleteAriaLabel(undefined)).toBe("Eliminar huella registrada");
    });
  });

  describe("formatPasskeyDate", () => {
    it("formats valid Date or timestamp into localized date string", () => {
      const formatted = formatPasskeyDate(new Date("2026-05-15T12:00:00Z"));
      expect(formatted).not.toBe("");
      expect(formatted).toContain("2026");
    });

    it("returns empty string for invalid date values", () => {
      expect(formatPasskeyDate("invalid-date-string")).toBe("");
    });
  });

  describe("sanitizePasskeyNickname", () => {
    it("preserves nicknames under 30 characters", () => {
      expect(sanitizePasskeyNickname("Mi iPhone 15")).toBe("Mi iPhone 15");
    });

    it("truncates nicknames exceeding 30 characters", () => {
      const longName = "Este es un nombre de dispositivo excesivamente largo";
      const sanitized = sanitizePasskeyNickname(longName);
      expect(sanitized).toHaveLength(30);
      expect(sanitized).toBe("Este es un nombre de dispositi");
    });

    it("returns empty string for empty input", () => {
      expect(sanitizePasskeyNickname("")).toBe("");
    });
  });

  describe("getPasskeyErrorMessage", () => {
    it("handles NotAllowedError DOMException / Error object", () => {
      const err = { name: "NotAllowedError" };
      expect(getPasskeyErrorMessage(err)).toBe("Cancelaste el registro de huella");
    });

    it("handles InvalidStateError DOMException / Error object", () => {
      const err = { name: "InvalidStateError" };
      expect(getPasskeyErrorMessage(err)).toBe(
        "No se encontró huella registrada. Entrá con Google y activá la huella desde tu perfil.",
      );
    });

    it("returns explicit error string if provided", () => {
      expect(getPasskeyErrorMessage("Error al conectar con el servidor")).toBe(
        "Error al conectar con el servidor",
      );
    });

    it("returns default message for unknown error types or empty input", () => {
      expect(getPasskeyErrorMessage(null)).toBe("No pudimos registrar la huella");
      expect(getPasskeyErrorMessage(undefined, "Error genérico")).toBe("Error genérico");
    });
  });
});
