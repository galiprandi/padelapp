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
  | { status: "ok"; alias: string | null; image: string | null; level?: number | null }
  | { status: "error"; message: string };

export async function updateUserProfileAction(
  aliasInput: string | null,
  imageInput?: string | null,
  levelInput?: number | null,
): Promise<UpdateProfileResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in." };
  }

  const trimmed = capitalizeName(aliasInput ?? "");
  if (
    trimmed.length > 0 &&
    (trimmed.length < MIN_ALIAS_LENGTH || trimmed.length > MAX_ALIAS_LENGTH)
  ) {
    return {
      status: "error",
      message: `Alias must be between ${MIN_ALIAS_LENGTH} and ${MAX_ALIAS_LENGTH} characters.`,
    };
  }

  if (levelInput !== undefined && levelInput !== null && (levelInput < 1 || levelInput > 8)) {
    return {
      status: "error",
      message: "Level must be between 1 and 8.",
    };
  }

  const aliasToSave = trimmed.length === 0 ? null : trimmed;
  const imageToSave = imageInput?.trim() || null;
  const levelToSave = levelInput ?? undefined;

  if (process.env.AUTH_BYPASS === "true") {
    return { status: "ok", alias: aliasToSave, image: imageToSave, level: levelToSave };
  }

  const updatePayload: Record<string, any> = { alias: aliasToSave, image: imageToSave };
  if (levelToSave !== undefined) {
    updatePayload.level = levelToSave;
  }

  await db
    .update(users)
    .set(updatePayload)
    .where(eq(users.id, session.user.id));

  revalidatePath("/me");
  revalidatePath("/me/profile");
  revalidatePath("/ranking");
  revalidateTag("ranking", "default");

  return { status: "ok", alias: aliasToSave, image: imageToSave, level: levelToSave };
}
