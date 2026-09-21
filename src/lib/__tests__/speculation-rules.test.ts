import { describe, it, expect } from "vitest";
import {
  getSpeculationRulesConfig,
  getSpeculationRulesTag,
  formatSpeculationDocumentPattern,
  getSpeculationEagernessForPath,
  isSpeculationPath,
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

describe("getSpeculationRulesTag", () => {
  it("debe retornar un objeto { __html } con el JSON serializado de las reglas por defecto", () => {
    const tag = getSpeculationRulesTag();
    expect(tag).toBeDefined();
    expect(typeof tag.__html).toBe("string");

    const parsed = JSON.parse(tag.__html);
    expect(parsed.prerender).toHaveLength(3);
    expect(parsed.prerender[0].urls).toEqual([...PRIMARY_SPECULATION_URLS]);
  });

  it("debe retornar un objeto { __html } con el JSON serializado para URLs personalizadas", () => {
    const tag = getSpeculationRulesTag(["/me", "/turnos"], "conservative");
    const parsed = JSON.parse(tag.__html);
    expect(parsed.prerender).toHaveLength(1);
    expect(parsed.prerender[0].eagerness).toBe("conservative");
    expect(parsed.prerender[0].urls).toEqual(["/me", "/turnos"]);
  });
});

describe("formatSpeculationDocumentPattern", () => {
  it("debe retornar un objeto { href_matches } con el patrón indicado", () => {
    expect(formatSpeculationDocumentPattern("/t/*")).toEqual({
      href_matches: "/t/*",
    });
  });
});

describe("getSpeculationEagernessForPath e isSpeculationPath", () => {
  it("debe clasificar rutas primarias con eagerness 'eager' e isSpeculationPath true", () => {
    expect(getSpeculationEagernessForPath("/me")).toBe("eager");
    expect(getSpeculationEagernessForPath("/turnos")).toBe("eager");
    expect(getSpeculationEagernessForPath("/ranking")).toBe("eager");
    expect(isSpeculationPath("/me")).toBe(true);
    expect(isSpeculationPath("/turnos")).toBe(true);
  });

  it("debe clasificar rutas secundarias con eagerness 'moderate' e isSpeculationPath true", () => {
    expect(getSpeculationEagernessForPath("/network")).toBe("moderate");
    expect(getSpeculationEagernessForPath("/install")).toBe("moderate");
    expect(isSpeculationPath("/network")).toBe(true);
  });

  it("debe clasificar patrones dinámicos (/t/123, /m/abc, /j/456, /p/789, /match/1, /turnos/1) con eagerness 'moderate' e isSpeculationPath true", () => {
    expect(getSpeculationEagernessForPath("/t/123456")).toBe("moderate");
    expect(getSpeculationEagernessForPath("/m/match-abc")).toBe("moderate");
    expect(getSpeculationEagernessForPath("/j/player-xyz")).toBe("moderate");
    expect(getSpeculationEagernessForPath("/p/user-456")).toBe("moderate");
    expect(getSpeculationEagernessForPath("/match/123/result")).toBe("moderate");
    expect(getSpeculationEagernessForPath("/turnos/456/editar")).toBe("moderate");

    expect(isSpeculationPath("/t/123456")).toBe(true);
    expect(isSpeculationPath("/m/match-abc")).toBe(true);
  });

  it("debe ignorar parámetros de consulta y fragmentos hash al evaluar la ruta", () => {
    expect(getSpeculationEagernessForPath("/me?tab=overview#section")).toBe("eager");
    expect(getSpeculationEagernessForPath("/t/123?referrer=whatsapp#top")).toBe("moderate");
  });

  it("debe retornar null para rutas no configuradas para especulación e isSpeculationPath false", () => {
    expect(getSpeculationEagernessForPath("/admin/dashboard")).toBeNull();
    expect(getSpeculationEagernessForPath("")).toBeNull();
    expect(isSpeculationPath("/unknown")).toBe(false);
  });
});
