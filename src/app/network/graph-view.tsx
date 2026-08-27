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
} from "./graph-utils";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[60vh] text-sm text-muted-foreground">
      Cargando grafo...
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
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

  const availableCommunities = useMemo(() => {
    const set = new Set<number>();
    for (const n of baseGraphData.nodes) {
      if (n.community !== null && n.community !== undefined) {
        set.add(n.community);
      }
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [baseGraphData.nodes]);

  // Filter data based on community, search and link filter on top of base graph
  const filteredData = useMemo(() => {
    const communityData = filterNodesAndLinksByCommunity(
      baseGraphData.nodes,
      baseGraphData.links,
      selectedCommunity,
    );

    const trimmedSearch = searchQuery.trim();
    if (!trimmedSearch && linkFilter === "all") return communityData;

    const query = normalizeSearchQuery(trimmedSearch);
    const matchingNodes = new Set(
      communityData.nodes
        .filter((n) => {
          if (!query) return true;
          return (
            normalizeSearchQuery(n.name || "").includes(query) ||
            (n.alias ? normalizeSearchQuery(n.alias).includes(query) : false)
          );
        })
        .map((n) => n.id),
    );

    // If searching, also include connected nodes
    if (query && matchingNodes.size > 0) {
      for (const link of communityData.links) {
        const sourceId = linkNodeId(link.source);
        const targetId = linkNodeId(link.target);
        if (matchingNodes.has(sourceId)) matchingNodes.add(targetId);
        if (matchingNodes.has(targetId)) matchingNodes.add(sourceId);
      }
    }

    const filteredLinks = communityData.links.filter((link) => {
      const sourceId = linkNodeId(link.source);
      const targetId = linkNodeId(link.target);

      // Node filter
      if (query && !matchingNodes.has(sourceId) && !matchingNodes.has(targetId)) {
        return false;
      }

      // Link type filter
      if (linkFilter !== "all") {
        const isPartner = link.partnerMatches > 0 && link.rivalMatches === 0;
        const isRival = link.rivalMatches > 0 && link.partnerMatches === 0;
        const isTurns = link.turnsTogether > 0 && link.partnerMatches === 0 && link.rivalMatches === 0;
        if (linkFilter === "partner" && !isPartner) return false;
        if (linkFilter === "rival" && !isRival) return false;
        if (linkFilter === "turns" && !isTurns) return false;
        if (linkFilter === "mixed" && (isPartner || isRival || isTurns)) return false;
      }

      return true;
    });

    // Only include nodes that appear in filtered links (or all nodes if no link filter)
    const nodesInLinks = new Set(
      filteredLinks.flatMap((l) => [
        linkNodeId(l.source),
        linkNodeId(l.target),
      ]),
    );

    const filteredNodes = communityData.nodes.filter((n) => {
      if (linkFilter !== "all" && !nodesInLinks.has(n.id)) return false;
      if (query && !matchingNodes.has(n.id)) return false;
      return true;
    });

    return { ...baseGraphData, nodes: filteredNodes, links: filteredLinks };
  }, [baseGraphData, searchQuery, linkFilter, selectedCommunity]);

  const selectedLinks = useMemo(() => {
    if (!selectedNode) return [];
    const unsorted = filterLinksBySelectedNode(filteredData.links, selectedNode);
    return sortGraphLinksByStrength(unsorted);
  }, [selectedNode, filteredData.links]);

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
      const baseSize = 5 + Math.min(Math.sqrt(matches) * 1.2, 8);
      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNode === node.id;
      const isViewer = viewerId === node.id;
      const radius = isHovered || isSelected ? baseSize * 1.2 : baseSize;
      const color = nodeColor(node);
      const label = isViewer ? "Vos" : capitalizeName(node.name || node.alias || "?");
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
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3 text-center px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <CalendarDays className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-lg font-bold text-foreground">Sin datos aún</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          La red se construye automáticamente cuando se confirman partidos.
          Aún no hay partidos confirmados.
        </p>
        <Link
          href="/match/new"
          className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
        >
          Crear partido
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
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-col gap-2">
        {viewerId && (
          <div className="flex flex-col gap-1.5">
            <span id="network-scope-label" className="sr-only">
              Ámbito de la red
            </span>
            <div
              role="radiogroup"
              aria-labelledby="network-scope-label"
              className="grid grid-cols-2 gap-1.5 bg-card/95 p-1 rounded-xl border border-border shadow-sm"
            >
              <button
                type="button"
                role="radio"
                aria-checked={scope === "personal"}
                onClick={() => setScope("personal")}
                className={cn(
                  "flex h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                  scope === "personal"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-label="Ver mi red de contactos únicamente"
              >
                <Users2 className="h-3.5 w-3.5" aria-hidden="true" />
                Mi red
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={scope === "global"}
                onClick={() => setScope("global")}
                className={cn(
                  "flex h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                  scope === "global"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-label="Ver la red global de jugadores"
              >
                <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                Red completa
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 rounded-xl bg-card px-3 py-2 border border-border shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background transition-all duration-200">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar jugador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
              aria-label="Buscar jugador en el grafo"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-all active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Limpiar búsqueda"
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
            aria-label="Centrar grafo"
          >
            Centrar
          </button>
        </div>

        {/* Link filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
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

          {availableCommunities.map((cId) => (
            <FilterChip
              key={`community-${cId}`}
              active={selectedCommunity === cId}
              onClick={() =>
                setSelectedCommunity(selectedCommunity === cId ? null : cId)
              }
              label={`Grupo ${cId}`}
              dotColor={COMMUNITY_COLORS[cId % COMMUNITY_COLORS.length]}
            />
          ))}

          <span className="ml-auto text-xs text-muted-foreground tabular-nums bg-card px-2 py-1 rounded-md border border-border shrink-0">
            {filteredData.nodes.length} · {filteredData.links.length}
          </span>
        </div>
      </div>

      {/* Empty personal network notice */}
      {scope === "personal" && viewerNeighbors.size === 0 && (
        <div className="absolute inset-x-4 bottom-4 z-20 rounded-xl border border-border bg-card p-4 shadow-lg text-center space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Users2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Tu red de contactos está vacía</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Los contactos se agregan automáticamente al sumarte a turnos o confirmar partidos con otros jugadores.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Link
              href="/turnos"
            prefetch={true}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            >
              Buscar turnos
            </Link>
            <button
              onClick={() => setScope("global")}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-4 text-xs font-bold text-foreground transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            >
              Ver red completa
            </button>
          </div>
        </div>
      )}

      {/* Empty search or filter results notice */}
      {filteredData.nodes.length === 0 && (searchQuery.trim() || linkFilter !== "all" || selectedCommunity !== null) && (
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 text-center space-y-2 pointer-events-auto">
          <p className="text-sm font-semibold text-muted-foreground">
            {searchQuery.trim()
              ? `No se encontraron jugadores que coincidan con "${searchQuery.trim()}"`
              : "No hay conexiones que coincidan con los filtros seleccionados"}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setLinkFilter("all");
              setSelectedCommunity(null);
            }}
            className="text-xs font-bold text-primary hover:underline active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-md px-2 py-1"
          >
            Restablecer filtros
          </button>
        </div>
      )}

      <ForceGraph2D
        ref={fgRef}
        graphData={filteredData}
        width={dimensions.width}
        height={dimensions.height}
        nodeVal={(node) => {
          const n = node as GraphNode;
          const matches = n.matchesPlayed || 0;
          const r = 5 + Math.min(Math.sqrt(matches) * 1.2, 8);
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
        <div className="absolute bottom-3 left-3 z-10 rounded-xl bg-card p-4 max-w-[280px] border border-border shadow-sm">
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
                {selectedNodeData.id === viewerId ? "Vos" : capitalizeName(selectedNodeData.name || selectedNodeData.alias || "?")}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedNodeData.matchesPlayed} partidos ·{" "}
                {selectedNodeData.networkSize} contactos
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-all active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              aria-label="Cerrar panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg bg-muted px-2 py-1.5 text-center border border-border">
              <p className="text-xs text-muted-foreground">Score</p>
              <p className="text-sm tabular-nums font-bold text-foreground">
                {selectedNodeData.skillScore}
              </p>
            </div>
            {(() => {
              const sideInfo = getPreferredSideBadgeLabel(selectedNodeData.preferredSide);
              return (
                <div
                  className="rounded-lg bg-muted px-2 py-1.5 text-center border border-border"
                  title={sideInfo.label}
                  aria-label={sideInfo.label}
                >
                  <p className="text-xs text-muted-foreground">Lado</p>
                  <p className="text-sm font-bold text-foreground">
                    {sideInfo.shortLabel}
                  </p>
                </div>
              );
            })()}
            <div className="rounded-lg bg-muted px-2 py-1.5 text-center border border-border">
              <p className="text-xs text-muted-foreground">Grupo</p>
              {selectedNodeData.community !== null ? (
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
                  aria-label={
                    selectedCommunity === selectedNodeData.community
                      ? "Mostrar todas las comunidades"
                      : `Filtrar el grafo por Grupo ${selectedNodeData.community}`
                  }
                >
                  {selectedNodeData.community}
                </button>
              ) : (
                <p className="text-sm font-bold text-muted-foreground">—</p>
              )}
            </div>
          </div>

          <Link
            href={`/p/${selectedNodeData.id}`}
            prefetch={true}
            className="block w-full text-center rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted active:scale-[0.98] mb-3"
          >
            Ver perfil público
          </Link>

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Conexiones ({selectedLinks.length})
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

                return (
                  <div
                    key={i}
                    className="flex flex-col gap-1 p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAndFocusNode(otherId)}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-md"
                      aria-label={`Enfocar a ${otherName} en el grafo`}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 border",
                          record.type === "partner" && "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
                          record.type === "rival" && "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800",
                          record.type === "mixed" && "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
                          record.type === "turns" && "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800"
                        )}
                      >
                        {record.type === "partner" ? "P" : record.type === "rival" ? "R" : record.type === "mixed" ? "M" : "T"}
                      </span>
                      <span className="text-xs font-medium text-foreground truncate">
                        {otherName}
                      </span>
                      <span className="text-muted-foreground text-xs font-semibold tabular-nums ml-auto shrink-0 pr-1 flex items-center gap-1.5">
                        {record.winRatePercentage !== null && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-foreground border border-border shrink-0"
                            title={`Porcentaje de victorias: ${record.winRatePercentage}%`}
                            aria-label={`Porcentaje de victorias: ${record.winRatePercentage}%`}
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
                      className="text-[11px] font-bold text-primary hover:underline px-1.5 py-0.5 rounded-md active:scale-[0.95] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                      aria-label={`Ver perfil de ${otherName}`}
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
                        title={`Afinidad: ${affinity.label}`}
                        aria-label={`Afinidad: ${affinity.label}`}
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 z-10 rounded-xl bg-card px-3 py-2.5 border border-border shadow-sm">
        <p className="text-xs text-muted-foreground mb-1.5 font-medium">
          Leyenda
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Pareja</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Rival</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">Mixto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-slate-500" />
            <span className="text-xs text-muted-foreground">Turnos</span>
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
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
  dotColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ${
        active
          ? "bg-card text-foreground border border-border shadow-sm"
          : "bg-muted text-muted-foreground border border-transparent hover:bg-card hover:text-foreground"
      }`}
      aria-pressed={active}
    >
      {dotColor ? (
        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
      ) : (
        color && <div className={`h-2 w-2 rounded-full ${color}`} />
      )}
      {label}
    </button>
  );
}
