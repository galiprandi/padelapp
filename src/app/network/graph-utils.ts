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

export interface CommunitySummary {
  communityId: number;
  totalPlayers: number;
  avgSkillScore: number;
  rightSideCount: number;
  leftSideCount: number;
  bothSidesCount: number;
  undefinedSideCount: number;
  formattedSummary: string;
}

/**
 * Calculates aggregate analytics (member count, average skill score, court side distribution)
 * for a specific Louvain community group.
 */
export function calculateCommunitySummary(
  nodes: GraphNode[],
  communityId: number,
): CommunitySummary {
  const communityNodes = nodes.filter((n) => n.community === communityId);
  const totalPlayers = communityNodes.length;

  if (totalPlayers === 0) {
    return {
      communityId,
      totalPlayers: 0,
      avgSkillScore: 1000,
      rightSideCount: 0,
      leftSideCount: 0,
      bothSidesCount: 0,
      undefinedSideCount: 0,
      formattedSummary: "Grupo sin miembros registrados",
    };
  }

  const totalScore = communityNodes.reduce(
    (sum, n) => sum + (n.skillScore ?? 1000),
    0,
  );
  const avgSkillScore = Math.round(totalScore / totalPlayers);

  let rightSideCount = 0;
  let leftSideCount = 0;
  let bothSidesCount = 0;
  let undefinedSideCount = 0;

  for (const n of communityNodes) {
    if (n.preferredSide === "RIGHT") rightSideCount++;
    else if (n.preferredSide === "LEFT") leftSideCount++;
    else if (n.preferredSide === "BOTH") bothSidesCount++;
    else undefinedSideCount++;
  }

  const parts: string[] = [
    `${totalPlayers} ${totalPlayers === 1 ? "jugador" : "jugadores"}`,
    `Score prom. ${avgSkillScore}`,
  ];

  const sideDetails: string[] = [];
  if (rightSideCount > 0) sideDetails.push(`${rightSideCount} Der`);
  if (leftSideCount > 0) sideDetails.push(`${leftSideCount} Rev`);
  if (bothSidesCount > 0) sideDetails.push(`${bothSidesCount} Ambos`);

  if (sideDetails.length > 0) {
    parts.push(sideDetails.join(" / "));
  }

  return {
    communityId,
    totalPlayers,
    avgSkillScore,
    rightSideCount,
    leftSideCount,
    bothSidesCount,
    undefinedSideCount,
    formattedSummary: parts.join(" · "),
  };
}

export interface TurnRescueCandidateInput {
  id: string;
  skillScore: number | null;
  preferredSide: "RIGHT" | "LEFT" | "BOTH" | null | string;
  community: number | null;
}

export interface EnrolledTurnPlayerInput {
  id: string;
  skillScore: number | null;
  preferredSide: "RIGHT" | "LEFT" | "BOTH" | null | string;
  community: number | null;
}

export interface TurnRescueProximityResult {
  score: number;
  avgSkillScore: number;
  skillDiff: number;
  isSideComplementary: boolean;
  directConnectionsCount: number;
  sameCommunityCount: number;
  proximityTier: "Ideal 🎯" | "Buena opción 👍" | "Compatible 🤝" | "Distante ⚠️";
  badgeStyle: string;
  formattedSummary: string;
}

/**
 * Calculates a candidate player's network rescue proximity and court compatibility against
 * enrolled participants of an open turn.
 */
export function calculateTurnRescueProximity(
  candidate: TurnRescueCandidateInput,
  enrolledPlayers: EnrolledTurnPlayerInput[],
  links: GraphLink[],
): TurnRescueProximityResult {
  const candidateScore = candidate.skillScore ?? 1000;

  if (enrolledPlayers.length === 0) {
    return {
      score: 60,
      avgSkillScore: 1000,
      skillDiff: Math.abs(candidateScore - 1000),
      isSideComplementary: false,
      directConnectionsCount: 0,
      sameCommunityCount: 0,
      proximityTier: "Buena opción 👍",
      badgeStyle:
        "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800",
      formattedSummary: "Turno sin inscriptos previos · Posición abierta",
    };
  }

  const totalEnrolledScore = enrolledPlayers.reduce(
    (sum, p) => sum + (p.skillScore ?? 1000),
    0,
  );
  const avgSkillScore = Math.round(totalEnrolledScore / enrolledPlayers.length);
  const skillDiff = Math.abs(candidateScore - avgSkillScore);

  // Determine court side complementarity based on enrolled side balance
  let rightCount = 0;
  let leftCount = 0;
  for (const p of enrolledPlayers) {
    if (p.preferredSide === "RIGHT") rightCount++;
    else if (p.preferredSide === "LEFT") leftCount++;
  }

  const neededSide =
    rightCount > leftCount ? "LEFT" : leftCount > rightCount ? "RIGHT" : null;

  const isSideComplementary =
    candidate.preferredSide === "BOTH" ||
    (neededSide !== null && candidate.preferredSide === neededSide);

  // Count direct connections to enrolled players in the graph
  const enrolledIds = new Set(enrolledPlayers.map((p) => p.id));
  let directConnectionsCount = 0;

  for (const link of links) {
    const src = linkNodeId(link.source);
    const tgt = linkNodeId(link.target);
    if (src === candidate.id && enrolledIds.has(tgt)) {
      directConnectionsCount++;
    } else if (tgt === candidate.id && enrolledIds.has(src)) {
      directConnectionsCount++;
    }
  }

  // Count enrolled players in the same community
  let sameCommunityCount = 0;
  if (candidate.community !== null && candidate.community !== undefined) {
    for (const p of enrolledPlayers) {
      if (p.community === candidate.community) {
        sameCommunityCount++;
      }
    }
  }

  // Compute composite proximity score
  let score = 0;
  if (skillDiff <= 100) score += 60;
  else if (skillDiff <= 200) score += 30;
  else if (skillDiff > 350) score -= 50;

  score += directConnectionsCount * 40;
  score += isSideComplementary ? 40 : 0;
  score += sameCommunityCount * 30;

  let proximityTier: "Ideal 🎯" | "Buena opción 👍" | "Compatible 🤝" | "Distante ⚠️";
  let badgeStyle: string;

  if (score >= 120) {
    proximityTier = "Ideal 🎯";
    badgeStyle =
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800";
  } else if (score >= 70) {
    proximityTier = "Buena opción 👍";
    badgeStyle =
      "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800";
  } else if (score >= 20) {
    proximityTier = "Compatible 🤝";
    badgeStyle =
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800";
  } else {
    proximityTier = "Distante ⚠️";
    badgeStyle = "bg-muted text-muted-foreground border-border";
  }

  const parts: string[] = [];
  parts.push(
    skillDiff <= 100
      ? `Score cercano (dif. ${skillDiff})`
      : `Dif. de score ${skillDiff}`,
  );

  if (isSideComplementary) {
    parts.push("Equilibra posición en cancha");
  }

  if (directConnectionsCount > 0) {
    parts.push(
      `${directConnectionsCount} ${directConnectionsCount === 1 ? "contacto en el turno" : "contactos en el turno"}`,
    );
  }

  if (sameCommunityCount > 0) {
    parts.push(
      `${sameCommunityCount} ${sameCommunityCount === 1 ? "del mismo grupo" : "del mismo grupo"}`,
    );
  }

  return {
    score,
    avgSkillScore,
    skillDiff,
    isSideComplementary,
    directConnectionsCount,
    sameCommunityCount,
    proximityTier,
    badgeStyle,
    formattedSummary: parts.join(" · "),
  };
}

export interface NetworkRoleInfo {
  roleLabel: string;
  badgeStyle: string;
  description: string;
}

/**
 * Categorizes a player's social role in the network graph based on community bridging,
 * degree centrality within community, and connection counts.
 */
export function calculateNetworkRoleInfo(
  nodes: GraphNode[],
  links: GraphLink[],
  selectedNodeId: string,
): NetworkRoleInfo {
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const connectedLinks = filterLinksBySelectedNode(links, selectedNodeId);
  const totalConnections = connectedLinks.length;

  if (!selectedNode || totalConnections === 0) {
    return {
      roleLabel: "Nuevo participante 🆕",
      badgeStyle: "bg-muted text-muted-foreground border-border",
      description: "Iniciando historial en la red",
    };
  }

  // Find all neighbor node IDs connected to selectedNodeId
  const neighborIds = connectedLinks.map((link) => {
    const src = linkNodeId(link.source);
    return src === selectedNodeId ? linkNodeId(link.target) : src;
  });

  // Collect distinct communities of neighbor nodes (excluding null/undefined)
  const connectedCommunities = new Set<number>();
  for (const nId of neighborIds) {
    const neighborNode = nodes.find((n) => n.id === nId);
    if (
      neighborNode &&
      neighborNode.community !== null &&
      neighborNode.community !== undefined
    ) {
      connectedCommunities.add(neighborNode.community);
    }
  }

  // 1. Community Bridge / Nexo comunitario: connects 2 or more distinct community groups
  if (connectedCommunities.size >= 2) {
    return {
      roleLabel: "Nexo comunitario 🌉",
      badgeStyle:
        "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800",
      description: "Conecta diferentes grupos de la comunidad",
    };
  }

  // 2. Community Host / Anfitrión de grupo: highest connected node in primary community (with degree >= 3)
  if (selectedNode.community !== null && selectedNode.community !== undefined) {
    const communityNodes = nodes.filter(
      (n) => n.community === selectedNode.community,
    );
    if (communityNodes.length > 1) {
      let isTopDegreeInCommunity = true;
      for (const compNode of communityNodes) {
        if (compNode.id === selectedNodeId) continue;
        const compDegree = filterLinksBySelectedNode(links, compNode.id).length;
        if (compDegree > totalConnections) {
          isTopDegreeInCommunity = false;
          break;
        }
      }
      if (isTopDegreeInCommunity && totalConnections >= 3) {
        return {
          roleLabel: "Anfitrión de grupo 👑",
          badgeStyle:
            "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
          description: "Referente con más conexiones en su grupo",
        };
      }
    }
  }

  // 3. Network Pivot / Pivote de red: high total connection frequency (>= 5 connections)
  if (totalConnections >= 5) {
    return {
      roleLabel: "Pivote de red 🔗",
      badgeStyle:
        "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800",
      description: "Jugador con alta frecuencia de interacción",
    };
  }

  // 4. Active Member / Miembro activo: standard connected participant (>= 1 connection)
  return {
    roleLabel: "Miembro activo 🎾",
    badgeStyle:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
    description: "Participante integrado a la red",
  };
}

export interface NetworkActivityTier {
  label: string;
  badgeStyle: string;
}

/**
 * Categorizes player activity in the network graph into standardized MDS activity tier badges.
 */
export function getNetworkActivityTier(
  networkSize: number,
  matchesPlayed: number,
): NetworkActivityTier {
  if (networkSize >= 10 && matchesPlayed >= 10) {
    return {
      label: "Conector leyenda ⚡",
      badgeStyle:
        "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
    };
  }
  if (networkSize >= 5 || matchesPlayed >= 5) {
    return {
      label: "Jugador activo 🎾",
      badgeStyle:
        "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
    };
  }
  if (networkSize >= 1 || matchesPlayed >= 1) {
    return {
      label: "En crecimiento 🌱",
      badgeStyle:
        "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800",
    };
  }
  return {
    label: "Nuevo en la red 🆕",
    badgeStyle: "bg-muted text-muted-foreground border-border",
  };
}

export interface SideSynergyBreakdown {
  totalPartners: number;
  complementaryCount: number;
  sameSideCount: number;
  formattedSynergySummary: string;
}

/**
 * Calculates court position synergy across all partner and mixed connections for a given player.
 */
export function calculateSideSynergyBreakdown(
  links: GraphLink[],
  nodes: GraphNode[],
  selectedNodeId: string,
): SideSynergyBreakdown {
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedSide = selectedNode?.preferredSide ?? null;

  const connectedLinks = filterLinksBySelectedNode(links, selectedNodeId);

  let totalPartners = 0;
  let complementaryCount = 0;
  let sameSideCount = 0;

  for (const link of connectedLinks) {
    const record = calculateConnectionRecord(link, selectedNodeId);
    if (record.type === "partner" || record.type === "mixed") {
      totalPartners++;
      const otherId =
        linkNodeId(link.source) === selectedNodeId
          ? linkNodeId(link.target)
          : linkNodeId(link.source);
      const otherNode = nodes.find((n) => n.id === otherId);
      const otherSide = otherNode?.preferredSide ?? null;

      const comp = getSideCompatibilityLabel(selectedSide, otherSide);
      if (comp) {
        if (comp.isComplementary) {
          complementaryCount++;
        } else {
          sameSideCount++;
        }
      }
    }
  }

  if (totalPartners === 0) {
    return {
      totalPartners: 0,
      complementaryCount: 0,
      sameSideCount: 0,
      formattedSynergySummary: "Sin duplas registradas",
    };
  }

  const parts: string[] = [];
  if (complementaryCount > 0) {
    parts.push(
      `${complementaryCount} ${complementaryCount === 1 ? "dupla complementaria" : "duplas complementarias"} 🎯`,
    );
  }
  if (sameSideCount > 0) {
    parts.push(
      `${sameSideCount} ${sameSideCount === 1 ? "dupla misma posición" : "duplas misma posición"} ⚠️`,
    );
  }

  if (parts.length === 0) {
    return {
      totalPartners,
      complementaryCount: 0,
      sameSideCount: 0,
      formattedSynergySummary: `${totalPartners} ${totalPartners === 1 ? "dupla" : "duplas"} (posiciones abiertas)`,
    };
  }

  return {
    totalPartners,
    complementaryCount,
    sameSideCount,
    formattedSynergySummary: parts.join(" · "),
  };
}

export interface CommunityCohesion {
  communityId: number;
  totalPlayers: number;
  internalLinksCount: number;
  externalLinksCount: number;
  internalDensityPercentage: number;
  cohesionTier: "Comunidad consolidada 🏆" | "Grupo activo 🎾" | "En integración 🌱" | "En formación 🆕";
  badgeStyle: string;
  formattedCohesionSummary: string;
}

/**
 * Calculates internal connection density and cohesion metrics for a Louvain community group.
 */
export function calculateCommunityCohesion(
  nodes: GraphNode[],
  links: GraphLink[],
  communityId: number,
): CommunityCohesion {
  const communityNodes = nodes.filter((n) => n.community === communityId);
  const totalPlayers = communityNodes.length;

  if (totalPlayers === 0) {
    return {
      communityId,
      totalPlayers: 0,
      internalLinksCount: 0,
      externalLinksCount: 0,
      internalDensityPercentage: 0,
      cohesionTier: "En formación 🆕",
      badgeStyle: "bg-muted text-muted-foreground border-border",
      formattedCohesionSummary: "Grupo sin miembros",
    };
  }

  const communityNodeIds = new Set(communityNodes.map((n) => n.id));

  let internalLinksCount = 0;
  let externalLinksCount = 0;

  for (const link of links) {
    const src = linkNodeId(link.source);
    const tgt = linkNodeId(link.target);
    const srcIn = communityNodeIds.has(src);
    const tgtIn = communityNodeIds.has(tgt);

    if (srcIn && tgtIn) {
      internalLinksCount++;
    } else if (srcIn || tgtIn) {
      externalLinksCount++;
    }
  }

  const maxPossibleInternalLinks =
    totalPlayers > 1 ? (totalPlayers * (totalPlayers - 1)) / 2 : 1;
  const internalDensityRatio =
    totalPlayers > 1 ? internalLinksCount / maxPossibleInternalLinks : 0;
  const internalDensityPercentage = Math.round(
    Math.min(internalDensityRatio, 1) * 100,
  );

  let cohesionTier:
    | "Comunidad consolidada 🏆"
    | "Grupo activo 🎾"
    | "En integración 🌱"
    | "En formación 🆕";
  let badgeStyle: string;

  if (
    internalDensityRatio >= 0.5 ||
    (totalPlayers <= 3 && internalLinksCount >= totalPlayers - 1 && internalLinksCount > 0)
  ) {
    cohesionTier = "Comunidad consolidada 🏆";
    badgeStyle =
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800";
  } else if (internalDensityRatio >= 0.25 || internalLinksCount > 0) {
    cohesionTier = "Grupo activo 🎾";
    badgeStyle =
      "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800";
  } else if (externalLinksCount > 0) {
    cohesionTier = "En integración 🌱";
    badgeStyle =
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800";
  } else {
    cohesionTier = "En formación 🆕";
    badgeStyle = "bg-muted text-muted-foreground border-border";
  }

  const parts: string[] = [];
  if (totalPlayers > 1) {
    parts.push(`${internalDensityPercentage}% cohesión interna`);
  }
  if (internalLinksCount > 0) {
    parts.push(
      `${internalLinksCount} ${internalLinksCount === 1 ? "conexión interna" : "conexiones internas"}`,
    );
  }
  if (externalLinksCount > 0) {
    parts.push(
      `${externalLinksCount} ${externalLinksCount === 1 ? "puente externo" : "puentes externos"}`,
    );
  }

  if (parts.length === 0) {
    parts.push("Sin interacciones registradas");
  }

  return {
    communityId,
    totalPlayers,
    internalLinksCount,
    externalLinksCount,
    internalDensityPercentage,
    cohesionTier,
    badgeStyle,
    formattedCohesionSummary: parts.join(" · "),
  };
}

export interface NodeConnectionSummary {
  totalConnections: number;
  partnerCount: number;
  rivalCount: number;
  mixedCount: number;
  turnsOnlyCount: number;
  overallPartnerWinRate: number | null;
  formattedSummary: string;
}

/**
 * Calculates aggregate connection summary (breakdown of partner, rival, mixed, turn relationships
 * and overall partnership win rate) for a given selected node.
 */
export function calculateNodeConnectionSummary(
  links: GraphLink[],
  selectedNodeId: string,
): NodeConnectionSummary {
  const connectedLinks = filterLinksBySelectedNode(links, selectedNodeId);
  const totalConnections = connectedLinks.length;

  if (totalConnections === 0) {
    return {
      totalConnections: 0,
      partnerCount: 0,
      rivalCount: 0,
      mixedCount: 0,
      turnsOnlyCount: 0,
      overallPartnerWinRate: null,
      formattedSummary: "Sin conexiones directas",
    };
  }

  let partnerCount = 0;
  let rivalCount = 0;
  let mixedCount = 0;
  let turnsOnlyCount = 0;

  let totalPartnerWins = 0;
  let totalPartnerMatches = 0;

  for (const link of connectedLinks) {
    const record = calculateConnectionRecord(link, selectedNodeId);
    if (record.type === "partner") {
      partnerCount++;
      totalPartnerWins += record.wins;
      totalPartnerMatches += record.wins + record.losses;
    } else if (record.type === "rival") {
      rivalCount++;
    } else if (record.type === "mixed") {
      mixedCount++;
      // Calculate partner matches within mixed
      totalPartnerWins += link.winsTogether;
      totalPartnerMatches += link.winsTogether + link.lossesTogether;
    } else if (record.type === "turns") {
      turnsOnlyCount++;
    }
  }

  const overallPartnerWinRate =
    totalPartnerMatches > 0
      ? Math.round((totalPartnerWins / totalPartnerMatches) * 100)
      : null;

  const parts: string[] = [];
  if (partnerCount > 0) parts.push(`${partnerCount} ${partnerCount === 1 ? "pareja" : "parejas"}`);
  if (rivalCount > 0) parts.push(`${rivalCount} ${rivalCount === 1 ? "rival" : "rivales"}`);
  if (mixedCount > 0) parts.push(`${mixedCount} ${mixedCount === 1 ? "mixto" : "mixtos"}`);
  if (turnsOnlyCount > 0) parts.push(`${turnsOnlyCount} ${turnsOnlyCount === 1 ? "turno" : "turnos"}`);

  if (overallPartnerWinRate !== null) {
    parts.push(`${overallPartnerWinRate}% WR dupla`);
  }

  return {
    totalConnections,
    partnerCount,
    rivalCount,
    mixedCount,
    turnsOnlyCount,
    overallPartnerWinRate,
    formattedSummary: parts.join(" · "),
  };
}
