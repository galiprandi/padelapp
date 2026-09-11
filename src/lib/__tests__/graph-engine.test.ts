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
  calculateNetworkDiversityScore,
  calculateCrossRivalryDensity,
  calculatePlayerSimilarityInfo,
  calculatePlayerGraphReach,
  calculateCommunityBridgingScore,
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

describe("calculateCommunityBridgingScore", () => {
  const nodes: GraphNode[] = [
    { id: "p-01", name: "Bridge Node", alias: "Bridge", image: null, skillScore: 1100, community: 1, networkSize: 3, matchesPlayed: 10, preferredSide: "RIGHT" },
    { id: "p-02", name: "Member Comm 1", alias: "C1", image: null, skillScore: 1050, community: 1, networkSize: 2, matchesPlayed: 5, preferredSide: "LEFT" },
    { id: "p-03", name: "Member Comm 2", alias: "C2", image: null, skillScore: 1020, community: 2, networkSize: 2, matchesPlayed: 4, preferredSide: "RIGHT" },
    { id: "p-04", name: "Member Comm 3", alias: "C3", image: null, skillScore: 980, community: 3, networkSize: 1, matchesPlayed: 3, preferredSide: "LEFT" },
    { id: "p-05", name: "Core Node", alias: "Core", image: null, skillScore: 1150, community: 1, networkSize: 3, matchesPlayed: 12, preferredSide: "RIGHT" },
  ];

  it("returns fallback bridging score for unconnected or non-existent node", () => {
    const res = calculateCommunityBridgingScore(nodes, [], "p-99");
    expect(res.bridgingScore).toBe(0);
    expect(res.distinctCommunitiesCount).toBe(0);
    expect(res.bridgingTier).toBe("Conexión local 📍");
    expect(res.badgeStyle).toContain("bg-muted");
    expect(res.formattedSummary).toBe("Sin conexiones para evaluación de puente");
  });

  it("calculates 'Puente de red 🌉' tier for node connecting 3 distinct communities", () => {
    const links: GraphLink[] = [
      { source: "p-01", target: "p-02", rivalMatches: 1, partnerMatches: 1, winsA: 1, winsB: 0, winsTogether: 1, lossesTogether: 0, turnsTogether: 0, strength: 2 }, // Comm 1 (internal)
      { source: "p-01", target: "p-03", rivalMatches: 2, partnerMatches: 0, winsA: 1, winsB: 1, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 2 }, // Comm 2 (external)
      { source: "p-01", target: "p-04", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 }, // Comm 3 (external)
    ];

    const res = calculateCommunityBridgingScore(nodes, links, "p-01");
    expect(res.distinctCommunitiesCount).toBe(3);
    expect(res.internalLinksCount).toBe(1);
    expect(res.externalBridgeLinksCount).toBe(2);
    expect(res.interCommunityRatio).toBe(67);
    expect(res.bridgingTier).toBe("Puente de red 🌉");
    expect(res.badgeStyle).toContain("bg-indigo-100");
    expect(res.formattedSummary).toContain("3 grupos de la red");
    expect(res.formattedSummary).toContain("2 enlaces puente (67%)");
  });

  it("calculates 'Nexo de grupo 🔗' tier for node connecting 2 communities", () => {
    const links: GraphLink[] = [
      { source: "p-01", target: "p-02", rivalMatches: 1, partnerMatches: 1, winsA: 1, winsB: 0, winsTogether: 1, lossesTogether: 0, turnsTogether: 0, strength: 2 },
      { source: "p-01", target: "p-03", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
    ];

    const res = calculateCommunityBridgingScore(nodes, links, "p-01");
    expect(res.distinctCommunitiesCount).toBe(2);
    expect(res.bridgingTier).toBe("Nexo de grupo 🔗");
    expect(res.badgeStyle).toContain("bg-sky-100");
  });

  it("calculates 'Núcleo de comunidad 🏛️' tier for node with high internal community density", () => {
    const links: GraphLink[] = [
      { source: "p-05", target: "p-01", rivalMatches: 2, partnerMatches: 1, winsA: 1, winsB: 1, winsTogether: 1, lossesTogether: 0, turnsTogether: 0, strength: 3 },
      { source: "p-05", target: "p-02", rivalMatches: 1, partnerMatches: 1, winsA: 1, winsB: 0, winsTogether: 1, lossesTogether: 0, turnsTogether: 0, strength: 2 },
      { source: "p-05", target: "p-02", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
    ];

    const res = calculateCommunityBridgingScore(nodes, links, "p-05");
    expect(res.distinctCommunitiesCount).toBe(1);
    expect(res.internalLinksCount).toBe(3);
    expect(res.externalBridgeLinksCount).toBe(0);
    expect(res.interCommunityRatio).toBe(0);
    expect(res.bridgingTier).toBe("Núcleo de comunidad 🏛️");
    expect(res.badgeStyle).toContain("bg-emerald-100");
    expect(res.formattedSummary).toContain("1 grupo de la red");
    expect(res.formattedSummary).toContain("3 conexiones internas");
  });
});

describe("calculatePlayerSimilarityInfo", () => {
  it("calculates 'Dupla ideal 🎯' tier for candidate with close skill score, complementary side, and mutual connections", () => {
    const candidate = { id: "p-04", skillScore: 1020, preferredSide: "LEFT" };
    const viewer = { id: "p-01", skillScore: 1000, preferredSide: "RIGHT" };

    const links: GraphLink[] = [
      { source: "p-01", target: "p-02", rivalMatches: 1, partnerMatches: 1, winsA: 1, winsB: 0, winsTogether: 1, lossesTogether: 0, turnsTogether: 0, strength: 2 },
      { source: "p-04", target: "p-02", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
    ];

    const res = calculatePlayerSimilarityInfo(candidate, viewer, links);
    expect(res.skillDiff).toBe(20);
    expect(res.isSideComplementary).toBe(true);
    expect(res.mutualConnectionsCount).toBe(1);
    expect(res.similarityPercentage).toBeGreaterThanOrEqual(80);
    expect(res.similarityTier).toBe("Dupla ideal 🎯");
    expect(res.badgeStyle).toContain("bg-emerald-100");
    expect(res.formattedSummary).toContain("% similitud");
    expect(res.formattedSummary).toContain("Score cercano (dif. 20)");
    expect(res.formattedSummary).toContain("Posición complementaria 🎯");
    expect(res.formattedSummary).toContain("1 contacto en común");
  });

  it("calculates 'Perfil distante 📍' tier for candidates with large skill difference and no complementarity or shared connections", () => {
    const candidate = { id: "p-99", skillScore: 1600, preferredSide: "RIGHT" };
    const viewer = { id: "p-01", skillScore: 1000, preferredSide: "RIGHT" };

    const res = calculatePlayerSimilarityInfo(candidate, viewer, []);
    expect(res.skillDiff).toBe(600);
    expect(res.isSideComplementary).toBe(false);
    expect(res.mutualConnectionsCount).toBe(0);
    expect(res.similarityPercentage).toBeLessThan(40);
    expect(res.similarityTier).toBe("Perfil distante 📍");
    expect(res.badgeStyle).toContain("bg-muted");
    expect(res.formattedSummary).toContain("Dif. de score 600");
  });
});

describe("Top connected players role and activity badging in StatsPanel", () => {
  const topPlayers = [
    { id: "p-01", name: "Agustín Aliprandi", alias: "Agu", image: null, matchesPlayed: 12, networkSize: 10 },
    { id: "p-02", name: "Fernando Belasteguín", alias: "Bela", image: null, matchesPlayed: 15, networkSize: 12 },
    { id: "p-03", name: "Nuevo Jugador", alias: "Nuevo", image: null, matchesPlayed: 0, networkSize: 0 },
  ];

  const graphNodes: GraphNode[] = [
    { id: "p-01", name: "Agustín", alias: "Agu", image: null, skillScore: 1100, community: 1, networkSize: 10, matchesPlayed: 12, preferredSide: "RIGHT" },
    { id: "p-02", name: "Belasteguín", alias: "Bela", image: null, skillScore: 1200, community: 1, networkSize: 12, matchesPlayed: 15, preferredSide: "LEFT" },
    { id: "p-04", name: "Facundo", alias: "Facu", image: null, skillScore: 1020, community: 2, networkSize: 5, matchesPlayed: 6, preferredSide: "LEFT" },
  ];

  const graphLinks: GraphLink[] = [
    { source: "p-01", target: "p-02", rivalMatches: 3, partnerMatches: 2, winsA: 2, winsB: 1, winsTogether: 2, lossesTogether: 0, turnsTogether: 0, strength: 5 },
    { source: "p-01", target: "p-04", rivalMatches: 2, partnerMatches: 0, winsA: 1, winsB: 1, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 2 },
  ];

  it("calculates 'Conector leyenda ⚡' activity tier for top players with networkSize >= 10 and matchesPlayed >= 10", () => {
    const tier = getNetworkActivityTier(topPlayers[0].networkSize, topPlayers[0].matchesPlayed);
    expect(tier.label).toBe("Conector leyenda ⚡");
    expect(tier.badgeStyle).toContain("bg-amber-100");
  });

  it("calculates 'Nuevo en la red 🆕' fallback activity tier for player with zero network connections and zero matches", () => {
    const tier = getNetworkActivityTier(topPlayers[2].networkSize, topPlayers[2].matchesPlayed);
    expect(tier.label).toBe("Nuevo en la red 🆕");
    expect(tier.badgeStyle).toContain("bg-muted");
  });

  it("calculates network role 'Nexo comunitario 🌉' for top player connected to multiple communities", () => {
    const role = calculateNetworkRoleInfo(graphNodes, graphLinks, "p-01");
    expect(role.roleLabel).toBe("Nexo comunitario 🌉");
    expect(role.badgeStyle).toContain("bg-indigo-100");
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

describe("calculateNetworkDiversityScore", () => {
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
      networkSize: 2,
      matchesPlayed: 5,
      preferredSide: "LEFT",
    },
    {
      id: "p-04",
      name: "Facu",
      alias: "facu",
      image: null,
      skillScore: 1020,
      community: 3,
      networkSize: 1,
      matchesPlayed: 4,
      preferredSide: "RIGHT",
    },
  ];

  it("returns 'Red concentrada 📍' tier with score 0 for unconnected node", () => {
    const score = calculateNetworkDiversityScore(nodes, [], "p-99");
    expect(score.diversityScore).toBe(0);
    expect(score.distinctCommunitiesCount).toBe(0);
    expect(score.diversityTier).toBe("Red concentrada 📍");
    expect(score.badgeStyle).toContain("bg-muted");
    expect(score.formattedSummary).toBe("Sin interacciones registradas en la red");
  });

  it("calculates 'Red ultra diversificada 🌐' for player connected to multiple communities with mixed duplas and complementary side balance", () => {
    const links: GraphLink[] = [
      {
        source: "p-01",
        target: "p-02", // community 1, partner, complementary (RIGHT + LEFT)
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
        target: "p-03", // community 2, rival
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
        source: "p-01",
        target: "p-04", // community 3, mixed
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

    const res = calculateNetworkDiversityScore(nodes, links, "p-01");
    expect(res.distinctCommunitiesCount).toBe(3);
    expect(res.diversityScore).toBeGreaterThanOrEqual(80);
    expect(res.diversityTier).toBe("Red ultra diversificada 🌐");
    expect(res.badgeStyle).toContain("bg-teal-100");
    expect(res.formattedSummary).toContain("3 grupos de la red");
    expect(res.formattedSummary).toContain("índice de diversidad");
  });

  it("calculates 'En focalización 🎯' tier for single-community partner connections", () => {
    const links: GraphLink[] = [
      {
        source: "p-01",
        target: "p-02", // community 1
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

    const res = calculateNetworkDiversityScore(nodes, links, "p-01");
    expect(res.distinctCommunitiesCount).toBe(1);
    expect(res.diversityScore).toBeGreaterThanOrEqual(20);
    expect(res.diversityScore).toBeLessThan(50);
    expect(res.diversityTier).toBe("En focalización 🎯");
    expect(res.badgeStyle).toContain("bg-amber-100");
  });
});

describe("calculateCrossRivalryDensity", () => {
  it("returns fallback density info for unconnected node", () => {
    const res = calculateCrossRivalryDensity([], "p-99");
    expect(res.crossRivalryPercentage).toBe(0);
    expect(res.rivalryTier).toBe("Sin partidos cruzados 📍");
    expect(res.badgeStyle).toContain("bg-muted");
    expect(res.formattedSummary).toBe("Sin interacciones cruzadas registradas");
  });
});

describe("calculatePlayerGraphReach", () => {
  it("returns fallback reach info for unconnected node", () => {
    const res = calculatePlayerGraphReach([], "p-99");
    expect(res.directConnectionsCount).toBe(0);
    expect(res.extendedReachCount).toBe(0);
    expect(res.totalReachCount).toBe(0);
    expect(res.reachMultiplier).toBe(1.0);
    expect(res.reachTier).toBe("Red inicial 📍");
    expect(res.badgeStyle).toContain("bg-muted");
    expect(res.formattedSummary).toBe("Sin contactos directos en la red");
  });

  it("calculates star topology reach (1 center node connected to 3 leaf nodes)", () => {
    const links: GraphLink[] = [
      { source: "p-center", target: "leaf-1", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-center", target: "leaf-2", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-center", target: "leaf-3", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
    ];

    // For leaf-1: direct = 1 (p-center), 2nd degree = 2 (leaf-2, leaf-3) => total = 3, multiplier = 3.0
    const leafReach = calculatePlayerGraphReach(links, "leaf-1");
    expect(leafReach.directConnectionsCount).toBe(1);
    expect(leafReach.extendedReachCount).toBe(2);
    expect(leafReach.totalReachCount).toBe(3);
    expect(leafReach.reachMultiplier).toBe(3.0);
    expect(leafReach.reachTier).toBe("Red expansiva 🌌");
    expect(leafReach.badgeStyle).toContain("bg-purple-100");
    expect(leafReach.formattedSummary).toContain("1 contacto directo");
    expect(leafReach.formattedSummary).toContain("2 en 2º grado");
    expect(leafReach.formattedSummary).toContain("3 alcance total");
  });

  it("calculates extended network reach in multi-hop network for 'Red interconectada 🌐' tier", () => {
    // A connected directly to B, C, D, E (4 direct connections)
    // B connected to F, G; C connected to H, I; D connected to J, K (6 2nd-degree extended connections)
    const links: GraphLink[] = [
      { source: "A", target: "B", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "A", target: "C", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "A", target: "D", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "A", target: "E", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },

      { source: "B", target: "F", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "B", target: "G", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "C", target: "H", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "C", target: "I", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "D", target: "J", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "D", target: "K", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
    ];

    // For A: direct = 4 (B, C, D, E), 2nd degree = 6 (F, G, H, I, J, K) => total = 10, multiplier = 2.5
    const reachA = calculatePlayerGraphReach(links, "A");
    expect(reachA.directConnectionsCount).toBe(4);
    expect(reachA.extendedReachCount).toBe(6);
    expect(reachA.totalReachCount).toBe(10);
    expect(reachA.reachMultiplier).toBe(2.5);
    expect(reachA.reachTier).toBe("Red interconectada 🌐");
    expect(reachA.badgeStyle).toContain("bg-sky-100");
  });

  it("calculates 'Círculo cercano ⭕' tier for moderate 2nd degree reach (2-5 nodes)", () => {
    const links: GraphLink[] = [
      { source: "A", target: "B", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "B", target: "C", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "B", target: "D", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
    ];

    // For A: direct = 1 (B), 2nd degree = 2 (C, D) => multiplier = 3.0 (triggers Red expansiva because multiplier >= 3.0)
    // To test Círculo cercano, give A 2 direct connections and 2 extended:
    const links2: GraphLink[] = [
      { source: "A", target: "B", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "A", target: "E", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "B", target: "C", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "B", target: "D", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
    ];

    // For A: direct = 2 (B, E), 2nd degree = 2 (C, D) => total = 4, multiplier = 2.0
    const reach = calculatePlayerGraphReach(links2, "A");
    expect(reach.directConnectionsCount).toBe(2);
    expect(reach.extendedReachCount).toBe(2);
    expect(reach.totalReachCount).toBe(4);
    expect(reach.reachMultiplier).toBe(2.0);
    expect(reach.reachTier).toBe("Círculo cercano ⭕");
    expect(reach.badgeStyle).toContain("bg-amber-100");
  });

  it("calculates 'Red de rivalidad activa ⚔️' tier for high rivalry interaction (>= 65%)", () => {
    const links: GraphLink[] = [
      {
        source: "p-01",
        target: "p-02", // rival
        rivalMatches: 3,
        partnerMatches: 0,
        winsA: 2,
        winsB: 1,
        winsTogether: 0,
        lossesTogether: 0,
        turnsTogether: 0,
        strength: 3,
      },
      {
        source: "p-01",
        target: "p-03", // mixed (rival + partner)
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
        target: "p-04", // partner
        rivalMatches: 0,
        partnerMatches: 2,
        winsA: 0,
        winsB: 0,
        winsTogether: 2,
        lossesTogether: 0,
        turnsTogether: 0,
        strength: 2,
      },
    ];

    // matchesWithRivalry = 1 rival + 1 mixed = 2; total match connections = 3 => 67%
    const res = calculateCrossRivalryDensity(links, "p-01");
    expect(res.crossRivalryPercentage).toBe(67);
    expect(res.rivalryTier).toBe("Red de rivalidad activa ⚔️");
    expect(res.badgeStyle).toContain("bg-rose-100");
    expect(res.formattedSummary).toContain("67% interacción con rivales");
    expect(res.formattedSummary).toContain("1 vínculo mixto");
  });

  it("calculates 'Duplas con rivalidad 🔄' tier for moderate rivalry interaction (35-64%)", () => {
    const links: GraphLink[] = [
      {
        source: "p-01",
        target: "p-02", // mixed
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
        target: "p-03", // partner
        rivalMatches: 0,
        partnerMatches: 2,
        winsA: 0,
        winsB: 0,
        winsTogether: 2,
        lossesTogether: 0,
        turnsTogether: 0,
        strength: 2,
      },
    ];

    // matchesWithRivalry = 1 mixed = 1; total match connections = 2 => 50%
    const res = calculateCrossRivalryDensity(links, "p-01");
    expect(res.crossRivalryPercentage).toBe(50);
    expect(res.rivalryTier).toBe("Duplas con rivalidad 🔄");
    expect(res.badgeStyle).toContain("bg-amber-100");
  });

  it("calculates 'Predominio de duplas 🤝' tier for low rivalry interaction (< 35%)", () => {
    const links: GraphLink[] = [
      {
        source: "p-01",
        target: "p-02", // partner
        rivalMatches: 0,
        partnerMatches: 3,
        winsA: 0,
        winsB: 0,
        winsTogether: 2,
        lossesTogether: 1,
        turnsTogether: 0,
        strength: 3,
      },
    ];

    const res = calculateCrossRivalryDensity(links, "p-01");
    expect(res.crossRivalryPercentage).toBe(0);
    expect(res.rivalryTier).toBe("Predominio de duplas 🤝");
    expect(res.badgeStyle).toContain("bg-emerald-100");
  });
});
