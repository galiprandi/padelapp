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
    return {
      type: "partner",
      wins,
      losses,
      formattedRecord: `${wins}V - ${losses}D`,
    };
  }

  if (isRival) {
    const wins = isSource ? link.winsA : link.winsB;
    const losses = isSource ? link.winsB : link.winsA;
    return {
      type: "rival",
      wins,
      losses,
      formattedRecord: `${wins}V - ${losses}D`,
    };
  }

  if (isMixed) {
    const rivalWins = isSource ? link.winsA : link.winsB;
    const rivalLosses = isSource ? link.winsB : link.winsA;
    const wins = rivalWins + link.winsTogether;
    const losses = rivalLosses + link.lossesTogether;
    return {
      type: "mixed",
      wins,
      losses,
      formattedRecord: `${wins}V - ${losses}D`,
    };
  }

  // Purely turns together (no confirmed matches yet)
  return {
    type: "turns",
    wins: 0,
    losses: 0,
    formattedRecord: `${link.turnsTogether} ${link.turnsTogether === 1 ? "turno" : "turnos"}`,
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
