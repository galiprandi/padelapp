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

export const DEFAULT_SPECULATION_URLS = [
  ...PRIMARY_SPECULATION_URLS,
  ...SECONDARY_SPECULATION_URLS,
] as const;

export type SpeculationEagerness = "eager" | "moderate" | "conservative";

export interface SpeculationRuleGroup {
  source: "list";
  urls: string[];
  eagerness: SpeculationEagerness;
}

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
    ],
  };
}
