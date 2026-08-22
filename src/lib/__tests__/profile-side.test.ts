import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "p-01" } }),
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([]),
  },
}));

import { updateUserProfileAction } from "@/app/(app)/me/actions";

describe("updateUserProfileAction preferredSide handling", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, AUTH_BYPASS: "true" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns preferredSide when passed RIGHT", async () => {
    const res = await updateUserProfileAction("agu", null, 6, "RIGHT");
    expect(res.status).toBe("ok");
    if (res.status === "ok") {
      expect(res.preferredSide).toBe("RIGHT");
    }
  });

  it("returns preferredSide when passed LEFT", async () => {
    const res = await updateUserProfileAction("agu", null, 6, "LEFT");
    expect(res.status).toBe("ok");
    if (res.status === "ok") {
      expect(res.preferredSide).toBe("LEFT");
    }
  });

  it("returns preferredSide when passed BOTH", async () => {
    const res = await updateUserProfileAction("agu", null, 6, "BOTH");
    expect(res.status).toBe("ok");
    if (res.status === "ok") {
      expect(res.preferredSide).toBe("BOTH");
    }
  });

  it("returns preferredSide as BOTH when passed null or undefined", async () => {
    const resNull = await updateUserProfileAction("agu", null, 6, null);
    expect(resNull.status).toBe("ok");
    if (resNull.status === "ok") {
      expect(resNull.preferredSide).toBe("BOTH");
    }

    const resUndefined = await updateUserProfileAction("agu", null, 6);
    expect(resUndefined.status).toBe("ok");
    if (resUndefined.status === "ok") {
      expect(resUndefined.preferredSide).toBe("BOTH");
    }
  });
});
