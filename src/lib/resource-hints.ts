export const DEFAULT_RESOURCE_HINT_DOMAINS = [
  "https://lh3.googleusercontent.com",
] as const;

export interface ResourceHint {
  rel: "preconnect" | "dns-prefetch";
  href: string;
}

export interface OriginTrialMetaProps {
  "http-equiv": "origin-trial";
  content: string;
}

/**
 * Sanitiza y valida la cadena de un dominio para pista de recursos.
 */
export function sanitizeResourceHintDomain(
  domain?: string | null,
): string | null {
  if (!domain || typeof domain !== "string") return null;
  const cleanDomain = domain.trim();
  return cleanDomain.length > 0 ? cleanDomain : null;
}

/**
 * Determina si una cadena de dominio es válida para una pista de recursos.
 */
export function isResourceHintDomainValid(
  domain?: string | null,
): boolean {
  return sanitizeResourceHintDomain(domain) !== null;
}

/**
 * Genera una clave única para iterar pistas de recursos en el árbol JSX.
 */
export function getResourceHintKey(
  hint: ResourceHint,
  index: number,
): string {
  return `${hint.rel}-${hint.href}-${index}`;
}

/**
 * Formatea las propiedades del elemento <link> para la pista de recursos.
 */
export function formatResourceHintLinkProps(
  hint: ResourceHint,
): { rel: "preconnect" | "dns-prefetch"; href: string } {
  return {
    rel: hint.rel,
    href: hint.href,
  };
}

/**
 * Retorna las propiedades para las etiquetas <link rel="preconnect"> y <link rel="dns-prefetch">
 * optimizando la conexión temprana a dominios estáticos de imágenes (Google Avatars).
 */
export function getResourceHints(
  domains: readonly string[] = DEFAULT_RESOURCE_HINT_DOMAINS,
): ResourceHint[] {
  const hints: ResourceHint[] = [];

  for (const domain of domains) {
    const cleanDomain = sanitizeResourceHintDomain(domain);
    if (!cleanDomain) continue;

    hints.push({
      rel: "preconnect",
      href: cleanDomain,
    });
    hints.push({
      rel: "dns-prefetch",
      href: cleanDomain,
    });
  }

  return hints;
}

/**
 * Genera las propiedades de la etiqueta <meta http-equiv="origin-trial"> si el token está presente.
 */
export function getOriginTrialMetaProps(
  token?: string | null,
): OriginTrialMetaProps | null {
  if (!token || typeof token !== "string") return null;
  const cleanToken = token.trim();
  if (!cleanToken) return null;

  return {
    "http-equiv": "origin-trial",
    content: cleanToken,
  };
}

/**
 * Determina si hay una prueba de origen (Origin Trial) activa en función de la presencia de un token válido.
 */
export function isOriginTrialActive(
  token?: string | null,
): boolean {
  return getOriginTrialMetaProps(token) !== null;
}

export interface ResourceHintLinkProps {
  key: string;
  rel: "preconnect" | "dns-prefetch";
  href: string;
}

/**
 * Genera una lista de objetos listos para renderizar como elementos `<link>` en la cabecera HTML,
 * incluyendo la clave única JSX `key` y las propiedades `rel` y `href`.
 */
export function getResourceHintLinkPropsList(
  domains: readonly string[] = DEFAULT_RESOURCE_HINT_DOMAINS,
): ResourceHintLinkProps[] {
  const hints = getResourceHints(domains);
  return hints.map((hint, idx) => ({
    key: getResourceHintKey(hint, idx),
    ...formatResourceHintLinkProps(hint),
  }));
}

export interface RootHeadMetadataProps {
  resourceHintLinks: ResourceHintLinkProps[];
  originTrialMeta: OriginTrialMetaProps | null;
}

/**
 * Consolida la extracción de metadatos para el tag `<head>` del RootLayout,
 * devolviendo las pistas de recursos formateadas y las propiedades de la meta etiqueta de Origin Trial.
 */
export function getRootHeadMetadataProps(
  originTrialToken?: string | null,
  customDomains: readonly string[] = DEFAULT_RESOURCE_HINT_DOMAINS,
): RootHeadMetadataProps {
  return {
    resourceHintLinks: getResourceHintLinkPropsList(customDomains),
    originTrialMeta: getOriginTrialMetaProps(originTrialToken),
  };
}
