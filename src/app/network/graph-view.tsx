"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, X, CalendarDays } from "lucide-react";
import type { GraphData, GraphNode } from "./actions";

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

function linkNodeId(val: string | { id: string }): string {
  return typeof val === "string" ? val : val.id;
}

interface GraphViewProps {
  graphData: GraphData;
}

export function GraphView({ graphData }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: typeof window !== "undefined" ? window.innerHeight : 600,
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [linkFilter, setLinkFilter] = useState<"all" | "partner" | "rival" | "mixed">("all");
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

  // Filtered data based on search and link filter
  const filteredData = useMemo(() => {
    if (!searchQuery && linkFilter === "all") return graphData;

    const query = searchQuery.toLowerCase();
    const matchingNodes = new Set(
      graphData.nodes
        .filter((n) => {
          if (!query) return true;
          return (
            n.name.toLowerCase().includes(query) ||
            (n.alias?.toLowerCase().includes(query) ?? false)
          );
        })
        .map((n) => n.id),
    );

    // If searching, also include connected nodes
    if (query && matchingNodes.size > 0) {
      for (const link of graphData.links) {
        const sourceId = linkNodeId(link.source);
        const targetId = linkNodeId(link.target);
        if (matchingNodes.has(sourceId)) matchingNodes.add(targetId);
        if (matchingNodes.has(targetId)) matchingNodes.add(sourceId);
      }
    }

    const filteredLinks = graphData.links.filter((link) => {
      const sourceId = linkNodeId(link.source);
      const targetId = linkNodeId(link.target);

      // Node filter
      if (matchingNodes.size > 0 && !matchingNodes.has(sourceId) && !matchingNodes.has(targetId)) {
        return false;
      }

      // Link type filter
      if (linkFilter !== "all") {
        const isPartner = link.partnerMatches > 0 && link.rivalMatches === 0;
        const isRival = link.rivalMatches > 0 && link.partnerMatches === 0;
        if (linkFilter === "partner" && !isPartner) return false;
        if (linkFilter === "rival" && !isRival) return false;
        if (linkFilter === "mixed" && (isPartner || isRival)) return false;
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

    const filteredNodes = graphData.nodes.filter((n) => {
      if (linkFilter !== "all" && !nodesInLinks.has(n.id)) return false;
      if (matchingNodes.size > 0 && !matchingNodes.has(n.id)) return false;
      return true;
    });

    return { ...graphData, nodes: filteredNodes, links: filteredLinks };
  }, [graphData, searchQuery, linkFilter]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeColor = useCallback((node: any) => {
    const community = node.community ?? 0;
    return COMMUNITY_COLORS[community % COMMUNITY_COLORS.length];
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkWidth = useCallback(
    (link: any) => {
      const isSelected =
        selectedNode &&
        (link.source?.id === selectedNode || link.target?.id === selectedNode);
      const base = 0.8 + Math.min(Math.log(link.strength + 1) * 1.2, 4);
      return isSelected ? base * 2 : base;
    },
    [selectedNode],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkColor = useCallback(
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
      const radius = isHovered || isSelected ? baseSize * 1.2 : baseSize;
      const color = nodeColor(node);
      const label = node.alias || node.name || "?";
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
          : "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = (isSelected ? 3 : isHovered ? 2 : 1.5) / globalScale;
      ctx.stroke();

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4 / globalScale, 0, 2 * Math.PI);
        ctx.strokeStyle = color + "60";
        ctx.lineWidth = 2 / globalScale;
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
    [nodeColor, hoveredNode, selectedNode],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = useCallback(
    (node: any) => {
      setSelectedNode(selectedNode === node.id ? null : node.id);
    },
    [selectedNode],
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

  const selectedLinks = selectedNode
    ? graphData.links.filter(
        (l) =>
          linkNodeId(l.source) === selectedNode ||
          linkNodeId(l.target) === selectedNode,
      )
    : [];

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-muted/30 overflow-hidden"
      style={{ height: "calc(100dvh - 49px)" }}
    >
      {/* Top bar with search and filters */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 rounded-xl bg-card px-3 py-2 border border-border shadow-sm">
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
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
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
            className="rounded-xl bg-card px-3 py-2 text-xs font-semibold text-foreground border border-border shadow-sm transition-colors hover:bg-muted active:scale-[0.98] shrink-0"
            aria-label="Centrar grafo"
          >
            Centrar
          </button>
        </div>

        {/* Link filter chips */}
        <div className="flex items-center gap-1.5">
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
          <span className="ml-auto text-xs text-muted-foreground tabular-nums bg-card px-2 py-1 rounded-md border border-border">
            {filteredData.nodes.length} · {filteredData.links.length}
          </span>
        </div>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={filteredData}
        width={dimensions.width}
        height={dimensions.height}
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
                {getInitials(selectedNodeData.alias || selectedNodeData.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {selectedNodeData.alias || selectedNodeData.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedNodeData.matchesPlayed} partidos ·{" "}
                {selectedNodeData.networkSize} contactos
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-muted-foreground hover:text-foreground text-xl leading-none transition-colors"
              aria-label="Cerrar panel"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg bg-muted px-2 py-1.5 text-center border border-border">
              <p className="text-xs text-muted-foreground">Score</p>
              <p className="text-sm tabular-nums font-bold text-foreground">
                {selectedNodeData.skillScore}
              </p>
            </div>
            <div className="rounded-lg bg-muted px-2 py-1.5 text-center border border-border">
              <p className="text-xs text-muted-foreground">Lado</p>
              <p className="text-sm font-bold text-foreground">
                {selectedNodeData.preferredSide === "RIGHT"
                  ? "Der."
                  : selectedNodeData.preferredSide === "LEFT"
                    ? "Rev."
                    : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-muted px-2 py-1.5 text-center border border-border">
              <p className="text-xs text-muted-foreground">Grupo</p>
              <p
                className="text-sm font-bold"
                style={{ color: nodeColor(selectedNodeData) }}
              >
                {selectedNodeData.community ?? "—"}
              </p>
            </div>
          </div>

          <Link
            href={`/p/${selectedNodeData.id}`}
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
                const isPartner =
                  link.partnerMatches > 0 && link.rivalMatches === 0;
                const isRival =
                  link.rivalMatches > 0 && link.partnerMatches === 0;
                return (
                  <div key={i} className="flex items-center gap-2.5 text-xs">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0"
                      style={{
                        backgroundColor: isPartner
                          ? "rgba(16,185,129,0.1)"
                          : isRival
                            ? "rgba(239,68,68,0.1)"
                            : "rgba(245,158,11,0.1)",
                        color: isPartner
                          ? "#10b981"
                          : isRival
                            ? "#ef4444"
                            : "#f59e0b",
                      }}
                    >
                      {isPartner ? "P" : isRival ? "R" : "M"}
                    </span>
                    <span className="text-muted-foreground flex-1 truncate">
                      {other?.alias || other?.name || "—"}
                    </span>
                    <span className="text-muted-foreground/50 text-xs tabular-nums">
                      {link.strength}×
                    </span>
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
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors active:scale-[0.98] ${
        active
          ? "bg-card text-foreground border border-border shadow-sm"
          : "bg-card/50 text-muted-foreground border border-transparent hover:bg-muted"
      }`}
      aria-pressed={active}
    >
      {color && <div className={`h-2 w-2 rounded-full ${color}`} />}
      {label}
    </button>
  );
}
