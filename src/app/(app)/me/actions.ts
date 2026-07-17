"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

const MIN_ALIAS_LENGTH = 2;
const MAX_ALIAS_LENGTH = 30;

export type UpdateProfileResponse =
  | { status: "ok"; alias: string | null; level: number; image: string | null }
  | { status: "error"; message: string };

export async function updateUserProfileAction(
  aliasInput: string | null,
  levelInput: number,
  imageInput?: string | null,
): Promise<UpdateProfileResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in." };
  }

  const trimmed = aliasInput?.trim() ?? "";
  if (
    trimmed.length > 0 &&
    (trimmed.length < MIN_ALIAS_LENGTH || trimmed.length > MAX_ALIAS_LENGTH)
  ) {
    return {
      status: "error",
      message: `Alias must be between ${MIN_ALIAS_LENGTH} and ${MAX_ALIAS_LENGTH} characters.`,
    };
  }

  const aliasToSave = trimmed.length === 0 ? null : trimmed;
  const imageToSave = imageInput?.trim() || null;

  await db
    .update(users)
    .set({ alias: aliasToSave, level: levelInput, image: imageToSave })
    .where(eq(users.id, session.user.id));

  revalidatePath("/me");
  revalidatePath("/me/profile");
  revalidatePath("/ranking");
  revalidateTag("ranking", "default");

  return { status: "ok", alias: aliasToSave, level: levelInput, image: imageToSave };
}
