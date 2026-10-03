/**
 * Pure utility functions for PWA installation guides and platform detection.
 */

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
 * Returns localized ARIA label for the return to home button.
 */
export function getInstallPageBackAriaLabel(): string {
  return "Volver a la página principal";
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
export function getInstallButtonClasses(): string {
  return "w-full h-12 rounded-lg font-semibold text-sm active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Returns standardized CSS classes for the installed status badge container.
 */
export function getInstallStatusInstalledClasses(): string {
  return "flex items-center justify-center gap-2 py-2 text-sm font-semibold text-emerald-500";
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
 * Returns localized platform option label string for Android/Chrome or iOS/Safari.
 */
export function getPlatformOptionLabelText(platform: PlatformType): string {
  return platform === "android" ? "Android / Chrome" : "iOS / Safari";
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
