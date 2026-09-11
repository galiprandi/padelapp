import { describe, it, expect } from "vitest";
import {
  DEFAULT_QUERY_STALE_TIME,
  getQueryClientConfig,
  createAppQueryClient,
} from "../query-client-config";
import { QueryClient } from "@tanstack/react-query";

describe("query-client-config", () => {
  describe("DEFAULT_QUERY_STALE_TIME", () => {
    it("debe ser de 60.000 ms (1 minuto)", () => {
      expect(DEFAULT_QUERY_STALE_TIME).toBe(60 * 1000);
    });
  });

  describe("getQueryClientConfig", () => {
    it("debe retornar la configuración por defecto de consultas con staleTime de 60s y refetchOnWindowFocus deshabilitado", () => {
      const config = getQueryClientConfig();

      expect(config.defaultOptions?.queries?.staleTime).toBe(60000);
      expect(config.defaultOptions?.queries?.refetchOnWindowFocus).toBe(false);
    });

    it("debe permitir sobreescribir opciones de consulta personalizadas", () => {
      const config = getQueryClientConfig({
        defaultOptions: {
          queries: {
            staleTime: 30000,
            retry: 2,
          },
        },
      });

      expect(config.defaultOptions?.queries?.staleTime).toBe(30000);
      expect(config.defaultOptions?.queries?.refetchOnWindowFocus).toBe(false);
      expect(config.defaultOptions?.queries?.retry).toBe(2);
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
      expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
    });

    it("debe instanciar QueryClient con sobreescrituras opcionales cuando se especifican", () => {
      const queryClient = createAppQueryClient({
        defaultOptions: {
          queries: {
            staleTime: 120000,
          },
        },
      });

      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.queries?.staleTime).toBe(120000);
    });
  });
});
