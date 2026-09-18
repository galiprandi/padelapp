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
 * Retorna las propiedades para las etiquetas <link rel="preconnect"> y <link rel="dns-prefetch">
 * optimizando la conexión temprana a dominios estáticos de imágenes (Google Avatars).
 */
export function getResourceHints(
  domains: readonly string[] = DEFAULT_RESOURCE_HINT_DOMAINS,
): ResourceHint[] {
  const hints: ResourceHint[] = [];

  for (const domain of domains) {
    if (!domain || typeof domain !== "string") continue;
    const cleanDomain = domain.trim();
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
