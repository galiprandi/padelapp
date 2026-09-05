export const MIN_ALIAS_LENGTH = 2;
export const MAX_ALIAS_LENGTH = 30;

export type PreferredSideOption = "RIGHT" | "LEFT" | "BOTH";

export const COURT_SIDE_OPTIONS: Array<{
  id: PreferredSideOption;
  label: string;
  desc: string;
}> = [
  { id: "RIGHT", label: "Derecha", desc: "Juego en el drive o lado derecho" },
  { id: "LEFT", label: "Revés", desc: "Juego en el lado izquierdo de revés" },
  { id: "BOTH", label: "Ambos", desc: "Me adapto indistintamente a ambos lados" },
];

/**
 * Validates alias input string. Returns error message in Argentine Spanish or null if valid.
 */
export function validateAlias(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < MIN_ALIAS_LENGTH || trimmed.length > MAX_ALIAS_LENGTH) {
    return `Usá entre ${MIN_ALIAS_LENGTH} y ${MAX_ALIAS_LENGTH} caracteres.`;
  }

  // Permitir letras (con acentos, diéresis y eñes), números, espacios y guiones comunes
  const aliasRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]+$/;
  if (!aliasRegex.test(trimmed)) {
    return "El alias solo puede tener letras, números, espacios y guiones.";
  }
  return null;
}

/**
 * Calculates the next preferred court side selection for keyboard arrow key navigation.
 */
export function getNextSideOption(
  currentSide: PreferredSideOption | null,
  key: string
): PreferredSideOption | null {
  if (key !== "ArrowRight" && key !== "ArrowDown" && key !== "ArrowLeft" && key !== "ArrowUp") {
    return null;
  }

  const ids: PreferredSideOption[] = COURT_SIDE_OPTIONS.map((opt) => opt.id);
  const currentIndex = ids.indexOf((currentSide ?? "BOTH") as PreferredSideOption);
  const activeIndex = currentIndex >= 0 ? currentIndex : 2;

  let nextIndex = activeIndex;
  if (key === "ArrowRight" || key === "ArrowDown") {
    nextIndex = (activeIndex + 1) % ids.length;
  } else if (key === "ArrowLeft" || key === "ArrowUp") {
    nextIndex = (activeIndex - 1 + ids.length) % ids.length;
  }

  return ids[nextIndex];
}

/**
 * Calculates the next category level (1-8) for keyboard arrow key navigation.
 */
export function getNextCategoryLevel(currentLevel: number, key: string): number | null {
  if (key !== "ArrowRight" && key !== "ArrowDown" && key !== "ArrowLeft" && key !== "ArrowUp") {
    return null;
  }

  const levels = [1, 2, 3, 4, 5, 6, 7, 8];
  const currentIndex = levels.indexOf(currentLevel);
  const activeIndex = currentIndex >= 0 ? currentIndex : 5; // Default to 6th Cat (index 5)

  let nextIndex = activeIndex;
  if (key === "ArrowRight" || key === "ArrowDown") {
    nextIndex = (activeIndex + 1) % levels.length;
  } else if (key === "ArrowLeft" || key === "ArrowUp") {
    nextIndex = (activeIndex - 1 + levels.length) % levels.length;
  }

  return levels[nextIndex];
}

/**
 * Returns localized Argentine Spanish label for preferred side selection.
 */
export function getSideOptionLabel(side: PreferredSideOption | null): string {
  switch (side) {
    case "RIGHT":
      return "Derecha";
    case "LEFT":
      return "Revés";
    case "BOTH":
      return "Ambos lados";
    default:
      return "Sin preferencia";
  }
}

/**
 * Computes uppercase 1-2 character player initials from display name.
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
