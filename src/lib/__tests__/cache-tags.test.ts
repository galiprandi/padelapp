import { describe, expect, it } from "vitest";
import {
  CACHE_TAG_MATCHES,
  CACHE_TAG_NETWORK,
  CACHE_TAG_PROFILE,
  CACHE_TAG_RANKING,
  CACHE_TAG_TURNS,
  CACHE_TTL_DYNAMIC,
  CACHE_TTL_FREQUENT,
  CACHE_TTL_STATIC,
  KNOWN_CACHE_TAGS,
  formatCacheInvalidationLogMessage,
  formatCacheKey,
  getCacheRevalidateOptions,
  getCacheRevalidateTTL,
  getCacheTagForDomain,
  getCacheTagsForDomain,
  getCacheTagsSummary,
  isKnownCacheTag,
} from "../cache-tags";

describe("cache-tags utilities", () => {
  describe("getCacheTagsForDomain", () => {
    it("returns all known tags when no domain is provided", () => {
      const tags = getCacheTagsForDomain();
      expect(tags).toEqual([...KNOWN_CACHE_TAGS]);
    });

    it("returns ranking tag for ranking domain", () => {
      expect(getCacheTagsForDomain("ranking")).toEqual([CACHE_TAG_RANKING]);
    });

    it("returns matches tag for matches domain", () => {
      expect(getCacheTagsForDomain("matches")).toEqual([CACHE_TAG_MATCHES]);
    });

    it("returns turns tag for turns domain", () => {
      expect(getCacheTagsForDomain("turns")).toEqual([CACHE_TAG_TURNS]);
    });

    it("returns network and matches tags for network domain", () => {
      expect(getCacheTagsForDomain("network")).toEqual([
        CACHE_TAG_NETWORK,
        CACHE_TAG_MATCHES,
      ]);
    });

    it("returns profile, ranking, and matches tags for profile domain", () => {
      expect(getCacheTagsForDomain("profile")).toEqual([
        CACHE_TAG_PROFILE,
        CACHE_TAG_RANKING,
        CACHE_TAG_MATCHES,
      ]);
    });

    it("returns all tags for 'all' domain", () => {
      expect(getCacheTagsForDomain("all")).toEqual([...KNOWN_CACHE_TAGS]);
    });
  });

  describe("getCacheRevalidateTTL", () => {
    it("returns DEFAULT (60s) when no domain is provided", () => {
      expect(getCacheRevalidateTTL()).toBe(CACHE_TTL_DYNAMIC);
    });

    it("returns 60s for ranking domain", () => {
      expect(getCacheRevalidateTTL("ranking")).toBe(CACHE_TTL_DYNAMIC);
      expect(getCacheRevalidateTTL(CACHE_TAG_RANKING)).toBe(CACHE_TTL_DYNAMIC);
    });

    it("returns 300s for network domain", () => {
      expect(getCacheRevalidateTTL("network")).toBe(300);
      expect(getCacheRevalidateTTL("NETWORK_CONTACTS")).toBe(300);
      expect(getCacheRevalidateTTL(CACHE_TAG_NETWORK)).toBe(300);
    });

    it("returns FREQUENT (10s) for turns and matches domains", () => {
      expect(getCacheRevalidateTTL("turns")).toBe(CACHE_TTL_FREQUENT);
      expect(getCacheRevalidateTTL("matches")).toBe(CACHE_TTL_FREQUENT);
    });

    it("returns STATIC (86400s) for static domain", () => {
      expect(getCacheRevalidateTTL("static")).toBe(CACHE_TTL_STATIC);
    });

    it("returns DYNAMIC (60s) for unknown domains", () => {
      expect(getCacheRevalidateTTL("unknown_domain")).toBe(CACHE_TTL_DYNAMIC);
    });
  });

  describe("formatCacheKey", () => {
    it("formats domain without parts", () => {
      expect(formatCacheKey("turns")).toBe("turns");
    });

    it("formats domain with single primitive part", () => {
      expect(formatCacheKey("turns", "123")).toBe("turns:123");
    });

    it("formats domain with multiple parts and cleans whitespace", () => {
      expect(formatCacheKey(" TURNS ", " user_123 ", 5)).toBe("turns:user_123:5");
    });

    it("filters out null and undefined values", () => {
      expect(formatCacheKey("matches", null, "user_abc", undefined, 10)).toBe(
        "matches:user_abc:10",
      );
    });

    it("handles boolean parts", () => {
      expect(formatCacheKey("ranking", true)).toBe("ranking:true");
    });
  });

  describe("isKnownCacheTag", () => {
    it("returns true for known cache tags", () => {
      expect(isKnownCacheTag(CACHE_TAG_RANKING)).toBe(true);
      expect(isKnownCacheTag(CACHE_TAG_MATCHES)).toBe(true);
      expect(isKnownCacheTag(CACHE_TAG_TURNS)).toBe(true);
      expect(isKnownCacheTag(CACHE_TAG_NETWORK)).toBe(true);
      expect(isKnownCacheTag(CACHE_TAG_PROFILE)).toBe(true);
    });

    it("returns false for non-string or unknown tags", () => {
      expect(isKnownCacheTag("invalid_tag")).toBe(false);
      expect(isKnownCacheTag(null)).toBe(false);
      expect(isKnownCacheTag(123)).toBe(false);
      expect(isKnownCacheTag({})).toBe(false);
    });
  });

  describe("getCacheTagForDomain", () => {
    it("returns primary tag for ranking domain", () => {
      expect(getCacheTagForDomain("ranking")).toBe(CACHE_TAG_RANKING);
    });

    it("returns primary tag for turns domain", () => {
      expect(getCacheTagForDomain("turns")).toBe(CACHE_TAG_TURNS);
    });

    it("returns primary tag for network domain", () => {
      expect(getCacheTagForDomain("network")).toBe(CACHE_TAG_NETWORK);
    });

    it("returns primary tag for profile domain", () => {
      expect(getCacheTagForDomain("profile")).toBe(CACHE_TAG_PROFILE);
    });
  });

  describe("getCacheRevalidateOptions", () => {
    it("returns default revalidate and all tags when no domain is provided", () => {
      const options = getCacheRevalidateOptions();
      expect(options.revalidate).toBe(CACHE_TTL_DYNAMIC);
      expect(options.tags).toEqual([...KNOWN_CACHE_TAGS]);
    });

    it("returns correct TTL and tags for turns domain", () => {
      const options = getCacheRevalidateOptions("turns");
      expect(options.revalidate).toBe(CACHE_TTL_FREQUENT);
      expect(options.tags).toEqual([CACHE_TAG_TURNS]);
    });

    it("returns correct TTL and tags for network domain", () => {
      const options = getCacheRevalidateOptions("network");
      expect(options.revalidate).toBe(300);
      expect(options.tags).toEqual([CACHE_TAG_NETWORK, CACHE_TAG_MATCHES]);
    });
  });

  describe("formatCacheInvalidationLogMessage", () => {
    it("returns fallback message when tags array is empty", () => {
      expect(formatCacheInvalidationLogMessage([])).toBe(
        "Sin etiquetas de caché para revalidar.",
      );
    });

    it("returns fallback message with reason when tags array is empty", () => {
      expect(
        formatCacheInvalidationLogMessage([], "actualización de resultado"),
      ).toBe("Sin etiquetas de caché para revalidar — Razón: actualización de resultado");
    });

    it("formats message for a single tag", () => {
      expect(formatCacheInvalidationLogMessage(["turns"])).toBe(
        "Revalidando 1 etiqueta de caché (turns).",
      );
    });

    it("formats message for multiple tags with custom reason", () => {
      expect(
        formatCacheInvalidationLogMessage(
          ["turns", "matches"],
          "nuevo partido registrado",
        ),
      ).toBe(
        "Revalidando 2 etiquetas de caché (turns, matches) — Razón: nuevo partido registrado",
      );
    });
  });

  describe("getCacheTagsSummary", () => {
    it("returns empty summary when tags is invalid or empty", () => {
      const summary = getCacheTagsSummary([]);
      expect(summary).toEqual({
        knownCount: 0,
        unknownCount: 0,
        knownTags: [],
        unknownTags: [],
      });
    });

    it("classifies known and unknown tags correctly and deduplicates", () => {
      const summary = getCacheTagsSummary([
        CACHE_TAG_TURNS,
        CACHE_TAG_MATCHES,
        "custom_tag",
        CACHE_TAG_TURNS,
        "custom_tag",
      ]);

      expect(summary.knownCount).toBe(2);
      expect(summary.unknownCount).toBe(1);
      expect(summary.knownTags).toEqual([CACHE_TAG_TURNS, CACHE_TAG_MATCHES]);
      expect(summary.unknownTags).toEqual(["custom_tag"]);
    });
  });
});
