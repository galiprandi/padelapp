import type { MatchTypeValue } from "@/lib/match-types";

const STORAGE_KEY = "padelred:match-prefs";

export type MatchPreferences = {
  position: "derecha" | "reves";
  matchType: MatchTypeValue;
  sets: string;
  countsForRanking: boolean;
  club: string;
  courtNumber: string;
};

const VALID_POSITIONS = new Set(["derecha", "reves"]);
const VALID_MATCH_TYPES = new Set(["FRIENDLY", "LOCAL_TOURNAMENT"]);

function isMatchPreferences(value: unknown): value is MatchPreferences {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.position === "string" &&
    VALID_POSITIONS.has(v.position) &&
    typeof v.matchType === "string" &&
    VALID_MATCH_TYPES.has(v.matchType) &&
    typeof v.sets === "string" &&
    typeof v.countsForRanking === "boolean" &&
    typeof v.club === "string" &&
    typeof v.courtNumber === "string"
  );
}

export function loadMatchPreferences(): MatchPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isMatchPreferences(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveMatchPreferences(prefs: MatchPreferences): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota / serialization errors
  }
}
