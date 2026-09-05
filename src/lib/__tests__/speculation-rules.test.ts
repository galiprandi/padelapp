import { describe, it, expect } from "vitest";
import {
  getSpeculationRulesConfig,
  PRIMARY_SPECULATION_URLS,
  SECONDARY_SPECULATION_URLS,
  DEFAULT_SPECULATION_URLS,
} from "../speculation-rules";

describe("getSpeculationRulesConfig", () => {
  it("debe exportar las URLs primarias, secundarias y por defecto correctamente", () => {
    expect(PRIMARY_SPECULATION_URLS).toContain("/me");
    expect(PRIMARY_SPECULATION_URLS).toContain("/notifications");
    expect(SECONDARY_SPECULATION_URLS).toContain("/network");
    expect(SECONDARY_SPECULATION_URLS).toContain("/install");

    expect(DEFAULT_SPECULATION_URLS).toEqual([
      ...PRIMARY_SPECULATION_URLS,
      ...SECONDARY_SPECULATION_URLS,
    ]);
  });

  it("debe retornar una configuración multinivel por defecto con eager para rutas primarias y moderate para secundarias", () => {
    const config = getSpeculationRulesConfig();
    expect(config).toBeDefined();
    expect(config.prerender).toHaveLength(2);

    const primaryGroup = config.prerender[0];
    expect(primaryGroup.source).toBe("list");
    expect(primaryGroup.eagerness).toBe("eager");
    expect(primaryGroup.urls).toEqual([...PRIMARY_SPECULATION_URLS]);

    const secondaryGroup = config.prerender[1];
    expect(secondaryGroup.source).toBe("list");
    expect(secondaryGroup.eagerness).toBe("moderate");
    expect(secondaryGroup.urls).toEqual([...SECONDARY_SPECULATION_URLS]);
  });

  it("debe permitir personalizar las URLs y el nivel de eagerness con un arreglo personalizado", () => {
    const customUrls = ["/me", "/turnos"];
    const config = getSpeculationRulesConfig(customUrls, "eager");

    expect(config.prerender).toHaveLength(1);
    expect(config.prerender[0].eagerness).toBe("eager");
    expect(config.prerender[0].urls).toEqual(customUrls);
  });

  it("debe usar las reglas multinivel por defecto si se pasa un arreglo de URLs vacío", () => {
    const config = getSpeculationRulesConfig([]);
    expect(config.prerender).toHaveLength(2);
    expect(config.prerender[0].urls).toEqual([...PRIMARY_SPECULATION_URLS]);
    expect(config.prerender[1].urls).toEqual([...SECONDARY_SPECULATION_URLS]);
  });
});
