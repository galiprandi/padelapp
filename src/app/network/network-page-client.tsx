"use client";

import { useState } from "react";
import { BarChart3, Network as NetworkIcon } from "lucide-react";
import { StatsPanel } from "./stats-panel";
import { GraphView } from "./graph-view";
import {
  getNetworkPageContainerClasses,
  getNetworkPageTabBarClasses,
  getNetworkPageContentClasses,
  getNetworkPageStatsContentClasses,
  getNetworkPageTabButtonClasses,
  getNetworkPageTabAriaLabel,
  getNetworkPageRegionAriaLabel,
} from "./graph-utils";
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
    <div
      role="region"
      aria-label={getNetworkPageRegionAriaLabel(tab)}
      className={getNetworkPageContainerClasses()}
    >
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Pestañas de la red de contactos"
        className={getNetworkPageTabBarClasses()}
      >
        <TabButton
          active={tab === "stats"}
          onClick={() => setTab("stats")}
          icon={BarChart3}
          label="Métricas"
          tab="stats"
        />
        <TabButton
          active={tab === "graph"}
          onClick={() => setTab("graph")}
          icon={NetworkIcon}
          label="Grafo"
          tab="graph"
        />
      </div>

      {/* Content */}
      <div className={getNetworkPageContentClasses()}>
        {tab === "stats" ? (
          <div className={getNetworkPageStatsContentClasses()}>
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
  tab,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tab: Tab;
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      aria-pressed={active}
      aria-label={getNetworkPageTabAriaLabel(tab)}
      className={getNetworkPageTabButtonClasses(active)}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
