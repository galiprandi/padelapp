import { describe, it, expect } from "vitest";
import {
  DEFAULT_SHARE_SUCCESS,
  DEFAULT_SHARE_COPY,
  DEFAULT_SHARE_ERROR,
  getShareToastMessages,
  getShareButtonLabel,
  getShareButtonAriaLabel,
  formatShareUrl,
} from "../share-utils";

describe("share-utils", () => {
  describe("getShareToastMessages", () => {
    it("returns default toast messages when no custom messages are provided", () => {
      const messages = getShareToastMessages();
      expect(messages).toEqual({
        successMessage: DEFAULT_SHARE_SUCCESS,
        copyMessage: DEFAULT_SHARE_COPY,
        errorMessage: DEFAULT_SHARE_ERROR,
      });
    });

    it("uses custom messages when provided", () => {
      const messages = getShareToastMessages({
        successMessage: "¡Copiado!",
        copyMessage: "Link listo",
        errorMessage: "Error de red",
      });
      expect(messages).toEqual({
        successMessage: "¡Copiado!",
        copyMessage: "Link listo",
        errorMessage: "Error de red",
      });
    });
  });

  describe("getShareButtonLabel", () => {
    it("returns 'Compartiendo...' when isSharing is true", () => {
      expect(getShareButtonLabel({ isSharing: true })).toBe("Compartiendo...");
    });

    it("returns successMessage when isSuccess is true", () => {
      expect(getShareButtonLabel({ isSuccess: true, successMessage: "¡Enviado!" })).toBe("¡Enviado!");
    });

    it("returns default success message when isSuccess is true without custom message", () => {
      expect(getShareButtonLabel({ isSuccess: true })).toBe(DEFAULT_SHARE_SUCCESS);
    });

    it("returns 'Compartir' when idle", () => {
      expect(getShareButtonLabel({})).toBe("Compartir");
    });
  });

  describe("getShareButtonAriaLabel", () => {
    it("returns customAriaLabel when provided", () => {
      expect(
        getShareButtonAriaLabel({ customAriaLabel: "Compartir partido en WhatsApp" }),
      ).toBe("Compartir partido en WhatsApp");
    });

    it("returns computed label for iconOnly buttons", () => {
      expect(getShareButtonAriaLabel({ iconOnly: true, isSharing: true })).toBe("Compartiendo...");
      expect(getShareButtonAriaLabel({ iconOnly: true, isSuccess: true })).toBe(DEFAULT_SHARE_SUCCESS);
      expect(getShareButtonAriaLabel({ iconOnly: true })).toBe("Compartir");
    });

    it("returns undefined for non-iconOnly buttons without custom ARIA label", () => {
      expect(getShareButtonAriaLabel({ iconOnly: false })).toBeUndefined();
    });
  });

  describe("formatShareUrl", () => {
    it("returns raw urlProp when origin is not provided", () => {
      expect(formatShareUrl("/t/123")).toBe("/t/123");
    });

    it("normalizes origin and protocol for absolute cross-origin URLs", () => {
      const formatted = formatShareUrl("http://otherdomain.com/t/123", "https://padelred.com", "https:", "padelred.com");
      expect(formatted).toBe("https://padelred.com/t/123");
    });

    it("handles invalid URLs gracefully by returning urlProp", () => {
      expect(formatShareUrl("http://[invalid-host]", "https://padelred.com")).toBe("http://[invalid-host]");
    });
  });
});
