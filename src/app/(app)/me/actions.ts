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
  | { status: "ok"; alias: string | null; image: string | null }
  | { status: "error"; message: string };

export async function updateUserProfileAction(
  aliasInput: string | null,
  imageInput?: string | null,
): Promise<UpdateProfileResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "Tenés que iniciar sesión." };
  }

  const trimmed = capitalizeName(aliasInput ?? "");
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

  await db
    .update(users)
    .set({ alias: aliasToSave, image: imageToSave })
    .where(eq(users.id, session.user.id));

  revalidatePath("/me");
  revalidatePath("/me/profile");
  revalidatePath("/ranking");
  revalidateTag("ranking", "default");

  return { status: "ok", alias: aliasToSave, image: imageToSave };
}
