import type { GraphLink, GraphNode } from "./actions";

export function linkNodeId(val: string | { id: string }): string {
  return typeof val === "string" ? val : val.id;
}

/**
 * Normalizes a search query string by trimming outer whitespace, converting to lowercase,
 * and stripping unicode diacritics (accents).
 */
export function normalizeSearchQuery(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Filters a list of graph links to return only those connected to `selectedNodeId`.
 */
export function filterLinksBySelectedNode(
  links: GraphLink[],
  selectedNodeId: string,
): GraphLink[] {
  return links.filter(
    (l) =>
      linkNodeId(l.source) === selectedNodeId ||
      linkNodeId(l.target) === selectedNodeId,
  );
}

export interface ConnectionRecord {
  type: "partner" | "rival" | "mixed" | "turns";
  wins: number;
  losses: number;
  formattedRecord: string;
  winRatePercentage: number | null;
}

/**
 * Sorts graph links in descending order of interaction strength.
 */
export function sortGraphLinksByStrength(links: GraphLink[]): GraphLink[] {
  return [...links].sort((a, b) => {
    const totalA = a.partnerMatches + a.rivalMatches + a.turnsTogether;
    const totalB = b.partnerMatches + b.rivalMatches + b.turnsTogether;
    if (totalB !== totalA) {
      return totalB - totalA;
    }
    const matchesA = a.partnerMatches + a.rivalMatches;
    const matchesB = b.partnerMatches + b.rivalMatches;
    return matchesB - matchesA;
  });
}

/**
 * Calculates head-to-head or partnership win-loss record for a graph link
 * from the perspective of `selectedPlayerId`.
 */
export function calculateConnectionRecord(
  link: GraphLink,
  selectedPlayerId: string,
): ConnectionRecord {
  const sourceId = linkNodeId(link.source);
  const isSource = sourceId === selectedPlayerId;

  const isPartner = link.partnerMatches > 0 && link.rivalMatches === 0;
  const isRival = link.rivalMatches > 0 && link.partnerMatches === 0;
  const isMixed = link.partnerMatches > 0 && link.rivalMatches > 0;

  if (isPartner) {
    const wins = link.winsTogether;
    const losses = link.lossesTogether;
    const total = wins + losses;
    return {
      type: "partner",
      wins,
      losses,
      formattedRecord: `${wins}V - ${losses}D`,
      winRatePercentage: total > 0 ? Math.round((wins / total) * 100) : null,
    };
  }

  if (isRival) {
    const wins = isSource ? link.winsA : link.winsB;
    const losses = isSource ? link.winsB : link.winsA;
    const total = wins + losses;
    return {
      type: "rival",
      wins,
      losses,
      formattedRecord: `${wins}V - ${losses}D`,
      winRatePercentage: total > 0 ? Math.round((wins / total) * 100) : null,
    };
  }

  if (isMixed) {
    const rivalWins = isSource ? link.winsA : link.winsB;
    const rivalLosses = isSource ? link.winsB : link.winsA;
    const wins = rivalWins + link.winsTogether;
    const losses = rivalLosses + link.lossesTogether;
    const total = wins + losses;
    return {
      type: "mixed",
      wins,
      losses,
      formattedRecord: `${wins}V - ${losses}D`,
      winRatePercentage: total > 0 ? Math.round((wins / total) * 100) : null,
    };
  }

  // Purely turns together (no confirmed matches yet)
  return {
    type: "turns",
    wins: 0,
    losses: 0,
    formattedRecord: `${link.turnsTogether} ${link.turnsTogether === 1 ? "turno" : "turnos"}`,
    winRatePercentage: null,
  };
}

export interface PreferredSideBadgeInfo {
  label: string;
  shortLabel: string;
}

/**
 * Returns formatted label and abbreviation for court side preference.
 */
export function getPreferredSideBadgeLabel(
  side: "RIGHT" | "LEFT" | "BOTH" | null | undefined | string,
): PreferredSideBadgeInfo {
  if (side === "RIGHT") {
    return { label: "Posición preferida: Derecha", shortLabel: "Der." };
  }
  if (side === "LEFT") {
    return { label: "Posición preferida: Revés", shortLabel: "Rev." };
  }
  if (side === "BOTH") {
    return { label: "Posición preferida: Ambos lados", shortLabel: "Ambos" };
  }
  return { label: "Posición preferida: Sin definir", shortLabel: "—" };
}

export interface ConnectionAffinityInfo {
  label: string;
  badgeStyle: string;
}

/**
 * Categorizes connection dynamic between two players based on match history and turn co-inscriptions.
 */
export function getConnectionAffinityLabel(
  link: GraphLink,
): ConnectionAffinityInfo {
  const { partnerMatches, rivalMatches, winsTogether, turnsTogether } = link;
  const totalMatches = partnerMatches + rivalMatches;

  if (partnerMatches >= 3) {
    const winRate = winsTogether / partnerMatches;
    if (winRate >= 0.65) {
      return {
        label: "Dupla exitosa 🏆",
        badgeStyle:
          "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
      };
    }
    return {
      label: "Dupla frecuente 🤝",
      badgeStyle:
        "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
    };
  }

  if (rivalMatches >= 3) {
    return {
      label: "Rivalidad clásica ⚔️",
      badgeStyle:
        "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800",
    };
  }

  if (partnerMatches > 0 && rivalMatches > 0) {
    return {
      label: "Historial cruzado 🔄",
      badgeStyle:
        "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
    };
  }

  if (totalMatches === 0 && turnsTogether > 0) {
    return {
      label: "Compañeros de turno 📅",
      badgeStyle:
        "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800",
    };
  }

  if (totalMatches > 0 && totalMatches < 3) {
    return {
      label: "En desarrollo 🌱",
      badgeStyle: "bg-muted text-muted-foreground border-border",
    };
  }

  return {
    label: "Primera conexión 🌱",
    badgeStyle: "bg-muted text-muted-foreground border-border",
  };
}

export interface SideCompatibility {
  label: string;
  isComplementary: boolean;
}

/**
 * Calculates physical court position synergy between two players.
 * Returns complementary indicator when one plays RIGHT and the other plays LEFT.
 */
export function getSideCompatibilityLabel(
  sideA: "RIGHT" | "LEFT" | null | string,
  sideB: "RIGHT" | "LEFT" | null | string,
): SideCompatibility | null {
  if (!sideA || !sideB) return null;

  const isComplementary =
    (sideA === "RIGHT" && sideB === "LEFT") ||
    (sideA === "LEFT" && sideB === "RIGHT");

  if (isComplementary) {
    return {
      label: "Der. + Rev. 🎯",
      isComplementary: true,
    };
  }

  if (sideA === "RIGHT" && sideB === "RIGHT") {
    return {
      label: "Ambos derecha ⚠️",
      isComplementary: false,
    };
  }

  if (sideA === "LEFT" && sideB === "LEFT") {
    return {
      label: "Ambos revés ⚠️",
      isComplementary: false,
    };
  }

  return null;
}

/**
 * Isolates graph nodes and links belonging to a specific Louvain community cluster.
 */
export function filterNodesAndLinksByCommunity(
  nodes: GraphNode[],
  links: GraphLink[],
  communityId: number | null,
): { nodes: GraphNode[]; links: GraphLink[] } {
  if (communityId === null) {
    return { nodes, links };
  }

  const communityNodeIds = new Set(
    nodes.filter((n) => n.community === communityId).map((n) => n.id),
  );

  const filteredNodes = nodes.filter((n) => communityNodeIds.has(n.id));
  const filteredLinks = links.filter(
    (l) =>
      communityNodeIds.has(linkNodeId(l.source)) &&
      communityNodeIds.has(linkNodeId(l.target)),
  );

  return {
    nodes: filteredNodes,
    links: filteredLinks,
  };
}

/**
 * Calculates the number of shared (mutual) connected players between nodeIdA and nodeIdB in the graph.
 */
export function calculateMutualConnectionsCount(
  links: GraphLink[],
  nodeIdA: string,
  nodeIdB: string,
): number {
  if (!nodeIdA || !nodeIdB || nodeIdA === nodeIdB) return 0;

  const neighborsA = new Set<string>();
  const neighborsB = new Set<string>();

  for (const link of links) {
    const src = linkNodeId(link.source);
    const tgt = linkNodeId(link.target);

    if (src === nodeIdA && tgt !== nodeIdB) neighborsA.add(tgt);
    else if (tgt === nodeIdA && src !== nodeIdB) neighborsA.add(src);

    if (src === nodeIdB && tgt !== nodeIdA) neighborsB.add(tgt);
    else if (tgt === nodeIdB && src !== nodeIdA) neighborsB.add(src);
  }

  let mutualCount = 0;
  for (const neighborId of neighborsA) {
    if (neighborsB.has(neighborId)) {
      mutualCount++;
    }
  }

  return mutualCount;
}
