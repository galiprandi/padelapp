"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { getGraphData, type GraphData } from "@/app/(app)/red/visual/actions";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[80vh] text-sm text-muted-foreground">
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

export default function GraphVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(false);

  useEffect(() => {
    getGraphData().then((data: GraphData) => {
      setGraphData(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: window.innerHeight - 120,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeColor = useCallback((node: any) => {
    const community = node.community ?? 0;
    return COMMUNITY_COLORS[community % COMMUNITY_COLORS.length];
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeRelSize = useCallback((node: any) => {
    const size = 3 + Math.min(Math.sqrt(node.matchesPlayed || 0) * 1.5, 12);
    return size;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkWidth = useCallback((link: any) => {
    return 0.3 + Math.min(Math.log(link.strength + 1) * 0.8, 4);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkColor = useCallback((link: any) => {
    if (link.partnerMatches > 0 && link.rivalMatches === 0) {
      return "rgba(52, 211, 153, 0.3)";
    }
    if (link.rivalMatches > 0 && link.partnerMatches === 0) {
      return "rgba(248, 113, 113, 0.2)";
    }
    return "rgba(251, 191, 36, 0.25)";
  }, []);

  const nodeCanvasObject = useCallback(
    (node: any, ctx: any, globalScale: number) => {
      const size = 3 + Math.min(Math.sqrt(node.matchesPlayed || 0) * 1.5, 12);
      const radius = size;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = nodeColor(node);
      ctx.fill();

      if (selectedNode === node.id) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (showLabels && globalScale > 2.5) {
        const label = node.alias || node.name;
        ctx.font = `${10 / globalScale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillText(label, node.x, node.y - radius - 4 / globalScale);
      }
    },
    [nodeColor, selectedNode, showLabels],
  );

  const handleNodeClick = useCallback(
    (node: any) => {
      setSelectedNode(selectedNode === node.id ? null : node.id);
    },
    [selectedNode],
  );

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
    <div ref={containerRef} className="relative w-full">
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-black/60 backdrop-blur px-3 py-2">
          <span className="text-xs text-white/80">
            {graphData.nodes.length} jugadores · {graphData.links.length}{" "}
            conexiones
          </span>
        </div>
        <button
          onClick={() => setShowLabels(!showLabels)}
          className="rounded-lg bg-black/60 backdrop-blur px-3 py-1.5 text-xs text-white/80 hover:bg-black/80 transition-colors"
        >
          {showLabels ? "Ocultar nombres" : "Mostrar nombres"}
        </button>
      </div>

      <ForceGraph2D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeRelSize={1}
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => "replace"}
        linkWidth={linkWidth}
        linkColor={linkColor}
        linkDirectionalParticles={0}
        cooldownTicks={100}
        onNodeClick={handleNodeClick}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        minZoom={0.3}
        maxZoom={8}
      />

      {selectedNodeData && (
        <div className="absolute bottom-3 left-3 z-10 rounded-xl bg-black/80 backdrop-blur p-4 max-w-xs">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-black"
              style={{ backgroundColor: nodeColor(selectedNodeData) }}
            >
              {(selectedNodeData.alias || selectedNodeData.name)
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {selectedNodeData.alias || selectedNodeData.name}
              </p>
              <p className="text-xs text-white/60">
                {selectedNodeData.matchesPlayed} partidos ·{" "}
                {selectedNodeData.networkSize} contactos
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-white/70">
              Score interno:{" "}
              <span className="text-white font-mono">
                {selectedNodeData.skillScore}
              </span>
            </p>
            <p className="text-xs text-white/70">
              Comunidad:{" "}
              <span className="text-white">
                {selectedNodeData.community ?? "—"}
              </span>
            </p>
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-white/60 mb-1">
                Conexiones ({selectedLinks.length})
              </p>
              <div className="space-y-0.5 max-h-32 overflow-y-auto">
                {selectedLinks.map(
                  (link: (typeof selectedLinks)[number], i: number) => {
                    const otherId =
                      link.source === selectedNode ? link.target : link.source;
                    const other = graphData.nodes.find(
                      (n: (typeof graphData.nodes)[number]) => n.id === otherId,
                    );
                    return (
                      <div
                        key={i}
                        className="text-xs text-white/50 flex items-center gap-1.5"
                      >
                        <span
                          className={
                            link.partnerMatches > 0 && link.rivalMatches === 0
                              ? "text-emerald-400"
                              : link.rivalMatches > 0 &&
                                  link.partnerMatches === 0
                                ? "text-red-400"
                                : "text-yellow-400"
                          }
                        >
                          {link.partnerMatches > 0 && link.rivalMatches === 0
                            ? "P"
                            : link.rivalMatches > 0 && link.partnerMatches === 0
                              ? "R"
                              : "M"}
                        </span>
                        <span>{other?.alias || other?.name || "—"}</span>
                        <span className="text-white/30">×{link.strength}</span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-3 right-3 z-10 rounded-lg bg-black/60 backdrop-blur px-3 py-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-white/60">Pareja</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <span className="text-xs text-white/60">Rival</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-yellow-400" />
            <span className="text-xs text-white/60">Mixto</span>
          </div>
        </div>
      </div>
    </div>
  );
}
