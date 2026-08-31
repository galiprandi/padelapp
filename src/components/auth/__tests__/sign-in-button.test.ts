import { describe, it, expect } from "vitest";
import {
  DEFAULT_SIGN_IN_LABEL,
  PENDING_SIGN_IN_LABEL,
  getSignInButtonClasses,
  getSignInButtonAriaProps,
} from "../sign-in-button";

describe("SignInButton MDS and Accessibility Module Exports", () => {
  it("exports standard default and pending label constants", () => {
    expect(DEFAULT_SIGN_IN_LABEL).toBe("Continuar con Google");
    expect(PENDING_SIGN_IN_LABEL).toBe("Conectando con Google...");
  });

  it("computes dynamic ARIA accessibility attributes for idle vs pending states", () => {
    const idleProps = getSignInButtonAriaProps(false, "Comenzar ahora");
    expect(idleProps).toEqual({
      "aria-busy": false,
      "aria-label": "Comenzar ahora",
    });

    const pendingProps = getSignInButtonAriaProps(true, "Comenzar ahora");
    expect(pendingProps).toEqual({
      "aria-busy": true,
      "aria-label": "Conectando con Google...",
    });
  });

  it("generates MDS button classes with tactile press scaling and focus ring offsets", () => {
    const classes = getSignInButtonClasses();

    expect(classes).toContain("active:scale-[0.98]");
    expect(classes).toContain("transition-all");
    expect(classes).toContain("ring-offset-background");
    expect(classes).toContain("focus-visible:ring-2");
    expect(classes).toContain("h-12");
  });

  it("merges custom className without stripping base tactile and focus ring styles", () => {
    const customClasses = getSignInButtonClasses("mt-4 shadow-md");

    expect(customClasses).toContain("active:scale-[0.98]");
    expect(customClasses).toContain("focus-visible:ring-offset-2");
    expect(customClasses).toContain("mt-4");
    expect(customClasses).toContain("shadow-md");
  });
});
