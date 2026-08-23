import { describe, it, expect, vi } from "vitest";
import { getRecencyWeight, applyFeedbackToScore } from "@/lib/graph/engine";

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
  revalidateTag: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockImplementation(() => []),
  },
}));

process.env.AUTH_BYPASS = "true";

describe("getRecencyWeight", () => {
  it("returns 0.5 for null date", () => {
    expect(getRecencyWeight(null)).toBe(0.5);
  });

  it("returns 1.0 for a match within the last 30 days", () => {
    const recent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    expect(getRecencyWeight(recent)).toBe(1.0);
  });

  it("returns 1.0 for a match today", () => {
    expect(getRecencyWeight(new Date())).toBe(1.0);
  });

  it("returns 0.75 for a match 30-60 days ago", () => {
    const date = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
    expect(getRecencyWeight(date)).toBe(0.75);
  });

  it("returns 0.5 for a match 60-120 days ago", () => {
    const date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
    expect(getRecencyWeight(date)).toBe(0.5);
  });

  it("returns 0.25 for a match more than 120 days ago", () => {
    const date = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000); // 200 days ago
    expect(getRecencyWeight(date)).toBe(0.25);
  });

  it("returns 0.25 for a very old match (1 year)", () => {
    const date = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    expect(getRecencyWeight(date)).toBe(0.25);
  });

  it("handles boundary: exactly 30 days ago (returns 0.75)", () => {
    const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    expect(getRecencyWeight(date)).toBe(0.75);
  });

  it("handles boundary: exactly 60 days ago (returns 0.5)", () => {
    const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    expect(getRecencyWeight(date)).toBe(0.5);
  });

  it("handles boundary: exactly 120 days ago (returns 0.25)", () => {
    const date = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
    expect(getRecencyWeight(date)).toBe(0.25);
  });
});

import { getPlayersLikeYouAction } from "@/app/network/actions";

describe("getPlayersLikeYouAction", () => {
  it("returns mock recommended player Facundo Lopez for viewer under mock/bypass conditions", async () => {
    const result = await getPlayersLikeYouAction("p-01");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "p-04",
      name: "Facundo Lopez",
      alias: "Facu",
      image: null,
      skillScore: 1020,
      preferredSide: "LEFT",
      matchesPlayed: 6,
    });
  });

  it("returns mock recommended player for a brand new user under mock/bypass conditions", async () => {
    const result = await getPlayersLikeYouAction("p-99");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("p-04");
  });

  it("returns non-self mock recommended player when viewer is p-04 under mock/bypass conditions", async () => {
    const result = await getPlayersLikeYouAction("p-04");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("p-01");
    expect(result[0].name).toBe("Agustín Aliprandi");
  });
});

import { getCachedTurnNetworkContacts, getPlayerNetworkStats, getPublicProfileUser } from "@/lib/queries";

describe("getCachedTurnNetworkContacts", () => {
  it("returns mock network contacts under bypass/mock conditions", async () => {
    const result = await getCachedTurnNetworkContacts("turn-01");
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("p-03");
    expect(result[0].alias).toBe("Gero");
    expect(result[1].id).toBe("p-04");
    expect(result[1].alias).toBe("Facu");
  });
});

describe("getPlayerNetworkStats and getPublicProfileUser", () => {
  it("returns full player network stats with frequent rival and successful partner under bypass mode", async () => {
    const stats = await getPlayerNetworkStats("p-01");
    expect(stats.preferredSide).toBe("RIGHT");
    expect(stats.networkSize).toBe(12);
    expect(stats.frequentRival?.user?.displayName).toBe("Fernando Belasteguín");
    expect(stats.frequentRival?.matches).toBe(5);
    expect(stats.successfulPartner?.user?.displayName).toBe("Facundo Lopez");
    expect(stats.successfulPartner?.wins).toBe(4);
  });

  it("returns opposite frequent rival for p-02 under bypass mode", async () => {
    const stats = await getPlayerNetworkStats("p-02");
    expect(stats.preferredSide).toBe("LEFT");
    expect(stats.frequentRival?.user?.displayName).toBe("Agustín Aliprandi");
  });

  it("returns mock public profile user details", async () => {
    const profile = await getPublicProfileUser("p-01");
    expect(profile).not.toBeNull();
    expect(profile?.displayName).toBe("Agustín");
    expect(profile?.rankingPosition).toBe(2);
  });
});

import { db } from "@/db";

describe("applyFeedbackToScore", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedDb = db as any;

  it("returns current score unchanged when there are no feedback records", async () => {
    mockedDb.where.mockResolvedValueOnce([]);
    const score = await applyFeedbackToScore("user-1", 1000);
    expect(score).toBe(1000);
  });

  it("increases score for net positive STRONGER feedback", async () => {
    mockedDb.where.mockResolvedValueOnce([
      { feedback: "STRONGER" },
      { feedback: "STRONGER" },
    ]);
    // totalFeedback = 2, feedbackWeight = 2/5 = 0.4, signal = 1.0
    // adjustment = 1.0 * 100 * 0.4 = +40
    const score = await applyFeedbackToScore("user-1", 1000);
    expect(score).toBe(1040);
  });

  it("decreases score for net negative WEAKER feedback", async () => {
    mockedDb.where.mockResolvedValueOnce([
      { feedback: "WEAKER" },
      { feedback: "WEAKER" },
      { feedback: "WEAKER" },
    ]);
    // totalFeedback = 3, feedbackWeight = 3/5 = 0.6, signal = -1.0
    // adjustment = -1.0 * 100 * 0.6 = -60
    const score = await applyFeedbackToScore("user-1", 1000);
    expect(score).toBe(940);
  });

  it("handles balanced feedback (equal STRONGER and WEAKER)", async () => {
    mockedDb.where.mockResolvedValueOnce([
      { feedback: "STRONGER" },
      { feedback: "WEAKER" },
    ]);
    // signal = 0
    const score = await applyFeedbackToScore("user-1", 1000);
    expect(score).toBe(1000);
  });
});

import {
  calculateConnectionRecord,
  normalizeSearchQuery,
  filterLinksBySelectedNode,
} from "@/app/network/graph-utils";
import type { GraphLink } from "@/app/network/actions";

describe("normalizeSearchQuery", () => {
  it("trims whitespace, converts to lowercase, and strips diacritics", () => {
    expect(normalizeSearchQuery("  Agustín  ")).toBe("agustin");
    expect(normalizeSearchQuery("BELA")).toBe("bela");
    expect(normalizeSearchQuery("Facundo López ")).toBe("facundo lopez");
  });
});

describe("filterLinksBySelectedNode", () => {
  const links: GraphLink[] = [
    {
      source: "p-01",
      target: "p-02",
      rivalMatches: 1,
      partnerMatches: 0,
      winsA: 1,
      winsB: 0,
      winsTogether: 0,
      lossesTogether: 0,
      turnsTogether: 0,
      strength: 1,
    },
    {
      source: "p-02",
      target: "p-03",
      rivalMatches: 2,
      partnerMatches: 0,
      winsA: 1,
      winsB: 1,
      winsTogether: 0,
      lossesTogether: 0,
      turnsTogether: 0,
      strength: 2,
    },
  ];

  it("filters links connected to selected player ID", () => {
    const p1Links = filterLinksBySelectedNode(links, "p-01");
    expect(p1Links).toHaveLength(1);
    expect(p1Links[0].target).toBe("p-02");

    const p2Links = filterLinksBySelectedNode(links, "p-02");
    expect(p2Links).toHaveLength(2);
  });
});

describe("calculateConnectionRecord", () => {
  it("calculates partner win-loss record correctly", () => {
    const link: GraphLink = {
      source: "p-01",
      target: "p-02",
      rivalMatches: 0,
      partnerMatches: 4,
      winsA: 0,
      winsB: 0,
      winsTogether: 3,
      lossesTogether: 1,
      turnsTogether: 2,
      strength: 6,
    };

    const record = calculateConnectionRecord(link, "p-01");
    expect(record.type).toBe("partner");
    expect(record.wins).toBe(3);
    expect(record.losses).toBe(1);
    expect(record.formattedRecord).toBe("3V - 1D");
  });

  it("calculates rival head-to-head record from source player perspective", () => {
    const link: GraphLink = {
      source: "p-01",
      target: "p-02",
      rivalMatches: 5,
      partnerMatches: 0,
      winsA: 3,
      winsB: 2,
      winsTogether: 0,
      lossesTogether: 0,
      turnsTogether: 1,
      strength: 6,
    };

    const recordSource = calculateConnectionRecord(link, "p-01");
    expect(recordSource.type).toBe("rival");
    expect(recordSource.wins).toBe(3);
    expect(recordSource.losses).toBe(2);
    expect(recordSource.formattedRecord).toBe("3V - 2D");
  });

  it("calculates rival head-to-head record from target player perspective", () => {
    const link: GraphLink = {
      source: "p-01",
      target: "p-02",
      rivalMatches: 5,
      partnerMatches: 0,
      winsA: 3,
      winsB: 2,
      winsTogether: 0,
      lossesTogether: 0,
      turnsTogether: 1,
      strength: 6,
    };

    const recordTarget = calculateConnectionRecord(link, "p-02");
    expect(recordTarget.type).toBe("rival");
    expect(recordTarget.wins).toBe(2);
    expect(recordTarget.losses).toBe(3);
    expect(recordTarget.formattedRecord).toBe("2V - 3D");
  });

  it("calculates mixed connection record combining rival and partner matches", () => {
    const link: GraphLink = {
      source: "p-01",
      target: "p-02",
      rivalMatches: 3,
      partnerMatches: 2,
      winsA: 2,
      winsB: 1,
      winsTogether: 2,
      lossesTogether: 0,
      turnsTogether: 0,
      strength: 5,
    };

    const record = calculateConnectionRecord(link, "p-01");
    expect(record.type).toBe("mixed");
    expect(record.wins).toBe(4); // 2 rival wins + 2 partner wins
    expect(record.losses).toBe(1); // 1 rival loss + 0 partner losses
    expect(record.formattedRecord).toBe("4V - 1D");
  });

  it("formats turns-only connection when no confirmed matches exist", () => {
    const link: GraphLink = {
      source: "p-01",
      target: "p-02",
      rivalMatches: 0,
      partnerMatches: 0,
      winsA: 0,
      winsB: 0,
      winsTogether: 0,
      lossesTogether: 0,
      turnsTogether: 3,
      strength: 3,
    };

    const record = calculateConnectionRecord(link, "p-01");
    expect(record.type).toBe("turns");
    expect(record.formattedRecord).toBe("3 turnos");
  });

  it("formats single turn connection correctly (singular)", () => {
    const link: GraphLink = {
      source: "p-01",
      target: "p-02",
      rivalMatches: 0,
      partnerMatches: 0,
      winsA: 0,
      winsB: 0,
      winsTogether: 0,
      lossesTogether: 0,
      turnsTogether: 1,
      strength: 1,
    };

    const record = calculateConnectionRecord(link, "p-01");
    expect(record.type).toBe("turns");
    expect(record.formattedRecord).toBe("1 turno");
  });
});
