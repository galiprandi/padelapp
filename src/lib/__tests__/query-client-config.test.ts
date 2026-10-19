import { describe, it, expect } from "vitest";
import {
  DEFAULT_QUERY_STALE_TIME,
  DEFAULT_QUERY_GC_TIME,
  MAX_QUERY_RETRY_COUNT,
  MAX_MUTATION_RETRY_COUNT,
  DEFAULT_RETRY_BASE_DELAY,
  DEFAULT_RETRY_MAX_DELAY,
  getQueryRetryDelay,
  isQueryRetryable,
  isMutationRetryable,
  getQueryClientMutationDefaults,
  getQueryClientCacheSummary,
  getQueryClientConfig,
  createAppQueryClient,
} from "../query-client-config";
import { QueryClient } from "@tanstack/react-query";

describe("query-client-config", () => {
  describe("Constantes de configuración", () => {
    it("debe definir DEFAULT_QUERY_STALE_TIME en 60.000 ms (1 minuto)", () => {
      expect(DEFAULT_QUERY_STALE_TIME).toBe(60 * 1000);
    });

    it("debe definir DEFAULT_QUERY_GC_TIME en 300.000 ms (5 minutos)", () => {
      expect(DEFAULT_QUERY_GC_TIME).toBe(5 * 60 * 1000);
    });

    it("debe definir MAX_QUERY_RETRY_COUNT en 2 reintentos", () => {
      expect(MAX_QUERY_RETRY_COUNT).toBe(2);
    });

    it("debe definir MAX_MUTATION_RETRY_COUNT en 1 reintento", () => {
      expect(MAX_MUTATION_RETRY_COUNT).toBe(1);
    });

    it("debe definir DEFAULT_RETRY_BASE_DELAY y DEFAULT_RETRY_MAX_DELAY", () => {
      expect(DEFAULT_RETRY_BASE_DELAY).toBe(1000);
      expect(DEFAULT_RETRY_MAX_DELAY).toBe(30000);
    });
  });

  describe("getQueryRetryDelay", () => {
    it("debe calcular el retardo exponencial progresivo según el número de fallo", () => {
      expect(getQueryRetryDelay(0)).toBe(1000); // 1000 * 2^0
      expect(getQueryRetryDelay(1)).toBe(2000); // 1000 * 2^1
      expect(getQueryRetryDelay(2)).toBe(4000); // 1000 * 2^2
      expect(getQueryRetryDelay(3)).toBe(8000); // 1000 * 2^3
    });

    it("debe acotar el retardo calculado al valor máximo maxDelay", () => {
      expect(getQueryRetryDelay(10)).toBe(30000); // Excede 30s maxDelay
    });

    it("debe respetar valores personalizados de baseDelay y maxDelay", () => {
      expect(getQueryRetryDelay(1, undefined, 500, 5000)).toBe(1000);
      expect(getQueryRetryDelay(5, undefined, 500, 2000)).toBe(2000);
    });

    it("debe manejar failureCount negativos tratando el valor como 0", () => {
      expect(getQueryRetryDelay(-1)).toBe(1000);
    });
  });

  describe("isQueryRetryable", () => {
    it("debe retornar true cuando failureCount es menor que el máximo permitido y el error es nulo o genérico", () => {
      expect(isQueryRetryable(0, null)).toBe(true);
      expect(isQueryRetryable(1, new Error("Network timeout"))).toBe(true);
    });

    it("debe retornar false cuando failureCount es igual o mayor que MAX_QUERY_RETRY_COUNT", () => {
      expect(isQueryRetryable(2, new Error("Server error"))).toBe(false);
      expect(isQueryRetryable(3, new Error("Server error"))).toBe(false);
    });

    it("debe retornar false para errores cliente HTTP status 4xx", () => {
      expect(isQueryRetryable(0, { status: 404 })).toBe(false);
      expect(isQueryRetryable(1, { status: 401 })).toBe(false);
      expect(isQueryRetryable(0, { statusCode: 403 })).toBe(false);
    });

    it("debe retornar true para errores servidor HTTP status 5xx", () => {
      expect(isQueryRetryable(0, { status: 500 })).toBe(true);
      expect(isQueryRetryable(1, { statusCode: 503 })).toBe(true);
    });
  });

  describe("isMutationRetryable", () => {
    it("debe retornar true para el primer fallo si no es un error cliente 4xx", () => {
      expect(isMutationRetryable(0, new Error("Network error"))).toBe(true);
      expect(isMutationRetryable(0, { status: 500 })).toBe(true);
    });

    it("debe retornar false cuando failureCount es mayor o igual a MAX_MUTATION_RETRY_COUNT", () => {
      expect(isMutationRetryable(1, new Error("Network error"))).toBe(false);
      expect(isMutationRetryable(2, new Error("Network error"))).toBe(false);
    });

    it("debe retornar false para errores cliente HTTP status 4xx", () => {
      expect(isMutationRetryable(0, { status: 400 })).toBe(false);
      expect(isMutationRetryable(0, { statusCode: 422 })).toBe(false);
    });
  });

  describe("getQueryClientMutationDefaults", () => {
    it("debe generar la configuración predeterminada de mutaciones con retry isMutationRetryable", () => {
      const defaults = getQueryClientMutationDefaults();
      expect(defaults?.retry).toBe(isMutationRetryable);
    });

    it("debe permitir sobreescribir opciones de mutación", () => {
      const defaults = getQueryClientMutationDefaults({ retry: 0 });
      expect(defaults?.retry).toBe(0);
    });
  });

  describe("getQueryClientCacheSummary", () => {
    it("debe retornar resumen de caché en cero para un QueryClient nuevo", () => {
      const queryClient = createAppQueryClient();
      const summary = getQueryClientCacheSummary(queryClient);

      expect(summary).toEqual({
        totalQueries: 0,
        activeQueries: 0,
        staleQueries: 0,
        errorQueries: 0,
        fetchingQueries: 0,
      });
    });

    it("debe contabilizar correctamente las consultas agregadas e invalidadas en el caché", () => {
      const queryClient = createAppQueryClient();
      queryClient.setQueryData(["test-query-1"], { id: 1 });
      queryClient.setQueryData(["test-query-2"], { id: 2 });

      const initialSummary = getQueryClientCacheSummary(queryClient);
      expect(initialSummary.totalQueries).toBe(2);
      expect(initialSummary.staleQueries).toBe(0); // Datos recién insertados dentro del staleTime (60s)

      queryClient.invalidateQueries({ queryKey: ["test-query-1"] });
      const updatedSummary = getQueryClientCacheSummary(queryClient);
      expect(updatedSummary.totalQueries).toBe(2);
      expect(updatedSummary.staleQueries).toBe(1);
    });
  });

  describe("getQueryClientConfig", () => {
    it("debe retornar la configuración por defecto de consultas con staleTime de 60s, gcTime de 5m, refetchOnWindowFocus deshabilitado y retryDelay", () => {
      const config = getQueryClientConfig();

      expect(config.defaultOptions?.queries?.staleTime).toBe(60000);
      expect(config.defaultOptions?.queries?.gcTime).toBe(300000);
      expect(config.defaultOptions?.queries?.refetchOnWindowFocus).toBe(false);
      expect(config.defaultOptions?.queries?.retry).toBe(isQueryRetryable);
      expect(config.defaultOptions?.queries?.retryDelay).toBe(getQueryRetryDelay);
      expect(config.defaultOptions?.mutations?.retry).toBe(isMutationRetryable);
    });

    it("debe permitir sobreescribir opciones de consulta personalizadas", () => {
      const config = getQueryClientConfig({
        defaultOptions: {
          queries: {
            staleTime: 30000,
            gcTime: 600000,
            retry: 5,
          },
        },
      });

      expect(config.defaultOptions?.queries?.staleTime).toBe(30000);
      expect(config.defaultOptions?.queries?.gcTime).toBe(600000);
      expect(config.defaultOptions?.queries?.refetchOnWindowFocus).toBe(false);
      expect(config.defaultOptions?.queries?.retry).toBe(5);
    });

    it("debe preservar sobreescrituras de mutaciones", () => {
      const config = getQueryClientConfig({
        defaultOptions: {
          mutations: {
            retry: 3,
          },
        },
      });

      expect(config.defaultOptions?.mutations?.retry).toBe(3);
    });
  });

  describe("createAppQueryClient", () => {
    it("debe instanciar una nueva QueryClient con la configuración por defecto de Padel Red", () => {
      const queryClient = createAppQueryClient();

      expect(queryClient).toBeInstanceOf(QueryClient);
      const defaultOptions = queryClient.getDefaultOptions();

      expect(defaultOptions.queries?.staleTime).toBe(60000);
      expect(defaultOptions.queries?.gcTime).toBe(300000);
      expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
      expect(defaultOptions.queries?.retry).toBe(isQueryRetryable);
      expect(defaultOptions.queries?.retryDelay).toBe(getQueryRetryDelay);
    });

    it("debe instanciar QueryClient with sobreescrituras opcionales cuando se especifican", () => {
      const queryClient = createAppQueryClient({
        defaultOptions: {
          queries: {
            staleTime: 120000,
            gcTime: 150000,
          },
        },
      });

      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.queries?.staleTime).toBe(120000);
      expect(defaultOptions.queries?.gcTime).toBe(150000);
    });
  });
});
