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
