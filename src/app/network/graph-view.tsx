"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, X, CalendarDays, Users2, Globe2 } from "lucide-react";
import type { GraphData, GraphNode } from "./actions";
import { capitalizeName, cn } from "@/lib/utils";
import {
  linkNodeId,
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
  calculateCommunityCohesion,
  calculateCommunityFilterOptions,
  calculateNetworkDiversityScore,
  calculateCrossRivalryDensity,
  calculatePlayerGraphReach,
  calculateCommunityBridgingScore,
  calculateNetworkCentralityScore,
  calculateGraphDensityMetric,
  calculateCommunityBalanceInfo,
  calculatePlayerInteractionReciprocity,
  calculatePartnershipStabilityInfo,
  calculateLocalClusteringCoefficient,
  calculatePlayerMatchComplementarity,
  calculatePlayerSimilarityInfo,
  calculateNetworkConcentrationIndex,
  calculateNetworkMultiBelonging,
  calculateNetworkExpansionPotential,
  calculateSelectedNodeGraphMetrics,
  filterGraphData,
  getGraphViewNodeCanvasSize,
  getFilterChipAriaLabel,
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
  getFilterChipDotClasses,
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
} from "./graph-utils";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[60vh] text-sm text-muted-foreground">
      {getGraphViewLoadingText()}
    </div>
  ),
});

const COMMUNITY_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#84cc16",
  "#6366f1",
  "#14b8a6",
  "#e11d48",
];

function preloadImages(nodes: GraphNode[]): Map<string, HTMLImageElement> {
  const imageMap = new Map<string, HTMLImageElement>();
  for (const node of nodes) {
    if (node.image) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = node.image;
      img.onload = () => imageMap.set(node.id, img);
      img.onerror = () => {};
    }
  }
  return imageMap;
}


interface GraphViewProps {
  graphData: GraphData;
  viewerId?: string;
}

export function GraphView({ graphData, viewerId }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ForceGraph2D instance type not available from dynamic import
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: typeof window !== "undefined" ? window.innerHeight : 600,
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [linkFilter, setLinkFilter] = useState<"all" | "partner" | "rival" | "mixed" | "turns">("all");
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);
  const [scope, setScope] = useState<"personal" | "global">(viewerId ? "personal" : "global");
  const imageMapRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    imageMapRef.current = preloadImages(graphData.nodes);
  }, [graphData]);

  useEffect(() => {
    const updateDimensions = () => {
      const container = containerRef.current;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      const fg = fgRef.current;
      fg.d3Force("charge").strength(-120);
      fg.d3Force("charge").distanceMax(400);
      fg.d3Force("link").distance(80);
      fg.d3Force("link").strength(0.3);
      fg.d3Force("center").strength(0.05);
      setTimeout(() => {
        fg.zoomToFit(300, 60);
      }, 1200);
    }
  }, [graphData]);

  // Calculate viewer neighbors
  const viewerNeighbors = useMemo(() => {
    if (!viewerId) return new Set<string>();
    const neighbors = new Set<string>();
    for (const link of graphData.links) {
      const sourceId = linkNodeId(link.source);
      const targetId = linkNodeId(link.target);
      if (sourceId === viewerId) neighbors.add(targetId);
      if (targetId === viewerId) neighbors.add(sourceId);
    }
    return neighbors;
  }, [graphData.links, viewerId]);

  // Filter base graph based on scope (personal vs global)
  const baseGraphData = useMemo(() => {
    if (scope === "global" || !viewerId) {
      return graphData;
    }

    const personalNodesSet = new Set<string>([viewerId]);
    for (const neighborId of viewerNeighbors) {
      personalNodesSet.add(neighborId);
    }

    const personalNodes = graphData.nodes.filter((node) => personalNodesSet.has(node.id));
    const personalLinks = graphData.links.filter((link) => {
      const sourceId = linkNodeId(link.source);
      const targetId = linkNodeId(link.target);
      return personalNodesSet.has(sourceId) && personalNodesSet.has(targetId);
    });

    return {
      nodes: personalNodes,
      links: personalLinks,
      generatedAt: graphData.generatedAt,
    };
  }, [graphData, scope, viewerId, viewerNeighbors]);

  const communityFilterOptions = useMemo(() => {
    return calculateCommunityFilterOptions(
      baseGraphData.nodes,
      baseGraphData.links,
    );
  }, [baseGraphData.nodes, baseGraphData.links]);

  // Filter data based on community, search and link filter on top of base graph
  const filteredData = useMemo(() => {
    const filtered = filterGraphData(
      baseGraphData,
      searchQuery,
      linkFilter,
      selectedCommunity,
    );
    return { ...baseGraphData, nodes: filtered.nodes, links: filtered.links };
  }, [baseGraphData, searchQuery, linkFilter, selectedCommunity]);

  const graphDensityMetric = useMemo(() => {
    return calculateGraphDensityMetric(filteredData.nodes, filteredData.links);
  }, [filteredData.nodes, filteredData.links]);

  const selectedLinks = useMemo(() => {
    if (!selectedNode) return [];
    const unsorted = filterLinksBySelectedNode(filteredData.links, selectedNode);
    return sortGraphLinksByStrength(unsorted);
  }, [selectedNode, filteredData.links]);

  const activeCommunitySummary = useMemo(() => {
    if (selectedCommunity === null) return null;
    const summary = calculateCommunitySummary(baseGraphData.nodes, selectedCommunity);
    const cohesion = calculateCommunityCohesion(
      baseGraphData.nodes,
      baseGraphData.links,
      selectedCommunity,
    );
    const balanceInfo = calculateCommunityBalanceInfo(
      baseGraphData.nodes,
      selectedCommunity,
    );
    return { ...summary, cohesion, balanceInfo };
  }, [baseGraphData.nodes, baseGraphData.links, selectedCommunity]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeColor = useCallback((node: any) => {
    const community = node.community ?? 0;
    return COMMUNITY_COLORS[community % COMMUNITY_COLORS.length];
  }, []);

   
  const linkWidth = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-force-graph-2d mutates link source/target to node objects at runtime
    (link: any) => {
      const isSelected =
        selectedNode &&
        (link.source?.id === selectedNode || link.target?.id === selectedNode);
      const base = 0.8 + Math.min(Math.log(link.strength + 1) * 1.2, 4);
      return isSelected ? base * 2 : base;
    },
    [selectedNode],
  );

   
  const linkColor = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-force-graph-2d mutates link source/target to node objects at runtime
    (link: any) => {
      const isSelected =
        selectedNode &&
        (link.source?.id === selectedNode || link.target?.id === selectedNode);
      const isHovered =
        hoveredNode &&
        (link.source?.id === hoveredNode || link.target?.id === hoveredNode);
      if (isSelected) {
        if (link.partnerMatches > 0 && link.rivalMatches === 0)
          return "rgba(16, 185, 129, 0.8)";
        if (link.rivalMatches > 0 && link.partnerMatches === 0)
          return "rgba(239, 68, 68, 0.8)";
        if (link.turnsTogether > 0 && link.partnerMatches === 0 && link.rivalMatches === 0)
          return "rgba(100, 116, 139, 0.8)";
        return "rgba(245, 158, 11, 0.8)";
      }
      if (isHovered) return "rgba(100, 116, 139, 0.5)";
      return "rgba(148, 163, 184, 0.25)";
    },
    [selectedNode, hoveredNode],
  );

  const nodeCanvasObject = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any, ctx: any, globalScale: number) => {
      if (!isFinite(node.x) || !isFinite(node.y)) return;
      const matches = node.matchesPlayed || 0;
      const baseSize = getGraphViewNodeCanvasSize(matches);
      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNode === node.id;
      const isViewer = viewerId === node.id;
      const radius = isHovered || isSelected ? baseSize * 1.2 : baseSize;
      const color = nodeColor(node);
      const label = getGraphViewNodeName(node.name, node.alias, isViewer);
      const fontSize = Math.max(11 / globalScale, 3.5);

      ctx.beginPath();
      ctx.arc(node.x, node.y + 2 / globalScale, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      const img = imageMapRef.current.get(node.id);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius - 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();
        const imgSize = (radius - 2) * 2;
        ctx.drawImage(
          img,
          node.x - radius + 2,
          node.y - radius + 2,
          imgSize,
          imgSize,
        );
        ctx.restore();
      } else {
        ctx.font = `bold ${radius * 0.8}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText(getInitials(label), node.x, node.y);
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = isSelected
        ? color
        : isHovered
          ? "rgba(255,255,255,0.6)"
          : isViewer
            ? "#eab308"
            : "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = (isSelected ? 3 : isHovered ? 2 : isViewer ? 2.5 : 1.5) / globalScale;
      ctx.stroke();

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4 / globalScale, 0, 2 * Math.PI);
        ctx.strokeStyle = color + "60";
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
      } else if (isViewer) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 3 / globalScale, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(234, 179, 8, 0.4)";
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }

      if (globalScale > 0.4) {
        ctx.font = `600 ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const labelY = node.y + radius + fontSize + 4 / globalScale;

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText(
          label,
          node.x + 0.5 / globalScale,
          labelY + 0.5 / globalScale,
        );

        ctx.fillStyle = isSelected ? color : "rgba(51, 65, 85, 0.85)";
        ctx.fillText(label, node.x, labelY);
      }

      if (globalScale > 1 && matches > 0) {
        const badgeX = node.x + radius * 0.75;
        const badgeY = node.y - radius * 0.75;
        const badgeR = radius * 0.38;

        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();

        ctx.font = `bold ${badgeR * 1.1}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = color;
        ctx.fillText(String(matches), badgeX, badgeY);
      }
    },
    [nodeColor, hoveredNode, selectedNode, viewerId],
  );

   
  const focusCameraOnNode = useCallback((nodeId: string) => {
    if (!fgRef.current) return;
    const targetNode = filteredData.nodes.find((n) => n.id === nodeId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const simNode = fgRef.current.graphData?.()?.nodes?.find((n: any) => n.id === nodeId) ?? targetNode;
    if (simNode && isFinite(simNode.x) && isFinite(simNode.y)) {
      fgRef.current.centerAt(simNode.x, simNode.y, 400);
      fgRef.current.zoom(2.5, 400);
    }
  }, [filteredData.nodes]);

  const handleSelectAndFocusNode = useCallback((nodeId: string) => {
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    } else {
      setSelectedNode(nodeId);
      focusCameraOnNode(nodeId);
    }
  }, [selectedNode, focusCameraOnNode]);

  const handleNodeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-force-graph-2d node type includes simulation fields not in GraphNode
    (node: any) => {
      if (node?.id) {
        handleSelectAndFocusNode(node.id);
      }
    },
    [handleSelectAndFocusNode],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node?.id ?? null);
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? "pointer" : "default";
    }
  }, []);

  if (graphData.nodes.length === 0) {
    const emptyDataProps = getGraphViewEmptyDataProps();
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3 text-center px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <CalendarDays className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-lg font-bold text-foreground">{emptyDataProps.title}</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          {emptyDataProps.description}
        </p>
        <Link
          href={emptyDataProps.buttonHref}
          prefetch={true}
          className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
        >
          {emptyDataProps.buttonText}
        </Link>
      </div>
    );
  }

  const selectedNodeData = selectedNode
    ? graphData.nodes.find((n) => n.id === selectedNode)
    : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-muted/30 overflow-hidden"
      style={{ height: "calc(100dvh - 49px)" }}
    >
      {/* Top bar with search and filters */}
      <div className={getGraphViewTopFilterContainerClasses()}>
        {viewerId && (
          <div className="flex flex-col gap-1.5">
            <span id="network-scope-label" className="sr-only">
              {getNetworkScopeLabelText()}
            </span>
            <div
              role="radiogroup"
              aria-labelledby="network-scope-label"
              className={getNetworkScopeRadiogroupClasses()}
            >
              <button
                type="button"
                role="radio"
                aria-checked={scope === "personal"}
                onClick={() => setScope("personal")}
                className={getNetworkScopeButtonClasses(scope === "personal")}
                aria-label={getGraphViewScopeAriaLabel("personal")}
              >
                <Users2 className="h-3.5 w-3.5" aria-hidden="true" />
                {getNetworkScopeButtonText("personal")}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={scope === "global"}
                onClick={() => setScope("global")}
                className={getNetworkScopeButtonClasses(scope === "global")}
                aria-label={getGraphViewScopeAriaLabel("global")}
              >
                <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                {getNetworkScopeButtonText("global")}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className={getGraphViewSearchContainerClasses()}>
            <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder={getGraphViewSearchInputPlaceholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
              aria-label={getGraphViewSearchAriaLabel()}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-all active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label={getGraphViewClearSearchAriaLabel()}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              if (fgRef.current) fgRef.current.zoomToFit(300, 50);
            }}
            className="rounded-xl bg-card px-3 py-2 text-xs font-semibold text-foreground border border-border shadow-sm transition-all hover:bg-muted active:scale-[0.98] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            aria-label={getGraphViewCenterButtonAriaLabel()}
          >
            {getGraphViewCenterButtonText()}
          </button>
        </div>

        {/* Link filter chips */}
        <div className={getGraphViewFilterBarContainerClasses()}>
          <FilterChip
            active={linkFilter === "all"}
            onClick={() => setLinkFilter("all")}
            label="Todos"
          />
          <FilterChip
            active={linkFilter === "partner"}
            onClick={() => setLinkFilter("partner")}
            label="Parejas"
            color="bg-emerald-500"
          />
          <FilterChip
            active={linkFilter === "rival"}
            onClick={() => setLinkFilter("rival")}
            label="Rivales"
            color="bg-red-500"
          />
          <FilterChip
            active={linkFilter === "mixed"}
            onClick={() => setLinkFilter("mixed")}
            label="Mixtos"
            color="bg-amber-500"
          />
          <FilterChip
            active={linkFilter === "turns"}
            onClick={() => setLinkFilter("turns")}
            label="Turnos"
            color="bg-slate-500"
          />

          {communityFilterOptions.map((opt) => (
            <FilterChip
              key={`community-${opt.communityId}`}
              active={selectedCommunity === opt.communityId}
              onClick={() =>
                setSelectedCommunity(
                  selectedCommunity === opt.communityId ? null : opt.communityId,
                )
              }
              label={opt.label}
              dotColor={opt.color}
              ariaLabel={opt.ariaLabel}
            />
          ))}

          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                graphDensityMetric.badgeStyle,
              )}
              title={getGraphViewGraphDensityTitle(
                graphDensityMetric.densityTier,
                graphDensityMetric.formattedSummary,
              )}
              aria-label={getGraphViewGraphDensityAriaLabel(
                graphDensityMetric.densityTier,
                graphDensityMetric.formattedSummary,
              )}
            >
              {graphDensityMetric.densityTier}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums bg-card px-2 py-1 rounded-md border border-border shrink-0">
              {filteredData.nodes.length} · {filteredData.links.length}
            </span>
          </div>
        </div>

        {/* Active community summary banner */}
        {activeCommunitySummary && selectedCommunity !== null && (
          <div className={getGraphViewActiveCommunityBannerClasses()}>
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    COMMUNITY_COLORS[selectedCommunity % COMMUNITY_COLORS.length],
                }}
              />
              <span className="font-bold text-foreground shrink-0">
                Grupo {selectedCommunity}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                  activeCommunitySummary.cohesion.badgeStyle,
                )}
                title={getGraphViewCommunityCohesionTitle(
                  activeCommunitySummary.cohesion.cohesionTier,
                  activeCommunitySummary.cohesion.formattedCohesionSummary,
                )}
                aria-label={getGraphViewCommunityCohesionAriaLabel(
                  activeCommunitySummary.cohesion.cohesionTier,
                  activeCommunitySummary.cohesion.formattedCohesionSummary,
                )}
              >
                {activeCommunitySummary.cohesion.cohesionTier}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                  activeCommunitySummary.balanceInfo.badgeStyle,
                )}
                title={getGraphViewCommunityBalanceTitle(
                  activeCommunitySummary.balanceInfo.balanceTier,
                  activeCommunitySummary.balanceInfo.formattedBalanceSummary,
                )}
                aria-label={getGraphViewCommunityBalanceAriaLabel(
                  activeCommunitySummary.balanceInfo.balanceTier,
                  activeCommunitySummary.balanceInfo.formattedBalanceSummary,
                )}
              >
                {activeCommunitySummary.balanceInfo.balanceTier}
              </span>
              <span className="text-muted-foreground truncate">
                · {activeCommunitySummary.formattedSummary}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCommunity(null)}
              className="text-xs font-bold text-primary hover:underline shrink-0 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-md px-1.5 py-0.5 ml-auto"
              aria-label={getGraphViewClearCommunityFilterAriaLabel(selectedCommunity)}
            >
              {getGraphViewCommunityClearFilterText()}
            </button>
          </div>
        )}
      </div>

      {/* Empty personal network notice */}
      {scope === "personal" && viewerNeighbors.size === 0 && (
        <div className={getGraphViewEmptyNetworkNoticeClasses()}>
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Users2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">{getEmptyPersonalNetworkTitle()}</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {getEmptyPersonalNetworkDescription()}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Link
              href="/turnos"
            prefetch={true}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            >
              {getEmptyPersonalNetworkSearchTurnsLabel()}
            </Link>
            <button
              onClick={() => setScope("global")}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-4 text-xs font-bold text-foreground transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            >
              {getEmptyPersonalNetworkViewGlobalLabel()}
            </button>
          </div>
        </div>
      )}

      {/* Empty search or filter results notice */}
      {filteredData.nodes.length === 0 && (searchQuery.trim() || linkFilter !== "all" || selectedCommunity !== null) && (
        (() => {
          const emptySearchProps = getGraphViewEmptySearchProps(searchQuery);
          return (
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 text-center space-y-2 pointer-events-auto">
              <p className="text-sm font-semibold text-muted-foreground">
                {emptySearchProps.message}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setLinkFilter("all");
                  setSelectedCommunity(null);
                }}
                className="text-xs font-bold text-primary hover:underline active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-md px-2 py-1"
              >
                {emptySearchProps.buttonText}
              </button>
            </div>
          );
        })()
      )}

      <ForceGraph2D
        ref={fgRef}
        graphData={filteredData}
        width={dimensions.width}
        height={dimensions.height}
        nodeVal={(node) => {
          const n = node as GraphNode;
          const r = getGraphViewNodeCanvasSize(n.matchesPlayed);
          return r * r;
        }}
        nodeRelSize={1}
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => "replace"}
        linkWidth={linkWidth}
        linkColor={linkColor}
        linkCurvature={0.15}
        linkDirectionalParticles={0}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        minZoom={0.15}
        maxZoom={15}
        backgroundColor="#fafafa"
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.4}
        cooldownTicks={500}
      />

      {/* Detail panel */}
      {selectedNodeData && (
        <div className={getGraphViewSelectedNodeDetailClasses()}>
          <div className="flex items-center gap-3 mb-3">
            {selectedNodeData.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedNodeData.image}
                alt={selectedNodeData.name}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center text-base font-bold text-white ring-2 ring-border"
                style={{ backgroundColor: nodeColor(selectedNodeData) }}
              >
                {getInitials(selectedNodeData.id === viewerId ? "Vos" : capitalizeName(selectedNodeData.name || selectedNodeData.alias || "?"))}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {getGraphViewNodeName(selectedNodeData.name, selectedNodeData.alias, selectedNodeData.id === viewerId)}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <p
                  className="text-xs text-muted-foreground"
                  aria-label={getGraphViewSelectedNodeAriaLabel(
                    getGraphViewNodeName(selectedNodeData.name, selectedNodeData.alias, selectedNodeData.id === viewerId),
                    selectedNodeData.matchesPlayed,
                    selectedNodeData.networkSize,
                  )}
                >
                  {selectedNodeData.matchesPlayed} partidos ·{" "}
                  {selectedNodeData.networkSize} contactos
                </p>
                {(() => {
                  const metrics = calculateSelectedNodeGraphMetrics(
                    selectedNodeData,
                    graphData.nodes,
                    filteredData.links,
                    viewerId,
                  );
                  return (
                    <>
                      {metrics.similarityInfo && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                            metrics.similarityInfo.badgeStyle,
                          )}
                          title={getPlayerSimilarityAriaLabel(
                            metrics.similarityInfo.similarityTier,
                            metrics.similarityInfo.formattedSummary,
                          )}
                          aria-label={getPlayerSimilarityAriaLabel(
                            metrics.similarityInfo.similarityTier,
                            metrics.similarityInfo.formattedSummary,
                          )}
                        >
                          {metrics.similarityInfo.similarityTier}
                        </span>
                      )}
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          metrics.expansionPotential.badgeStyle,
                        )}
                        title={getPlayerExpansionAriaLabel(
                          metrics.expansionPotential.expansionTier,
                          metrics.expansionPotential.formattedSummary,
                        )}
                        aria-label={getPlayerExpansionAriaLabel(
                          metrics.expansionPotential.expansionTier,
                          metrics.expansionPotential.formattedSummary,
                        )}
                      >
                        {metrics.expansionPotential.expansionTier}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          metrics.concentration.badgeStyle,
                        )}
                        title={getInteractionConcentrationAriaLabel(
                          metrics.concentration.concentrationTier,
                          metrics.concentration.formattedSummary,
                        )}
                        aria-label={getInteractionConcentrationAriaLabel(
                          metrics.concentration.concentrationTier,
                          metrics.concentration.formattedSummary,
                        )}
                      >
                        {metrics.concentration.concentrationTier}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          metrics.multiBelonging.badgeStyle,
                        )}
                        title={getMultiBelongingAriaLabel(
                          metrics.multiBelonging.multiBelongingTier,
                          metrics.multiBelonging.formattedSummary,
                        )}
                        aria-label={getMultiBelongingAriaLabel(
                          metrics.multiBelonging.multiBelongingTier,
                          metrics.multiBelonging.formattedSummary,
                        )}
                      >
                        {metrics.multiBelonging.multiBelongingTier}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          metrics.complementarity.badgeStyle,
                        )}
                        title={getMatchComplementarityAriaLabel(
                          metrics.complementarity.complementarityTier,
                          metrics.complementarity.formattedSummary,
                        )}
                        aria-label={getMatchComplementarityAriaLabel(
                          metrics.complementarity.complementarityTier,
                          metrics.complementarity.formattedSummary,
                        )}
                      >
                        {metrics.complementarity.complementarityTier}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          metrics.stability.badgeStyle,
                        )}
                        title={getPartnershipStabilityAriaLabel(
                          metrics.stability.stabilityTier,
                          metrics.stability.formattedSummary,
                        )}
                        aria-label={getPartnershipStabilityAriaLabel(
                          metrics.stability.stabilityTier,
                          metrics.stability.formattedSummary,
                        )}
                      >
                        {metrics.stability.stabilityTier}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          metrics.localClustering.badgeStyle,
                        )}
                        title={getLocalClusteringAriaLabel(
                          metrics.localClustering.clusteringTier,
                          metrics.localClustering.formattedSummary,
                        )}
                        aria-label={getLocalClusteringAriaLabel(
                          metrics.localClustering.clusteringTier,
                          metrics.localClustering.formattedSummary,
                        )}
                      >
                        {metrics.localClustering.clusteringTier}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          metrics.activityTier.badgeStyle,
                        )}
                        title={getGraphViewNodeActivityTitle(metrics.activityTier.label)}
                        aria-label={getGraphViewNodeActivityAriaLabel(metrics.activityTier.label)}
                      >
                        {metrics.activityTier.label}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          metrics.centrality.badgeStyle,
                        )}
                        title={getNetworkCentralityAriaLabel(
                          metrics.centrality.centralityTier,
                          metrics.centrality.formattedSummary,
                        )}
                        aria-label={getNetworkCentralityAriaLabel(
                          metrics.centrality.centralityTier,
                          metrics.centrality.formattedSummary,
                        )}
                      >
                        {metrics.centrality.centralityTier}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          metrics.roleInfo.badgeStyle,
                        )}
                        title={getNetworkRoleAriaLabel(
                          metrics.roleInfo.roleLabel,
                          metrics.roleInfo.description,
                        )}
                        aria-label={getNetworkRoleAriaLabel(
                          metrics.roleInfo.roleLabel,
                          metrics.roleInfo.description,
                        )}
                      >
                        {metrics.roleInfo.roleLabel}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          metrics.bridging.badgeStyle,
                        )}
                        title={getCommunityBridgingAriaLabel(
                          metrics.bridging.bridgingTier,
                          metrics.bridging.formattedSummary,
                        )}
                        aria-label={getCommunityBridgingAriaLabel(
                          metrics.bridging.bridgingTier,
                          metrics.bridging.formattedSummary,
                        )}
                      >
                        {metrics.bridging.bridgingTier}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          metrics.diversity.badgeStyle,
                        )}
                        title={getNetworkDiversityAriaLabel(
                          metrics.diversity.diversityTier,
                          metrics.diversity.formattedSummary,
                        )}
                        aria-label={getNetworkDiversityAriaLabel(
                          metrics.diversity.diversityTier,
                          metrics.diversity.formattedSummary,
                        )}
                      >
                        {metrics.diversity.diversityTier}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          metrics.crossRivalry.badgeStyle,
                        )}
                        title={getCrossRivalryAriaLabel(
                          metrics.crossRivalry.rivalryTier,
                          metrics.crossRivalry.formattedSummary,
                        )}
                        aria-label={getCrossRivalryAriaLabel(
                          metrics.crossRivalry.rivalryTier,
                          metrics.crossRivalry.formattedSummary,
                        )}
                      >
                        {metrics.crossRivalry.rivalryTier}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          metrics.reach.badgeStyle,
                        )}
                        title={getPlayerGraphReachAriaLabel(
                          metrics.reach.reachTier,
                          metrics.reach.formattedSummary,
                        )}
                        aria-label={getPlayerGraphReachAriaLabel(
                          metrics.reach.reachTier,
                          metrics.reach.formattedSummary,
                        )}
                      >
                        {metrics.reach.reachTier}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          metrics.reciprocity.badgeStyle,
                        )}
                        title={getInteractionReciprocityAriaLabel(
                          metrics.reciprocity.reciprocityTier,
                          metrics.reciprocity.formattedSummary,
                        )}
                        aria-label={getInteractionReciprocityAriaLabel(
                          metrics.reciprocity.reciprocityTier,
                          metrics.reciprocity.formattedSummary,
                        )}
                      >
                        {metrics.reciprocity.reciprocityTier}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-all active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              aria-label={getGraphViewDetailPanelCloseAriaLabel()}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className={getGraphViewDetailPanelCardScoreClasses()}>
              <p className="text-xs text-muted-foreground">{getGraphViewDetailPanelScoreLabel()}</p>
              <p className="text-sm tabular-nums font-bold text-foreground">
                {selectedNodeData.skillScore}
              </p>
            </div>
            {(() => {
              const sideInfo = getPreferredSideBadgeLabel(selectedNodeData.preferredSide);
              return (
                <div
                  className={getGraphViewDetailPanelCardScoreClasses()}
                  title={sideInfo.label}
                  aria-label={sideInfo.label}
                >
                  <p className="text-xs text-muted-foreground">{getGraphViewDetailPanelSideLabel()}</p>
                  <p className="text-sm font-bold text-foreground">
                    {sideInfo.shortLabel}
                  </p>
                </div>
              );
            })()}
            <div className={getGraphViewDetailPanelCardScoreClasses()}>
              <p className="text-xs text-muted-foreground">{getGraphViewDetailPanelGroupLabel()}</p>
              {selectedNodeData.community !== null ? (
              (() => {
                const commSummary = calculateCommunitySummary(
                  graphData.nodes,
                  selectedNodeData.community,
                );
                return (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCommunity(
                        selectedCommunity === selectedNodeData.community
                          ? null
                          : selectedNodeData.community,
                      )
                    }
                    className="w-full text-center font-bold text-sm hover:underline active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-md"
                    style={{ color: nodeColor(selectedNodeData) }}
                    title={`Grupo ${selectedNodeData.community}: ${commSummary.formattedSummary}`}
                    aria-label={getGraphViewNodeGroupAriaLabel(
                      selectedNodeData.community,
                      commSummary.formattedSummary,
                      selectedCommunity === selectedNodeData.community,
                    )}
                  >
                    {selectedNodeData.community}
                  </button>
                );
              })()
              ) : (
                <p className="text-sm font-bold text-muted-foreground">—</p>
              )}
            </div>
          </div>

          <Link
            href={`/p/${selectedNodeData.id}`}
            prefetch={true}
            className={getGraphViewDetailPanelPublicProfileButtonClasses()}
          >
            {getGraphViewDetailPanelPublicProfileText()}
          </Link>

          <div className="pt-3 border-t border-border">
            {(() => {
              const summary = calculateNodeConnectionSummary(
                filteredData.links,
                selectedNodeData.id,
              );
              const synergyBreakdown = calculateSideSynergyBreakdown(
                filteredData.links,
                graphData.nodes,
                selectedNodeData.id,
              );
              return (
                <div
                  className={getGraphViewSummaryCardContainerClasses()}
                  title={getGraphViewNodeSummaryTitle(summary.formattedSummary)}
                  aria-label={getGraphViewNodeSummaryAriaLabel(
                    selectedNodeData.id === viewerId ? "Vos" : capitalizeName(selectedNodeData.name || selectedNodeData.alias || "Jugador"),
                    summary.formattedSummary,
                    synergyBreakdown.formattedSynergySummary,
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-semibold text-foreground text-[11px]">
                      {getGraphViewSummaryCardTitleText()}
                    </p>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {getGraphViewSummaryCardTotalText(summary.totalConnections)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px] truncate">
                    {summary.formattedSummary}
                  </p>
                  {synergyBreakdown.totalPartners > 0 && (
                    <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 break-words leading-tight pt-0.5 border-t border-border/50">
                      {getGraphViewSummaryCardSynergyText(synergyBreakdown.formattedSynergySummary)}
                    </p>
                  )}
                </div>
              );
            })()}

            <p className="text-xs text-muted-foreground mb-2 font-medium">
              {getGraphViewDetailPanelConnectionsHeader(selectedLinks.length)}
            </p>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {selectedLinks.map((link, i) => {
                const otherId =
                  linkNodeId(link.source) === selectedNode
                    ? linkNodeId(link.target)
                    : linkNodeId(link.source);
                const other = graphData.nodes.find((n) => n.id === otherId);
                const otherName = capitalizeName(other?.name || other?.alias || "—");
                const record = calculateConnectionRecord(link, selectedNode ?? "");
                const affinity = getConnectionAffinityLabel(link);
                const sideCompatibility = getSideCompatibilityLabel(
                  selectedNodeData.preferredSide,
                  other?.preferredSide ?? null,
                );
                const mutualCount = calculateMutualConnectionsCount(
                  filteredData.links,
                  selectedNode ?? "",
                  otherId,
                );

                return (
                  <div
                    key={i}
                    className={getGraphViewConnectionItemClasses()}
                  >
                    <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAndFocusNode(otherId)}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-md"
                      aria-label={getGraphViewFocusNodeAriaLabel(otherName)}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 border",
                          getConnectionBadgeClasses(record.type),
                        )}
                      >
                        {getConnectionTypeSymbol(record.type)}
                      </span>
                      <span className="text-xs font-medium text-foreground truncate">
                        {otherName}
                      </span>
                      <span className="text-muted-foreground text-xs font-semibold tabular-nums ml-auto shrink-0 pr-1 flex items-center gap-1.5">
                        {record.winRatePercentage !== null && (
                          <span
                            className={getGraphViewWinRateBadgeClasses()}
                            title={getGraphViewConnectionWinRateAriaLabel(record.winRatePercentage)}
                            aria-label={getGraphViewConnectionWinRateAriaLabel(record.winRatePercentage)}
                          >
                            {record.winRatePercentage}% WR
                          </span>
                        )}
                        <span>{record.formattedRecord}</span>
                      </span>
                    </button>
                    <Link
                      href={`/p/${otherId}`}
                      prefetch={true}
                      className={getGraphViewProfileLinkClasses()}
                      aria-label={getGraphViewProfileLinkAriaLabel(otherName)}
                    >
                      Perfil
                    </Link>
                    </div>

                    <div className="flex items-center gap-1.5 pl-8 flex-wrap">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                          affinity.badgeStyle
                        )}
                        title={getGraphViewAffinityTitle(affinity.label)}
                        aria-label={getGraphViewAffinityTitle(affinity.label)}
                      >
                        {affinity.label}
                      </span>
                      {sideCompatibility && (record.type === "partner" || record.type === "mixed") && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                            sideCompatibility.isComplementary
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800"
                              : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800"
                          )}
                        >
                          {sideCompatibility.label}
                        </span>
                      )}
                      {mutualCount > 0 && (
                        <span
                          className={getGraphViewMutualContactsBadgeClasses()}
                          title={`${mutualCount} ${mutualCount === 1 ? "contacto en común" : "contactos en común"}`}
                          aria-label={getGraphViewConnectionMutualAriaLabel(otherName, mutualCount)}
                        >
                          {getGraphViewMutualContactsBadgeText(mutualCount)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        className={getGraphViewLegendContainerClasses()}
        aria-label={getGraphViewLegendAriaLabel()}
      >
        <p className="text-xs text-muted-foreground mb-1.5 font-medium">
          {getGraphViewLegendTitle()}
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">{getGraphViewLegendPartnerLabel()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">{getGraphViewLegendRivalLabel()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">{getGraphViewLegendMixedLabel()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-slate-500" />
            <span className="text-xs text-muted-foreground">{getGraphViewLegendTurnsLabel()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  color,
  dotColor,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
  dotColor?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={getFilterChipClasses(active)}
      aria-pressed={active}
      aria-label={ariaLabel || getFilterChipAriaLabel(label, active)}
    >
      {dotColor ? (
        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
      ) : (
        color && <div className={getFilterChipDotClasses(color)} />
      )}
      {label}
    </button>
  );
}
