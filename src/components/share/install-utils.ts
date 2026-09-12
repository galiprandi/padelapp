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
