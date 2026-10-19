import { describe, it, expect } from "vitest";
import {
  getUpdateProfileInvalidAliasLengthResponseBody,
  getUpdateProfileInvalidLevelResponseBody,
  getUpdateProfileSuccessResponseBody,
  getUpdateProfileUnauthorizedResponseBody,
  validateProfileAliasLength,
  validateProfileLevelInput,
} from "../profile-actions-utils";

describe("profile-actions-utils", () => {
  describe("validateProfileLevelInput", () => {
    it("defaults to 6ª Cat when levelInput is undefined or null", () => {
      expect(validateProfileLevelInput(undefined)).toEqual({
        isValid: true,
        level: 6,
      });
      expect(validateProfileLevelInput(null)).toEqual({
        isValid: true,
        level: 6,
      });
    });

    it("accepts valid category levels 1 through 8", () => {
      for (let level = 1; level <= 8; level++) {
        expect(validateProfileLevelInput(level)).toEqual({
          isValid: true,
          level,
        });
      }
    });

    it("rejects level inputs less than 1 or greater than 8", () => {
      const resLow = validateProfileLevelInput(0);
      expect(resLow.isValid).toBe(false);
      expect(resLow.errorMessage).toBe("La categoría debe estar entre 1ª Cat. y 8ª Cat.");

      const resHigh = validateProfileLevelInput(9);
      expect(resHigh.isValid).toBe(false);
      expect(resHigh.errorMessage).toBe("La categoría debe estar entre 1ª Cat. y 8ª Cat.");
    });
  });

  describe("validateProfileAliasLength", () => {
    it("accepts empty alias (will revert to name/email display)", () => {
      expect(validateProfileAliasLength("")).toEqual({ isValid: true });
    });

    it("accepts valid alias lengths within bounds", () => {
      expect(validateProfileAliasLength("PadelKing")).toEqual({ isValid: true });
    });

    it("rejects alias shorter than min length or longer than max length", () => {
      const resShort = validateProfileAliasLength("a");
      expect(resShort.isValid).toBe(false);
      expect(resShort.errorMessage).toBe("El alias debe tener entre 2 y 30 caracteres.");

      const resLong = validateProfileAliasLength("a".repeat(31));
      expect(resLong.isValid).toBe(false);
      expect(resLong.errorMessage).toBe("El alias debe tener entre 2 y 30 caracteres.");
    });
  });

  describe("response payload constructors", () => {
    it("returns unauthorized error response payload", () => {
      expect(getUpdateProfileUnauthorizedResponseBody()).toEqual({
        status: "error",
        message: "Tenés que iniciar sesión.",
      });
    });

    it("returns invalid level error response payload", () => {
      expect(getUpdateProfileInvalidLevelResponseBody()).toEqual({
        status: "error",
        message: "La categoría debe estar entre 1ª Cat. y 8ª Cat.",
      });
    });

    it("returns invalid alias length error response payload", () => {
      expect(getUpdateProfileInvalidAliasLengthResponseBody()).toEqual({
        status: "error",
        message: "El alias debe tener entre 2 y 30 caracteres.",
      });
    });

    it("returns success response payload for profile update", () => {
      expect(
        getUpdateProfileSuccessResponseBody("Bela", "https://img.test/1.jpg", 4, "RIGHT"),
      ).toEqual({
        status: "ok",
        alias: "Bela",
        image: "https://img.test/1.jpg",
        level: 4,
        preferredSide: "RIGHT",
      });
    });
  });
});
