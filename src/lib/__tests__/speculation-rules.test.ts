import { describe, it, expect } from "vitest";
import {
  getSpeculationRulesConfig,
  DEFAULT_SPECULATION_URLS,
} from "../speculation-rules";

describe("getSpeculationRulesConfig", () => {
  it("debe retornar la configuración por defecto con eager: moderate", () => {
    const config = getSpeculationRulesConfig();
    expect(config).toBeDefined();
    expect(config.prerender).toHaveLength(1);

    const group = config.prerender[0];
    expect(group.source).toBe("list");
    expect(group.eagerness).toBe("moderate");
    expect(group.urls).toEqual([...DEFAULT_SPECULATION_URLS]);
  });

  it("debe permitir personalizar las URLs y el nivel de eagerness", () => {
    const customUrls = ["/me", "/turnos"];
    const config = getSpeculationRulesConfig(customUrls, "eager");

    expect(config.prerender[0].eagerness).toBe("eager");
    expect(config.prerender[0].urls).toEqual(customUrls);
  });

  it("debe usar las URLs por defecto si se pasa un arreglo vacío", () => {
    const config = getSpeculationRulesConfig([]);
    expect(config.prerender[0].urls).toEqual([...DEFAULT_SPECULATION_URLS]);
  });
});
