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
  getInstallStatusCheckIconClasses,
  getInstallButtonSpinnerClasses,
  getInstallButtonDownloadIconClasses,
  getInstallElementContainerClasses,
  getInstallElementInstallingNoticeClasses,
  getInstallElementTagClasses,
  getInstallContentContainerClasses,
  getInstallContentPlatformWrapperClasses,
  getInstallContentPlatformGridClasses,
  getInstallContentDividerWrapperClasses,
  getInstallContentDividerLineContainerClasses,
  getInstallContentDividerLineClasses,
  getInstallContentDividerTextContainerClasses,
  getInstallContentStepsContainerClasses,
  getInstallStepTextGroupClasses,
  getAlreadyInstalledCheckIconClasses,
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

  it("returns standardized CSS classes and supports custom overrides for extracted styling helpers", () => {
    expect(getInstallButtonClasses()).toContain("w-full h-12 rounded-lg font-semibold");
    expect(getInstallButtonClasses("custom-install-btn")).toContain("custom-install-btn");

    expect(getInstallStatusInstalledClasses()).toContain("text-emerald-500");
    expect(getInstallStatusInstalledClasses("custom-status")).toContain("custom-status");

    expect(getInstallStatusCheckIconClasses()).toBe("h-4 w-4");
    expect(getInstallStatusCheckIconClasses("custom-check")).toContain("custom-check");

    expect(getInstallButtonSpinnerClasses()).toBe("h-4 w-4 animate-spin");
    expect(getInstallButtonSpinnerClasses("custom-spinner")).toContain("custom-spinner");

    expect(getInstallButtonDownloadIconClasses()).toBe("h-4 w-4");
    expect(getInstallButtonDownloadIconClasses("custom-download")).toContain("custom-download");

    expect(getInstallElementContainerClasses()).toBe("flex flex-col items-center gap-2 w-full");
    expect(getInstallElementContainerClasses("custom-element-box")).toContain("custom-element-box");

    expect(getInstallElementInstallingNoticeClasses()).toBe("flex items-center gap-2 text-sm text-muted-foreground");
    expect(getInstallElementInstallingNoticeClasses("custom-notice")).toContain("custom-notice");

    expect(getInstallElementTagClasses()).toBe("w-full");
    expect(getInstallElementTagClasses("custom-tag")).toContain("custom-tag");

    expect(getInstallContentContainerClasses()).toBe("space-y-6");
    expect(getInstallContentContainerClasses("custom-content")).toContain("custom-content");

    expect(getInstallContentPlatformWrapperClasses()).toBe("space-y-2");
    expect(getInstallContentPlatformWrapperClasses("custom-wrapper")).toContain("custom-wrapper");

    expect(getInstallContentPlatformGridClasses()).toBe("grid grid-cols-2 gap-2");
    expect(getInstallContentPlatformGridClasses("custom-grid")).toContain("custom-grid");

    expect(getInstallContentDividerWrapperClasses()).toBe("relative");
    expect(getInstallContentDividerWrapperClasses("custom-divider-wrapper")).toContain("custom-divider-wrapper");

    expect(getInstallContentDividerLineContainerClasses()).toBe("absolute inset-0 flex items-center");
    expect(getInstallContentDividerLineContainerClasses("custom-line-container")).toContain("custom-line-container");

    expect(getInstallContentDividerLineClasses()).toBe("w-full border-t border-border");
    expect(getInstallContentDividerLineClasses("custom-line")).toContain("custom-line");

    expect(getInstallContentDividerTextContainerClasses()).toBe("relative flex justify-center text-xs");
    expect(getInstallContentDividerTextContainerClasses("custom-text-container")).toContain("custom-text-container");

    expect(getInstallContentStepsContainerClasses()).toBe("space-y-3");
    expect(getInstallContentStepsContainerClasses("custom-steps")).toContain("custom-steps");

    expect(getInstallStepTextGroupClasses()).toBe("space-y-0.5");
    expect(getInstallStepTextGroupClasses("custom-step-text")).toContain("custom-step-text");

    expect(getAlreadyInstalledIconBadgeClasses()).toContain("rounded-full bg-muted border border-emerald-500/30");
    expect(getAlreadyInstalledIconBadgeClasses("custom-badge")).toContain("custom-badge");

    expect(getAlreadyInstalledCheckIconClasses()).toBe("h-6 w-6 text-emerald-500");
    expect(getAlreadyInstalledCheckIconClasses("custom-check-lg")).toContain("custom-check-lg");
  });
});
