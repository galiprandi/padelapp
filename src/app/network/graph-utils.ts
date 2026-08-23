import type { GraphLink } from "./actions";

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
