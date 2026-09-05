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
  getSideCompatibilityLabel,
  filterNodesAndLinksByCommunity,
  getPreferredSideBadgeLabel,
  getConnectionAffinityLabel,
  sortGraphLinksByStrength,
  calculateMutualConnectionsCount,
  calculateCommunitySummary,
  calculateNodeConnectionSummary,
  getNetworkActivityTier,
  calculateSideSynergyBreakdown,
  calculateNetworkRoleInfo,
  calculateTurnRescueProximity,
  calculateCommunityCohesion,
  calculateCommunityFilterOptions,
  type TurnRescueCandidateInput,
  type EnrolledTurnPlayerInput,
} from "@/app/network/graph-utils";
import type { GraphLink, GraphNode } from "@/app/network/actions";

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

describe("sortGraphLinksByStrength", () => {
  it("sorts graph links in descending order of total interactions", () => {
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
        turnsTogether: 1, // total = 2
        strength: 2,
      },
      {
        source: "p-01",
        target: "p-03",
        rivalMatches: 3,
        partnerMatches: 2,
        winsA: 2,
        winsB: 1,
        winsTogether: 2,
        lossesTogether: 0,
        turnsTogether: 2, // total = 7
        strength: 7,
      },
      {
        source: "p-01",
        target: "p-04",
        rivalMatches: 2,
        partnerMatches: 2,
        winsA: 1,
        winsB: 1,
        winsTogether: 1,
        lossesTogether: 1,
        turnsTogether: 0, // total = 4
        strength: 4,
      },
    ];

    const sorted = sortGraphLinksByStrength(links);
    expect(sorted.map((l) => l.target)).toEqual(["p-03", "p-04", "p-02"]);
  });

  it("breaks ties by match count when total interaction strength is equal", () => {
    const links: GraphLink[] = [
      {
        source: "p-01",
        target: "p-02",
        rivalMatches: 0,
        partnerMatches: 0,
        winsA: 0,
        winsB: 0,
        winsTogether: 0,
        lossesTogether: 0,
        turnsTogether: 5, // total = 5, matches = 0
        strength: 5,
      },
      {
        source: "p-01",
        target: "p-03",
        rivalMatches: 2,
        partnerMatches: 2,
        winsA: 1,
        winsB: 1,
        winsTogether: 1,
        lossesTogether: 1,
        turnsTogether: 1, // total = 5, matches = 4
        strength: 5,
      },
    ];

    const sorted = sortGraphLinksByStrength(links);
    expect(sorted.map((l) => l.target)).toEqual(["p-03", "p-02"]);
  });
});

describe("calculateConnectionRecord", () => {
  it("calculates partner win-loss record and winRatePercentage correctly", () => {
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
    expect(record.winRatePercentage).toBe(75);
  });

  it("calculates rival head-to-head record and winRatePercentage from source player perspective", () => {
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
    expect(recordSource.winRatePercentage).toBe(60);
  });

  it("calculates rival head-to-head record and winRatePercentage from target player perspective", () => {
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
    expect(recordTarget.winRatePercentage).toBe(40);
  });

  it("calculates mixed connection record combining rival and partner matches with winRatePercentage", () => {
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
    expect(record.winRatePercentage).toBe(80);
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
    expect(record.winRatePercentage).toBeNull();
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
    expect(record.winRatePercentage).toBeNull();
  });
});

describe("getConnectionAffinityLabel", () => {
  it("returns 'Dupla exitosa 🏆' when partner matches >= 3 and win rate >= 65%", () => {
    const link: GraphLink = {
      source: "p-01",
      target: "p-02",
      rivalMatches: 0,
      partnerMatches: 4,
      winsA: 0,
      winsB: 0,
      winsTogether: 3, // 75% win rate
      lossesTogether: 1,
      turnsTogether: 0,
      strength: 4,
    };
    const res = getConnectionAffinityLabel(link);
    expect(res.label).toBe("Dupla exitosa 🏆");
    expect(res.badgeStyle).toContain("bg-emerald-100");
  });

  it("returns 'Dupla frecuente 🤝' when partner matches >= 3 and win rate < 65%", () => {
    const link: GraphLink = {
      source: "p-01",
      target: "p-02",
      rivalMatches: 0,
      partnerMatches: 4,
      winsA: 0,
      winsB: 0,
      winsTogether: 2, // 50% win rate
      lossesTogether: 2,
      turnsTogether: 0,
      strength: 4,
    };
    const res = getConnectionAffinityLabel(link);
    expect(res.label).toBe("Dupla frecuente 🤝");
    expect(res.badgeStyle).toContain("bg-emerald-100");
  });

  it("returns 'Rivalidad clásica ⚔️' when rival matches >= 3", () => {
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
    const res = getConnectionAffinityLabel(link);
    expect(res.label).toBe("Rivalidad clásica ⚔️");
    expect(res.badgeStyle).toContain("bg-rose-100");
  });

  it("returns 'Historial cruzado 🔄' when played both as partners and rivals (< 3 matches each)", () => {
    const link: GraphLink = {
      source: "p-01",
      target: "p-02",
      rivalMatches: 2,
      partnerMatches: 1,
      winsA: 1,
      winsB: 1,
      winsTogether: 1,
      lossesTogether: 0,
      turnsTogether: 0,
      strength: 3,
    };
    const res = getConnectionAffinityLabel(link);
    expect(res.label).toBe("Historial cruzado 🔄");
    expect(res.badgeStyle).toContain("bg-amber-100");
  });

  it("returns 'Compañeros de turno 📅' when no matches yet but turn co-inscriptions exist", () => {
    const link: GraphLink = {
      source: "p-01",
      target: "p-02",
      rivalMatches: 0,
      partnerMatches: 0,
      winsA: 0,
      winsB: 0,
      winsTogether: 0,
      lossesTogether: 0,
      turnsTogether: 2,
      strength: 2,
    };
    const res = getConnectionAffinityLabel(link);
    expect(res.label).toBe("Compañeros de turno 📅");
    expect(res.badgeStyle).toContain("bg-slate-100");
  });

  it("returns 'En desarrollo 🌱' when 1 or 2 matches played in total", () => {
    const link: GraphLink = {
      source: "p-01",
      target: "p-02",
      rivalMatches: 0,
      partnerMatches: 1,
      winsA: 0,
      winsB: 0,
      winsTogether: 1,
      lossesTogether: 0,
      turnsTogether: 0,
      strength: 1,
    };
    const res = getConnectionAffinityLabel(link);
    expect(res.label).toBe("En desarrollo 🌱");
    expect(res.badgeStyle).toContain("bg-muted");
  });

  it("returns 'Primera conexión 🌱' when zero matches and zero turn co-inscriptions", () => {
    const link: GraphLink = {
      source: "p-01",
      target: "p-02",
      rivalMatches: 0,
      partnerMatches: 0,
      winsA: 0,
      winsB: 0,
      winsTogether: 0,
      lossesTogether: 0,
      turnsTogether: 0,
      strength: 0,
    };
    const res = getConnectionAffinityLabel(link);
    expect(res.label).toBe("Primera conexión 🌱");
  });
});

describe("getPreferredSideBadgeLabel", () => {
  it("formats RIGHT side preference label and shortLabel correctly", () => {
    const res = getPreferredSideBadgeLabel("RIGHT");
    expect(res.label).toBe("Posición preferida: Derecha");
    expect(res.shortLabel).toBe("Der.");
  });

  it("formats LEFT side preference label and shortLabel correctly", () => {
    const res = getPreferredSideBadgeLabel("LEFT");
    expect(res.label).toBe("Posición preferida: Revés");
    expect(res.shortLabel).toBe("Rev.");
  });

  it("formats BOTH sides preference label and shortLabel correctly", () => {
    const res = getPreferredSideBadgeLabel("BOTH");
    expect(res.label).toBe("Posición preferida: Ambos lados");
    expect(res.shortLabel).toBe("Ambos");
  });

  it("handles null, undefined, or unknown values with fallback label", () => {
    expect(getPreferredSideBadgeLabel(null)).toEqual({
      label: "Posición preferida: Sin definir",
      shortLabel: "—",
    });
    expect(getPreferredSideBadgeLabel(undefined)).toEqual({
      label: "Posición preferida: Sin definir",
      shortLabel: "—",
    });
    expect(getPreferredSideBadgeLabel("UNKNOWN")).toEqual({
      label: "Posición preferida: Sin definir",
      shortLabel: "—",
    });
  });
});

describe("getSideCompatibilityLabel", () => {
  it("returns null when either side is missing or null", () => {
    expect(getSideCompatibilityLabel(null, "RIGHT")).toBeNull();
    expect(getSideCompatibilityLabel("LEFT", null)).toBeNull();
    expect(getSideCompatibilityLabel(null, null)).toBeNull();
  });

  it("returns complementary indicator for RIGHT + LEFT players", () => {
    const res1 = getSideCompatibilityLabel("RIGHT", "LEFT");
    expect(res1?.isComplementary).toBe(true);
    expect(res1?.label).toBe("Der. + Rev. 🎯");

    const res2 = getSideCompatibilityLabel("LEFT", "RIGHT");
    expect(res2?.isComplementary).toBe(true);
    expect(res2?.label).toBe("Der. + Rev. 🎯");
  });

  it("returns same-side indicator for RIGHT + RIGHT players", () => {
    const res = getSideCompatibilityLabel("RIGHT", "RIGHT");
    expect(res?.isComplementary).toBe(false);
    expect(res?.label).toBe("Ambos derecha ⚠️");
  });

  it("returns same-side indicator for LEFT + LEFT players", () => {
    const res = getSideCompatibilityLabel("LEFT", "LEFT");
    expect(res?.isComplementary).toBe(false);
    expect(res?.label).toBe("Ambos revés ⚠️");
  });
});

describe("filterNodesAndLinksByCommunity", () => {
  const nodes: GraphNode[] = [
    {
      id: "p-01",
      name: "Agustín",
      alias: "agu",
      image: null,
      skillScore: 1100,
      community: 1,
      networkSize: 2,
      matchesPlayed: 10,
      preferredSide: "RIGHT",
    },
    {
      id: "p-02",
      name: "Belasteguín",
      alias: "Bela",
      image: null,
      skillScore: 1200,
      community: 1,
      networkSize: 2,
      matchesPlayed: 12,
      preferredSide: "LEFT",
    },
    {
      id: "p-03",
      name: "Gero",
      alias: "gero",
      image: null,
      skillScore: 1050,
      community: 2,
      networkSize: 1,
      matchesPlayed: 5,
      preferredSide: "RIGHT",
    },
  ];

  const links: GraphLink[] = [
    {
      source: "p-01",
      target: "p-02",
      rivalMatches: 2,
      partnerMatches: 1,
      winsA: 1,
      winsB: 1,
      winsTogether: 1,
      lossesTogether: 0,
      turnsTogether: 0,
      strength: 3,
    },
    {
      source: "p-01",
      target: "p-03",
      rivalMatches: 1,
      partnerMatches: 0,
      winsA: 1,
      winsB: 0,
      winsTogether: 0,
      lossesTogether: 0,
      turnsTogether: 0,
      strength: 1,
    },
  ];

  it("returns all nodes and links when communityId is null", () => {
    const result = filterNodesAndLinksByCommunity(nodes, links, null);
    expect(result.nodes).toHaveLength(3);
    expect(result.links).toHaveLength(2);
  });

  it("filters nodes and links belonging strictly to community 1", () => {
    const result = filterNodesAndLinksByCommunity(nodes, links, 1);
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes.map((n) => n.id)).toEqual(["p-01", "p-02"]);
    expect(result.links).toHaveLength(1);
    expect(result.links[0].source).toBe("p-01");
    expect(result.links[0].target).toBe("p-02");
  });

  it("filters nodes belonging to community 2 with zero internal links", () => {
    const result = filterNodesAndLinksByCommunity(nodes, links, 2);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].id).toBe("p-03");
    expect(result.links).toHaveLength(0);
  });
});

describe("calculateMutualConnectionsCount", () => {
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
      source: "p-01",
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
    {
      source: "p-04",
      target: "p-02",
      rivalMatches: 1,
      partnerMatches: 1,
      winsA: 1,
      winsB: 0,
      winsTogether: 1,
      lossesTogether: 0,
      turnsTogether: 0,
      strength: 2,
    },
    {
      source: "p-04",
      target: "p-03",
      rivalMatches: 0,
      partnerMatches: 1,
      winsA: 0,
      winsB: 0,
      winsTogether: 1,
      lossesTogether: 0,
      turnsTogether: 0,
      strength: 1,
    },
  ];

  it("calculates mutual connections count correctly between two players with shared neighbors", () => {
    // p-01 is connected to p-02, p-03
    // p-04 is connected to p-02, p-03
    // Shared neighbors = p-02, p-03 => count = 2
    const mutual = calculateMutualConnectionsCount(links, "p-01", "p-04");
    expect(mutual).toBe(2);
  });

  it("calculates mutual connections between directly connected players", () => {
    // p-01 is connected to p-02 and p-03
    // p-02 is connected to p-01 and p-04
    // p-01's neighbors (excluding p-02) = {p-03}
    // p-02's neighbors (excluding p-01) = {p-04}
    // Intersection = 0
    const mutual = calculateMutualConnectionsCount(links, "p-01", "p-02");
    expect(mutual).toBe(0);
  });

  it("returns 0 for identical node IDs, empty inputs, or disconnected nodes", () => {
    expect(calculateMutualConnectionsCount(links, "p-01", "p-01")).toBe(0);
    expect(calculateMutualConnectionsCount(links, "", "p-02")).toBe(0);
    expect(calculateMutualConnectionsCount(links, "p-01", "p-99")).toBe(0);
  });
});

describe("calculateCommunitySummary", () => {
  const nodes: GraphNode[] = [
    {
      id: "p-01",
      name: "Agustín",
      alias: "agu",
      image: null,
      skillScore: 1100,
      community: 1,
      networkSize: 2,
      matchesPlayed: 10,
      preferredSide: "RIGHT",
    },
    {
      id: "p-02",
      name: "Belasteguín",
      alias: "Bela",
      image: null,
      skillScore: 1200,
      community: 1,
      networkSize: 2,
      matchesPlayed: 12,
      preferredSide: "LEFT",
    },
    {
      id: "p-03",
      name: "Facu",
      alias: "facu",
      image: null,
      skillScore: 1000,
      community: 1,
      networkSize: 1,
      matchesPlayed: 4,
      preferredSide: "BOTH",
    },
    {
      id: "p-04",
      name: "Gero",
      alias: "gero",
      image: null,
      skillScore: 1050,
      community: 2,
      networkSize: 1,
      matchesPlayed: 5,
      preferredSide: null,
    },
  ];

  it("calculates community summary for a populated group with side breakdown and average score", () => {
    const summary = calculateCommunitySummary(nodes, 1);
    expect(summary.communityId).toBe(1);
    expect(summary.totalPlayers).toBe(3);
    // (1100 + 1200 + 1000) / 3 = 1100
    expect(summary.avgSkillScore).toBe(1100);
    expect(summary.rightSideCount).toBe(1);
    expect(summary.leftSideCount).toBe(1);
    expect(summary.bothSidesCount).toBe(1);
    expect(summary.undefinedSideCount).toBe(0);
    expect(summary.formattedSummary).toBe("3 jugadores · Score prom. 1100 · 1 Der / 1 Rev / 1 Ambos");
  });

  it("calculates community summary for single member group with null side preference", () => {
    const summary = calculateCommunitySummary(nodes, 2);
    expect(summary.communityId).toBe(2);
    expect(summary.totalPlayers).toBe(1);
    expect(summary.avgSkillScore).toBe(1050);
    expect(summary.undefinedSideCount).toBe(1);
    expect(summary.formattedSummary).toBe("1 jugador · Score prom. 1050");
  });

  it("returns fallback summary for non-existent community ID", () => {
    const summary = calculateCommunitySummary(nodes, 99);
    expect(summary.totalPlayers).toBe(0);
    expect(summary.formattedSummary).toBe("Grupo sin miembros registrados");
  });
});

describe("calculateNodeConnectionSummary", () => {
  const links: GraphLink[] = [
    {
      source: "p-01",
      target: "p-02",
      rivalMatches: 0,
      partnerMatches: 4,
      winsA: 0,
      winsB: 0,
      winsTogether: 3,
      lossesTogether: 1,
      turnsTogether: 0,
      strength: 4,
    },
    {
      source: "p-01",
      target: "p-03",
      rivalMatches: 5,
      partnerMatches: 0,
      winsA: 3,
      winsB: 2,
      winsTogether: 0,
      lossesTogether: 0,
      turnsTogether: 0,
      strength: 5,
    },
    {
      source: "p-01",
      target: "p-04",
      rivalMatches: 0,
      partnerMatches: 0,
      winsA: 0,
      winsB: 0,
      winsTogether: 0,
      lossesTogether: 0,
      turnsTogether: 2,
      strength: 2,
    },
  ];

  it("calculates aggregate node connection summary breakdown and overall partner win rate", () => {
    const summary = calculateNodeConnectionSummary(links, "p-01");
    expect(summary.totalConnections).toBe(3);
    expect(summary.partnerCount).toBe(1);
    expect(summary.rivalCount).toBe(1);
    expect(summary.mixedCount).toBe(0);
    expect(summary.turnsOnlyCount).toBe(1);
    expect(summary.overallPartnerWinRate).toBe(75);
    expect(summary.formattedSummary).toBe("1 pareja · 1 rival · 1 turno · 75% WR dupla");
  });

  it("returns clean fallback for node with zero direct links", () => {
    const summary = calculateNodeConnectionSummary(links, "p-99");
    expect(summary.totalConnections).toBe(0);
    expect(summary.overallPartnerWinRate).toBeNull();
    expect(summary.formattedSummary).toBe("Sin conexiones directas");
  });
});

describe("getNetworkActivityTier", () => {
  it("returns 'Conector leyenda ⚡' when networkSize >= 10 and matchesPlayed >= 10", () => {
    const tier = getNetworkActivityTier(12, 15);
    expect(tier.label).toBe("Conector leyenda ⚡");
    expect(tier.badgeStyle).toContain("bg-amber-100");
  });

  it("returns 'Jugador activo 🎾' when networkSize >= 5 or matchesPlayed >= 5", () => {
    const tier1 = getNetworkActivityTier(5, 2);
    expect(tier1.label).toBe("Jugador activo 🎾");
    expect(tier1.badgeStyle).toContain("bg-emerald-100");

    const tier2 = getNetworkActivityTier(2, 6);
    expect(tier2.label).toBe("Jugador activo 🎾");
  });

  it("returns 'En crecimiento 🌱' when networkSize >= 1 or matchesPlayed >= 1", () => {
    const tier = getNetworkActivityTier(1, 0);
    expect(tier.label).toBe("En crecimiento 🌱");
    expect(tier.badgeStyle).toContain("bg-sky-100");
  });

  it("returns 'Nuevo en la red 🆕' when networkSize and matchesPlayed are 0", () => {
    const tier = getNetworkActivityTier(0, 0);
    expect(tier.label).toBe("Nuevo en la red 🆕");
    expect(tier.badgeStyle).toContain("bg-muted");
  });
});

describe("calculateSideSynergyBreakdown", () => {
  const nodes: GraphNode[] = [
    {
      id: "p-01",
      name: "Agustín",
      alias: "agu",
      image: null,
      skillScore: 1100,
      community: 1,
      networkSize: 2,
      matchesPlayed: 10,
      preferredSide: "RIGHT",
    },
    {
      id: "p-02",
      name: "Belasteguín",
      alias: "Bela",
      image: null,
      skillScore: 1200,
      community: 1,
      networkSize: 2,
      matchesPlayed: 12,
      preferredSide: "LEFT",
    },
    {
      id: "p-03",
      name: "Gero",
      alias: "gero",
      image: null,
      skillScore: 1050,
      community: 1,
      networkSize: 2,
      matchesPlayed: 5,
      preferredSide: "RIGHT",
    },
  ];

  const links: GraphLink[] = [
    {
      source: "p-01",
      target: "p-02",
      rivalMatches: 0,
      partnerMatches: 3,
      winsA: 0,
      winsB: 0,
      winsTogether: 2,
      lossesTogether: 1,
      turnsTogether: 0,
      strength: 3,
    },
    {
      source: "p-01",
      target: "p-03",
      rivalMatches: 0,
      partnerMatches: 2,
      winsA: 0,
      winsB: 0,
      winsTogether: 1,
      lossesTogether: 1,
      turnsTogether: 0,
      strength: 2,
    },
  ];

  it("calculates partner side synergy breakdown with complementary and same-side count", () => {
    // p-01 (RIGHT) with p-02 (LEFT) -> complementary
    // p-01 (RIGHT) with p-03 (RIGHT) -> same side
    const breakdown = calculateSideSynergyBreakdown(links, nodes, "p-01");
    expect(breakdown.totalPartners).toBe(2);
    expect(breakdown.complementaryCount).toBe(1);
    expect(breakdown.sameSideCount).toBe(1);
    expect(breakdown.formattedSynergySummary).toBe(
      "1 dupla complementaria 🎯 · 1 dupla misma posición ⚠️",
    );
  });

  it("returns fallback summary when player has no partner connections", () => {
    const breakdown = calculateSideSynergyBreakdown(links, nodes, "p-99");
    expect(breakdown.totalPartners).toBe(0);
    expect(breakdown.formattedSynergySummary).toBe("Sin duplas registradas");
  });
});

describe("calculateNetworkRoleInfo", () => {
  const nodes: GraphNode[] = [
    {
      id: "p-01",
      name: "Agustín",
      alias: "agu",
      image: null,
      skillScore: 1100,
      community: 1,
      networkSize: 3,
      matchesPlayed: 10,
      preferredSide: "RIGHT",
    },
    {
      id: "p-02",
      name: "Belasteguín",
      alias: "Bela",
      image: null,
      skillScore: 1200,
      community: 1,
      networkSize: 1,
      matchesPlayed: 12,
      preferredSide: "LEFT",
    },
    {
      id: "p-03",
      name: "Facu",
      alias: "facu",
      image: null,
      skillScore: 1000,
      community: 2,
      networkSize: 2,
      matchesPlayed: 4,
      preferredSide: "LEFT",
    },
    {
      id: "p-04",
      name: "Gero",
      alias: "gero",
      image: null,
      skillScore: 1050,
      community: 1,
      networkSize: 1,
      matchesPlayed: 5,
      preferredSide: "RIGHT",
    },
    {
      id: "p-05",
      name: "Diego",
      alias: "diego",
      image: null,
      skillScore: 980,
      community: 3,
      networkSize: 1,
      matchesPlayed: 3,
      preferredSide: "LEFT",
    },
  ];

  it("returns 'Nuevo participante 🆕' for unconnected or missing node", () => {
    const res = calculateNetworkRoleInfo(nodes, [], "p-99");
    expect(res.roleLabel).toBe("Nuevo participante 🆕");
    expect(res.badgeStyle).toContain("bg-muted");
  });

  it("returns 'Nexo comunitario 🌉' when connected to neighbors in 2 or more distinct communities", () => {
    // p-01 (community 1) connected to p-02 (community 1) and p-03 (community 2)
    const links: GraphLink[] = [
      {
        source: "p-01",
        target: "p-02",
        rivalMatches: 1,
        partnerMatches: 1,
        winsA: 1,
        winsB: 0,
        winsTogether: 1,
        lossesTogether: 0,
        turnsTogether: 0,
        strength: 2,
      },
      {
        source: "p-01",
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

    const res = calculateNetworkRoleInfo(nodes, links, "p-01");
    expect(res.roleLabel).toBe("Nexo comunitario 🌉");
    expect(res.badgeStyle).toContain("bg-indigo-100");
  });

  it("returns 'Anfitrión de grupo 👑' when top degree node in primary community with degree >= 3", () => {
    // p-01 (community 1) connected to p-02, p-04 (both community 1) and p-04 has 1 link, p-02 has 1 link
    const links: GraphLink[] = [
      {
        source: "p-01",
        target: "p-02",
        rivalMatches: 1,
        partnerMatches: 1,
        winsA: 1,
        winsB: 0,
        winsTogether: 1,
        lossesTogether: 0,
        turnsTogether: 0,
        strength: 2,
      },
      {
        source: "p-01",
        target: "p-04",
        rivalMatches: 1,
        partnerMatches: 1,
        winsA: 1,
        winsB: 0,
        winsTogether: 1,
        lossesTogether: 0,
        turnsTogether: 0,
        strength: 2,
      },
      {
        source: "p-01",
        target: "p-02",
        rivalMatches: 0,
        partnerMatches: 1,
        winsA: 0,
        winsB: 0,
        winsTogether: 1,
        lossesTogether: 0,
        turnsTogether: 1,
        strength: 2,
      },
    ];

    const res = calculateNetworkRoleInfo(nodes, links, "p-01");
    expect(res.roleLabel).toBe("Anfitrión de grupo 👑");
    expect(res.badgeStyle).toContain("bg-amber-100");
  });

  it("returns 'Pivote de red 🔗' when total connections >= 5 within single community and not top host", () => {
    const singleCommunityNodes: GraphNode[] = [
      { id: "p-01", name: "P1", alias: null, image: null, skillScore: 1000, community: 1, networkSize: 5, matchesPlayed: 10, preferredSide: "RIGHT" },
      { id: "p-02", name: "P2", alias: null, image: null, skillScore: 1000, community: 1, networkSize: 7, matchesPlayed: 12, preferredSide: "LEFT" },
      { id: "p-03", name: "P3", alias: null, image: null, skillScore: 1000, community: 1, networkSize: 1, matchesPlayed: 2, preferredSide: "RIGHT" },
      { id: "p-04", name: "P4", alias: null, image: null, skillScore: 1000, community: 1, networkSize: 1, matchesPlayed: 2, preferredSide: "RIGHT" },
      { id: "p-05", name: "P5", alias: null, image: null, skillScore: 1000, community: 1, networkSize: 1, matchesPlayed: 2, preferredSide: "RIGHT" },
      { id: "p-06", name: "P6", alias: null, image: null, skillScore: 1000, community: 1, networkSize: 1, matchesPlayed: 2, preferredSide: "RIGHT" },
      { id: "p-07", name: "P7", alias: null, image: null, skillScore: 1000, community: 1, networkSize: 1, matchesPlayed: 2, preferredSide: "RIGHT" },
      { id: "p-08", name: "P8", alias: null, image: null, skillScore: 1000, community: 1, networkSize: 1, matchesPlayed: 2, preferredSide: "RIGHT" },
      { id: "p-09", name: "P9", alias: null, image: null, skillScore: 1000, community: 1, networkSize: 1, matchesPlayed: 2, preferredSide: "RIGHT" },
    ];

    // p-01 has 5 connections, p-02 has 7 connections (distinct top host in community 1)
    const links: GraphLink[] = [
      { source: "p-01", target: "p-03", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-01", target: "p-04", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-01", target: "p-05", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-01", target: "p-06", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-01", target: "p-07", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },

      { source: "p-02", target: "p-03", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-02", target: "p-04", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-02", target: "p-05", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-02", target: "p-06", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-02", target: "p-07", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-02", target: "p-08", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-02", target: "p-09", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
    ];

    const res = calculateNetworkRoleInfo(singleCommunityNodes, links, "p-01");
    expect(res.roleLabel).toBe("Pivote de red 🔗");
    expect(res.badgeStyle).toContain("bg-sky-100");
  });

  it("returns 'Miembro activo 🎾' for standard connected participant (>= 1 connection)", () => {
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
    ];

    const res = calculateNetworkRoleInfo(nodes, links, "p-02");
    expect(res.roleLabel).toBe("Miembro activo 🎾");
    expect(res.badgeStyle).toContain("bg-emerald-100");
  });
});

describe("calculateTurnRescueProximity", () => {
  const links: GraphLink[] = [
    {
      source: "cand-01",
      target: "enrolled-01",
      rivalMatches: 1,
      partnerMatches: 1,
      winsA: 1,
      winsB: 0,
      winsTogether: 1,
      lossesTogether: 0,
      turnsTogether: 0,
      strength: 2,
    },
  ];

  it("returns fallback proximity info when turn has no enrolled players", () => {
    const candidate: TurnRescueCandidateInput = {
      id: "cand-01",
      skillScore: 1050,
      preferredSide: "RIGHT",
      community: 1,
    };
    const res = calculateTurnRescueProximity(candidate, [], []);
    expect(res.avgSkillScore).toBe(1000);
    expect(res.skillDiff).toBe(50);
    expect(res.proximityTier).toBe("Buena opción 👍");
    expect(res.formattedSummary).toBe("Turno sin inscriptos previos · Posición abierta");
  });

  it("calculates 'Ideal 🎯' tier for candidate with close skill score, complementary side, direct connection and same community", () => {
    const candidate: TurnRescueCandidateInput = {
      id: "cand-01",
      skillScore: 1100,
      preferredSide: "LEFT",
      community: 1,
    };
    const enrolled: EnrolledTurnPlayerInput[] = [
      { id: "enrolled-01", skillScore: 1100, preferredSide: "RIGHT", community: 1 },
      { id: "enrolled-02", skillScore: 1100, preferredSide: "RIGHT", community: 1 },
    ];

    const res = calculateTurnRescueProximity(candidate, enrolled, links);
    expect(res.avgSkillScore).toBe(1100);
    expect(res.skillDiff).toBe(0);
    expect(res.isSideComplementary).toBe(true);
    expect(res.directConnectionsCount).toBe(1);
    expect(res.sameCommunityCount).toBe(2);
    expect(res.score).toBeGreaterThanOrEqual(120);
    expect(res.proximityTier).toBe("Ideal 🎯");
    expect(res.badgeStyle).toContain("bg-emerald-100");
    expect(res.formattedSummary).toContain("Score cercano (dif. 0)");
    expect(res.formattedSummary).toContain("Equilibra posición en cancha");
    expect(res.formattedSummary).toContain("1 contacto en el turno");
    expect(res.formattedSummary).toContain("2 del mismo grupo");
  });

  it("calculates 'Distante ⚠️' tier for candidate with large skill difference and no connections or community overlap", () => {
    const candidate: TurnRescueCandidateInput = {
      id: "cand-99",
      skillScore: 1500,
      preferredSide: "RIGHT",
      community: 5,
    };
    const enrolled: EnrolledTurnPlayerInput[] = [
      { id: "enrolled-01", skillScore: 1000, preferredSide: "RIGHT", community: 1 },
    ];

    const res = calculateTurnRescueProximity(candidate, enrolled, []);
    expect(res.skillDiff).toBe(500);
    expect(res.isSideComplementary).toBe(false);
    expect(res.score).toBeLessThan(20);
    expect(res.proximityTier).toBe("Distante ⚠️");
    expect(res.badgeStyle).toContain("bg-muted");
    expect(res.formattedSummary).toBe("Dif. de score 500");
  });
});

describe("calculateCommunityCohesion", () => {
  const nodes: GraphNode[] = [
    {
      id: "p-01",
      name: "Agustín",
      alias: "agu",
      image: null,
      skillScore: 1100,
      community: 1,
      networkSize: 2,
      matchesPlayed: 10,
      preferredSide: "RIGHT",
    },
    {
      id: "p-02",
      name: "Belasteguín",
      alias: "Bela",
      image: null,
      skillScore: 1200,
      community: 1,
      networkSize: 2,
      matchesPlayed: 12,
      preferredSide: "LEFT",
    },
    {
      id: "p-03",
      name: "Gero",
      alias: "gero",
      image: null,
      skillScore: 1050,
      community: 2,
      networkSize: 1,
      matchesPlayed: 5,
      preferredSide: "RIGHT",
    },
  ];

  it("returns fallback cohesion info for empty or non-existent community", () => {
    const res = calculateCommunityCohesion(nodes, [], 99);
    expect(res.totalPlayers).toBe(0);
    expect(res.cohesionTier).toBe("En formación 🆕");
    expect(res.formattedCohesionSummary).toBe("Grupo sin miembros");
  });

  it("calculates 'Comunidad consolidada 🏆' tier for a group with internal connections", () => {
    const links: GraphLink[] = [
      {
        source: "p-01",
        target: "p-02",
        rivalMatches: 2,
        partnerMatches: 1,
        winsA: 1,
        winsB: 1,
        winsTogether: 1,
        lossesTogether: 0,
        turnsTogether: 0,
        strength: 3,
      },
    ];

    const res = calculateCommunityCohesion(nodes, links, 1);
    expect(res.communityId).toBe(1);
    expect(res.totalPlayers).toBe(2);
    expect(res.internalLinksCount).toBe(1);
    expect(res.externalLinksCount).toBe(0);
    expect(res.cohesionTier).toBe("Comunidad consolidada 🏆");
    expect(res.badgeStyle).toContain("bg-emerald-100");
    expect(res.formattedCohesionSummary).toContain("100% cohesión interna");
    expect(res.formattedCohesionSummary).toContain("1 conexión interna");
  });

  it("calculates 'En integración 🌱' tier for a group connected only to external communities", () => {
    const links: GraphLink[] = [
      {
        source: "p-01",
        target: "p-03",
        rivalMatches: 1,
        partnerMatches: 0,
        winsA: 1,
        winsB: 0,
        winsTogether: 0,
        lossesTogether: 0,
        turnsTogether: 0,
        strength: 1,
      },
    ];

    const res = calculateCommunityCohesion(nodes, links, 2);
    expect(res.totalPlayers).toBe(1);
    expect(res.internalLinksCount).toBe(0);
    expect(res.externalLinksCount).toBe(1);
    expect(res.cohesionTier).toBe("En integración 🌱");
    expect(res.badgeStyle).toContain("bg-amber-100");
    expect(res.formattedCohesionSummary).toBe("1 puente externo");
  });
});

describe("calculateCommunityFilterOptions", () => {
  const nodes: GraphNode[] = [
    {
      id: "p-01",
      name: "Agustín",
      alias: "agu",
      image: null,
      skillScore: 1100,
      community: 1,
      networkSize: 2,
      matchesPlayed: 10,
      preferredSide: "RIGHT",
    },
    {
      id: "p-02",
      name: "Belasteguín",
      alias: "Bela",
      image: null,
      skillScore: 1200,
      community: 1,
      networkSize: 2,
      matchesPlayed: 12,
      preferredSide: "LEFT",
    },
    {
      id: "p-03",
      name: "Gero",
      alias: "gero",
      image: null,
      skillScore: 1050,
      community: 2,
      networkSize: 1,
      matchesPlayed: 5,
      preferredSide: "RIGHT",
    },
  ];

  const links: GraphLink[] = [
    {
      source: "p-01",
      target: "p-02",
      rivalMatches: 2,
      partnerMatches: 1,
      winsA: 1,
      winsB: 1,
      winsTogether: 1,
      lossesTogether: 0,
      turnsTogether: 0,
      strength: 3,
    },
  ];

  it("calculates community filter options with player counts, colors, cohesion tiers, and ARIA labels", () => {
    const options = calculateCommunityFilterOptions(nodes, links);
    expect(options).toHaveLength(2);

    const opt1 = options.find((o) => o.communityId === 1);
    expect(opt1).toBeDefined();
    expect(opt1?.playerCount).toBe(2);
    expect(opt1?.label).toBe("Grupo 1 (2)");
    expect(opt1?.cohesionTier).toBe("Comunidad consolidada 🏆");
    expect(opt1?.color).toBe("#10b981");
    expect(opt1?.ariaLabel).toContain("Filtrar por Grupo 1: 2 jugadores");

    const opt2 = options.find((o) => o.communityId === 2);
    expect(opt2).toBeDefined();
    expect(opt2?.playerCount).toBe(1);
    expect(opt2?.label).toBe("Grupo 2 (1)");
    expect(opt2?.cohesionTier).toBe("En formación 🆕");
    expect(opt2?.color).toBe("#f59e0b");
    expect(opt2?.ariaLabel).toContain("Filtrar por Grupo 2: 1 jugador");
  });

  it("returns empty options list when no nodes have assigned communities", () => {
    const unassignedNodes: GraphNode[] = [
      {
        id: "p-99",
        name: "Nuevo",
        alias: null,
        image: null,
        skillScore: 1000,
        community: null,
        networkSize: 0,
        matchesPlayed: 0,
        preferredSide: null,
      },
    ];

    const options = calculateCommunityFilterOptions(unassignedNodes, []);
    expect(options).toHaveLength(0);
  });
});
