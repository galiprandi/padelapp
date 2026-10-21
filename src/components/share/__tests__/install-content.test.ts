import { describe, it, expect } from "vitest";
import {
  isIOSDeviceUserAgent,
  getPlatformSteps,
  getNextPlatformValue,
  getPlatformRadioAriaLabel,
  getInstallStatusAriaLabel,
  getInstallPageAriaLabel,
  getInstallSkeletonAriaLabel,
  getInstallPageTitle,
  getInstallPageDescription,
  getInstallPageLogoAltText,
  getInstallPageBackAriaLabel,
  getInstallPageBackLinkClasses,
  getInstallActionAriaLabel,
  getInstallButtonLabel,
  getInstallButtonClasses,
  getInstallStatusInstalledClasses,
  getInstallInstalledLabel,
  getInstallSuccessToast,
  getInstallInitErrorToast,
  getInstallValidationErrorToast,
  getManualInstallDividerText,
  getPlatformSelectorHeaderText,
  getPlatformSelectorHeaderClasses,
  getPlatformOptionLabelText,
  getPlatformRadioClasses,
  getManualInstallDividerClasses,
  getInstallStepContainerClasses,
  getInstallStepIconBadgeClasses,
  getInstallStepIconClasses,
  getInstallStepTitleClasses,
  getInstallStepDescriptionClasses,
  getAlreadyInstalledTitleText,
  getAlreadyInstalledDescriptionText,
  getAlreadyInstalledContainerClasses,
  getAlreadyInstalledIconBadgeClasses,
  getAlreadyInstalledTitleClasses,
  getAlreadyInstalledDescriptionClasses,
  getInstallPageMainClasses,
  getInstallPageContainerClasses,
  getInstallPageLogoClasses,
  getInstallPageHeaderClasses,
  getInstallPageTitleClasses,
  getInstallPageDescriptionClasses,
  getInstallPageContentWrapperClasses,
  getInstallPageBackLinkText,
  getInstallLoadingLogoSkeletonClasses,
  getInstallLoadingHeaderClasses,
  getInstallLoadingTitleSkeletonClasses,
  getInstallLoadingSubtitleSkeletonClasses,
  getInstallLoadingCardSkeletonClasses,
  getInstallLoadingButtonSkeletonClasses,
} from "../install-utils";

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

  it("calculates next platform correctly during arrow key navigation", () => {
    expect(getNextPlatformValue("android", "ArrowRight")).toBe("ios");
    expect(getNextPlatformValue("android", "ArrowDown")).toBe("ios");
    expect(getNextPlatformValue("ios", "ArrowLeft")).toBe("android");
    expect(getNextPlatformValue("ios", "ArrowUp")).toBe("android");
    expect(getNextPlatformValue("android", "Enter")).toBe("android");
  });

  it("generates correct accessible ARIA radio labels for platforms", () => {
    expect(getPlatformRadioAriaLabel("android")).toContain("Android o Chrome");
    expect(getPlatformRadioAriaLabel("ios")).toContain("iOS o Safari");
  });

  it("generates correct accessible status ARIA labels for installation state", () => {
    expect(getInstallStatusAriaLabel(true)).toBe("Padel Red ya está instalada en tu dispositivo");
    expect(getInstallStatusAriaLabel(false)).toBe("Instrucciones de instalación de Padel Red");
  });

  it("returns correct localized ARIA labels and copy strings for InstallPage", () => {
    expect(getInstallPageAriaLabel()).toBe("Página de instalación de la aplicación Padel Red");
    expect(getInstallSkeletonAriaLabel()).toBe("Cargando guía de instalación de Padel Red");
    expect(getInstallPageTitle()).toBe("Instalar Padel Red");
    expect(getInstallPageDescription()).toBe("Agregá la app a tu pantalla de inicio para acceder más rápido.");
    expect(getInstallPageLogoAltText()).toBe("Padel Red");
    expect(getInstallPageBackAriaLabel()).toBe("Volver a la página principal");
    expect(getInstallPageBackLinkClasses()).toContain("h-10 w-full rounded-lg text-sm font-semibold");
    expect(getInstallPageBackLinkClasses()).toContain("focus-visible:ring-2");
  });

  it("returns correct install button action ARIA labels and button state text", () => {
    expect(getInstallActionAriaLabel()).toBe("Instalar app de Padel Red");
    expect(getInstallButtonLabel(true)).toBe("Instalando...");
    expect(getInstallButtonLabel(false)).toBe("Instalar app");
  });

  it("returns standardized CSS classes for install button and installed badge", () => {
    expect(getInstallButtonClasses()).toContain("w-full h-12 rounded-lg font-semibold");
    expect(getInstallButtonClasses()).toContain("active:scale-[0.98]");
    expect(getInstallStatusInstalledClasses()).toContain("text-emerald-500");
    expect(getInstallInstalledLabel()).toBe("Instalada");
  });

  it("returns correct toast notification messages for install events", () => {
    expect(getInstallSuccessToast()).toBe("App instalada");
    expect(getInstallInitErrorToast()).toBe("No se pudo iniciar la instalación");
    expect(getInstallValidationErrorToast()).toBe("No se pudo validar la instalación");
  });

  it("returns correct platform and manual install copy strings", () => {
    expect(getManualInstallDividerText()).toBe("O instalá manualmente");
    expect(getPlatformSelectorHeaderText()).toBe("Elegí tu sistema operativo:");
    expect(getPlatformOptionLabelText("android")).toBe("Android / Chrome");
    expect(getPlatformOptionLabelText("ios")).toBe("iOS / Safari");
    expect(getAlreadyInstalledTitleText()).toBe("Padel Red ya está instalada");
    expect(getAlreadyInstalledDescriptionText()).toBe("Buscala en tu pantalla de inicio para jugar con un solo toque.");
  });

  it("returns standardized CSS classes for platform radio buttons and step layout items", () => {
    expect(getPlatformSelectorHeaderClasses()).toBe("text-xs font-bold text-muted-foreground");
    expect(getPlatformRadioClasses(true)).toContain("bg-primary border-primary text-primary-foreground font-bold");
    expect(getPlatformRadioClasses(false)).toContain("bg-card border-border text-muted-foreground hover:bg-muted");
    expect(getManualInstallDividerClasses()).toContain("bg-card px-2 text-muted-foreground font-bold");
    expect(getInstallStepContainerClasses()).toContain("flex items-center gap-4 rounded-xl bg-card p-4");
    expect(getInstallStepIconBadgeClasses()).toContain("flex h-10 w-10 shrink-0 items-center justify-center");
    expect(getInstallStepIconClasses()).toBe("h-5 w-5 text-primary");
    expect(getInstallStepTitleClasses()).toBe("text-xs font-bold text-muted-foreground");
    expect(getInstallStepDescriptionClasses()).toBe("text-sm font-semibold leading-snug text-foreground");
    expect(getAlreadyInstalledContainerClasses()).toBe("flex flex-col items-center gap-3 py-6");
    expect(getAlreadyInstalledIconBadgeClasses()).toContain("border-emerald-500/30");
    expect(getAlreadyInstalledTitleClasses()).toBe("text-sm font-semibold text-foreground");
    expect(getAlreadyInstalledDescriptionClasses()).toBe("text-xs text-muted-foreground text-center max-w-[240px]");
  });

  it("returns standardized CSS classes and text labels for InstallPage layout elements", () => {
    expect(getInstallPageMainClasses()).toContain("flex min-h-[100dvh] flex-col items-center justify-center");
    expect(getInstallPageContainerClasses()).toContain("flex w-full max-w-sm flex-col items-center gap-8");
    expect(getInstallPageLogoClasses()).toBe("h-20 w-20");
    expect(getInstallPageHeaderClasses()).toBe("space-y-2 text-center");
    expect(getInstallPageTitleClasses()).toBe("text-2xl font-bold text-foreground");
    expect(getInstallPageDescriptionClasses()).toBe("text-sm text-muted-foreground max-w-[260px]");
    expect(getInstallPageContentWrapperClasses()).toBe("w-full");
    expect(getInstallPageBackLinkText()).toBe("Volver al inicio");
  });

  it("returns standardized CSS classes for InstallLoading skeleton elements", () => {
    expect(getInstallLoadingLogoSkeletonClasses()).toBe("h-20 w-20 rounded-2xl");
    expect(getInstallLoadingHeaderClasses()).toBe("flex flex-col items-center space-y-2 text-center");
    expect(getInstallLoadingTitleSkeletonClasses()).toBe("h-7 w-48 rounded-md");
    expect(getInstallLoadingSubtitleSkeletonClasses()).toBe("h-8 w-64 rounded-md");
    expect(getInstallLoadingCardSkeletonClasses()).toBe("h-56 w-full rounded-xl");
    expect(getInstallLoadingButtonSkeletonClasses()).toBe("h-10 w-full rounded-lg");
  });
});
