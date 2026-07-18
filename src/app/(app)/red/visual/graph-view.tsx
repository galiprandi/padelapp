"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { getGraphData, type GraphData, type GraphNode } from "@/app/(app)/red/visual/actions";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[80vh] text-sm text-muted-foreground">
      Cargando grafo...
    </div>
  ),
});

const COMMUNITY_COLORS = [
  "#fbbf24", "#34d399", "#60a5fa", "#f87171",
  "#a78bfa", "#fb923c", "#2dd4bf", "#f472b6",
  "#facc15", "#4ade80", "#38bdf8", "#fb7185",
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
          height: window.innerHeight - 60,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (fgRef.current && graphData && graphData.nodes.length > 0) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 60);
      }, 800);
    }
  }, [graphData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeColor = useCallback((node: any) => {
    const community = node.community ?? 0;
    return COMMUNITY_COLORS[community % COMMUNITY_COLORS.length];
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkWidth = useCallback((link: any) => {
    return 0.5 + Math.min(Math.log(link.strength + 1) * 1.2, 5);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkColor = useCallback((link: any) => {
    const isSelected = selectedNode && (link.source?.id === selectedNode || link.target?.id === selectedNode);
    const opacity = isSelected ? 0.8 : 0.25;
    if (link.partnerMatches > 0 && link.rivalMatches === 0) {
      return `rgba(52, 211, 153, ${opacity})`;
    }
    if (link.rivalMatches > 0 && link.partnerMatches === 0) {
      return `rgba(248, 113, 113, ${opacity})`;
    }
    return `rgba(251, 191, 36, ${opacity})`;
  }, [selectedNode]);

  const nodeCanvasObject = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any, ctx: any, globalScale: number) => {
      const matches = node.matchesPlayed || 0;
      const baseSize = 8 + Math.min(Math.sqrt(matches) * 2.5, 18);
      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNode === node.id;
      const radius = isHovered || isSelected ? baseSize * 1.25 : baseSize;
      const color = nodeColor(node);
      const label = node.alias || node.name || "?";
      const fontSize = Math.max(10 / globalScale, 3);

      // Glow for selected/hovered
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4 / globalScale, 0, 2 * Math.PI);
        ctx.fillStyle = color + "40";
        ctx.fill();
      }

      // Node circle
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
        ctx.drawImage(img, node.x - radius + 2, node.y - radius + 2, imgSize, imgSize);
        ctx.restore();
      } else {
        ctx.font = `bold ${radius * 0.9}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillText(getInitials(label), node.x, node.y);
      }

      // Ring border
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = isSelected ? "#ffffff" : "rgba(0,0,0,0.3)";
      ctx.lineWidth = isSelected ? 2.5 / globalScale : 1 / globalScale;
      ctx.stroke();

      // Label with background pill — always visible
      if (globalScale > 0.5) {
        ctx.font = `600 ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const textWidth = ctx.measureText(label).width;
        const padX = 4 / globalScale;
        const padY = 2 / globalScale;
        const labelY = node.y + radius + fontSize / 2 + 3 / globalScale;

        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.beginPath();
        const bgX = node.x - textWidth / 2 - padX;
        const bgY = labelY - fontSize / 2 - padY;
        const bgW = textWidth + padX * 2;
        const bgH = fontSize + padY * 2;
        const bgR = 3 / globalScale;
        ctx.roundRect(bgX, bgY, bgW, bgH, bgR);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.fillText(label, node.x, labelY);
      }

      // Matches played badge
      if (globalScale > 1.5 && matches > 0) {
        const badgeX = node.x + radius * 0.7;
        const badgeY = node.y - radius * 0.7;
        const badgeR = radius * 0.4;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fill();
        ctx.font = `bold ${badgeR * 1.2}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = color;
        ctx.fillText(String(matches), badgeX, badgeY);
      }
    },
    [nodeColor, hoveredNode, selectedNode],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
  }, [selectedNode]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node?.id ?? null);
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? "pointer" : "default";
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Construyendo la red...</p>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-3 text-center">
        <p className="text-lg font-semibold text-foreground">Sin datos aún</p>
        <p className="text-sm text-muted-foreground max-w-xs">
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
    <div ref={containerRef} className="relative w-full bg-[#0a0a0a]">
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-black/70 backdrop-blur px-3 py-2">
          <span className="text-xs text-white/80">
            {graphData.nodes.length} jugadores · {graphData.links.length} conexiones
          </span>
        </div>
        <button
          onClick={() => {
            if (fgRef.current) fgRef.current.zoomToFit(400, 60);
          }}
          className="rounded-lg bg-black/70 backdrop-blur px-3 py-1.5 text-xs text-white/80 hover:bg-black/90 transition-colors"
        >
          Centrar
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
        linkDirectionalParticles={0}
        cooldownTicks={200}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        minZoom={0.2}
        maxZoom={12}
        backgroundColor="#0a0a0a"
      />

      {selectedNodeData && (
        <div className="absolute bottom-3 left-3 z-10 rounded-xl bg-black/85 backdrop-blur p-4 max-w-xs border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            {selectedNodeData.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedNodeData.image}
                alt={selectedNodeData.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-black"
                style={{ backgroundColor: nodeColor(selectedNodeData) }}
              >
                {getInitials(selectedNodeData.alias || selectedNodeData.name)}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-white">
                {selectedNodeData.alias || selectedNodeData.name}
              </p>
              <p className="text-xs text-white/60">
                {selectedNodeData.matchesPlayed} partidos · {selectedNodeData.networkSize} contactos
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="ml-auto text-white/40 hover:text-white/80 text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Score</span>
              <span className="text-xs text-white font-mono">{selectedNodeData.skillScore}</span>
              {selectedNodeData.preferredSide && (
                <span className="text-xs text-white/50 ml-2">
                  Lado: {selectedNodeData.preferredSide === "RIGHT" ? "Derecha" : "Revés"}
                </span>
              )}
            </div>
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-white/60 mb-1.5">
                Conexiones ({selectedLinks.length})
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {selectedLinks.map((link, i) => {
                  const otherId = link.source === selectedNode ? link.target : link.source;
                  const other = graphData.nodes.find((n) => n.id === otherId);
                  const isPartner = link.partnerMatches > 0 && link.rivalMatches === 0;
                  const isRival = link.rivalMatches > 0 && link.partnerMatches === 0;
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                        style={{
                          backgroundColor: isPartner
                            ? "rgba(52,211,153,0.2)"
                            : isRival
                              ? "rgba(248,113,113,0.2)"
                              : "rgba(251,191,36,0.2)",
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
                      <span className="text-white/30">{link.strength}×</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-3 right-3 z-10 rounded-lg bg-black/70 backdrop-blur px-3 py-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-white/60">Pareja</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="text-xs text-white/60">Rival</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="text-xs text-white/60">Mixto</span>
          </div>
        </div>
      </div>
    </div>
  );
}
