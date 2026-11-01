import { describe, it, expect } from "vitest";
import {
  getBypassAuthSession,
  getLoginContainerClasses,
  getLoginContentContainerClasses,
  getLoginFallbackContainerClasses,
  getLoginFallbackSpinnerClasses,
  getLoginFormContainerClasses,
  getLoginHeaderContainerClasses,
  getLoginHeaderTaglineClasses,
  getLoginHeaderTitleClasses,
  getLoginLoadingAriaLabel,
  getLoginLoadingText,
  getLoginLogoAltText,
  getLoginLogoClasses,
  getLoginRegionAriaLabel,
  getLoginTaglineText,
  getLoginTermsNoticeClasses,
  getLoginTermsNoticeText,
  getLoginTitleGroupClasses,
  getLoginTitleText,
  getLoginLoadingMainClasses,
  getLoginLoadingContentContainerClasses,
  getLoginLoadingHeaderClasses,
  getLoginLoadingTextGroupClasses,
  getLoginLoadingLogoSkeletonClasses,
  getLoginLoadingTitleSkeletonClasses,
  getLoginLoadingSubtitleSkeletonClasses,
  getLoginLoadingCtaContainerClasses,
  getLoginLoadingCtaButtonSkeletonClasses,
  getLoginLoadingTermsSkeletonClasses,
  getLoginLoadingCtaButtonKeys,
  getSignInButtonText,
  getSignInContentContainerClasses,
  getSignInFormAriaLabel,
  getSignInFormClasses,
  getSignInPendingText,
  getSignInSpinnerClasses,
  isPprBailoutError,
  maskSensitiveData,
  resolveDisplayNameFromGoogleProfile,
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

  it("returns login logo CSS classes", () => {
    const classes = getLoginLogoClasses();
    expect(classes).toContain("h-24");
    expect(classes).toContain("w-24");
  });

  it("returns login title group CSS classes", () => {
    const classes = getLoginTitleGroupClasses();
    expect(classes).toContain("space-y-3");
    expect(classes).toContain("text-center");
  });

  it("returns login fallback spinner CSS classes", () => {
    const classes = getLoginFallbackSpinnerClasses();
    expect(classes).toContain("animate-spin");
    expect(classes).toContain("text-primary");
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

describe("LoginLoading skeleton layout & dimensions helpers", () => {
  it("getLoginLoadingMainClasses returns layout classes and handles custom overrides", () => {
    expect(getLoginLoadingMainClasses()).toContain("relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10");
    expect(getLoginLoadingMainClasses("custom-main")).toContain("custom-main");
  });

  it("getLoginLoadingContentContainerClasses returns content wrapper classes and handles custom overrides", () => {
    expect(getLoginLoadingContentContainerClasses()).toContain("flex w-full max-w-sm flex-col items-center gap-12");
    expect(getLoginLoadingContentContainerClasses("custom-box")).toContain("custom-box");
  });

  it("getLoginLoadingHeaderClasses returns header block classes and handles custom overrides", () => {
    expect(getLoginLoadingHeaderClasses()).toContain("flex flex-col items-center gap-6");
    expect(getLoginLoadingHeaderClasses("custom-header")).toContain("custom-header");
  });

  it("getLoginLoadingTextGroupClasses returns text group classes and handles custom overrides", () => {
    expect(getLoginLoadingTextGroupClasses()).toContain("flex flex-col items-center space-y-3 text-center");
    expect(getLoginLoadingTextGroupClasses("custom-txt-grp")).toContain("custom-txt-grp");
  });

  it("getLoginLoadingLogoSkeletonClasses returns logo skeleton dimension classes and handles custom overrides", () => {
    expect(getLoginLoadingLogoSkeletonClasses()).toContain("h-24 w-24 rounded-2xl");
    expect(getLoginLoadingLogoSkeletonClasses("custom-logo")).toContain("custom-logo");
  });

  it("getLoginLoadingTitleSkeletonClasses returns title skeleton dimension classes and handles custom overrides", () => {
    expect(getLoginLoadingTitleSkeletonClasses()).toContain("h-8 w-36 rounded-md");
    expect(getLoginLoadingTitleSkeletonClasses("custom-title")).toContain("custom-title");
  });

  it("getLoginLoadingSubtitleSkeletonClasses returns subtitle skeleton dimension classes and handles custom overrides", () => {
    expect(getLoginLoadingSubtitleSkeletonClasses()).toContain("h-10 w-60 rounded-md");
    expect(getLoginLoadingSubtitleSkeletonClasses("custom-sub")).toContain("custom-sub");
  });

  it("getLoginLoadingCtaContainerClasses returns CTA container classes and handles custom overrides", () => {
    expect(getLoginLoadingCtaContainerClasses()).toContain("flex w-full flex-col gap-3");
    expect(getLoginLoadingCtaContainerClasses("custom-cta-box")).toContain("custom-cta-box");
  });

  it("getLoginLoadingCtaButtonSkeletonClasses returns button skeleton dimension classes and handles custom overrides", () => {
    expect(getLoginLoadingCtaButtonSkeletonClasses()).toContain("h-12 w-full rounded-xl");
    expect(getLoginLoadingCtaButtonSkeletonClasses("custom-cta-btn")).toContain("custom-cta-btn");
  });

  it("getLoginLoadingTermsSkeletonClasses returns terms skeleton dimension classes and handles custom overrides", () => {
    expect(getLoginLoadingTermsSkeletonClasses()).toContain("h-4 w-56 rounded-md");
    expect(getLoginLoadingTermsSkeletonClasses("custom-terms")).toContain("custom-terms");
  });

  it("getLoginLoadingCtaButtonKeys returns array of iteration keys [0, 1]", () => {
    const keys = getLoginLoadingCtaButtonKeys();
    expect(keys).toEqual([0, 1]);
    expect(keys).toHaveLength(2);
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

describe("maskSensitiveData", () => {
  it("returns primitive values unchanged", () => {
    expect(maskSensitiveData(123)).toBe(123);
    expect(maskSensitiveData("hello")).toBe("hello");
    expect(maskSensitiveData(null)).toBe(null);
  });

  it("masks sensitive keys in nested objects and arrays", () => {
    const input = {
      provider: "google",
      sessionToken: "secret123",
      nested: {
        password: "p1",
        user: "john",
      },
      list: [{ token: "t123", public: "yes" }],
    };

    const output = maskSensitiveData(input) as Record<string, unknown>;

    expect(output.provider).toBe("google");
    expect(output.sessionToken).toBe("[REDACTED]");
    expect((output.nested as Record<string, unknown>).password).toBe("[REDACTED]");
    expect((output.nested as Record<string, unknown>).user).toBe("john");
    expect(((output.list as unknown[])[0] as Record<string, unknown>).token).toBe("[REDACTED]");
    expect(((output.list as unknown[])[0] as Record<string, unknown>).public).toBe("yes");
  });
});

describe("resolveDisplayNameFromGoogleProfile", () => {
  it("returns trimmed name if present", () => {
    expect(resolveDisplayNameFromGoogleProfile({ name: " Agustín Tapia " })).toBe("Agustín Tapia");
  });

  it("returns trimmed given_name if name is missing", () => {
    expect(resolveDisplayNameFromGoogleProfile({ given_name: " Arturo " })).toBe("Arturo");
  });

  it("returns email prefix if name and given_name are missing", () => {
    expect(resolveDisplayNameFromGoogleProfile({ email: "galan@padel.com" })).toBe("galan");
  });

  it("returns default fallback 'Jugador' if profile is empty", () => {
    expect(resolveDisplayNameFromGoogleProfile({})).toBe("Jugador");
  });
});

describe("isPprBailoutError", () => {
  it("returns false for non-error values", () => {
    expect(isPprBailoutError("not an error")).toBe(false);
    expect(isPprBailoutError(null)).toBe(false);
  });

  it("returns true for error with NEXT_ digest", () => {
    const err = new Error("Bailout");
    (err as unknown as { digest: string }).digest = "NEXT_PRERENDER_BAILOUT";
    expect(isPprBailoutError(err)).toBe(true);
  });

  it("returns true for error with HANGING_PROMISE_REJECTION digest", () => {
    const err = new Error("Hanging promise");
    (err as unknown as { digest: string }).digest = "HANGING_PROMISE_REJECTION";
    expect(isPprBailoutError(err)).toBe(true);
  });

  it("returns true for prerender header/cookie error messages", () => {
    const err = new Error("During prerendering, `cookies()` rejects access");
    expect(isPprBailoutError(err)).toBe(true);
  });

  it("returns false for standard errors", () => {
    const err = new Error("Database connection failed");
    expect(isPprBailoutError(err)).toBe(false);
  });
});

describe("getBypassAuthSession", () => {
  it("returns mock session payload with default expiration date", () => {
    const session = getBypassAuthSession();
    expect(session.user.id).toBe("p-01");
    expect(session.user.displayName).toBe("Agustín");
    expect(session.user.email).toBe("agu@mock.test");
    expect(session.expires).toBe("2026-12-31T23:59:59.999Z");
  });

  it("supports custom expiration date string", () => {
    const session = getBypassAuthSession("2027-01-01T00:00:00.000Z");
    expect(session.expires).toBe("2027-01-01T00:00:00.000Z");
  });
});
