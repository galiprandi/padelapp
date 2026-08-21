"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { capitalizeName } from "@/lib/utils";

const MIN_ALIAS_LENGTH = 2;
const MAX_ALIAS_LENGTH = 30;

export type UpdateProfileResponse =
  | { status: "ok"; alias: string | null; image: string | null; level: number }
  | { status: "error"; message: string };

export async function updateUserProfileAction(
  aliasInput: string | null,
  imageInput?: string | null,
  levelInput?: number | null,
): Promise<UpdateProfileResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "Tenés que iniciar sesión." };
  }

  const trimmed = capitalizeName(aliasInput ?? "");

  let levelToSave = 6;
  if (levelInput !== undefined && levelInput !== null) {
    if (levelInput < 1 || levelInput > 8) {
      return {
        status: "error",
        message: "La categoría debe estar entre 1ª Cat. y 8ª Cat.",
      };
    }
    levelToSave = levelInput;
  }

  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    const aliasToSave = trimmed.length === 0 ? null : trimmed;
    const imageToSave = imageInput?.trim() || null;
    return { status: "ok", alias: aliasToSave, image: imageToSave, level: levelToSave };
  }

  if (
    trimmed.length > 0 &&
    (trimmed.length < MIN_ALIAS_LENGTH || trimmed.length > MAX_ALIAS_LENGTH)
  ) {
    return {
      status: "error",
      message: `El alias debe tener entre ${MIN_ALIAS_LENGTH} y ${MAX_ALIAS_LENGTH} caracteres.`,
    };
  }

  const aliasToSave = trimmed.length === 0 ? null : trimmed;
  const imageToSave = imageInput?.trim() || null;

  const updateFields: Record<string, unknown> = {
    alias: aliasToSave,
    image: imageToSave,
  };
  if (levelInput !== undefined && levelInput !== null) {
    updateFields.level = levelToSave;
  }

  await db
    .update(users)
    .set(updateFields)
    .where(eq(users.id, session.user.id));

  revalidatePath("/me");
  revalidatePath("/me/profile");
  revalidatePath("/ranking");
  revalidateTag("ranking", "default");

  return { status: "ok", alias: aliasToSave, image: imageToSave, level: levelToSave };
}
