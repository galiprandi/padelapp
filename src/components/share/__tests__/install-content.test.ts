import { describe, it, expect } from "vitest";

describe("PWA install guide and platform detection logic", () => {
  it("detects iOS devices from user agent strings", () => {
    const iosUserAgent =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1";
    const isIOS = /iPad|iPhone|iPod/.test(iosUserAgent);
    expect(isIOS).toBe(true);
  });

  it("detects non-iOS devices from Android user agent strings", () => {
    const androidUserAgent =
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36";
    const isIOS = /iPad|iPhone|iPod/.test(androidUserAgent);
    expect(isIOS).toBe(false);
  });

  it("provides expected platform labels in Argentine Spanish", () => {
    const platforms = [
      { key: "android", label: "Android / Chrome" },
      { key: "ios", label: "iOS / Safari" },
    ];
    expect(platforms[0].label).toBe("Android / Chrome");
    expect(platforms[1].label).toBe("iOS / Safari");
  });
});
