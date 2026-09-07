import { describe, it, expect } from "vitest";
import { isIOSDeviceUserAgent, getPlatformSteps } from "../install-utils";

describe("PWA install guide and platform detection logic", () => {
  it("detects iOS devices from iPhone user agent strings", () => {
    const iosUserAgent =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1";
    expect(isIOSDeviceUserAgent(iosUserAgent)).toBe(true);
  });

  it("detects iPadOS devices from desktop Mac user agent with touch support", () => {
    const macUserAgent =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15";
    expect(isIOSDeviceUserAgent(macUserAgent, true)).toBe(true);
    expect(isIOSDeviceUserAgent(macUserAgent, false)).toBe(false);
  });

  it("detects non-iOS devices from Android user agent strings", () => {
    const androidUserAgent =
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36";
    expect(isIOSDeviceUserAgent(androidUserAgent)).toBe(false);
  });

  it("returns correct platform step definitions for iOS", () => {
    const iosSteps = getPlatformSteps("ios");
    expect(iosSteps).toHaveLength(3);
    expect(iosSteps[0].title).toBe("Menú de compartir");
    expect(iosSteps[1].title).toBe("Agregar a inicio");
    expect(iosSteps[2].title).toBe("Finalizar instalación");
  });

  it("returns correct platform step definitions for Android", () => {
    const androidSteps = getPlatformSteps("android");
    expect(androidSteps).toHaveLength(3);
    expect(androidSteps[0].title).toBe("Instalar con un tap");
    expect(androidSteps[1].title).toBe("Menú del navegador");
    expect(androidSteps[2].title).toBe("Aplicación lista");
  });
});
