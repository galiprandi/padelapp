"use client";

import { useState } from "react";
import { BarChart3, Network as NetworkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsPanel } from "./stats-panel";
import { GraphView } from "./graph-view";
import type { AdoptionMetrics, GraphData, RecommendedPlayer } from "./actions";

interface NetworkPageClientProps {
  metrics: AdoptionMetrics;
  graphData: GraphData;
  viewerId?: string;
  playersLikeYou: RecommendedPlayer[];
}

type Tab = "stats" | "graph";

export function NetworkPageClient({ metrics, graphData, viewerId, playersLikeYou }: NetworkPageClientProps) {
  const [tab, setTab] = useState<Tab>("stats");

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-background">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border bg-card px-4 py-2 shrink-0">
        <TabButton
          active={tab === "stats"}
          onClick={() => setTab("stats")}
          icon={BarChart3}
          label="Métricas"
        />
        <TabButton
          active={tab === "graph"}
          onClick={() => setTab("graph")}
          icon={NetworkIcon}
          label="Grafo"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "stats" ? (
          <div className="p-4 pb-24">
            <StatsPanel
              metrics={metrics}
              graphNodes={graphData.nodes.length}
              graphLinks={graphData.links.length}
              playersLikeYou={playersLikeYou}
              graphData={graphData}
            />
          </div>
        ) : (
          <GraphView graphData={graphData} viewerId={viewerId} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        active
          ? "bg-primary text-primary-foreground shadow-xs"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      aria-pressed={active}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
