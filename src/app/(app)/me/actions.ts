"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, playerGraphStats } from "@/db/schema";
import { capitalizeName } from "@/lib/utils";

const MIN_ALIAS_LENGTH = 2;
const MAX_ALIAS_LENGTH = 30;

export type UpdateProfileResponse =
  | {
      status: "ok";
      alias: string | null;
      image: string | null;
      level: number;
      preferredSide: "RIGHT" | "LEFT" | "BOTH" | null;
    }
  | { status: "error"; message: string };

export async function updateUserProfileAction(
  aliasInput: string | null,
  imageInput?: string | null,
  levelInput?: number | null,
  preferredSideInput?: "RIGHT" | "LEFT" | "BOTH" | null,
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

  const sideToReturn = preferredSideInput ?? "BOTH";

  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    const aliasToSave = trimmed.length === 0 ? null : trimmed;
    const imageToSave = imageInput?.trim() || null;
    return {
      status: "ok",
      alias: aliasToSave,
      image: imageToSave,
      level: levelToSave,
      preferredSide: sideToReturn,
    };
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

  return {
    status: "ok",
    alias: aliasToSave,
    image: imageToSave,
    level: levelToSave,
    preferredSide: sideToReturn,
  };
}
