export const DEFAULT_SPECULATION_URLS = [
  "/me",
  "/turnos",
  "/ranking",
  "/match",
  "/notifications",
  "/network",
  "/me/profile",
  "/me/security",
  "/match/new",
  "/turnos/nuevo",
  "/install",
  "/catalog",
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
  eagerness: SpeculationEagerness = "moderate",
): SpeculationRulesConfig {
  const urls = customUrls && customUrls.length > 0 ? customUrls : [...DEFAULT_SPECULATION_URLS];

  return {
    prerender: [
      {
        source: "list",
        urls,
        eagerness,
      },
    ],
  };
}
