import { describe, it, expect } from "vitest";
import { sanitizePrivateKey } from "@/lib/firebase-admin";

const VALID_KEY_BODY = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAkIB";

describe("sanitizePrivateKey", () => {
  it("converts literal \\n to actual newlines", () => {
    const raw = `-----BEGIN PRIVATE KEY-----\\n${VALID_KEY_BODY}\\n-----END PRIVATE KEY-----`;
    const result = sanitizePrivateKey(raw);
    expect(result).toContain("\n");
    expect(result).not.toContain("\\n");
  });

  it("preserves actual newlines", () => {
    const raw = `-----BEGIN PRIVATE KEY-----\n${VALID_KEY_BODY}\n-----END PRIVATE KEY-----`;
    const result = sanitizePrivateKey(raw);
    expect(result).toContain("\n");
    expect(result.split("\n")).toHaveLength(3);
  });

  it("strips surrounding double quotes", () => {
    const raw = `"-----BEGIN PRIVATE KEY-----\n${VALID_KEY_BODY}\n-----END PRIVATE KEY-----"`;
    const result = sanitizePrivateKey(raw);
    expect(result).not.toMatch(/^"/);
    expect(result).not.toMatch(/"$/);
  });

  it("strips surrounding single quotes", () => {
    const raw = `'-----BEGIN PRIVATE KEY-----\n${VALID_KEY_BODY}\n-----END PRIVATE KEY-----'`;
    const result = sanitizePrivateKey(raw);
    expect(result).not.toMatch(/^'/);
    expect(result).not.toMatch(/'$/);
  });

  it("removes stray \\r characters", () => {
    const raw = `-----BEGIN PRIVATE KEY-----\r\n${VALID_KEY_BODY}\r\n-----END PRIVATE KEY-----`;
    const result = sanitizePrivateKey(raw);
    expect(result).not.toContain("\r");
  });

  it("collapses multiple consecutive newlines into one", () => {
    const raw = `-----BEGIN PRIVATE KEY-----\n\n\n${VALID_KEY_BODY}\n\n-----END PRIVATE KEY-----`;
    const result = sanitizePrivateKey(raw);
    expect(result).not.toMatch(/\n{2,}/);
  });

  it("trims each line", () => {
    const raw = `-----BEGIN PRIVATE KEY-----\n  ${VALID_KEY_BODY}  \n-----END PRIVATE KEY-----`;
    const result = sanitizePrivateKey(raw);
    const lines = result.split("\n");
    expect(lines[1]).toBe(VALID_KEY_BODY);
  });

  it("filters out empty lines", () => {
    const raw = `-----BEGIN PRIVATE KEY-----\n\n\n${VALID_KEY_BODY}\n\n\n-----END PRIVATE KEY-----`;
    const result = sanitizePrivateKey(raw);
    const lines = result.split("\n");
    expect(lines.every((l) => l.length > 0)).toBe(true);
  });

  it("trims leading/trailing whitespace from the whole key", () => {
    const raw = `  -----BEGIN PRIVATE KEY-----\n${VALID_KEY_BODY}\n-----END PRIVATE KEY-----  `;
    const result = sanitizePrivateKey(raw);
    expect(result).toMatch(/^-----BEGIN/);
    expect(result).toMatch(/END PRIVATE KEY-----$/);
  });
});
