"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const MIN_ALIAS_LENGTH = 2;
const MAX_ALIAS_LENGTH = 30;

export type UpdateProfileResponse =
  | { status: "ok"; alias: string | null; level: number }
  | { status: "error"; message: string };

export async function updateUserProfileAction(
  aliasInput: string | null,
  levelInput: number,
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

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      alias: aliasToSave,
      level: levelInput,
    },
  });

  revalidatePath("/me");
  revalidatePath("/me/profile");
  revalidatePath("/ranking");
  revalidateTag("ranking", "default");

  return { status: "ok", alias: aliasToSave, level: levelInput };
}
