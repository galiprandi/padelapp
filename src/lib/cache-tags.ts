/**
 * Constantes estandarizadas de etiquetas de caché (tags) para la revalidación
 * granular en Next.js (revalidateTag) y unstable_cache.
 */
export const CACHE_TAG_RANKING = "ranking";
export const CACHE_TAG_MATCHES = "matches";
export const CACHE_TAG_TURNS = "turns";
export const CACHE_TAG_NETWORK = "network_contacts";
export const CACHE_TAG_PROFILE = "profile";

export const KNOWN_CACHE_TAGS = [
  CACHE_TAG_RANKING,
  CACHE_TAG_MATCHES,
  CACHE_TAG_TURNS,
  CACHE_TAG_NETWORK,
  CACHE_TAG_PROFILE,
] as const;

export type KnownCacheTag = (typeof KNOWN_CACHE_TAGS)[number];

export type CacheDomain =
  | "ranking"
  | "matches"
  | "turns"
  | "network"
  | "profile"
  | "all";

/**
 * Tiempos de vida recomendados (TTL en segundos) para cada perfil de revalidación.
 */
export const CACHE_TTL_STATIC = 86400; // 24 horas (datos casi estáticos)
export const CACHE_TTL_DYNAMIC = 60; // 1 minuto (datos estándar dinámicos)
export const CACHE_TTL_FREQUENT = 10; // 10 segundos (datos de alta frecuencia)

/**
 * Devuelve las etiquetas de caché asociadas a un dominio de negocio específico o conjunto de dominios.
 */
export function getCacheTagsForDomain(domain?: CacheDomain): KnownCacheTag[] {
  if (!domain) {
    return [...KNOWN_CACHE_TAGS];
  }

  switch (domain) {
    case "ranking":
      return [CACHE_TAG_RANKING];
    case "matches":
      return [CACHE_TAG_MATCHES];
    case "turns":
      return [CACHE_TAG_TURNS];
    case "network":
      return [CACHE_TAG_NETWORK, CACHE_TAG_MATCHES];
    case "profile":
      return [CACHE_TAG_PROFILE, CACHE_TAG_RANKING, CACHE_TAG_MATCHES];
    case "all":
    default:
      return [...KNOWN_CACHE_TAGS];
  }
}

/**
 * Devuelve el tiempo recomendado de revalidación (TTL en segundos) para un dominio o categoría.
 */
export function getCacheRevalidateTTL(domain?: string): number {
  if (!domain) {
    return CACHE_TTL_DYNAMIC;
  }

  const normalized = domain.toLowerCase().trim();

  switch (normalized) {
    case "ranking":
    case CACHE_TAG_RANKING:
      return CACHE_TTL_DYNAMIC; // 60s
    case "network":
    case "network_contacts":
    case CACHE_TAG_NETWORK:
      return 300; // 5 min
    case "profile":
    case CACHE_TAG_PROFILE:
      return CACHE_TTL_DYNAMIC; // 60s
    case "turns":
    case CACHE_TAG_TURNS:
      return CACHE_TTL_FREQUENT; // 10s (alta frecuencia de uniones/cancelaciones)
    case "matches":
    case CACHE_TAG_MATCHES:
      return CACHE_TTL_FREQUENT; // 10s (alta frecuencia de resultados/confirmaciones)
    case "static":
      return CACHE_TTL_STATIC; // 24h
    default:
      return CACHE_TTL_DYNAMIC;
  }
}

/**
 * Construye una clave de caché estandarizada, limpia y sin espacios para unstable_cache.
 * Omite valores nulos/indefinidos y formatea tipos primitivos.
 */
export function formatCacheKey(
  domain: string,
  ...parts: Array<string | number | boolean | null | undefined>
): string {
  const cleanDomain = domain.trim().toLowerCase();
  const validParts = parts
    .filter((p) => p !== null && p !== undefined && p !== "")
    .map((p) => String(p).trim());

  if (validParts.length === 0) {
    return cleanDomain;
  }

  return `${cleanDomain}:${validParts.join(":")}`;
}

/**
 * Comprueba si una cadena dada es una etiqueta de caché reconocida por la aplicación.
 */
export function isKnownCacheTag(tag: unknown): tag is KnownCacheTag {
  if (typeof tag !== "string") {
    return false;
  }
  return (KNOWN_CACHE_TAGS as readonly string[]).includes(tag.trim());
}
