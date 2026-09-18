import { describe, it, expect } from "vitest";
import {
  DEFAULT_RESOURCE_HINT_DOMAINS,
  getResourceHints,
  getOriginTrialMetaProps,
} from "../resource-hints";

describe("resource-hints", () => {
  describe("DEFAULT_RESOURCE_HINT_DOMAINS", () => {
    it("debe contener el dominio de avatares de Google por defecto", () => {
      expect(DEFAULT_RESOURCE_HINT_DOMAINS).toContain("https://lh3.googleusercontent.com");
    });
  });

  describe("getResourceHints", () => {
    it("debe retornar pistas preconnect y dns-prefetch para los dominios por defecto", () => {
      const hints = getResourceHints();
      expect(hints).toEqual([
        {
          rel: "preconnect",
          href: "https://lh3.googleusercontent.com",
        },
        {
          rel: "dns-prefetch",
          href: "https://lh3.googleusercontent.com",
        },
      ]);
    });

    it("debe generar pistas para dominios personalizados", () => {
      const customDomains = ["https://images.example.com", "https://cdn.example.com"];
      const hints = getResourceHints(customDomains);

      expect(hints).toHaveLength(4);
      expect(hints[0]).toEqual({
        rel: "preconnect",
        href: "https://images.example.com",
      });
      expect(hints[1]).toEqual({
        rel: "dns-prefetch",
        href: "https://images.example.com",
      });
      expect(hints[2]).toEqual({
        rel: "preconnect",
        href: "https://cdn.example.com",
      });
      expect(hints[3]).toEqual({
        rel: "dns-prefetch",
        href: "https://cdn.example.com",
      });
    });

    it("debe ignorar valores vacíos, nulos o con solo espacios", () => {
      // @ts-expect-error testing invalid inputs
      const hints = getResourceHints(["https://lh3.googleusercontent.com", "", "   ", null, undefined]);

      expect(hints).toEqual([
        {
          rel: "preconnect",
          href: "https://lh3.googleusercontent.com",
        },
        {
          rel: "dns-prefetch",
          href: "https://lh3.googleusercontent.com",
        },
      ]);
    });
  });

  describe("getOriginTrialMetaProps", () => {
    it("debe retornar la estructura de objeto para meta http-equiv='origin-trial' cuando se provee un token válido", () => {
      const token = "sample-origin-trial-token-12345";
      const props = getOriginTrialMetaProps(token);

      expect(props).toEqual({
        "http-equiv": "origin-trial",
        content: "sample-origin-trial-token-12345",
      });
    });

    it("debe hacer trim del token si contiene espacios al inicio o final", () => {
      const token = "   sample-token   ";
      const props = getOriginTrialMetaProps(token);

      expect(props).toEqual({
        "http-equiv": "origin-trial",
        content: "sample-token",
      });
    });

    it("debe retornar null para token indefinido, nulo o vacío", () => {
      expect(getOriginTrialMetaProps(undefined)).toBeNull();
      expect(getOriginTrialMetaProps(null)).toBeNull();
      expect(getOriginTrialMetaProps("")).toBeNull();
      expect(getOriginTrialMetaProps("   ")).toBeNull();
    });
  });
});
