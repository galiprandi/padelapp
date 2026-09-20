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
  formatCacheKey,
  getCacheRevalidateTTL,
  getCacheTagsForDomain,
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
});
