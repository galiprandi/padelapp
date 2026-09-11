import { describe, it, expect } from "vitest";
import {
  getLoginLoadingAriaLabel,
  getLoginRegionAriaLabel,
  getLoginTermsNoticeText,
  safeCallbackUrl,
} from "@/lib/auth-utils";

describe("auth-utils login text helpers", () => {
  it("returns a non-empty localized region ARIA label", () => {
    const label = getLoginRegionAriaLabel();
    expect(label).toBe("Opciones de inicio de sesión de Padel Red");
  });

  it("returns a non-empty localized loading ARIA label", () => {
    const label = getLoginLoadingAriaLabel();
    expect(label).toBe("Cargando opciones de inicio de sesión");
  });

  it("returns a non-empty localized terms notice text", () => {
    const text = getLoginTermsNoticeText();
    expect(text).toBe("Al continuar, aceptás nuestros términos de servicio.");
  });
});

describe("safeCallbackUrl", () => {
  it("returns fallback when url is undefined", () => {
    expect(safeCallbackUrl(undefined)).toBe("/me");
  });

  it("returns custom fallback when url is undefined", () => {
    expect(safeCallbackUrl(undefined, "/ranking")).toBe("/ranking");
  });

  it("returns fallback when url is empty string", () => {
    expect(safeCallbackUrl("")).toBe("/me");
  });

  it("returns fallback for absolute URL (open redirect attempt)", () => {
    expect(safeCallbackUrl("https://evil.com")).toBe("/me");
  });

  it("returns fallback for protocol-relative URL", () => {
    expect(safeCallbackUrl("//evil.com")).toBe("/me");
  });

  it("returns fallback for protocol-relative URL with path", () => {
    expect(safeCallbackUrl("//evil.com/path")).toBe("/me");
  });

  it("accepts valid relative path", () => {
    expect(safeCallbackUrl("/me")).toBe("/me");
  });

  it("accepts valid relative path with query params", () => {
    expect(safeCallbackUrl("/turnos?id=123")).toBe("/turnos?id=123");
  });

  it("accepts root path", () => {
    expect(safeCallbackUrl("/")).toBe("/");
  });

  it("returns fallback for relative path without leading slash", () => {
    expect(safeCallbackUrl("me")).toBe("/me");
  });
});
