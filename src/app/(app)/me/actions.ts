"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, playerGraphStats } from "@/db/schema";
import { capitalizeName } from "@/lib/utils";
import {
  getUpdateProfileInvalidAliasLengthResponseBody,
  getUpdateProfileInvalidLevelResponseBody,
  getUpdateProfileSuccessResponseBody,
  getUpdateProfileUnauthorizedResponseBody,
  type PreferredSideInput,
  type UpdateProfileResponse,
  validateProfileAliasLength,
  validateProfileLevelInput,
} from "./profile-actions-utils";

export type { UpdateProfileResponse };

export async function updateUserProfileAction(
  aliasInput: string | null,
  imageInput?: string | null,
  levelInput?: number | null,
  preferredSideInput?: PreferredSideInput,
): Promise<UpdateProfileResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return getUpdateProfileUnauthorizedResponseBody();
  }

  const trimmed = capitalizeName(aliasInput ?? "");

  const levelValidation = validateProfileLevelInput(levelInput);
  if (!levelValidation.isValid) {
    return getUpdateProfileInvalidLevelResponseBody();
  }
  const levelToSave = levelValidation.level;

  const sideToReturn = preferredSideInput ?? "BOTH";

  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    const aliasToSave = trimmed.length === 0 ? null : trimmed;
    const imageToSave = imageInput?.trim() || null;
    return getUpdateProfileSuccessResponseBody(
      aliasToSave,
      imageToSave,
      levelToSave,
      sideToReturn,
    );
  }

  const aliasValidation = validateProfileAliasLength(trimmed);
  if (!aliasValidation.isValid) {
    return getUpdateProfileInvalidAliasLengthResponseBody();
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

  if (preferredSideInput !== undefined) {
    const dbSide =
      preferredSideInput === "RIGHT" || preferredSideInput === "LEFT"
        ? preferredSideInput
        : null;

    const [existingStats] = await db
      .select({ userId: playerGraphStats.userId })
      .from(playerGraphStats)
      .where(eq(playerGraphStats.userId, session.user.id))
      .limit(1);

    if (existingStats) {
      await db
        .update(playerGraphStats)
        .set({
          preferredSide: dbSide,
          updatedAt: new Date(),
        })
        .where(eq(playerGraphStats.userId, session.user.id));
    } else {
      await db.insert(playerGraphStats).values({
        userId: session.user.id,
        preferredSide: dbSide,
      });
    }
  }

  revalidatePath("/me");
  revalidatePath("/me/profile");
  revalidatePath(`/p/${session.user.id}`);
  revalidatePath("/ranking");
  revalidateTag("ranking", "default");
  revalidateTag("matches", "default");

  return getUpdateProfileSuccessResponseBody(
    aliasToSave,
    imageToSave,
    levelToSave,
    sideToReturn,
  );
}
