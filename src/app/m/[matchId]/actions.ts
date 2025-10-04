"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function acceptInvitationAction(matchId: string, token: string) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/m/${matchId}?token=${encodeURIComponent(token)}`);
  }

  if (!token || token.trim().length === 0) {
    throw new Error("Missing invitation token.");
  }

  const invitation = await prisma.matchInvitation.findFirst({
    where: {
      matchId,
      token,
      accepted: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!invitation) {
    throw new Error("Invitation not found or already used.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.matchInvitation.update({
      where: { id: invitation.id },
      data: { accepted: true },
    });

    await tx.matchPlayer.update({
      where: {
        matchId_position: {
          matchId,
          position: invitation.position,
        },
      },
      data: {
        userId: session.user.id,
        confirmed: true,
      },
    });
  });

  redirect(`/match/${matchId}`);
}
