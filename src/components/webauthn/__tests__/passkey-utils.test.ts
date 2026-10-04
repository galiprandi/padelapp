import { describe, it, expect } from "vitest";
import {
  getPasskeyLoginAriaLabel,
  getPasskeyLoginButtonText,
  getPasskeyRegisterAriaLabel,
  getPasskeyDeleteAriaLabel,
  formatPasskeyDate,
  sanitizePasskeyNickname,
  getPasskeyErrorMessage,
  getPasskeyManagerRegionAriaLabel,
  getPasskeyManagerTitle,
  getPasskeyManagerDescription,
  getPasskeyUnsupportedDescription,
  getPasskeyNicknameLabel,
  getPasskeyNicknamePlaceholder,
  getPasskeyNicknameAriaLabel,
  getPasskeyRegisterSuccessToast,
  getPasskeyDeleteSuccessToast,
  getPasskeyDefaultNickname,
  getPasskeyOnboardingTitle,
  getPasskeyOnboardingDescription,
  getPasskeyOnboardingRegionAriaLabel,
  getPasskeyOnboardingDismissAriaLabel,
  getPasskeyOnboardingLaterAriaLabel,
  getPasskeyOnboardingLaterLabel,
  getSecurityPageHeadingTitle,
  getSecurityPageHeadingDescription,
  getSecurityPageBackAriaLabel,
  getSecuritySkeletonAriaLabel,
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

  describe("getPasskeyLoginButtonText", () => {
    it("returns verifying status text when authenticating", () => {
      expect(getPasskeyLoginButtonText(true)).toBe("Verificando…");
    });

    it("returns default button text when idle", () => {
      expect(getPasskeyLoginButtonText(false)).toBe("Entrar con huella");
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

  describe("PasskeyManager pure helpers", () => {
    it("returns passkey manager region ARIA label", () => {
      expect(getPasskeyManagerRegionAriaLabel()).toBe("Gestor de acceso biométrico con huella");
    });

    it("returns passkey manager section title and descriptions", () => {
      expect(getPasskeyManagerTitle()).toBe("Acceso con huella");
      expect(getPasskeyManagerDescription()).toBe("Entrá más rápido con huella o Face ID. Sin escribir tu email cada vez.");
      expect(getPasskeyUnsupportedDescription()).toBe("Tu dispositivo no soporta autenticación biométrica web.");
    });

    it("returns device nickname field labels and placeholders", () => {
      expect(getPasskeyNicknameLabel()).toBe("Nombre del dispositivo (opcional)");
      expect(getPasskeyNicknamePlaceholder()).toBe("Ej: Mi Celular, Mi Computadora...");
      expect(getPasskeyNicknameAriaLabel()).toBe("Nombre del dispositivo para la huella");
    });

    it("returns toast success messages", () => {
      expect(getPasskeyRegisterSuccessToast()).toBe("Huella registrada");
      expect(getPasskeyDeleteSuccessToast()).toBe("Huella eliminada");
    });

    it("returns default nickname fallback when nickname is missing or whitespace", () => {
      expect(getPasskeyDefaultNickname("  Mi iPad  ")).toBe("Mi iPad");
      expect(getPasskeyDefaultNickname(null)).toBe("Huella registrada");
      expect(getPasskeyDefaultNickname("   ")).toBe("Huella registrada");
    });
  });

  describe("PasskeyOnboarding pure helpers", () => {
    it("returns passkey onboarding copy and region ARIA labels", () => {
      expect(getPasskeyOnboardingTitle()).toBe("Entrá más rápido con huella");
      expect(getPasskeyOnboardingDescription()).toBe("Activá el acceso biométrico y no vuelvas a escribir tu email. Tocá una vez para registrar tu huella o Face ID.");
      expect(getPasskeyOnboardingRegionAriaLabel()).toBe("Sugerencia de acceso biométrico");
      expect(getPasskeyOnboardingDismissAriaLabel()).toBe("Cerrar sugerencia de acceso biométrico");
      expect(getPasskeyOnboardingLaterAriaLabel()).toBe("Descartar sugerencia por ahora");
      expect(getPasskeyOnboardingLaterLabel()).toBe("Ahora no");
    });
  });

  describe("Security page pure helpers", () => {
    it("returns security page heading and navigation ARIA labels", () => {
      expect(getSecurityPageHeadingTitle()).toBe("Seguridad");
      expect(getSecurityPageHeadingDescription()).toBe("Iniciá sesión sin contraseña usando tu huella o Face ID.");
      expect(getSecurityPageBackAriaLabel()).toBe("Volver a mi perfil");
      expect(getSecuritySkeletonAriaLabel()).toBe("Cargando opciones de seguridad y acceso biométrico");
    });
  });
});
