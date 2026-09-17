/**
 * Pure utility functions for WebAuthn passkey management, accessibility labels,
 * date formatting, nickname sanitization, and error handling.
 */

export function getPasskeyLoginAriaLabel(isAuthenticating: boolean): string {
  return isAuthenticating
    ? "Verificando huella biométrica..."
    : "Entrar con huella o Face ID";
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
