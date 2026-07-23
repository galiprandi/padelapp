"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  getGraphData,
  type GraphData,
  type GraphNode,
} from "@/app/network/actions";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[100vh] text-sm text-neutral-400">
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

export default function GraphVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: typeof window !== "undefined" ? window.innerHeight : 600,
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const imageMapRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    getGraphData().then((data: GraphData) => {
      setGraphData(data);
      imageMapRef.current = preloadImages(data.nodes);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (fgRef.current && graphData && graphData.nodes.length > 0) {
      // Tune d3-force for proper node spacing
      const fg = fgRef.current;
      // Strong repulsion between nodes
      fg.d3Force("charge").strength(-120);
      fg.d3Force("charge").distanceMax(400);
      // Longer links for visual clarity
      fg.d3Force("link").distance(80);
      fg.d3Force("link").strength(0.3);
      // Collision handled by strong charge + distanceMax
      // Gentle centering
      fg.d3Force("center").strength(0.05);
      setTimeout(() => {
        fg.zoomToFit(300, 60);
      }, 1200);
    }
  }, [graphData]);

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

      // Soft shadow under node
      ctx.beginPath();
      ctx.arc(node.x, node.y + 2 / globalScale, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fill();

      // Node circle — solid color
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Profile image or initials
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

      // Ring border
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = isSelected
        ? color
        : isHovered
          ? "rgba(255,255,255,0.6)"
          : "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = (isSelected ? 3 : isHovered ? 2 : 1.5) / globalScale;
      ctx.stroke();

      // Outer ring for selected
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4 / globalScale, 0, 2 * Math.PI);
        ctx.strokeStyle = color + "60";
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
      }

      // Label below node — clean text, no background pill
      if (globalScale > 0.4) {
        ctx.font = `600 ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const labelY = node.y + radius + fontSize + 4 / globalScale;

        // Subtle text shadow for readability on light bg
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText(
          label,
          node.x + 0.5 / globalScale,
          labelY + 0.5 / globalScale,
        );

        ctx.fillStyle = isSelected ? color : "rgba(51, 65, 85, 0.85)";
        ctx.fillText(label, node.x, labelY);
      }

      // Matches badge
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh] gap-3 bg-neutral-50">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="text-sm text-neutral-400">Construyendo la red...</p>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh] gap-3 text-center bg-neutral-50">
        <p className="text-xl font-semibold text-neutral-700">Sin datos aún</p>
        <p className="text-sm text-neutral-400 max-w-xs">
          La red se construye automáticamente cuando se confirman partidos. Aún
          no hay partidos confirmados.
        </p>
      </div>
    );
  }

  const selectedNodeData = selectedNode
    ? graphData.nodes.find((n) => n.id === selectedNode)
    : null;

  const selectedLinks = selectedNode
    ? graphData.links.filter(
        (l) => l.source === selectedNode || l.target === selectedNode,
      )
    : [];

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-neutral-50 overflow-hidden"
    >
      {/* Top bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 shadow-sm border border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-sm font-semibold text-neutral-700">
              Red de Padel Red
            </span>
          </div>
          <div className="h-4 w-px bg-neutral-200" />
          <span className="text-xs text-neutral-400">
            {graphData.nodes.length} jugadores · {graphData.links.length}{" "}
            conexiones
          </span>
        </div>
        <button
          onClick={() => {
            if (fgRef.current) fgRef.current.zoomToFit(300, 50);
          }}
          className="rounded-xl bg-white px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-100 transition-all border border-neutral-200 shadow-sm"
        >
          ⊕ Centrar
        </button>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
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
        <div className="absolute bottom-4 left-4 z-10 rounded-2xl bg-white p-5 max-w-[280px] border border-neutral-200 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            {selectedNodeData.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedNodeData.image}
                alt={selectedNodeData.name}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-neutral-100"
              />
            ) : (
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center text-base font-bold text-white ring-2 ring-neutral-100"
                style={{ backgroundColor: nodeColor(selectedNodeData) }}
              >
                {getInitials(selectedNodeData.alias || selectedNodeData.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-800 truncate">
                {selectedNodeData.alias || selectedNodeData.name}
              </p>
              <p className="text-xs text-neutral-400">
                {selectedNodeData.matchesPlayed} partidos ·{" "}
                {selectedNodeData.networkSize} contactos
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-neutral-300 hover:text-neutral-600 text-xl leading-none transition-colors"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg bg-neutral-50 px-2 py-1.5 text-center border border-neutral-100">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wide">
                Score
              </p>
              <p className="text-sm font-sans tabular-nums font-bold text-neutral-700">
                {selectedNodeData.skillScore}
              </p>
            </div>
            <div className="rounded-lg bg-neutral-50 px-2 py-1.5 text-center border border-neutral-100">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wide">
                Lado
              </p>
              <p className="text-sm font-bold text-neutral-700">
                {selectedNodeData.preferredSide === "RIGHT"
                  ? "Der."
                  : selectedNodeData.preferredSide === "LEFT"
                    ? "Rev."
                    : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-neutral-50 px-2 py-1.5 text-center border border-neutral-100">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wide">
                Grupo
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: nodeColor(selectedNodeData) }}
              >
                {selectedNodeData.community ?? "—"}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100">
            <p className="text-xs text-neutral-400 mb-2 font-medium">
              Conexiones ({selectedLinks.length})
            </p>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {selectedLinks.map((link, i) => {
                const otherId =
                  link.source === selectedNode ? link.target : link.source;
                const other = graphData.nodes.find((n) => n.id === otherId);
                const isPartner =
                  link.partnerMatches > 0 && link.rivalMatches === 0;
                const isRival =
                  link.rivalMatches > 0 && link.partnerMatches === 0;
                return (
                  <div key={i} className="flex items-center gap-2.5 text-xs">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold shrink-0"
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
                    <span className="text-neutral-600 flex-1 truncate">
                      {other?.alias || other?.name || "—"}
                    </span>
                    <span className="text-neutral-300 text-[10px]">
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
      <div className="absolute bottom-4 right-4 z-10 rounded-xl bg-white px-4 py-3 border border-neutral-200 shadow-sm">
        <p className="text-[10px] text-neutral-400 uppercase tracking-wide mb-2 font-medium">
          Leyenda
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-neutral-500">Pareja</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-xs text-neutral-500">Rival</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-xs text-neutral-500">Mixto</span>
          </div>
        </div>
      </div>
    </div>
  );
}
