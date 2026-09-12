import { describe, it, expect, vi } from "vitest";
import { getCachedTurnById, getCachedOpenTurns } from "@/lib/queries/turn";

vi.mock("next/cache", () => ({
  // Mirrors the real unstable_cache contract: values crossing the cache
  // boundary are JSON-serialized. If these queries are ever moved back from
  // "use cache" to unstable_cache, Date fields arrive as strings and these
  // tests fail — that is the regression net for the /t/[id] crash.
  unstable_cache:
    (fn: (...args: unknown[]) => Promise<unknown>) =>
    async (...args: unknown[]) =>
      JSON.parse(JSON.stringify(await fn(...args))),
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
  revalidateTag: vi.fn(),
}));

describe("cached turn queries preserve Date instances", () => {
  it("getCachedTurnById returns real Date for date and players joinedAt", async () => {
    process.env.AUTH_BYPASS = "true";
    const turn = await getCachedTurnById("turn-01");
    expect(turn).not.toBeNull();
    expect(turn!.date).toBeInstanceOf(Date);
    expect(turn!.players.length).toBeGreaterThan(0);
    for (const p of turn!.players) {
      expect(p.joinedAt).toBeInstanceOf(Date);
    }
  });

  it("getCachedOpenTurns returns real Date for date and players joinedAt", async () => {
    process.env.AUTH_BYPASS = "true";
    const turns = await getCachedOpenTurns();
    expect(turns.length).toBeGreaterThan(0);
    expect(turns[0].date).toBeInstanceOf(Date);
    for (const p of turns[0].players) {
      expect(p.joinedAt).toBeInstanceOf(Date);
    }
  });
});
