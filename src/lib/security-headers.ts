export interface SecurityHeader {
  key: string;
  value: string;
}

export const DEFAULT_PERMISSIONS_POLICY =
  "camera=(), microphone=(), geolocation=(), interest-cohort=()";

/**
 * Genera la cadena de política de Content-Security-Policy (CSP) para la aplicación.
 * En modo desarrollo (`isDev = true`), incluye `'unsafe-eval'` requerido por React para stack traces.
 */
export function getContentSecurityPolicy(isDev: boolean = false): string {
  const scriptSrc = `script-src 'self' 'unsafe-inline'${
    isDev ? " 'unsafe-eval'" : ""
  } https://www.googletagmanager.com https://va.vercel-scripts.com`;

  const directives = [
    "default-src 'self'",
    "img-src 'self' data: blob: https://lh3.googleusercontent.com",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://www.googleapis.com https://identity.googleapis.com https://firebaseinstallations.googleapis.com https://fcm.googleapis.com https://fcmregistrations.googleapis.com https://va.vercel-scripts.com",
    "frame-src 'self' https://accounts.google.com",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com",
  ];

  return directives.join("; ");
}

/**
 * Retorna la cadena de política de permisos del navegador (Permissions-Policy).
 */
export function getPermissionsPolicy(): string {
  return DEFAULT_PERMISSIONS_POLICY;
}

/**
 * Genera el listado de cabeceras de seguridad HTTP recomendadas para la aplicación.
 */
export function getSecurityHeaders(isDev: boolean = false): SecurityHeader[] {
  return [
    // Previene clickjacking en todas las rutas (incluyendo callbacks OAuth).
    { key: "X-Frame-Options", value: "DENY" },
    // Evita el sniff de Content-Type en navegadores antiguos.
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Evita filtrar parámetros de consulta con tokens en enlaces salientes.
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // Restringe APIs avanzadas del navegador al mismo origen.
    {
      key: "Permissions-Policy",
      value: getPermissionsPolicy(),
    },
    // Configuración base de Content Security Policy (CSP).
    {
      key: "Content-Security-Policy",
      value: getContentSecurityPolicy(isDev),
    },
  ];
}
