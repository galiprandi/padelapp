export const MIN_ALIAS_LENGTH = 2;
export const MAX_ALIAS_LENGTH = 30;

export type PreferredSideInput = "RIGHT" | "LEFT" | "BOTH" | null;

export type UpdateProfileResponse =
  | {
      status: "ok";
      alias: string | null;
      image: string | null;
      level: number;
      preferredSide: PreferredSideInput;
    }
  | { status: "error"; message: string };

/**
 * Validates category level input (1-8). Returns valid status and level or error response payload.
 */
export function validateProfileLevelInput(levelInput?: number | null): {
  isValid: boolean;
  level: number;
  errorMessage?: string;
} {
  let levelToSave = 6;
  if (levelInput !== undefined && levelInput !== null) {
    if (levelInput < 1 || levelInput > 8) {
      return {
        isValid: false,
        level: levelToSave,
        errorMessage: "La categoría debe estar entre 1ª Cat. y 8ª Cat.",
      };
    }
    levelToSave = levelInput;
  }
  return { isValid: true, level: levelToSave };
}

/**
 * Validates alias input string length bounds.
 */
export function validateProfileAliasLength(
  trimmedAlias: string,
  minLen: number = MIN_ALIAS_LENGTH,
  maxLen: number = MAX_ALIAS_LENGTH,
): { isValid: boolean; errorMessage?: string } {
  if (
    trimmedAlias.length > 0 &&
    (trimmedAlias.length < minLen || trimmedAlias.length > maxLen)
  ) {
    return {
      isValid: false,
      errorMessage: `El alias debe tener entre ${minLen} y ${maxLen} caracteres.`,
    };
  }
  return { isValid: true };
}

/**
 * Returns error response payload when user is unauthorized.
 */
export function getUpdateProfileUnauthorizedResponseBody(): UpdateProfileResponse {
  return { status: "error", message: "Tenés que iniciar sesión." };
}

/**
 * Returns error response payload when category level input is invalid.
 */
export function getUpdateProfileInvalidLevelResponseBody(): UpdateProfileResponse {
  return {
    status: "error",
    message: "La categoría debe estar entre 1ª Cat. y 8ª Cat.",
  };
}

/**
 * Returns error response payload when alias length is out of bounds.
 */
export function getUpdateProfileInvalidAliasLengthResponseBody(
  minLen: number = MIN_ALIAS_LENGTH,
  maxLen: number = MAX_ALIAS_LENGTH,
): UpdateProfileResponse {
  return {
    status: "error",
    message: `El alias debe tener entre ${minLen} y ${maxLen} caracteres.`,
  };
}

/**
 * Returns success response payload for updated profile state.
 */
export function getUpdateProfileSuccessResponseBody(
  alias: string | null,
  image: string | null,
  level: number,
  preferredSide: PreferredSideInput,
): UpdateProfileResponse {
  return {
    status: "ok",
    alias,
    image,
    level,
    preferredSide,
  };
}
