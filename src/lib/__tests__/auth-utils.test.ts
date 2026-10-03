import { describe, it, expect } from "vitest";
import {
  getLoginLoadingAriaLabel,
  getLoginLoadingText,
  getLoginRegionAriaLabel,
  getLoginTaglineText,
  getLoginTermsNoticeText,
  getLoginTitleText,
  getSignInFormAriaLabel,
  getSignInFormClasses,
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

  it("returns a non-empty localized login title text", () => {
    const title = getLoginTitleText();
    expect(title).toBe("Padel Red");
  });

  it("returns a non-empty localized login tagline text", () => {
    const tagline = getLoginTaglineText();
    expect(tagline).toContain("Turnos que no se cancelan.");
    expect(tagline).toContain("Tu comunidad de pádel en un solo lugar.");
  });

  it("returns a non-empty localized login loading text", () => {
    const loadingText = getLoginLoadingText();
    expect(loadingText).toBe("Cargando…");
  });

  it("returns localized ARIA label for Google sign-in form", () => {
    expect(getSignInFormAriaLabel()).toBe("Formulario de inicio de sesión con Google");
  });

  it("generates sign-in form classes with optional custom className", () => {
    expect(getSignInFormClasses()).toBe("w-full");
    expect(getSignInFormClasses("mt-4 flex-col")).toBe("w-full mt-4 flex-col");
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
