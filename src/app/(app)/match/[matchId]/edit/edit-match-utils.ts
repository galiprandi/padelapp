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

/**
 * Returns accessible ARIA label for match edit loading skeleton state.
 */
export function getMatchEditSkeletonAriaLabel(): string {
  return "Cargando formulario de edición del partido...";
}

/**
 * Returns container CSS classes for match edit cards.
 */
export function getEditMatchCardContainerClasses(): string {
  return "rounded-xl border border-border bg-card shadow-xs";
}

/**
 * Returns CSS classes for match edit radio button options.
 */
export function getEditMatchRadioOptionClasses(
  isSelected: boolean,
  isClosed: boolean,
): string {
  return [
    "flex items-center justify-center h-10 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]",
    isSelected
      ? "bg-primary border-primary text-primary-foreground font-semibold"
      : "bg-card border-border text-muted-foreground hover:bg-muted",
    isClosed && isSelected ? "opacity-50" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Returns CSS classes for match edit submit button.
 */
export function getEditMatchSubmitButtonClasses(): string {
  return "w-full h-12 text-base font-bold rounded-lg transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Returns display text for match edit submit button based on pending state.
 */
export function getEditMatchSubmitButtonText(isPending: boolean): string {
  return isPending ? "Guardando..." : "Guardar cambios";
}

/**
 * Returns localized Argentine Spanish notice text when format editing is disabled for closed matches.
 */
export function getEditMatchFormatDisabledNoticeText(): string {
  return "El formato no puede editarse en un partido ya confirmado.";
}

/**
 * Returns localized title text for location card.
 */
export function getEditMatchLocationCardTitleText(): string {
  return "Ubicación y Tiempo";
}

/**
 * Returns localized title text for format card.
 */
export function getEditMatchFormatCardTitleText(): string {
  return "Formato";
}

/**
 * Returns localized title text for notes card.
 */
export function getEditMatchNotesCardTitleText(): string {
  return "Notas";
}

/**
 * Returns localized placeholder text for notes textarea.
 */
export function getEditMatchNotesPlaceholderText(): string {
  return "Notas adicionales sobre el partido...";
}

/**
 * Formats notes character count string (e.g. "45/200").
 */
export function formatEditMatchNotesCharacterCount(
  notes?: string | null,
  maxLength = 200,
): string {
  const currentLength = (notes ?? "").length;
  return `${currentLength}/${maxLength}`;
}
