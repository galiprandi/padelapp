import { QueryClient, QueryClientConfig } from "@tanstack/react-query";

export const DEFAULT_QUERY_STALE_TIME = 60 * 1000; // 1 minuto (60.000 ms)

/**
 * Genera la configuración por defecto de TanStack QueryClient para la aplicación.
 * Define staleTime en 60 segundos y desactiva refetchOnWindowFocus para optimizar
 * la performance en dispositivos móviles y reducir consultas innecesarias a la red.
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
        refetchOnWindowFocus: false,
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
