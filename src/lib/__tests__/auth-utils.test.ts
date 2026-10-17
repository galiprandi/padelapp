import { describe, it, expect } from "vitest";
import {
  getLoginContainerClasses,
  getLoginContentContainerClasses,
  getLoginFallbackContainerClasses,
  getLoginFormContainerClasses,
  getLoginHeaderContainerClasses,
  getLoginHeaderTaglineClasses,
  getLoginHeaderTitleClasses,
  getLoginLoadingAriaLabel,
  getLoginLoadingText,
  getLoginLogoAltText,
  getLoginRegionAriaLabel,
  getLoginTaglineText,
  getLoginTermsNoticeClasses,
  getLoginTermsNoticeText,
  getLoginTitleText,
  getSignInButtonText,
  getSignInContentContainerClasses,
  getSignInFormAriaLabel,
  getSignInFormClasses,
  getSignInPendingText,
  getSignInSpinnerClasses,
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

  it("returns a non-empty localized login logo alt text", () => {
    const alt = getLoginLogoAltText();
    expect(alt).toBe("Padel Red");
  });

  it("returns login container CSS classes", () => {
    const classes = getLoginContainerClasses();
    expect(classes).toContain("min-h-[100dvh]");
    expect(classes).toContain("bg-background");
  });

  it("returns login content container CSS classes", () => {
    const classes = getLoginContentContainerClasses();
    expect(classes).toContain("max-w-sm");
    expect(classes).toContain("flex-col");
  });

  it("returns login terms notice CSS classes", () => {
    const classes = getLoginTermsNoticeClasses();
    expect(classes).toContain("text-xs");
    expect(classes).toContain("text-muted-foreground");
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

  it("returns login header container CSS classes", () => {
    const classes = getLoginHeaderContainerClasses();
    expect(classes).toContain("flex-col");
    expect(classes).toContain("items-center");
    expect(classes).toContain("gap-6");
  });

  it("returns login header title CSS classes", () => {
    const classes = getLoginHeaderTitleClasses();
    expect(classes).toContain("text-3xl");
    expect(classes).toContain("font-bold");
    expect(classes).toContain("text-foreground");
  });

  it("returns login header tagline CSS classes", () => {
    const classes = getLoginHeaderTaglineClasses();
    expect(classes).toContain("text-sm");
    expect(classes).toContain("text-muted-foreground");
    expect(classes).toContain("whitespace-pre-line");
  });

  it("returns login fallback container CSS classes", () => {
    const classes = getLoginFallbackContainerClasses();
    expect(classes).toContain("h-12");
    expect(classes).toContain("rounded-xl");
    expect(classes).toContain("bg-muted");
  });

  it("returns login form container CSS classes", () => {
    const classes = getLoginFormContainerClasses();
    expect(classes).toContain("w-full");
    expect(classes).toContain("flex-col");
    expect(classes).toContain("gap-3");
  });

  it("returns localized sign-in pending text", () => {
    expect(getSignInPendingText()).toBe("Conectando…");
  });

  it("returns correct sign-in button text based on pending state", () => {
    expect(getSignInButtonText(false)).toBe("Continuar con Google");
    expect(getSignInButtonText(false, "Ingresar")).toBe("Ingresar");
    expect(getSignInButtonText(true)).toBe("Conectando…");
    expect(getSignInButtonText(true, "Ingresar")).toBe("Conectando…");
  });

  it("returns sign-in spinner CSS classes", () => {
    const classes = getSignInSpinnerClasses();
    expect(classes).toContain("animate-spin");
    expect(classes).toContain("text-primary-foreground");
  });

  it("returns sign-in content container CSS classes", () => {
    const classes = getSignInContentContainerClasses();
    expect(classes).toContain("items-center");
    expect(classes).toContain("justify-center");
    expect(classes).toContain("gap-2");
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
