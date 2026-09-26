import { describe, it, expect } from "vitest";
import {
  DEFAULT_PERMISSIONS_POLICY,
  getContentSecurityPolicy,
  getPermissionsPolicy,
  getSecurityHeaders,
} from "../security-headers";

describe("security-headers", () => {
  describe("getPermissionsPolicy", () => {
    it("debe retornar la política de permisos predeterminada del navegador", () => {
      const policy = getPermissionsPolicy();
      expect(policy).toBe(DEFAULT_PERMISSIONS_POLICY);
      expect(policy).toContain("camera=()");
      expect(policy).toContain("microphone=()");
      expect(policy).toContain("geolocation=()");
      expect(policy).toContain("interest-cohort=()");
    });
  });

  describe("getContentSecurityPolicy", () => {
    it("debe generar la directiva CSP para producción sin 'unsafe-eval'", () => {
      const csp = getContentSecurityPolicy(false);

      expect(csp).not.toContain("'unsafe-eval'");
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("img-src 'self' data: blob: https://lh3.googleusercontent.com");
      expect(csp).toContain("script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com");
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
      expect(csp).toContain("connect-src 'self' https://www.googleapis.com https://identity.googleapis.com https://firebaseinstallations.googleapis.com https://fcm.googleapis.com https://fcmregistrations.googleapis.com https://va.vercel-scripts.com");
      expect(csp).toContain("frame-src 'self' https://accounts.google.com");
      expect(csp).toContain("font-src 'self' data:");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self' https://accounts.google.com");
    });

    it("debe incluir 'unsafe-eval' en script-src en modo desarrollo", () => {
      const csp = getContentSecurityPolicy(true);

      expect(csp).toContain("'unsafe-eval'");
      expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://va.vercel-scripts.com");
    });

    it("debe asumir producción por defecto si no se pasa isDev", () => {
      const csp = getContentSecurityPolicy();

      expect(csp).not.toContain("'unsafe-eval'");
    });
  });

  describe("getSecurityHeaders", () => {
    it("debe retornar un arreglo con las 5 cabeceras de seguridad requeridas", () => {
      const headers = getSecurityHeaders(false);

      expect(headers).toHaveLength(5);

      const headerKeys = headers.map((h) => h.key);
      expect(headerKeys).toEqual([
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "Permissions-Policy",
        "Content-Security-Policy",
      ]);
    });

    it("debe configurar X-Frame-Options en DENY", () => {
      const headers = getSecurityHeaders(false);
      const frameOptions = headers.find((h) => h.key === "X-Frame-Options");
      expect(frameOptions?.value).toBe("DENY");
    });

    it("debe configurar X-Content-Type-Options en nosniff", () => {
      const headers = getSecurityHeaders(false);
      const contentTypeOptions = headers.find((h) => h.key === "X-Content-Type-Options");
      expect(contentTypeOptions?.value).toBe("nosniff");
    });

    it("debe configurar Referrer-Policy en strict-origin-when-cross-origin", () => {
      const headers = getSecurityHeaders(false);
      const referrerPolicy = headers.find((h) => h.key === "Referrer-Policy");
      expect(referrerPolicy?.value).toBe("strict-origin-when-cross-origin");
    });

    it("debe aplicar la configuración CSP correcta para entornos de desarrollo y producción", () => {
      const devHeaders = getSecurityHeaders(true);
      const prodHeaders = getSecurityHeaders(false);

      const devCsp = devHeaders.find((h) => h.key === "Content-Security-Policy")?.value;
      const prodCsp = prodHeaders.find((h) => h.key === "Content-Security-Policy")?.value;

      expect(devCsp).toContain("'unsafe-eval'");
      expect(prodCsp).not.toContain("'unsafe-eval'");
    });
  });
});
