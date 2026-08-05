import { describe, it, expect } from "vitest";
import {
  generateMagicToken,
  getMagicLinkBaseUrl,
  createMagicLink,
  MAGIC_LINK_PATHS,
} from "@/lib/magic-link";

describe("generateMagicToken", () => {
  it("generates a token of default length (12)", () => {
    const token = generateMagicToken();
    expect(token).toHaveLength(12);
  });

  it("generates a token of custom length", () => {
    const token = generateMagicToken(20);
    expect(token).toHaveLength(20);
  });

  it("throws for length <= 0", () => {
    expect(() => generateMagicToken(0)).toThrow("token length must be greater than zero");
    expect(() => generateMagicToken(-1)).toThrow("token length must be greater than zero");
  });

  it("only uses characters from the safe alphabet (no 0, O, I, l)", () => {
    const token = generateMagicToken(100);
    const safeAlphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    for (const char of token) {
      expect(safeAlphabet).toContain(char);
    }
  });

  it("generates different tokens on subsequent calls (randomness)", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 20; i++) {
      tokens.add(generateMagicToken());
    }
    // At least 18 out of 20 should be unique (extremely high probability)
    expect(tokens.size).toBeGreaterThanOrEqual(18);
  });
});

describe("getMagicLinkBaseUrl", () => {
  it("uses explicit override with https", () => {
    expect(getMagicLinkBaseUrl("https://padelred.app")).toBe("https://padelred.app/");
  });

  it("adds https:// prefix if missing", () => {
    expect(getMagicLinkBaseUrl("padelred.app")).toBe("https://padelred.app/");
  });

  it("preserves http:// prefix", () => {
    expect(getMagicLinkBaseUrl("http://localhost:3000")).toBe("http://localhost:3000/");
  });

  it("does not add trailing slash if already present", () => {
    expect(getMagicLinkBaseUrl("https://padelred.app/")).toBe("https://padelred.app/");
  });

  it("falls back to localhost when no override and no env var", () => {
    const original = process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(getMagicLinkBaseUrl()).toBe("http://localhost:3000/");
    process.env.NEXT_PUBLIC_APP_URL = original;
  });

  it("uses NEXT_PUBLIC_APP_URL env var when no override", () => {
    const original = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://staging.padelred.app";
    expect(getMagicLinkBaseUrl()).toBe("https://staging.padelred.app/");
    process.env.NEXT_PUBLIC_APP_URL = original;
  });
});

describe("createMagicLink", () => {
  it("creates a link for a match resource", () => {
    const result = createMagicLink({
      resource: "match",
      identifier: "abc123",
      baseUrl: "https://padelred.app",
    });
    expect(result.url).toBe("https://padelred.app/m/abc123");
    expect(result.identifier).toBe("abc123");
  });

  it("creates a link for a turn resource", () => {
    const result = createMagicLink({
      resource: "turn",
      identifier: "xyz789",
      baseUrl: "https://padelred.app",
    });
    expect(result.url).toBe("https://padelred.app/t/xyz789");
  });

  it("creates a link for a player resource", () => {
    const result = createMagicLink({
      resource: "player",
      identifier: "player1",
      baseUrl: "https://padelred.app",
    });
    expect(result.url).toBe("https://padelred.app/j/player1");
  });

  it("creates a link for a user resource", () => {
    const result = createMagicLink({
      resource: "user",
      identifier: "user1",
      baseUrl: "https://padelred.app",
    });
    expect(result.url).toBe("https://padelred.app/u/user1");
  });

  it("generates a random identifier when none provided", () => {
    const result = createMagicLink({
      resource: "match",
      baseUrl: "https://padelred.app",
    });
    expect(result.identifier).toHaveLength(12);
    expect(result.url).toContain(result.identifier);
  });

  it("appends extra segments", () => {
    const result = createMagicLink({
      resource: "match",
      identifier: "abc123",
      extraSegments: ["result"],
      baseUrl: "https://padelred.app",
    });
    expect(result.url).toBe("https://padelred.app/m/abc123/result");
  });

  it("skips empty extra segments", () => {
    const result = createMagicLink({
      resource: "match",
      identifier: "abc123",
      extraSegments: ["", "  ", "result"],
      baseUrl: "https://padelred.app",
    });
    expect(result.url).toBe("https://padelred.app/m/abc123/result");
  });

  it("appends query params", () => {
    const result = createMagicLink({
      resource: "match",
      identifier: "abc123",
      query: { from: "whatsapp", invite: 1 },
      baseUrl: "https://padelred.app",
    });
    expect(result.url).toContain("from=whatsapp");
    expect(result.url).toContain("invite=1");
  });

  it("skips null and undefined query values", () => {
    const result = createMagicLink({
      resource: "match",
      identifier: "abc123",
      query: { from: "whatsapp", skip: null, also: undefined },
      baseUrl: "https://padelred.app",
    });
    expect(result.url).toContain("from=whatsapp");
    expect(result.url).not.toContain("skip");
    expect(result.url).not.toContain("also");
  });

  it("handles custom (unknown) resource paths", () => {
    const result = createMagicLink({
      resource: "custom-path",
      identifier: "abc123",
      baseUrl: "https://padelred.app",
    });
    expect(result.url).toBe("https://padelred.app/custom-path/abc123");
  });

  it("MAGIC_LINK_PATHS maps all known resources", () => {
    expect(MAGIC_LINK_PATHS.match).toBe("m");
    expect(MAGIC_LINK_PATHS.player).toBe("j");
    expect(MAGIC_LINK_PATHS.turn).toBe("t");
    expect(MAGIC_LINK_PATHS.user).toBe("u");
    expect(MAGIC_LINK_PATHS.ranking).toBe("ranking");
    expect(MAGIC_LINK_PATHS.comment).toBe("c");
  });
});
