import { describe, it, expect, vi } from "vitest";
import {
  getRecencyWeight,
  applyFeedbackToScore,
  calculateAdjustedFeedbackScore,
  calculatePlayerSideWinsAndRates,
  type ConfirmedMatchInfo,
} from "@/lib/graph/engine";
import { calculateMatchEdgeUpdates, edgeKey } from "@/lib/graph/update";
import { calculateTurnPairEnrollees, type TurnEnrolleeInput } from "@/lib/graph/turn-edges";

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
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

describe("calculateMatchEdgeUpdates and edgeKey", () => {
  it("determines deterministic ordered pair via edgeKey", () => {
    expect(edgeKey("user-b", "user-a")).toEqual(["user-a", "user-b"]);
    expect(edgeKey("user-1", "user-2")).toEqual(["user-1", "user-2"]);
  });

  it("returns empty array for match with fewer than 2 valid players", () => {
    const match: ConfirmedMatchInfo = {
      id: "m-01",
      score: "6-4 6-3",
      date: new Date(),
      players: [{ userId: "p-01", position: 0, teamId: "A", side: "RIGHT" }],
    };
    expect(calculateMatchEdgeUpdates(match)).toEqual([]);
  });

  it("calculates rival and partner deltas for 2v2 match with Team A win", () => {
    const match: ConfirmedMatchInfo = {
      id: "m-2v2",
      score: "6-4 6-2", // Team A wins
      date: new Date("2026-10-01"),
      players: [
        { userId: "p-01", position: 0, teamId: "A", side: "RIGHT" },
        { userId: "p-02", position: 1, teamId: "A", side: "LEFT" },
        { userId: "p-03", position: 2, teamId: "B", side: "RIGHT" },
        { userId: "p-04", position: 3, teamId: "B", side: "LEFT" },
      ],
    };

    const updates = calculateMatchEdgeUpdates(match);
    expect(updates).toHaveLength(6);

    const partnerA = updates.find(
      (u) =>
        (u.playerAId === "p-01" && u.playerBId === "p-02") ||
        (u.playerAId === "p-02" && u.playerBId === "p-01"),
    );
    expect(partnerA).toBeDefined();
    expect(partnerA?.partnerDelta).toBe(1);
    expect(partnerA?.rivalDelta).toBe(0);
    expect(partnerA?.winsTogetherDelta).toBe(1);
    expect(partnerA?.lossesTogetherDelta).toBe(0);

    const partnerB = updates.find(
      (u) =>
        (u.playerAId === "p-03" && u.playerBId === "p-04") ||
        (u.playerAId === "p-04" && u.playerBId === "p-03"),
    );
    expect(partnerB).toBeDefined();
    expect(partnerB?.partnerDelta).toBe(1);
    expect(partnerB?.winsTogetherDelta).toBe(0);
    expect(partnerB?.lossesTogetherDelta).toBe(1);
  });

  it("calculates rival deltas for 1v1 match with Team B win", () => {
    const match: ConfirmedMatchInfo = {
      id: "m-1v1",
      score: "3-6 4-6", // Team B wins
      date: new Date("2026-10-02"),
      players: [
        { userId: "p-01", position: 0, teamId: "A", side: "RIGHT" },
        { userId: "p-02", position: 1, teamId: "B", side: "LEFT" },
      ],
    };

    const updates = calculateMatchEdgeUpdates(match);
    expect(updates).toHaveLength(1);
    expect(updates[0].rivalDelta).toBe(1);
    expect(updates[0].partnerDelta).toBe(0);
    expect(updates[0].playerAId).toBe("p-01");
    expect(updates[0].playerBId).toBe("p-02");
    expect(updates[0].winsADelta).toBe(0);
    expect(updates[0].winsBDelta).toBe(1);
  });
});

describe("calculateAdjustedFeedbackScore and calculatePlayerSideWinsAndRates", () => {
  it("calculates feedback score adjustments for various signals", () => {
    expect(calculateAdjustedFeedbackScore([], 1000)).toBe(1000);
    expect(
      calculateAdjustedFeedbackScore(
        [{ feedback: "STRONGER" }, { feedback: "STRONGER" }],
        1000,
      ),
    ).toBe(1040);
    expect(
      calculateAdjustedFeedbackScore(
        [{ feedback: "WEAKER" }, { feedback: "WEAKER" }, { feedback: "WEAKER" }],
        1000,
      ),
    ).toBe(940);
    expect(
      calculateAdjustedFeedbackScore(
        [{ feedback: "STRONGER" }, { feedback: "WEAKER" }],
        1000,
      ),
    ).toBe(1000);
  });

  it("calculates player side preferences and win rates from match inputs", () => {
    const matches = [
      { side: "RIGHT" as const, position: 0, matchScore: "6-4 6-2" }, // Team A wins -> RIGHT win
      { side: "RIGHT" as const, position: 0, matchScore: "2-6 3-6" }, // Team B wins -> RIGHT loss
      { side: "LEFT" as const, position: 1, matchScore: "6-1 6-0" }, // Team A wins -> LEFT win
    ];

    const result = calculatePlayerSideWinsAndRates(matches);
    expect(result.preferredSide).toBe("RIGHT");
    expect(result.winRateRight).toBe(0.5); // 1 win out of 2 right matches
    expect(result.winRateLeft).toBe(1.0); // 1 win out of 1 left match
  });

  it("returns null preferredSide when match counts for RIGHT and LEFT are equal", () => {
    const matches = [
      { side: "RIGHT" as const, position: 0, matchScore: "6-4 6-2" },
      { side: "LEFT" as const, position: 1, matchScore: "6-4 6-2" },
    ];

    const result = calculatePlayerSideWinsAndRates(matches);
    expect(result.preferredSide).toBeNull();
  });
});

describe("calculateTurnPairEnrollees", () => {
  it("aggregates turn co-inscription count and latest turn date for pairs of enrollees", () => {
    const d1 = new Date("2026-09-01");
    const d2 = new Date("2026-09-15");

    const players: TurnEnrolleeInput[] = [
      { turnId: "t-01", userId: "p-01", joinedAt: d1 },
      { turnId: "t-01", userId: "p-02", joinedAt: d1 },
      { turnId: "t-02", userId: "p-01", joinedAt: d2 },
    ];

    const substitutes: TurnEnrolleeInput[] = [
      { turnId: "t-01", userId: "p-03", joinedAt: d1 },
      { turnId: "t-02", userId: "p-02", joinedAt: d2 },
    ];

    const edges = calculateTurnPairEnrollees(players, substitutes);
    expect(edges).toHaveLength(3);

    const pair12 = edges.find(
      (e) =>
        (e.playerAId === "p-01" && e.playerBId === "p-02") ||
        (e.playerAId === "p-02" && e.playerBId === "p-01"),
    );
    expect(pair12?.turnsTogether).toBe(2);
    expect(pair12?.lastTurnAt).toEqual(d2);
  });
});

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
    const score = await applyFeedbackToScore("user-1", 1000);
    expect(score).toBe(1040);
  });

  it("decreases score for net negative WEAKER feedback", async () => {
    mockedDb.where.mockResolvedValueOnce([
      { feedback: "WEAKER" },
      { feedback: "WEAKER" },
      { feedback: "WEAKER" },
    ]);
    const score = await applyFeedbackToScore("user-1", 1000);
    expect(score).toBe(940);
  });

  it("handles balanced feedback (equal STRONGER and WEAKER)", async () => {
    mockedDb.where.mockResolvedValueOnce([
      { feedback: "STRONGER" },
      { feedback: "WEAKER" },
    ]);
    const score = await applyFeedbackToScore("user-1", 1000);
    expect(score).toBe(1000);
  });
});

import {
  calculateConnectionRecord,
  normalizeSearchQuery,
  getRecommendedPlayerContainerClasses,
  getRecommendedPlayerAvatarAriaLabel,
  getRecommendedPlayerSkillText,
  getRecommendedPlayerSideText,
  getRecommendedPlayerAriaLabel,
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
  calculateNetworkCentralityScore,
  calculateGraphDensityMetric,
  calculateCommunityBalanceInfo,
  calculatePlayerInteractionReciprocity,
  calculatePartnershipStabilityInfo,
  calculateLocalClusteringCoefficient,
  calculatePlayerMatchComplementarity,
  calculateNetworkConcentrationIndex,
  calculateNetworkMultiBelonging,
  calculateNetworkExpansionPotential,
  getInitials,
  getEmptyPersonalNetworkTitle,
  getEmptyPersonalNetworkDescription,
  getEmptyPersonalNetworkSearchTurnsLabel,
  getEmptyPersonalNetworkViewGlobalLabel,
  getGraphViewCenterButtonAriaLabel,
  getGraphViewClearSearchAriaLabel,
  getGraphViewLegendTitle,
  getGraphViewLegendPartnerLabel,
  getGraphViewLegendRivalLabel,
  getGraphViewLegendMixedLabel,
  getGraphViewLegendTurnsLabel,
  getGraphViewProfileLinkAriaLabel,
  getGraphViewAffinityTitle,
  getFilterChipClasses,
  getGraphViewDetailPanelCloseAriaLabel,
  getGraphViewDetailPanelPublicProfileText,
  getGraphViewDetailPanelConnectionsHeader,
  getGraphViewDetailPanelScoreLabel,
  getGraphViewDetailPanelSideLabel,
  getGraphViewDetailPanelGroupLabel,
  getGraphViewCommunityClearFilterText,
  getGraphViewSearchInputPlaceholder,
  getGraphViewCenterButtonText,
  getGraphViewLegendContainerClasses,
  getGraphViewSelectedNodeDetailClasses,
  getGraphViewTopFilterContainerClasses,
  getGraphViewSearchContainerClasses,
  getNetworkScopeLabelText,
  getNetworkScopeRadiogroupClasses,
  getNetworkScopeButtonClasses,
  getNetworkScopeButtonText,
  getGraphViewFilterBarContainerClasses,
  getGraphViewActiveCommunityBannerClasses,
  getGraphViewEmptyNetworkNoticeClasses,
  getGraphViewDetailPanelCardScoreClasses,
  getGraphViewDetailPanelPublicProfileButtonClasses,
  getGraphViewSummaryCardContainerClasses,
  getGraphViewSummaryCardTitleText,
  getGraphViewSummaryCardTotalText,
  getGraphViewSummaryCardSynergyText,
  getGraphViewConnectionItemClasses,
  getGraphViewWinRateBadgeClasses,
  getGraphViewProfileLinkClasses,
  getGraphViewMutualContactsBadgeClasses,
  getGraphViewMutualContactsBadgeText,
  getStatsPanelScoreBadgeClasses,
  getStatsPanelScoreLabelText,
  getStatsPanelProfileButtonClasses,
  getStatsPanelProfileButtonText,
  getStatsPanelCommunityBarContainerClasses,
  getStatsPanelTopPlayerRankClasses,
  getStatsPanelTopPlayerContactsClasses,
  formatTimeAgo,
  getNetworkSkeletonAriaLabel,
  getNetworkSkeletonContainerClasses,
  getNetworkSkeletonTabBarClasses,
  getNetworkSkeletonActiveTabButtonClasses,
  getNetworkSkeletonInactiveTabButtonClasses,
  getNetworkSkeletonContentClasses,
  getNetworkSkeletonBackButtonClasses,
  getNetworkSkeletonCardClasses,
  getNetworkSkeletonGridTwoColsClasses,
  getNetworkSkeletonGridThreeColsClasses,
  getStatsPanelRegionAriaLabel,
  getTopClubTurnsMatchesText,
  getTopPlayerActivityAriaLabel,
  getTopPlayerCentralityAriaLabel,
  getTopPlayerDiversityAriaLabel,
  getTopPlayerExpansionAriaLabel,
  getTopPlayerMultiBelongingAriaLabel,
  getTopPlayerReciprocityAriaLabel,
  getTopPlayerRoleAriaLabel,
  getTopPlayerRoleTitle,
  getTopPlayerActivityTitle,
  getTopPlayerCentralityTitle,
  getTopPlayerDiversityTitle,
  getTopPlayerMultiBelongingTitle,
  getTopPlayerReciprocityTitle,
  getTopPlayerStabilityTitle,
  getTopPlayerExpansionTitle,
  getRecentUsersItemAriaLabel,
  getTopClubItemAriaLabel,
  getCommunityItemAriaLabel,
  getFilterChipDotClasses,
  getTopPlayerStabilityAriaLabel,
  getNetworkDiversityAriaLabel,
  getCrossRivalryAriaLabel,
  getPlayerGraphReachAriaLabel,
  getPlayerExpansionAriaLabel,
  getInteractionConcentrationAriaLabel,
  getMultiBelongingAriaLabel,
  getMatchComplementarityAriaLabel,
  getPartnershipStabilityAriaLabel,
  getLocalClusteringAriaLabel,
  getNetworkCentralityAriaLabel,
  getNetworkRoleAriaLabel,
  getCommunityBridgingAriaLabel,
  getInteractionReciprocityAriaLabel,
  getPlayerSimilarityAriaLabel,
  getGraphViewLoadingText,
  getGraphViewEmptyDataProps,
  getGraphViewScopeAriaLabel,
  getGraphViewSearchAriaLabel,
  getGraphViewEmptySearchProps,
  getGraphViewNodeName,
  getGraphViewLegendAriaLabel,
  getConnectionBadgeClasses,
  getConnectionTypeSymbol,
  getGraphViewSelectedNodeAriaLabel,
  getGraphViewFocusNodeAriaLabel,
  getGraphViewConnectionWinRateAriaLabel,
  getGraphViewConnectionMutualAriaLabel,
  getGraphViewNodeGroupAriaLabel,
  getNetworkPageContainerClasses,
  getNetworkPageTabBarClasses,
  getNetworkPageContentClasses,
  getNetworkPageStatsContentClasses,
  getNetworkPageTabButtonClasses,
  getNetworkPageTabAriaLabel,
  getNetworkPageRegionAriaLabel,
  getRecommendedPlayerSimilarityAriaLabel,
  getRecommendedPlayerSimilarityTitle,
  getStatsCardCommunityCohesionAriaLabel,
  getStatsCardCommunityCohesionTitle,
  getStatsCardCommunityBalanceAriaLabel,
  getStatsCardCommunityBalanceTitle,
  getGraphViewGraphDensityAriaLabel,
  getGraphViewGraphDensityTitle,
  getGraphViewCommunityCohesionAriaLabel,
  getGraphViewCommunityCohesionTitle,
  getGraphViewCommunityBalanceAriaLabel,
  getGraphViewCommunityBalanceTitle,
  getGraphViewClearCommunityFilterAriaLabel,
  getGraphViewNodeActivityAriaLabel,
  getGraphViewNodeActivityTitle,
  getGraphViewNodeSummaryTitle,
  getGraphViewNodeSummaryAriaLabel,
  getGrowthBadgeClasses,
  formatGrowthRateText,
  getStatCardContainerClasses,
  getStatCardHeaderClasses,
  getStatCardLabelClasses,
  getStatCardValueGroupClasses,
  getStatCardValueClasses,
  getStatCardSubtextClasses,
  getStatsPanelHeadingTitle,
  getStatsPanelHeadingDescription,
  getStatsPanelBackAriaLabel,
  getRecommenderHeadingTitle,
  getRecommenderHeadingDescription,
  getRecommenderEmptyStateText,
  getRecentUsersHeadingTitle,
  getTopCommunitiesHeadingTitle,
  getTopConnectedHeadingTitle,
  getRecent30DaysHeadingTitle,
  getTopClubsHeadingTitle,
  getRecommendedPlayerProfileLinkAriaLabel,
  getStatsCardCommunityLabel,
  getStatsCardCommunityMembersText,
  getStatsPanelContainerClasses,
  getStatsPanelHeaderBackLinkClasses,
  getStatsPanelOverviewGridClasses,
  getStatsPanelSectionCardClasses,
  getStatsPanelSummaryCardClasses,
  getStatsPanelTopPlayerItemClasses,
  getStatsPanelRecentUserItemClasses,
  getStatsPanelBadgeTagClasses,
  getTopPlayerRankText,
  getTopPlayerMatchesText,
  getTopPlayerContactsText,
  getUsersOverviewCardTitle,
  getUsersOverviewCardSubtext,
  getTurnsOverviewCardTitle,
  getTurnsOverviewCardSubtext,
  getMatchesOverviewCardTitle,
  getMatchesOverviewCardSubtext,
  getEnrollmentsOverviewCardTitle,
  getEnrollmentsOverviewCardSubtext,
  getNetworkSectionTitle,
  getNetworkPlayersLabel,
  getNetworkConnectionsLabel,
  getNetworkDensityLabel,
  getNetworkAvgConnectionsLabel,
  getActiveSessionsLabel,
  getActive30dLabel,
  getActive30dSubtext,
  get30dSummaryUsersLabel,
  get30dSummaryTurnsLabel,
  get30dSummaryMatchesLabel,
  calculateAdoptionGrowthRate,
  aggregateTopCommunities,
  aggregateTopClubsActivity,
  sortRecommendedCandidatesBySkillDiff,
  calculateSelectedNodeGraphMetrics,
  filterGraphData,
  getGraphViewNodeCanvasSize,
  getFilterChipAriaLabel,
  getNetworkErrorResetButtonText,
  getNetworkErrorHomeButtonText,
  getNetworkErrorIconBadgeClasses,
  getNetworkErrorTitleClasses,
  getNetworkErrorDescriptionClasses,
  getNetworkErrorActionGroupClasses,
  getNetworkErrorButtonClasses,
  getNetworkPageTabListAriaLabel,
  getNetworkPageStatsTabLabel,
  getNetworkPageGraphTabLabel,
  type TurnRescueCandidateInput,
  type EnrolledTurnPlayerInput,
} from "@/app/network/graph-utils";
import type { GraphLink, GraphNode } from "@/app/network/actions";

describe("filterGraphData", () => {
  const nodes: GraphNode[] = [
    { id: "p-01", name: "Agustín", alias: "agu", image: null, skillScore: 1100, community: 1, networkSize: 3, matchesPlayed: 10, preferredSide: "RIGHT" },
    { id: "p-02", name: "Belasteguín", alias: "Bela", image: null, skillScore: 1200, community: 1, networkSize: 3, matchesPlayed: 12, preferredSide: "LEFT" },
    { id: "p-03", name: "Gerónimo", alias: "Gero", image: null, skillScore: 1050, community: 2, networkSize: 2, matchesPlayed: 5, preferredSide: "RIGHT" },
    { id: "p-04", name: "Facundo", alias: "Facu", image: null, skillScore: 1020, community: 3, networkSize: 1, matchesPlayed: 0, preferredSide: "LEFT" },
  ];

  const links: GraphLink[] = [
    { source: "p-01", target: "p-02", rivalMatches: 0, partnerMatches: 3, winsA: 0, winsB: 0, winsTogether: 2, lossesTogether: 1, turnsTogether: 0, strength: 3 },
    { source: "p-01", target: "p-03", rivalMatches: 3, partnerMatches: 0, winsA: 2, winsB: 1, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 3 },
    { source: "p-01", target: "p-04", rivalMatches: 0, partnerMatches: 0, winsA: 0, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 2, strength: 2 },
  ];

  const baseData = { nodes, links };

  it("returns base data when no search, linkFilter is 'all', and community is null", () => {
    const result = filterGraphData(baseData, "", "all", null);
    expect(result.nodes).toHaveLength(4);
    expect(result.links).toHaveLength(3);
  });

  it("filters graph by community cluster", () => {
    const result = filterGraphData(baseData, "", "all", 1);
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes.map((n) => n.id)).toEqual(["p-01", "p-02"]);
    expect(result.links).toHaveLength(1);
  });

  it("filters graph by search query matching node name or alias", () => {
    const result = filterGraphData(baseData, "Bela", "all", null);
    expect(result.nodes.map((n) => n.id)).toContain("p-02");
    expect(result.nodes.map((n) => n.id)).toContain("p-01"); // connected node included
  });

  it("filters graph by link type 'partner'", () => {
    const result = filterGraphData(baseData, "", "partner", null);
    expect(result.links).toHaveLength(1);
    expect(result.links[0].source).toBe("p-01");
    expect(result.links[0].target).toBe("p-02");
  });

  it("filters graph by link type 'rival'", () => {
    const result = filterGraphData(baseData, "", "rival", null);
    expect(result.links).toHaveLength(1);
    expect(result.links[0].target).toBe("p-03");
  });

  it("filters graph by link type 'turns'", () => {
    const result = filterGraphData(baseData, "", "turns", null);
    expect(result.links).toHaveLength(1);
    expect(result.links[0].target).toBe("p-04");
  });
});

describe("getGraphViewNodeCanvasSize and getFilterChipAriaLabel", () => {
  it("calculates node canvas radius properly based on matches played", () => {
    expect(getGraphViewNodeCanvasSize(0)).toBe(5);
    expect(getGraphViewNodeCanvasSize(null)).toBe(5);
    expect(getGraphViewNodeCanvasSize(16)).toBe(5 + 4 * 1.2); // 9.8
  });

  it("formats filter chip ARIA label correctly depending on active state", () => {
    expect(getFilterChipAriaLabel("Parejas", true)).toBe("Filtro Parejas activo. Tocar para desactivar.");
    expect(getFilterChipAriaLabel("Rivales", false)).toBe("Filtrar por Rivales.");
  });
});

describe("calculateSelectedNodeGraphMetrics", () => {
  const nodes: GraphNode[] = [
    { id: "p-01", name: "Agustín", alias: "agu", image: null, skillScore: 1100, community: 1, networkSize: 3, matchesPlayed: 10, preferredSide: "RIGHT" },
    { id: "p-02", name: "Belasteguín", alias: "Bela", image: null, skillScore: 1200, community: 1, networkSize: 3, matchesPlayed: 12, preferredSide: "LEFT" },
    { id: "p-03", name: "Gero", alias: "gero", image: null, skillScore: 1050, community: 2, networkSize: 2, matchesPlayed: 5, preferredSide: "RIGHT" },
    { id: "p-04", name: "Facu", alias: "facu", image: null, skillScore: 1020, community: 3, networkSize: 2, matchesPlayed: 4, preferredSide: "LEFT" },
  ];

  const links: GraphLink[] = [
    { source: "p-01", target: "p-02", rivalMatches: 1, partnerMatches: 3, winsA: 1, winsB: 0, winsTogether: 2, lossesTogether: 1, turnsTogether: 0, strength: 4 },
    { source: "p-01", target: "p-03", rivalMatches: 2, partnerMatches: 0, winsA: 1, winsB: 1, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 2 },
    { source: "p-01", target: "p-04", rivalMatches: 0, partnerMatches: 2, winsA: 0, winsB: 0, winsTogether: 2, lossesTogether: 0, turnsTogether: 0, strength: 2 },
  ];

  it("aggregates all 15 graph network metrics for selected node p-01 without viewerId", () => {
    const selected = nodes[0];
    const metrics = calculateSelectedNodeGraphMetrics(selected, nodes, links);

    expect(metrics.activityTier.label).toBe("Jugador activo 🎾");
    expect(metrics.roleInfo.roleLabel).toBe("Nexo comunitario 🌉");
    expect(metrics.diversity.diversityTier).toBe("Red ultra diversificada 🌐");
    expect(metrics.crossRivalry.rivalryTier).toBe("Red de rivalidad activa ⚔️");
    expect(metrics.reach.reachTier).toBe("Red inicial 📍");
    expect(metrics.bridging.bridgingTier).toBe("Puente de red 🌉");
    expect(metrics.centrality.centralityTier).toBe("Hub principal 👑");
    expect(metrics.reciprocity.reciprocityTier).toBe("Red recíproca y equilibrada ⚖️");
    expect(metrics.stability.stabilityTier).toBe("Duplas consolidadas 🏆");
    expect(metrics.localClustering.clusteringTier).toBe("Conector abierto 🌐");
    expect(metrics.concentration.concentrationTier).toBe("Red distribuida 🌐");
    expect(metrics.complementarity.complementarityTier).toBe("Dupla sinérgica ideal 🎯");
    expect(metrics.multiBelonging.multiBelongingTier).toBe("Multicomunitario 🌐");
    expect(metrics.expansionPotential.expansionTier).toBe("Círculo exclusivo 🔒");
    expect(metrics.similarityInfo).toBeNull();
  });

  it("calculates similarityInfo when viewerId is provided and distinct from selected node", () => {
    const selected = nodes[1]; // p-02 (Bela)
    const metrics = calculateSelectedNodeGraphMetrics(selected, nodes, links, "p-01");

    expect(metrics.similarityInfo).not.toBeNull();
    expect(metrics.similarityInfo?.similarityTier).toBe("Alta compatibilidad 👍");
    expect(metrics.similarityInfo?.isSideComplementary).toBe(true);
    expect(metrics.similarityInfo?.skillDiff).toBe(100);
  });
});

describe("calculateNetworkExpansionPotential", () => {
  const nodes: GraphNode[] = [
    { id: "p-01", name: "Agustín", alias: "agu", image: null, skillScore: 1100, community: 1, networkSize: 3, matchesPlayed: 10, preferredSide: "RIGHT" },
    { id: "p-02", name: "Belasteguín", alias: "Bela", image: null, skillScore: 1200, community: 1, networkSize: 3, matchesPlayed: 12, preferredSide: "LEFT" },
    { id: "p-03", name: "Gero", alias: "gero", image: null, skillScore: 1050, community: 2, networkSize: 2, matchesPlayed: 5, preferredSide: "RIGHT" },
    { id: "p-04", name: "Facu", alias: "facu", image: null, skillScore: 1000, community: 3, networkSize: 2, matchesPlayed: 4, preferredSide: "BOTH" },
    { id: "p-05", name: "Diego", alias: "diego", image: null, skillScore: 980, community: 4, networkSize: 1, matchesPlayed: 2, preferredSide: "LEFT" },
    { id: "p-06", name: "Lucas", alias: "lucas", image: null, skillScore: 1020, community: 2, networkSize: 1, matchesPlayed: 2, preferredSide: "RIGHT" },
  ];

  it("returns fallback expansion potential info for isolated node with zero links", () => {
    const res = calculateNetworkExpansionPotential([], nodes, "p-99");
    expect(res.expansionScore).toBe(0);
    expect(res.unexploredReachCount).toBe(0);
    expect(res.unconnectedCommunitiesCount).toBe(4); // communities 1, 2, 3, 4
    expect(res.expansionTier).toBe("Círculo exclusivo 🔒");
    expect(res.badgeStyle).toContain("bg-muted");
    expect(res.formattedSummary).toBe("4 grupos no conectados en la red");
  });

  it("calculates 'Red en expansión activa 🚀' tier for node with high 2nd-degree reach and unconnected communities", () => {
    const links: GraphLink[] = [
      { source: "p-01", target: "p-02", rivalMatches: 0, partnerMatches: 2, winsA: 0, winsB: 0, winsTogether: 2, lossesTogether: 0, turnsTogether: 0, strength: 2 },
      { source: "p-02", target: "p-03", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-02", target: "p-04", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-02", target: "p-05", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-02", target: "p-06", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
    ];

    const res = calculateNetworkExpansionPotential(links, nodes, "p-01");
    expect(res.unexploredReachCount).toBe(4);
    expect(res.unconnectedCommunitiesCount).toBe(3);
    expect(res.expansionTier).toBe("Red en expansión activa 🚀");
    expect(res.badgeStyle).toContain("bg-teal-100");
    expect(res.formattedSummary).toContain("4 contactos de 2º grado");
    expect(res.formattedSummary).toContain("3 grupos no conectados");
  });

  it("calculates 'Potencial de conexión 🌐' tier for moderate 2nd-degree reach", () => {
    const links: GraphLink[] = [
      { source: "p-01", target: "p-02", rivalMatches: 0, partnerMatches: 1, winsA: 0, winsB: 0, winsTogether: 1, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-02", target: "p-03", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
      { source: "p-02", target: "p-04", rivalMatches: 1, partnerMatches: 0, winsA: 1, winsB: 0, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 1 },
    ];

    const res = calculateNetworkExpansionPotential(links, nodes, "p-01");
    expect(res.unexploredReachCount).toBe(2);
    expect(res.expansionTier).toBe("Potencial de conexión 🌐");
    expect(res.badgeStyle).toContain("bg-sky-100");
    expect(res.formattedSummary).toContain("2 contactos de 2º grado");
  });
});

describe("calculateNetworkMultiBelonging", () => {
  const nodes: GraphNode[] = [
    { id: "p-01", name: "Agustín", alias: "agu", image: null, skillScore: 1100, community: 1, networkSize: 3, matchesPlayed: 10, preferredSide: "RIGHT" },
    { id: "p-02", name: "Belasteguín", alias: "Bela", image: null, skillScore: 1200, community: 1, networkSize: 3, matchesPlayed: 12, preferredSide: "LEFT" },
    { id: "p-03", name: "Gero", alias: "gero", image: null, skillScore: 1050, community: 2, networkSize: 2, matchesPlayed: 5, preferredSide: "RIGHT" },
    { id: "p-04", name: "Facu", alias: "facu", image: null, skillScore: 1000, community: 3, networkSize: 2, matchesPlayed: 4, preferredSide: "BOTH" },
  ];

  it("returns fallback multi-belonging info for isolated node with zero connections", () => {
    const res = calculateNetworkMultiBelonging([], nodes, "p-99");
    expect(res.multiBelongingScore).toBe(0);
    expect(res.distinctCommunitiesCount).toBe(0);
    expect(res.primaryCommunitySharePercentage).toBe(0);
    expect(res.externalCommunitiesSharePercentage).toBe(0);
    expect(res.multiBelongingTier).toBe("Comunidad inicial 📍");
    expect(res.badgeStyle).toContain("bg-muted");
    expect(res.formattedSummary).toBe("Sin interacciones registradas en la red");
  });

  it("calculates 'Multicomunitario 🌐' tier for player active across 3 distinct communities", () => {
    const links: GraphLink[] = [
      { source: "p-01", target: "p-02", rivalMatches: 0, partnerMatches: 2, winsA: 0, winsB: 0, winsTogether: 2, lossesTogether: 0, turnsTogether: 0, strength: 2 },
      { source: "p-01", target: "p-03", rivalMatches: 2, partnerMatches: 0, winsA: 1, winsB: 1, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 2 },
      { source: "p-01", target: "p-04", rivalMatches: 0, partnerMatches: 2, winsA: 0, winsB: 0, winsTogether: 2, lossesTogether: 0, turnsTogether: 0, strength: 2 },
    ];

    const res = calculateNetworkMultiBelonging(links, nodes, "p-01");
    expect(res.distinctCommunitiesCount).toBe(3);
    expect(res.primaryCommunitySharePercentage).toBe(33);
    expect(res.externalCommunitiesSharePercentage).toBe(67);
    expect(res.multiBelongingTier).toBe("Multicomunitario 🌐");
    expect(res.badgeStyle).toContain("bg-teal-100");
    expect(res.formattedSummary).toContain("3 grupos de la red");
    expect(res.formattedSummary).toContain("67% interacción externa");
  });

  it("calculates 'Bicomunitario 🔗' tier for player active in 2 distinct communities", () => {
    const links: GraphLink[] = [
      { source: "p-01", target: "p-02", rivalMatches: 0, partnerMatches: 3, winsA: 0, winsB: 0, winsTogether: 2, lossesTogether: 1, turnsTogether: 0, strength: 3 },
      { source: "p-01", target: "p-03", rivalMatches: 2, partnerMatches: 0, winsA: 1, winsB: 1, winsTogether: 0, lossesTogether: 0, turnsTogether: 0, strength: 2 },
    ];

    const res = calculateNetworkMultiBelonging(links, nodes, "p-01");
    expect(res.distinctCommunitiesCount).toBe(2);
    expect(res.primaryCommunitySharePercentage).toBe(60);
    expect(res.externalCommunitiesSharePercentage).toBe(40);
    expect(res.multiBelongingTier).toBe("Bicomunitario 🔗");
    expect(res.badgeStyle).toContain("bg-sky-100");
    expect(res.formattedSummary).toContain("2 grupos de la red");
    expect(res.formattedSummary).toContain("40% interacción externa");
  });

  it("calculates 'Focalizado en grupo 🏛️' tier for single community concentration", () => {
    const links: GraphLink[] = [
      { source: "p-01", target: "p-02", rivalMatches: 0, partnerMatches: 4, winsA: 0, winsB: 0, winsTogether: 3, lossesTogether: 1, turnsTogether: 0, strength: 4 },
    ];

    const res = calculateNetworkMultiBelonging(links, nodes, "p-01");
    expect(res.distinctCommunitiesCount).toBe(1);
    expect(res.primaryCommunitySharePercentage).toBe(100);
    expect(res.externalCommunitiesSharePercentage).toBe(0);
    expect(res.multiBelongingTier).toBe("Focalizado en grupo 🏛️");
    expect(res.badgeStyle).toContain("bg-emerald-100");
    expect(res.formattedSummary).toContain("1 grupo de la red");
    expect(res.formattedSummary).toContain("100% interacción interna");
  });
});

describe("calculatePlayerMatchComplementarity", () => {
  const nodes: GraphNode[] = [
    { id: "p-01", name: "Agustín", alias: "agu", image: null, skillScore: 1100, community: 1, networkSize: 3, matchesPlayed: 10, preferredSide: "RIGHT" },
    { id: "p-02", name: "Belasteguín", alias: "Bela", image: null, skillScore: 1200, community: 1, networkSize: 3, matchesPlayed: 12, preferredSide: "LEFT" },
    { id: "p-03", name: "Gero", alias: "gero", image: null, skillScore: 1050, community: 1, networkSize: 2, matchesPlayed: 5, preferredSide: "RIGHT" },
    { id: "p-04", name: "Facu", alias: "facu", image: null, skillScore: 1000, community: 1, networkSize: 2, matchesPlayed: 4, preferredSide: "BOTH" },
  ];

  it("returns fallback complementarity info for isolated node with zero partners", () => {
    const res = calculatePlayerMatchComplementarity([], nodes, "p-99");
    expect(res.complementarityScore).toBe(0);
    expect(res.totalPartnersCount).toBe(0);
    expect(res.synergicPartnersCount).toBe(0);
    expect(res.sameSidePartnersCount).toBe(0);
    expect(res.avgPartnerWinRatePercentage).toBeNull();
    expect(res.complementarityTier).toBe("Ajuste táctico ⚠️");
    expect(res.badgeStyle).toContain("bg-muted");
    expect(res.formattedSummary).toBe("Sin duplas registradas en la red");
  });

  it("calculates 'Dupla sinérgica ideal 🎯' tier for player with complementary partners and high win rate", () => {
    const links: GraphLink[] = [
      { source: "p-01", target: "p-02", rivalMatches: 0, partnerMatches: 4, winsA: 0, winsB: 0, winsTogether: 3, lossesTogether: 1, turnsTogether: 0, strength: 4 },
      { source: "p-01", target: "p-04", rivalMatches: 0, partnerMatches: 2, winsA: 0, winsB: 0, winsTogether: 2, lossesTogether: 0, turnsTogether: 0, strength: 2 },
    ];

    const res = calculatePlayerMatchComplementarity(links, nodes, "p-01");
    expect(res.totalPartnersCount).toBe(2);
    expect(res.synergicPartnersCount).toBe(2);
    expect(res.avgPartnerWinRatePercentage).toBe(83);
    expect(res.complementarityTier).toBe("Dupla sinérgica ideal 🎯");
    expect(res.badgeStyle).toContain("bg-emerald-100");
    expect(res.formattedSummary).toContain("2 duplas sinérgicas (Der + Rev)");
    expect(res.formattedSummary).toContain("83% WR dupla");
  });

  it("calculates 'Sinergia técnica ⚡' tier for player with at least 1 complementary partner", () => {
    const links: GraphLink[] = [
      { source: "p-01", target: "p-02", rivalMatches: 0, partnerMatches: 2, winsA: 0, winsB: 0, winsTogether: 1, lossesTogether: 1, turnsTogether: 0, strength: 2 },
    ];

    const res = calculatePlayerMatchComplementarity(links, nodes, "p-01");
    expect(res.totalPartnersCount).toBe(1);
    expect(res.synergicPartnersCount).toBe(1);
    expect(res.avgPartnerWinRatePercentage).toBe(50);
    expect(res.complementarityTier).toBe("Sinergia técnica ⚡");
    expect(res.badgeStyle).toContain("bg-sky-100");
    expect(res.formattedSummary).toContain("1 dupla sinérgica (Der + Rev)");
    expect(res.formattedSummary).toContain("50% WR dupla");
  });

  it("calculates 'Ajuste táctico ⚠️' or 'Sinergia en desarrollo 🌱' tier for partners on the same court side", () => {
    const links: GraphLink[] = [
      { source: "p-01", target: "p-03", rivalMatches: 0, partnerMatches: 2, winsA: 0, winsB: 0, winsTogether: 0, lossesTogether: 2, turnsTogether: 0, strength: 2 },
    ];

    const res = calculatePlayerMatchComplementarity(links, nodes, "p-01");
    expect(res.totalPartnersCount).toBe(1);
    expect(res.synergicPartnersCount).toBe(0);
    expect(res.sameSidePartnersCount).toBe(1);
    expect(res.avgPartnerWinRatePercentage).toBe(0);
    expect(res.formattedSummary).toContain("1 dupla misma posición");
    expect(res.formattedSummary).toContain("0% WR dupla");
  });
});

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
        turnsTogether: 1,
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
        turnsTogether: 2,
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
        turnsTogether: 0,
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
        turnsTogether: 5,
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
        turnsTogether: 1,
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
    expect(record.wins).toBe(4);
    expect(record.losses).toBe(1);
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
      winsTogether: 3,
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
      winsTogether: 2,
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
    const mutual = calculateMutualConnectionsCount(links, "p-01", "p-04");
    expect(mutual).toBe(2);
  });

  it("calculates mutual connections between directly connected players", () => {
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

describe("StatCard styling pure helpers", () => {
  it("returns correct CSS class strings for StatCard elements", () => {
    expect(getStatCardHeaderClasses()).toBe("flex items-center justify-between");
    expect(getStatCardLabelClasses()).toBe("text-xs font-semibold text-muted-foreground");
    expect(getStatCardValueGroupClasses()).toBe("flex items-baseline gap-2");
    expect(getStatCardValueClasses()).toBe("text-2xl font-bold tabular-nums text-foreground");
    expect(getStatCardSubtextClasses()).toBe("text-xs text-muted-foreground");
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
