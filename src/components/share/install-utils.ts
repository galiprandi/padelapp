/**
 * Pure utility functions for PWA installation guides and platform detection.
 */
import { cn } from "@/lib/utils";

export type PlatformType = "android" | "ios";

export interface InstallStep {
  id: string;
  title: string;
  description: string;
  iconName: "share" | "plus-square" | "smartphone" | "check";
}

/**
 * Calculates the next platform selection based on keyboard navigation keys.
 */
export function getNextPlatformValue(current: PlatformType, key: string): PlatformType {
  if (key === "ArrowRight" || key === "ArrowDown") {
    return "ios";
  }
  if (key === "ArrowLeft" || key === "ArrowUp") {
    return "android";
  }
  return current;
}

/**
 * Returns accessible ARIA label for platform radio buttons.
 */
export function getPlatformRadioAriaLabel(platform: PlatformType): string {
  return platform === "android"
    ? "Ver instrucciones de instalación para Android o Chrome"
    : "Ver instrucciones de instalación para iOS o Safari";
}

/**
 * Returns localized ARIA status description for PWA installation state.
 */
export function getInstallStatusAriaLabel(isInstalled: boolean): string {
  return isInstalled
    ? "Padel Red ya está instalada en tu dispositivo"
    : "Instrucciones de instalación de Padel Red";
}

/**
 * Returns localized ARIA accessibility label for the main install page landmark region.
 */
export function getInstallPageAriaLabel(): string {
  return "Página de instalación de la aplicación Padel Red";
}

/**
 * Returns localized ARIA accessibility label for the install guide skeleton loading state.
 */
export function getInstallSkeletonAriaLabel(): string {
  return "Cargando guía de instalación de Padel Red";
}

/**
 * Returns localized title text for the install page header.
 */
export function getInstallPageTitle(): string {
  return "Instalar Padel Red";
}

/**
 * Returns localized subtitle description for the install page.
 */
export function getInstallPageDescription(): string {
  return "Agregá la app a tu pantalla de inicio para acceder más rápido.";
}

/**
 * Returns accessible alt text description for the Padel Red application logo image on the install page.
 */
export function getInstallPageLogoAltText(): string {
  return "Padel Red";
}

/**
 * Returns localized ARIA label for the return to home button.
 */
export function getInstallPageBackAriaLabel(): string {
  return "Volver a la página principal";
}

/**
 * Returns standardized CSS class string for the return to home button on the install page.
 */
export function getInstallPageBackLinkClasses(): string {
  return "h-10 w-full rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Returns accessible ARIA label for the install application action button.
 */
export function getInstallActionAriaLabel(): string {
  return "Instalar app de Padel Red";
}

/**
 * Returns localized text for the install button depending on pending installation state.
 */
export function getInstallButtonLabel(isInstalling: boolean): string {
  return isInstalling ? "Instalando..." : "Instalar app";
}

/**
 * Returns standardized CSS classes for the primary PWA install button.
 */
export function getInstallButtonClasses(customClassName?: string): string {
  return cn(
    "w-full h-12 rounded-lg font-semibold text-sm active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    customClassName,
  );
}

/**
 * Returns standardized CSS classes for the installed status badge container.
 */
export function getInstallStatusInstalledClasses(customClassName?: string): string {
  return cn("flex items-center justify-center gap-2 py-2 text-sm font-semibold text-emerald-500", customClassName);
}

/**
 * Returns standardized CSS classes for the check icon inside the installed status badge.
 */
export function getInstallStatusCheckIconClasses(customClassName?: string): string {
  return cn("h-4 w-4", customClassName);
}

/**
 * Returns standardized CSS classes for the loading spinner inside the install button.
 */
export function getInstallButtonSpinnerClasses(customClassName?: string): string {
  return cn("h-4 w-4 animate-spin", customClassName);
}

/**
 * Returns standardized CSS classes for the download icon inside the install button.
 */
export function getInstallButtonDownloadIconClasses(customClassName?: string): string {
  return cn("h-4 w-4", customClassName);
}

/**
 * Returns standardized CSS classes for the experimental <install> element wrapper container.
 */
export function getInstallElementContainerClasses(customClassName?: string): string {
  return cn("flex flex-col items-center gap-2 w-full", customClassName);
}

/**
 * Returns standardized CSS classes for the installing status notice inside the experimental <install> wrapper.
 */
export function getInstallElementInstallingNoticeClasses(customClassName?: string): string {
  return cn("flex items-center gap-2 text-sm text-muted-foreground", customClassName);
}

/**
 * Returns standardized CSS classes for the native <install> element tag.
 */
export function getInstallElementTagClasses(customClassName?: string): string {
  return cn("w-full", customClassName);
}

/**
 * Returns standardized CSS classes for the main InstallContent container.
 */
export function getInstallContentContainerClasses(customClassName?: string): string {
  return cn("space-y-6", customClassName);
}

/**
 * Returns standardized CSS classes for the platform selector section wrapper.
 */
export function getInstallContentPlatformWrapperClasses(customClassName?: string): string {
  return cn("space-y-2", customClassName);
}

/**
 * Returns standardized CSS classes for the platform selector radio button grid.
 */
export function getInstallContentPlatformGridClasses(customClassName?: string): string {
  return cn("grid grid-cols-2 gap-2", customClassName);
}

/**
 * Returns standardized CSS classes for the manual installation divider outer wrapper.
 */
export function getInstallContentDividerWrapperClasses(customClassName?: string): string {
  return cn("relative", customClassName);
}

/**
 * Returns standardized CSS classes for the manual installation divider line container.
 */
export function getInstallContentDividerLineContainerClasses(customClassName?: string): string {
  return cn("absolute inset-0 flex items-center", customClassName);
}

/**
 * Returns standardized CSS classes for the manual installation divider horizontal rule line.
 */
export function getInstallContentDividerLineClasses(customClassName?: string): string {
  return cn("w-full border-t border-border", customClassName);
}

/**
 * Returns standardized CSS classes for the manual installation divider centered text container.
 */
export function getInstallContentDividerTextContainerClasses(customClassName?: string): string {
  return cn("relative flex justify-center text-xs", customClassName);
}

/**
 * Returns standardized CSS classes for the platform steps list container.
 */
export function getInstallContentStepsContainerClasses(customClassName?: string): string {
  return cn("space-y-3", customClassName);
}

/**
 * Returns standardized CSS classes for individual installation step title and description text group.
 */
export function getInstallStepTextGroupClasses(customClassName?: string): string {
  return cn("space-y-0.5", customClassName);
}

/**
 * Returns localized text label when PWA application is already installed.
 */
export function getInstallInstalledLabel(): string {
  return "Instalada";
}

/**
 * Returns localized toast notification message when app installation succeeds.
 */
export function getInstallSuccessToast(): string {
  return "App instalada";
}

/**
 * Returns localized toast notification message when native install prompt fails to launch.
 */
export function getInstallInitErrorToast(): string {
  return "No se pudo iniciar la instalación";
}

/**
 * Returns localized toast notification message when installation data validation fails.
 */
export function getInstallValidationErrorToast(): string {
  return "No se pudo validar la instalación";
}

/**
 * Returns localized divider text for manual installation instructions option.
 */
export function getManualInstallDividerText(): string {
  return "O instalá manualmente";
}

/**
 * Returns localized header label for selecting platform operating system.
 */
export function getPlatformSelectorHeaderText(): string {
  return "Elegí tu sistema operativo:";
}

/**
 * Returns standardized CSS classes for the platform selector header label.
 */
export function getPlatformSelectorHeaderClasses(): string {
  return "text-xs font-bold text-muted-foreground";
}

/**
 * Returns localized platform option label string for Android/Chrome or iOS/Safari.
 */
export function getPlatformOptionLabelText(platform: PlatformType): string {
  return platform === "android" ? "Android / Chrome" : "iOS / Safari";
}

/**
 * Returns standardized CSS class string for platform radio selector buttons based on selection state.
 */
export function getPlatformRadioClasses(isSelected: boolean): string {
  return isSelected
    ? "h-12 rounded-lg border text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background bg-primary border-primary text-primary-foreground font-bold"
    : "h-12 rounded-lg border text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background bg-card border-border text-muted-foreground hover:bg-muted";
}

/**
 * Returns standardized CSS class string for the manual install divider label.
 */
export function getManualInstallDividerClasses(): string {
  return "bg-card px-2 text-muted-foreground font-bold";
}

/**
 * Returns standardized CSS class string for individual platform installation step item container.
 */
export function getInstallStepContainerClasses(): string {
  return "flex items-center gap-4 rounded-xl bg-card p-4 border border-border shadow-xs";
}

/**
 * Returns standardized CSS class string for individual platform installation step icon badge container.
 */
export function getInstallStepIconBadgeClasses(): string {
  return "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted border border-border";
}

/**
 * Returns standardized CSS class string for platform installation step icon element.
 */
export function getInstallStepIconClasses(): string {
  return "h-5 w-5 text-primary";
}

/**
 * Returns standardized CSS class string for platform installation step title.
 */
export function getInstallStepTitleClasses(): string {
  return "text-xs font-bold text-muted-foreground";
}

/**
 * Returns standardized CSS class string for platform installation step description text.
 */
export function getInstallStepDescriptionClasses(): string {
  return "text-sm font-semibold leading-snug text-foreground";
}

/**
 * Returns localized title text when app is already installed in user device.
 */
export function getAlreadyInstalledTitleText(): string {
  return "Padel Red ya está instalada";
}

/**
 * Returns localized description text when app is already installed in user device.
 */
export function getAlreadyInstalledDescriptionText(): string {
  return "Buscala en tu pantalla de inicio para jugar con un solo toque.";
}

/**
 * Returns standardized CSS class string for already installed status container.
 */
export function getAlreadyInstalledContainerClasses(): string {
  return "flex flex-col items-center gap-3 py-6";
}

/**
 * Returns standardized CSS class string for already installed status check icon badge.
 */
export function getAlreadyInstalledIconBadgeClasses(customClassName?: string): string {
  return cn("flex h-12 w-12 items-center justify-center rounded-full bg-muted border border-emerald-500/30", customClassName);
}

/**
 * Returns standardized CSS classes for the checkmark icon inside the already installed status badge.
 */
export function getAlreadyInstalledCheckIconClasses(customClassName?: string): string {
  return cn("h-6 w-6 text-emerald-500", customClassName);
}

/**
 * Returns standardized CSS class string for already installed status title.
 */
export function getAlreadyInstalledTitleClasses(): string {
  return "text-sm font-semibold text-foreground";
}

/**
 * Returns standardized CSS class string for already installed status description.
 */
export function getAlreadyInstalledDescriptionClasses(): string {
  return "text-xs text-muted-foreground text-center max-w-[240px]";
}

/**
 * Returns standardized CSS class string for the main InstallPage landmark container.
 */
export function getInstallPageMainClasses(): string {
  return "flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10";
}

/**
 * Returns standardized CSS class string for the inner InstallPage content container.
 */
export function getInstallPageContainerClasses(): string {
  return "flex w-full max-w-sm flex-col items-center gap-8";
}

/**
 * Returns standardized CSS class string for the application logo image on the install page.
 */
export function getInstallPageLogoClasses(): string {
  return "h-20 w-20";
}

/**
 * Returns standardized CSS class string for the install page header container.
 */
export function getInstallPageHeaderClasses(): string {
  return "space-y-2 text-center";
}

/**
 * Returns standardized CSS class string for the install page main heading.
 */
export function getInstallPageTitleClasses(): string {
  return "text-2xl font-bold text-foreground";
}

/**
 * Returns standardized CSS class string for the install page description text.
 */
export function getInstallPageDescriptionClasses(): string {
  return "text-sm text-muted-foreground max-w-[260px]";
}

/**
 * Returns standardized CSS class string for the install content wrapper container.
 */
export function getInstallPageContentWrapperClasses(): string {
  return "w-full";
}

/**
 * Returns localized text for the back link button on the install page.
 */
export function getInstallPageBackLinkText(): string {
  return "Volver al inicio";
}

/**
 * Returns standardized CSS class string for the logo skeleton in InstallLoading.
 */
export function getInstallLoadingLogoSkeletonClasses(): string {
  return "h-20 w-20 rounded-2xl";
}

/**
 * Returns standardized CSS class string for the header container in InstallLoading.
 */
export function getInstallLoadingHeaderClasses(): string {
  return "flex flex-col items-center space-y-2 text-center";
}

/**
 * Returns standardized CSS class string for the title skeleton in InstallLoading.
 */
export function getInstallLoadingTitleSkeletonClasses(): string {
  return "h-7 w-48 rounded-md";
}

/**
 * Returns standardized CSS class string for the subtitle skeleton in InstallLoading.
 */
export function getInstallLoadingSubtitleSkeletonClasses(): string {
  return "h-8 w-64 rounded-md";
}

/**
 * Returns standardized CSS class string for the content card skeleton in InstallLoading.
 */
export function getInstallLoadingCardSkeletonClasses(): string {
  return "h-56 w-full rounded-xl";
}

/**
 * Returns standardized CSS class string for the back button skeleton in InstallLoading.
 */
export function getInstallLoadingButtonSkeletonClasses(): string {
  return "h-10 w-full rounded-lg";
}

export function isIOSDeviceUserAgent(userAgent: string, hasTouchPoints: boolean = false): boolean {
  if (!userAgent) return false;
  const isIOSUA = /iPad|iPhone|iPod/.test(userAgent);
  const isMacTouch = userAgent.includes("Mac") && hasTouchPoints;
  return isIOSUA || isMacTouch;
}

/**
 * Returns localized installation step definitions for Android or iOS platforms.
 */
export function getPlatformSteps(platform: PlatformType): InstallStep[] {
  if (platform === "ios") {
    return [
      {
        id: "ios-step-share",
        title: "Menú de compartir",
        description: "Abrí el menú de compartir abajo en Safari.",
        iconName: "share",
      },
      {
        id: "ios-step-add",
        title: "Agregar a inicio",
        description: 'Seleccioná la opción "Agregar a inicio" o "Add to Home Screen".',
        iconName: "plus-square",
      },
      {
        id: "ios-step-confirm",
        title: "Finalizar instalación",
        description: 'Pulsá "Agregar" en la esquina superior derecha.',
        iconName: "smartphone",
      },
    ];
  }

  return [
    {
      id: "android-step-button",
      title: "Instalar con un tap",
      description: 'Pulsá el botón superior de "Instalar app" si te aparece disponible.',
      iconName: "smartphone",
    },
    {
      id: "android-step-menu",
      title: "Menú del navegador",
      description: 'O abrí el menú (tres puntos ⋮) y elegí "Instalar aplicación" o "Agregar a pantalla principal".',
      iconName: "plus-square",
    },
    {
      id: "android-step-ready",
      title: "Aplicación lista",
      description: "Y listo. Ya podés disfrutar de Padel Red como una aplicación nativa.",
      iconName: "check",
    },
  ];
}
