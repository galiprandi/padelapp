import { describe, it, expect } from "vitest";
import {
  getSpeculationRulesConfig,
  PRIMARY_SPECULATION_URLS,
  SECONDARY_SPECULATION_URLS,
  DYNAMIC_SPECULATION_PATTERNS,
  DEFAULT_SPECULATION_URLS,
  SpeculationListRuleGroup,
  SpeculationDocumentRuleGroup,
} from "../speculation-rules";

describe("getSpeculationRulesConfig", () => {
  it("debe exportar las URLs primarias, secundarias, patrones dinámicos y por defecto correctamente", () => {
    expect(PRIMARY_SPECULATION_URLS).toContain("/me");
    expect(PRIMARY_SPECULATION_URLS).toContain("/notifications");
    expect(SECONDARY_SPECULATION_URLS).toContain("/network");
    expect(SECONDARY_SPECULATION_URLS).toContain("/install");

    expect(DYNAMIC_SPECULATION_PATTERNS).toContain("/t/*");
    expect(DYNAMIC_SPECULATION_PATTERNS).toContain("/m/*");
    expect(DYNAMIC_SPECULATION_PATTERNS).toContain("/j/*");
    expect(DYNAMIC_SPECULATION_PATTERNS).toContain("/p/*");

    expect(DEFAULT_SPECULATION_URLS).toEqual([
      ...PRIMARY_SPECULATION_URLS,
      ...SECONDARY_SPECULATION_URLS,
    ]);
  });

  it("debe retornar una configuración multinivel por defecto con eager para listas primarias, moderate para secundarias y moderate para patrones de documento dinámicos", () => {
    const config = getSpeculationRulesConfig();
    expect(config).toBeDefined();
    expect(config.prerender).toHaveLength(3);

    const primaryGroup = config.prerender[0] as SpeculationListRuleGroup;
    expect(primaryGroup.source).toBe("list");
    expect(primaryGroup.eagerness).toBe("eager");
    expect(primaryGroup.urls).toEqual([...PRIMARY_SPECULATION_URLS]);

    const secondaryGroup = config.prerender[1] as SpeculationListRuleGroup;
    expect(secondaryGroup.source).toBe("list");
    expect(secondaryGroup.eagerness).toBe("moderate");
    expect(secondaryGroup.urls).toEqual([...SECONDARY_SPECULATION_URLS]);

    const dynamicGroup = config.prerender[2] as SpeculationDocumentRuleGroup;
    expect(dynamicGroup.source).toBe("document");
    expect(dynamicGroup.eagerness).toBe("moderate");
    expect(dynamicGroup.where.or).toEqual(
      DYNAMIC_SPECULATION_PATTERNS.map((pattern) => ({
        href_matches: pattern,
      })),
    );
  });

  it("debe permitir personalizar las URLs y el nivel de eagerness con un arreglo personalizado", () => {
    const customUrls = ["/me", "/turnos"];
    const config = getSpeculationRulesConfig(customUrls, "eager");

    expect(config.prerender).toHaveLength(1);
    const customGroup = config.prerender[0] as SpeculationListRuleGroup;
    expect(customGroup.source).toBe("list");
    expect(customGroup.eagerness).toBe("eager");
    expect(customGroup.urls).toEqual(customUrls);
  });

  it("debe usar las reglas multinivel por defecto si se pasa un arreglo de URLs vacío", () => {
    const config = getSpeculationRulesConfig([]);
    expect(config.prerender).toHaveLength(3);
    const primaryGroup = config.prerender[0] as SpeculationListRuleGroup;
    const secondaryGroup = config.prerender[1] as SpeculationListRuleGroup;
    const dynamicGroup = config.prerender[2] as SpeculationDocumentRuleGroup;

    expect(primaryGroup.urls).toEqual([...PRIMARY_SPECULATION_URLS]);
    expect(secondaryGroup.urls).toEqual([...SECONDARY_SPECULATION_URLS]);
    expect(dynamicGroup.source).toBe("document");
  });
});
