import { QueryClient, QueryClientConfig, DefaultOptions } from "@tanstack/react-query";

export const DEFAULT_QUERY_STALE_TIME = 60 * 1000; // 1 minuto (60.000 ms)
export const DEFAULT_QUERY_GC_TIME = 5 * 60 * 1000; // 5 minutos (300.000 ms)
export const MAX_QUERY_RETRY_COUNT = 2; // Máximo 2 reintentos para errores transitorios
export const MAX_MUTATION_RETRY_COUNT = 1; // Máximo 1 reintento para mutaciones transitorias
export const DEFAULT_RETRY_BASE_DELAY = 1000; // 1 segundo (1.000 ms)
export const DEFAULT_RETRY_MAX_DELAY = 30000; // 30 segundos (30.000 ms)

/**
 * Función helper pura para determinar el retardo de reintento exponencial (exponential backoff).
 * Calcula un retardo progresivo en milisegundos basado en el intento, acotado entre baseDelay y maxDelay.
 */
export function getQueryRetryDelay(
  failureCount: number,
  _error?: unknown,
  baseDelay = DEFAULT_RETRY_BASE_DELAY,
  maxDelay = DEFAULT_RETRY_MAX_DELAY,
): number {
  const attempt = Math.max(0, failureCount);
  const calculatedDelay = baseDelay * Math.pow(2, attempt);
  return Math.min(calculatedDelay, maxDelay);
}

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
 * Función helper pura para determinar si una mutación que falló debe reintentarse.
 * Limita los reintentos a 1 para errores transitorios y descarta errores cliente 4xx.
 */
export function isMutationRetryable(
  failureCount: number,
  error: unknown,
): boolean {
  if (failureCount >= MAX_MUTATION_RETRY_COUNT) {
    return false;
  }

  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
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
 * Genera la configuración por defecto para mutaciones en TanStack QueryClient.
 */
export function getQueryClientMutationDefaults(
  overrides?: DefaultOptions["mutations"],
): DefaultOptions["mutations"] {
  return {
    retry: isMutationRetryable,
    ...overrides,
  };
}

export interface QueryClientCacheSummary {
  totalQueries: number;
  activeQueries: number;
  staleQueries: number;
  errorQueries: number;
  fetchingQueries: number;
}

/**
 * Extrae un resumen tipado del estado del caché de una instancia de QueryClient.
 * Proporciona telemetría útil para monitoreo de rendimiento y diagnóstico.
 */
export function getQueryClientCacheSummary(
  queryClient: QueryClient,
): QueryClientCacheSummary {
  const queryCache = queryClient.getQueryCache();
  const queries = queryCache.getAll();

  let activeQueries = 0;
  let staleQueries = 0;
  let errorQueries = 0;
  let fetchingQueries = 0;

  for (const query of queries) {
    if (query.isActive()) {
      activeQueries++;
    }
    if (query.isStale()) {
      staleQueries++;
    }
    if (query.state.status === "error") {
      errorQueries++;
    }
    if (query.state.fetchStatus === "fetching") {
      fetchingQueries++;
    }
  }

  return {
    totalQueries: queries.length,
    activeQueries,
    staleQueries,
    errorQueries,
    fetchingQueries,
  };
}

/**
 * Genera la configuración por defecto de TanStack QueryClient para la aplicación.
 * Define staleTime en 60s, gcTime en 5 min, desactiva refetchOnWindowFocus
 * y configura un límite de reintentos y retroceso exponencial para optimizar la performance en dispositivos móviles.
 */
export function getQueryClientConfig(
  overrides?: QueryClientConfig,
): QueryClientConfig {
  const mutationDefaults = getQueryClientMutationDefaults(
    overrides?.defaultOptions?.mutations,
  );

  return {
    ...overrides,
    defaultOptions: {
      ...overrides?.defaultOptions,
      queries: {
        staleTime: DEFAULT_QUERY_STALE_TIME,
        gcTime: DEFAULT_QUERY_GC_TIME,
        refetchOnWindowFocus: false,
        retry: isQueryRetryable,
        retryDelay: getQueryRetryDelay,
        ...overrides?.defaultOptions?.queries,
      },
      mutations: mutationDefaults,
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
