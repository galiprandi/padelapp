/**
 * Club name normalization.
 *
 * `club` is a free-text field on turns and matches. Users write the same
 * club with slight variations ("Padel City", "padel city", "PADEL CITY",
 * "Padel City · Cancha 3"), which breaks grouping in stats and
 * autocomplete suggestions.
 *
 * `normalizeClub` produces a canonical key for grouping/dedup:
 * - lowercase
 * - trim and collapse internal whitespace
 * - strip court suffixes ("· cancha 3", "cancha 3", "- cancha 3")
 * - strip common decorative separators at the end
 *
 * It does NOT mutate the stored value — the user still sees what they
 * typed. It is only used as a grouping/dedup key.
 */
export function normalizeClub(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    // collapse whitespace
    .replace(/\s+/g, " ")
    // strip " · cancha N", " - cancha N", " cancha N", "· cancha N" suffixes
    .replace(/\s*[\-·]\s*cancha\s*\d+\s*/g, "")
    .replace(/\s+cancha\s*\d+\s*/g, "")
    // strip trailing decorative separators
    .replace(/\s*[\-·]\s*$/g, "")
    .trim();
}

/**
 * Pick the best display name for a normalized club group.
 * Prefers the most frequent original spelling, falls back to the
 * longest one (usually the most descriptive), then the first seen.
 */
export function pickClubDisplayName(
  originals: string[],
): string {
  if (originals.length === 0) return "";
  const freq = new Map<string, number>();
  for (const o of originals) {
    const key = o.trim();
    if (!key) continue;
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }
  let best = "";
  let bestScore = -1;
  for (const [name, count] of freq) {
    // score: frequency * 10 + length (prefer descriptive names on tie)
    const score = count * 10 + name.length;
    if (score > bestScore) {
      bestScore = score;
      best = name;
    }
  }
  return best || (originals[0] ?? "");
}
