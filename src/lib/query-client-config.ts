import { QueryClient, QueryClientConfig } from "@tanstack/react-query";

export const DEFAULT_QUERY_STALE_TIME = 60 * 1000; // 1 minuto (60.000 ms)
export const DEFAULT_QUERY_GC_TIME = 5 * 60 * 1000; // 5 minutos (300.000 ms)
export const MAX_QUERY_RETRY_COUNT = 2; // Máximo 2 reintentos para errores transitorios

/**
 * Función helper pura para determinar si una consulta que falló debe reintentarse.
 * Limita los reintentos a un máximo de 2 para fallos transitorios y evita reintentos
 * en errores no reintentables (ej. 4xx HTTP status o errores cliente explícitos).
 */
export function isQueryRetryable(
  failureCount: number,
  error: unknown,
): boolean {
  if (failureCount >= MAX_QUERY_RETRY_COUNT) {
    return false;
  }

  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    // Omitir reintentos para errores HTTP cliente 4xx
    if (typeof err.status === "number" && err.status >= 400 && err.status < 500) {
      return false;
    }
    if (typeof err.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 500) {
      return false;
    }
  }

  return true;
}

/**
 * Genera la configuración por defecto de TanStack QueryClient para la aplicación.
 * Define staleTime en 60s, gcTime en 5 min, desactiva refetchOnWindowFocus
 * y configura un límite de reintentos prudente para optimizar la performance en dispositivos móviles.
 */
export function getQueryClientConfig(
  overrides?: QueryClientConfig,
): QueryClientConfig {
  return {
    ...overrides,
    defaultOptions: {
      ...overrides?.defaultOptions,
      queries: {
        staleTime: DEFAULT_QUERY_STALE_TIME,
        gcTime: DEFAULT_QUERY_GC_TIME,
        refetchOnWindowFocus: false,
        retry: isQueryRetryable,
        ...overrides?.defaultOptions?.queries,
      },
      mutations: {
        ...overrides?.defaultOptions?.mutations,
      },
    },
  };
}

/**
 * Crea e inicializa una instancia de QueryClient con la configuración por defecto de Padel Red
 * o con sobreescrituras opcionales pasadas como argumento.
 */
export function createAppQueryClient(
  overrides?: QueryClientConfig,
): QueryClient {
  return new QueryClient(getQueryClientConfig(overrides));
}
