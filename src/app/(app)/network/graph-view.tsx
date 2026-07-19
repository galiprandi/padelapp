"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  getGraphData,
  type GraphData,
  type GraphNode,
} from "@/app/(app)/network/actions";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[100vh] text-sm text-muted-foreground">
      Cargando grafo...
    </div>
  ),
});

const COMMUNITY_COLORS = [
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#f87171",
  "#a78bfa",
  "#fb923c",
  "#2dd4bf",
  "#f472b6",
  "#facc15",
  "#4ade80",
  "#38bdf8",
  "#fb7185",
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
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
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
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: window.innerHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Zoom to fit after initial render — use full viewport
  useEffect(() => {
    if (fgRef.current && graphData && graphData.nodes.length > 0) {
      setTimeout(() => {
        fgRef.current.zoomToFit(300, 40);
      }, 1000);
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
      const base = 1 + Math.min(Math.log(link.strength + 1) * 1.5, 6);
      return isSelected ? base * 2.5 : base;
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
      const opacity = isSelected ? 0.9 : isHovered ? 0.5 : 0.3;
      if (link.partnerMatches > 0 && link.rivalMatches === 0) {
        return `rgba(52, 211, 153, ${opacity})`;
      }
      if (link.rivalMatches > 0 && link.partnerMatches === 0) {
        return `rgba(248, 113, 113, ${opacity})`;
      }
      return `rgba(251, 191, 36, ${opacity})`;
    },
    [selectedNode, hoveredNode],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkDirectionalParticles = useCallback(
    (link: any) => {
      if (!selectedNode) return 0;
      return link.source?.id === selectedNode ||
        link.target?.id === selectedNode
        ? 2
        : 0;
    },
    [selectedNode],
  );

  const nodeCanvasObject = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any, ctx: any, globalScale: number) => {
      if (!isFinite(node.x) || !isFinite(node.y)) return;
      const matches = node.matchesPlayed || 0;
      const baseSize = 14 + Math.min(Math.sqrt(matches) * 3, 24);
      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNode === node.id;
      const radius = isHovered || isSelected ? baseSize * 1.3 : baseSize;
      const color = nodeColor(node);
      const label = node.alias || node.name || "?";
      const fontSize = Math.max(12 / globalScale, 4);

      // Outer glow for selected/hovered — multi-layer for bloom effect
      if (isSelected) {
        for (let i = 3; i > 0; i--) {
          ctx.beginPath();
          ctx.arc(
            node.x,
            node.y,
            radius + (i * 6) / globalScale,
            0,
            2 * Math.PI,
          );
          ctx.fillStyle = color + (i === 3 ? "15" : i === 2 ? "25" : "40");
          ctx.fill();
        }
      } else if (isHovered) {
        for (let i = 2; i > 0; i--) {
          ctx.beginPath();
          ctx.arc(
            node.x,
            node.y,
            radius + (i * 4) / globalScale,
            0,
            2 * Math.PI,
          );
          ctx.fillStyle = color + (i === 2 ? "20" : "35");
          ctx.fill();
        }
      }

      // Subtle shadow under node
      ctx.beginPath();
      ctx.arc(node.x, node.y + 2 / globalScale, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fill();

      // Node circle — gradient fill
      const gradient = ctx.createRadialGradient(
        node.x - radius * 0.3,
        node.y - radius * 0.3,
        0,
        node.x,
        node.y,
        radius,
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + "cc");
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Profile image or initials
      const img = imageMapRef.current.get(node.id);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius - 3, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();
        const imgSize = (radius - 3) * 2;
        ctx.drawImage(
          img,
          node.x - radius + 3,
          node.y - radius + 3,
          imgSize,
          imgSize,
        );
        ctx.restore();
      } else {
        ctx.font = `bold ${radius * 0.85}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillText(getInitials(label), node.x, node.y);
      }

      // Ring border — thicker for selected
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = isSelected
        ? "#ffffff"
        : isHovered
          ? "rgba(255,255,255,0.5)"
          : "rgba(0,0,0,0.35)";
      ctx.lineWidth = (isSelected ? 3 : isHovered ? 2 : 1) / globalScale;
      ctx.stroke();

      // Label — always visible with pill background
      if (globalScale > 0.3) {
        ctx.font = `700 ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const textWidth = ctx.measureText(label).width;
        const padX = 6 / globalScale;
        const padY = 3 / globalScale;
        const labelY = node.y + radius + fontSize / 2 + 5 / globalScale;

        // Pill background
        ctx.fillStyle = isSelected
          ? "rgba(0, 0, 0, 0.85)"
          : "rgba(0, 0, 0, 0.6)";
        ctx.beginPath();
        const bgX = node.x - textWidth / 2 - padX;
        const bgY = labelY - fontSize / 2 - padY;
        const bgW = textWidth + padX * 2;
        const bgH = fontSize + padY * 2;
        const bgR = 4 / globalScale;
        ctx.roundRect(bgX, bgY, bgW, bgH, bgR);
        ctx.fill();

        // Label text
        ctx.fillStyle = isSelected ? color : "rgba(255, 255, 255, 0.95)";
        ctx.fillText(label, node.x, labelY);
      }

      // Matches played badge — top right
      if (globalScale > 0.8 && matches > 0) {
        const badgeX = node.x + radius * 0.72;
        const badgeY = node.y - radius * 0.72;
        const badgeR = radius * 0.42;

        // Badge shadow
        ctx.beginPath();
        ctx.arc(badgeX + 1, badgeY + 1, badgeR, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();

        // Badge circle
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, 2 * Math.PI);
        ctx.fillStyle = "#0a0a0a";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();

        // Badge number
        ctx.font = `bold ${badgeR * 1.3}px sans-serif`;
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
      <div className="flex flex-col items-center justify-center h-[100vh] gap-3 bg-[#070710]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        <p className="text-sm text-white/40">Construyendo la red...</p>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100vh] gap-3 text-center bg-[#070710]">
        <p className="text-xl font-semibold text-white/80">Sin datos aún</p>
        <p className="text-sm text-white/40 max-w-xs">
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
      className="relative w-full bg-[#070710] overflow-hidden"
    >
      {/* Top bar — stats + controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl bg-black/60 backdrop-blur-md px-4 py-2.5 border border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-semibold text-white/90">
              Red Padel Red
            </span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs text-white/50">
            {graphData.nodes.length} jugadores · {graphData.links.length}{" "}
            conexiones
          </span>
        </div>
        <button
          onClick={() => {
            if (fgRef.current) fgRef.current.zoomToFit(300, 40);
          }}
          className="rounded-xl bg-black/60 backdrop-blur-md px-4 py-2 text-xs text-white/70 hover:bg-black/80 hover:text-white/90 transition-all border border-white/5"
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
        linkDirectionalParticles={linkDirectionalParticles}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.004}
        cooldownTicks={300}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        minZoom={0.15}
        maxZoom={15}
        backgroundColor="#070710"
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.3}
      />

      {/* Detail panel */}
      {selectedNodeData && (
        <div className="absolute bottom-4 left-4 z-10 rounded-2xl bg-black/85 backdrop-blur-xl p-5 max-w-[280px] border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            {selectedNodeData.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedNodeData.image}
                alt={selectedNodeData.name}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20"
              />
            ) : (
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center text-base font-bold text-black ring-2 ring-white/20"
                style={{ backgroundColor: nodeColor(selectedNodeData) }}
              >
                {getInitials(selectedNodeData.alias || selectedNodeData.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {selectedNodeData.alias || selectedNodeData.name}
              </p>
              <p className="text-xs text-white/50">
                {selectedNodeData.matchesPlayed} partidos ·{" "}
                {selectedNodeData.networkSize} contactos
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-white/30 hover:text-white/70 text-xl leading-none transition-colors"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg bg-white/5 px-2 py-1.5 text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-wide">
                Score
              </p>
              <p className="text-sm font-mono font-bold text-white">
                {selectedNodeData.skillScore}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 px-2 py-1.5 text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-wide">
                Lado
              </p>
              <p className="text-sm font-bold text-white">
                {selectedNodeData.preferredSide === "RIGHT"
                  ? "Der."
                  : selectedNodeData.preferredSide === "LEFT"
                    ? "Rev."
                    : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 px-2 py-1.5 text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-wide">
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

          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-white/50 mb-2 font-medium">
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
                          ? "rgba(52,211,153,0.15)"
                          : isRival
                            ? "rgba(248,113,113,0.15)"
                            : "rgba(251,191,36,0.15)",
                        color: isPartner
                          ? "#34d399"
                          : isRival
                            ? "#f87171"
                            : "#fbbf24",
                      }}
                    >
                      {isPartner ? "P" : isRival ? "R" : "M"}
                    </span>
                    <span className="text-white/70 flex-1 truncate">
                      {other?.alias || other?.name || "—"}
                    </span>
                    <span className="text-white/30 text-[10px]">
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
      <div className="absolute bottom-4 right-4 z-10 rounded-xl bg-black/60 backdrop-blur-md px-4 py-3 border border-white/5">
        <p className="text-[10px] text-white/40 uppercase tracking-wide mb-2 font-medium">
          Leyenda
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30" />
            <span className="text-xs text-white/60">Pareja</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400 shadow-lg shadow-red-400/30" />
            <span className="text-xs text-white/60">Rival</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/30" />
            <span className="text-xs text-white/60">Mixto</span>
          </div>
        </div>
      </div>

      {/* Subtle radial gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(7,7,16,0.6) 100%)",
        }}
      />
    </div>
  );
}
