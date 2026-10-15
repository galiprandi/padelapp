/**
 * Pure utility functions for WebAuthn passkey management, accessibility labels,
 * date formatting, nickname sanitization, toast notifications, and error handling.
 */

export function getPasskeyLoginAriaLabel(isAuthenticating: boolean): string {
  return isAuthenticating
    ? "Verificando huella biométrica..."
    : "Entrar con huella o Face ID";
}

export function getPasskeyLoginButtonText(isAuthenticating: boolean): string {
  return isAuthenticating ? "Verificando…" : "Entrar con huella";
}

export function getPasskeyRegisterAriaLabel(
  isRegistering: boolean,
  actionLabel = "Registrar nueva huella biométrica",
): string {
  return isRegistering ? "Registrando huella biométrica..." : actionLabel;
}

export function getPasskeyDeleteAriaLabel(
  nickname?: string | null,
): string {
  const trimmed = nickname?.trim();
  return trimmed
    ? `Eliminar huella "${trimmed}"`
    : "Eliminar huella registrada";
}

export function formatPasskeyDate(date: Date | string | number): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function sanitizePasskeyNickname(nickname: string): string {
  if (!nickname) return "";
  return nickname.slice(0, 30);
}

export function getPasskeyErrorMessage(
  err: unknown,
  defaultMessage = "No pudimos registrar la huella",
): string {
  if (!err) return defaultMessage;

  const errorObj = err as { name?: string; message?: string };
  if (errorObj.name === "NotAllowedError") {
    return "Cancelaste el registro de huella";
  }
  if (errorObj.name === "InvalidStateError") {
    return "No se encontró huella registrada. Entrá con Google y activá la huella desde tu perfil.";
  }

  if (typeof err === "string" && err.trim().length > 0) {
    return err;
  }

  return defaultMessage;
}

export function getPasskeyManagerRegionAriaLabel(): string {
  return "Gestor de acceso biométrico con huella";
}

export function getPasskeyManagerTitle(): string {
  return "Acceso con huella";
}

export function getPasskeyManagerDescription(): string {
  return "Entrá más rápido con huella o Face ID. Sin escribir tu email cada vez.";
}

export function getPasskeyUnsupportedDescription(): string {
  return "Tu dispositivo no soporta autenticación biométrica web.";
}

export function getPasskeyNicknameLabel(): string {
  return "Nombre del dispositivo (opcional)";
}

export function getPasskeyNicknamePlaceholder(): string {
  return "Ej: Mi Celular, Mi Computadora...";
}

export function getPasskeyNicknameAriaLabel(): string {
  return "Nombre del dispositivo para la huella";
}

export function getPasskeyRegisterSuccessToast(): string {
  return "Huella registrada";
}

export function getPasskeyDeleteSuccessToast(): string {
  return "Huella eliminada";
}

export function getPasskeyDefaultNickname(nickname?: string | null): string {
  const trimmed = nickname?.trim();
  return trimmed || "Huella registrada";
}

export function getPasskeyOnboardingTitle(): string {
  return "Entrá más rápido con huella";
}

export function getPasskeyOnboardingDescription(): string {
  return "Activá el acceso biométrico y no vuelvas a escribir tu email. Tocá una vez para registrar tu huella o Face ID.";
}

export function getPasskeyOnboardingRegionAriaLabel(): string {
  return "Sugerencia de acceso biométrico";
}

export function getPasskeyOnboardingDismissAriaLabel(): string {
  return "Cerrar sugerencia de acceso biométrico";
}

export function getPasskeyOnboardingLaterAriaLabel(): string {
  return "Descartar sugerencia por ahora";
}

export function getPasskeyOnboardingLaterLabel(): string {
  return "Ahora no";
}

export function getSecurityPageHeadingTitle(): string {
  return "Seguridad";
}

export function getSecurityPageHeadingDescription(): string {
  return "Iniciá sesión sin contraseña usando tu huella o Face ID.";
}

export function getSecurityPageBackAriaLabel(): string {
  return "Volver a mi perfil";
}

export function getSecuritySkeletonAriaLabel(): string {
  return "Cargando opciones de seguridad y acceso biométrico";
}

export function getPasskeyRegisterButtonText(isRegistering: boolean): string {
  return isRegistering ? "Registrando…" : "Registrar huella";
}

export function getPasskeyOnboardingRegisterButtonText(isRegistering: boolean): string {
  return isRegistering ? "Registrando…" : "Activar huella";
}

export function getPasskeyRegisterActionAriaLabel(): string {
  return "Registrar nueva huella biométrica";
}

export function getPasskeyOnboardingRegisterActionAriaLabel(): string {
  return "Activar acceso con huella";
}

export function getPasskeyRegisterErrorFallbackMessage(): string {
  return "No pudimos registrar la huella";
}

export function getPasskeyItemContainerClasses(): string {
  return "flex items-center gap-3 rounded-lg border border-border bg-muted px-3 py-2";
}

export function getPasskeyDeleteButtonClasses(): string {
  return "rounded-md p-1.5 text-muted-foreground hover:bg-card hover:text-destructive transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

export function getPasskeyRegisterButtonClasses(): string {
  return "w-full h-10 font-medium active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

export function getPasskeyLoginButtonClasses(): string {
  return "h-12 w-full rounded-lg text-base font-semibold active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

export function getPasskeyOnboardingDismissButtonClasses(): string {
  return "absolute right-2 top-2 h-8 w-8 rounded-md p-1 text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

export function getPasskeyOnboardingRegisterButtonClasses(): string {
  return "h-10 flex-1 text-xs font-bold active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

export function getPasskeyOnboardingLaterButtonClasses(): string {
  return "h-10 text-xs font-semibold active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

export function getSecurityPageBackLinkClasses(): string {
  return "flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

export function getSecurityRegionAriaLabel(): string {
  return "Configuración de seguridad y acceso biométrico";
}
