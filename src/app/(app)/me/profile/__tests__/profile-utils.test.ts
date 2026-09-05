import { describe, it, expect } from "vitest";
import {
  validateAlias,
  getNextSideOption,
  getNextCategoryLevel,
  getSideOptionLabel,
  getInitials,
  MIN_ALIAS_LENGTH,
  MAX_ALIAS_LENGTH,
} from "../profile-utils";

describe("validateAlias", () => {
  it("allows empty or whitespace-only alias strings without validation error", () => {
    expect(validateAlias("")).toBeNull();
    expect(validateAlias("   ")).toBeNull();
  });

  it("returns an error for aliases shorter than MIN_ALIAS_LENGTH", () => {
    expect(validateAlias("A")).toBe(`Usá entre ${MIN_ALIAS_LENGTH} y ${MAX_ALIAS_LENGTH} caracteres.`);
  });

  it("returns an error for aliases longer than MAX_ALIAS_LENGTH", () => {
    const longAlias = "A".repeat(MAX_ALIAS_LENGTH + 1);
    expect(validateAlias(longAlias)).toBe(`Usá entre ${MIN_ALIAS_LENGTH} y ${MAX_ALIAS_LENGTH} caracteres.`);
  });

  it("returns an error for aliases with invalid characters", () => {
    expect(validateAlias("Gero_01")).toBe("El alias solo puede tener letras, números, espacios y guiones.");
    expect(validateAlias("Muro!")).toBe("El alias solo puede tener letras, números, espacios y guiones.");
    expect(validateAlias("Padel@Red")).toBe("El alias solo puede tener letras, números, espacios y guiones.");
  });

  it("accepts valid aliases with letters, numbers, accents, spaces, and hyphens", () => {
    expect(validateAlias("El Muro")).toBeNull();
    expect(validateAlias("Gero-01")).toBeNull();
    expect(validateAlias("María José")).toBeNull();
    expect(validateAlias("Ñandú 10")).toBeNull();
  });
});

describe("getNextSideOption", () => {
  it("cycles forward on ArrowRight and ArrowDown", () => {
    expect(getNextSideOption("RIGHT", "ArrowRight")).toBe("LEFT");
    expect(getNextSideOption("LEFT", "ArrowDown")).toBe("BOTH");
    expect(getNextSideOption("BOTH", "ArrowRight")).toBe("RIGHT");
  });

  it("cycles backward on ArrowLeft and ArrowUp", () => {
    expect(getNextSideOption("RIGHT", "ArrowLeft")).toBe("BOTH");
    expect(getNextSideOption("BOTH", "ArrowUp")).toBe("LEFT");
    expect(getNextSideOption("LEFT", "ArrowLeft")).toBe("RIGHT");
  });

  it("returns null for non-navigation keys", () => {
    expect(getNextSideOption("RIGHT", "Enter")).toBeNull();
    expect(getNextSideOption("RIGHT", "Tab")).toBeNull();
    expect(getNextSideOption("RIGHT", "Escape")).toBeNull();
  });
});

describe("getNextCategoryLevel", () => {
  it("cycles forward through category levels 1 through 8", () => {
    expect(getNextCategoryLevel(1, "ArrowRight")).toBe(2);
    expect(getNextCategoryLevel(6, "ArrowDown")).toBe(7);
    expect(getNextCategoryLevel(8, "ArrowRight")).toBe(1);
  });

  it("cycles backward through category levels 1 through 8", () => {
    expect(getNextCategoryLevel(1, "ArrowLeft")).toBe(8);
    expect(getNextCategoryLevel(6, "ArrowUp")).toBe(5);
    expect(getNextCategoryLevel(8, "ArrowLeft")).toBe(7);
  });

  it("returns null for non-navigation keys", () => {
    expect(getNextCategoryLevel(6, "Enter")).toBeNull();
    expect(getNextCategoryLevel(6, "Space")).toBeNull();
  });
});

describe("getSideOptionLabel", () => {
  it("returns correct localized Argentine Spanish labels for court sides", () => {
    expect(getSideOptionLabel("RIGHT")).toBe("Derecha");
    expect(getSideOptionLabel("LEFT")).toBe("Revés");
    expect(getSideOptionLabel("BOTH")).toBe("Ambos lados");
    expect(getSideOptionLabel(null)).toBe("Sin preferencia");
  });
});

describe("getInitials", () => {
  it("returns first two letters for single-word names", () => {
    expect(getInitials("Agustín")).toBe("AG");
  });

  it("returns first and last initials for multi-word names", () => {
    expect(getInitials("Fernando Belasteguín")).toBe("FB");
    expect(getInitials("Juan Martín Díaz")).toBe("JD");
  });

  it("returns empty string for null or empty input", () => {
    expect(getInitials(null)).toBe("");
    expect(getInitials("")).toBe("");
  });
});
