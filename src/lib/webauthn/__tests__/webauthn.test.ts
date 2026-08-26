import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "user-123", email: "test@padel.red", displayName: "Padel Player" },
  }),
}));

// Mock database
vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          {
            credentialId: "cred-01",
            nickname: "iPhone Roby",
            deviceType: "singleDevice",
            createdAt: new Date("2026-08-01"),
            transports: ["internal"],
          },
        ]),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockResolvedValue({}),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue({}),
    }),
  },
}));

import { getUserPasskeys, deletePasskey } from "@/lib/webauthn/actions";
import { auth } from "@/auth";

describe("WebAuthn / Passkey Actions Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserPasskeys", () => {
    it("returns empty array when user is unauthenticated", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as any);
      const passkeys = await getUserPasskeys();
      expect(passkeys).toEqual([]);
    });

    it("returns empty array for mock bypass user 'p-01'", async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: "p-01", email: "p-01@test.com" },
      } as any);
      const passkeys = await getUserPasskeys();
      expect(passkeys).toEqual([]);
    });

    it("fetches registered passkeys for authenticated user", async () => {
      const passkeys = await getUserPasskeys();
      expect(passkeys).toHaveLength(1);
      expect(passkeys[0]).toEqual({
        credentialId: "cred-01",
        nickname: "iPhone Roby",
        deviceType: "singleDevice",
        createdAt: new Date("2026-08-01"),
        transports: ["internal"],
      });
    });
  });

  describe("deletePasskey", () => {
    it("returns error object when user is unauthenticated", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as any);
      const result = await deletePasskey("cred-01");
      expect(result).toEqual({ error: "Debés estar logueado." });
    });

    it("returns verified true on successful passkey deletion", async () => {
      const result = await deletePasskey("cred-01");
      expect(result).toEqual({ verified: true });
    });
  });
});
