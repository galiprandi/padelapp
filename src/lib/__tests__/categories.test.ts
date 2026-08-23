import { describe, it, expect } from "vitest";
import { CATEGORIES, getCategoryDefinition } from "@/lib/constants/categories";

describe("categories constants and helper", () => {
  it("contains all 8 categories from 1ª Cat. to 8ª Cat.", () => {
    expect(CATEGORIES).toHaveLength(8);
    expect(CATEGORIES.map((c) => c.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(CATEGORIES.map((c) => c.shortLabel)).toEqual([
      "1ª Cat.",
      "2ª Cat.",
      "3ª Cat.",
      "4ª Cat.",
      "5ª Cat.",
      "6ª Cat.",
      "7ª Cat.",
      "8ª Cat.",
    ]);
  });

  it("returns correct CategoryDefinition for valid level integers", () => {
    const cat1 = getCategoryDefinition(1);
    expect(cat1.shortLabel).toBe("1ª Cat.");
    expect(cat1.label).toBe("1ª Categoría");
    expect(cat1.description).toContain("profesional");

    const cat6 = getCategoryDefinition(6);
    expect(cat6.shortLabel).toBe("6ª Cat.");
    expect(cat6.label).toBe("6ª Categoría");

    const cat8 = getCategoryDefinition(8);
    expect(cat8.shortLabel).toBe("8ª Cat.");
    expect(cat8.label).toBe("8ª Categoría");
    expect(cat8.description).toContain("iniciación");
  });

  it("defaults to 6ª Cat. for invalid, null or out-of-range level inputs", () => {
    expect(getCategoryDefinition(null).shortLabel).toBe("6ª Cat.");
    expect(getCategoryDefinition(undefined).shortLabel).toBe("6ª Cat.");
    expect(getCategoryDefinition(0).shortLabel).toBe("6ª Cat.");
    expect(getCategoryDefinition(9).shortLabel).toBe("6ª Cat.");
    expect(getCategoryDefinition(-1).shortLabel).toBe("6ª Cat.");
  });

  it("ensures every category has a non-empty description and valid structure", () => {
    for (const cat of CATEGORIES) {
      expect(cat.level).toBeGreaterThanOrEqual(1);
      expect(cat.level).toBeLessThanOrEqual(8);
      expect(cat.shortLabel).toMatch(/^[1-8]ª Cat\.$/);
      expect(cat.label).toMatch(/^[1-8]ª Categoría$/);
      expect(cat.description.length).toBeGreaterThan(10);
    }
  });
});
