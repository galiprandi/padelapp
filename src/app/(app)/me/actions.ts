"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const MIN_ALIAS_LENGTH = 2;
const MAX_ALIAS_LENGTH = 30;

export type UpdateUserAliasResponse =
  | { status: "ok"; alias: string | null }
  | { status: "error"; message: string };

export async function updateUserAliasAction(aliasInput: string | null): Promise<UpdateUserAliasResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in." };
  }

  const trimmed = aliasInput?.trim() ?? "";
  if (trimmed.length > 0 && (trimmed.length < MIN_ALIAS_LENGTH || trimmed.length > MAX_ALIAS_LENGTH)) {
    return {
      status: "error",
      message: `Alias must be between ${MIN_ALIAS_LENGTH} and ${MAX_ALIAS_LENGTH} characters.`,
    };
  }

  const aliasToSave = trimmed.length === 0 ? null : trimmed;

  await prisma.user.update({
    where: { id: session.user.id },
    // Cast to any to avoid issues if the generated client is stale; schema includes alias.
    data: { alias: aliasToSave } as any,
  });

  revalidatePath("/me");
  revalidatePath("/me/profile");

  return { status: "ok", alias: aliasToSave };
}
