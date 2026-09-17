import { describe, it, expect } from "vitest";
import {
  DEFAULT_QUERY_STALE_TIME,
  DEFAULT_QUERY_GC_TIME,
  MAX_QUERY_RETRY_COUNT,
  isQueryRetryable,
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

  describe("getQueryClientConfig", () => {
    it("debe retornar la configuración por defecto de consultas con staleTime de 60s, gcTime de 5m, refetchOnWindowFocus deshabilitado y reintento isQueryRetryable", () => {
      const config = getQueryClientConfig();

      expect(config.defaultOptions?.queries?.staleTime).toBe(60000);
      expect(config.defaultOptions?.queries?.gcTime).toBe(300000);
      expect(config.defaultOptions?.queries?.refetchOnWindowFocus).toBe(false);
      expect(config.defaultOptions?.queries?.retry).toBe(isQueryRetryable);
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
            retry: 1,
          },
        },
      });

      expect(config.defaultOptions?.mutations?.retry).toBe(1);
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
    });

    it("debe instanciar QueryClient con sobreescrituras opcionales cuando se especifican", () => {
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
