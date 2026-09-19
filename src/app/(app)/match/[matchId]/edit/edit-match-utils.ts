/**
 * Helper functions for match editing and detail views.
 */

export interface EditMatchFormData {
  club?: string;
  courtNumber?: string;
  date?: string;
  time?: string;
  sets?: string;
  matchType?: string;
  notes?: string;
}

export interface EditMatchValidationResult {
  isValid: boolean;
  errors: Array<{ field: keyof EditMatchFormData; message: string }>;
}

/**
 * Returns a human-readable lowercase label for match types.
 */
export function getMatchTypeLabel(matchType?: string | null): string {
  if (!matchType) return "amistoso";
  switch (matchType) {
    case "FRIENDLY":
      return "amistoso";
    case "LOCAL_TOURNAMENT":
      return "torneo";
    default:
      return matchType.toLowerCase();
  }
}

/**
 * Validates form data for match editing.
 */
export function validateEditMatchFormData(data: EditMatchFormData): EditMatchValidationResult {
  const errors: Array<{ field: keyof EditMatchFormData; message: string }> = [];

  if (data.notes && data.notes.length > 200) {
    errors.push({
      field: "notes",
      message: "Las notas no pueden superar los 200 caracteres.",
    });
  }

  if (data.sets) {
    const setsNum = parseInt(data.sets, 10);
    if (isNaN(setsNum) || setsNum <= 0) {
      errors.push({
        field: "sets",
        message: "La cantidad de sets debe ser un número válido.",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generates Argentine Spanish ARIA region labels for match edit and detail pages.
 */
export function getEditMatchRegionAriaLabel(
  section:
    | "form"
    | "location"
    | "format"
    | "notes"
    | "header"
    | "details"
    | "actions"
    | "summary"
    | "confirmations"
    | "attendance"
    | "teams",
): string {
  switch (section) {
    case "form":
      return "Formulario para editar detalles del partido";
    case "location":
      return "Ubicación y horario del partido";
    case "format":
      return "Formato y tipo de partido";
    case "notes":
      return "Notas adicionales del partido";
    case "header":
      return "Encabezado y estado del partido";
    case "details":
      return "Ubicación y organizador del partido";
    case "actions":
      return "Acciones disponibles del partido";
    case "summary":
      return "Resumen del resultado final";
    case "confirmations":
      return "Estado de confirmaciones de resultado";
    case "attendance":
      return "Registro de asistencia de jugadores";
    case "teams":
      return "Formación de equipos del partido";
  }
}

/**
 * Returns localized Argentine Spanish toast message on successful match update.
 */
export function getEditMatchSuccessToast(): string {
  return "Actualizaste el partido con éxito.";
}

/**
 * Returns localized Argentine Spanish toast message on failed match update.
 */
export function getEditMatchErrorToast(message?: string | null): string {
  return message && message.trim().length > 0
    ? message
    : "No pudimos actualizar el partido.";
}

/**
 * Returns accessible ARIA label for match edit submit trigger button.
 */
export function getEditMatchSubmitAriaLabel(isPending: boolean): string {
  return isPending
    ? "Guardando cambios del partido..."
    : "Guardar cambios del partido";
}
