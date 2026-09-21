export const PRIMARY_SPECULATION_URLS = [
  "/me",
  "/turnos",
  "/ranking",
  "/match",
  "/notifications",
] as const;

export const SECONDARY_SPECULATION_URLS = [
  "/network",
  "/me/profile",
  "/me/security",
  "/match/new",
  "/turnos/nuevo",
  "/install",
  "/catalog",
] as const;

export const DYNAMIC_SPECULATION_PATTERNS = [
  "/t/*",
  "/m/*",
  "/j/*",
  "/p/*",
  "/match/*",
  "/turnos/*",
] as const;

export const DEFAULT_SPECULATION_URLS = [
  ...PRIMARY_SPECULATION_URLS,
  ...SECONDARY_SPECULATION_URLS,
] as const;

export type SpeculationEagerness = "eager" | "moderate" | "conservative";

export interface SpeculationListRuleGroup {
  source: "list";
  urls: string[];
  eagerness: SpeculationEagerness;
}

export interface SpeculationDocumentRuleGroup {
  source: "document";
  where: {
    or: Array<{ href_matches: string }>;
  };
  eagerness: SpeculationEagerness;
}

export type SpeculationRuleGroup =
  | SpeculationListRuleGroup
  | SpeculationDocumentRuleGroup;

export interface SpeculationRulesConfig {
  prerender: SpeculationRuleGroup[];
}

export function getSpeculationRulesConfig(
  customUrls?: string[],
  eagerness?: SpeculationEagerness,
): SpeculationRulesConfig {
  if (customUrls && customUrls.length > 0) {
    return {
      prerender: [
        {
          source: "list",
          urls: customUrls,
          eagerness: eagerness ?? "moderate",
        },
      ],
    };
  }

  return {
    prerender: [
      {
        source: "list",
        urls: [...PRIMARY_SPECULATION_URLS],
        eagerness: eagerness ?? "eager",
      },
      {
        source: "list",
        urls: [...SECONDARY_SPECULATION_URLS],
        eagerness: "moderate",
      },
      {
        source: "document",
        where: {
          or: DYNAMIC_SPECULATION_PATTERNS.map(formatSpeculationDocumentPattern),
        },
        eagerness: "moderate",
      },
    ],
  };
}

export function formatSpeculationDocumentPattern(
  pattern: string,
): { href_matches: string } {
  return { href_matches: pattern };
}

export function getSpeculationEagernessForPath(
  path: string,
): SpeculationEagerness | null {
  if (!path) return null;
  const cleanPath = path.trim().split("?")[0].split("#")[0];

  if ((PRIMARY_SPECULATION_URLS as readonly string[]).includes(cleanPath)) {
    return "eager";
  }

  if ((SECONDARY_SPECULATION_URLS as readonly string[]).includes(cleanPath)) {
    return "moderate";
  }

  const isDynamicMatch = DYNAMIC_SPECULATION_PATTERNS.some((pattern) => {
    const prefix = pattern.replace(/\/\*$/, "");
    return cleanPath.startsWith(prefix + "/") || cleanPath === prefix;
  });

  if (isDynamicMatch) {
    return "moderate";
  }

  return null;
}

export function isSpeculationPath(path: string): boolean {
  return getSpeculationEagernessForPath(path) !== null;
}

export function getSpeculationRulesTag(
  customUrls?: string[],
  eagerness?: SpeculationEagerness,
): { __html: string } {
  const config = getSpeculationRulesConfig(customUrls, eagerness);
  return {
    __html: JSON.stringify(config),
  };
}
