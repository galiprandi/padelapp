"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createMagicLink, generateMagicToken } from "@/lib/magic-link";

const MIN_SETS = 1;
const MAX_SETS = 5;

export type SlotPayload =
  | {
      kind: "user";
      position: number;
      userId: string;
    }
  | {
      kind: "invite";
      position: number;
      email: string;
      displayName: string;
      token?: string;
    };

const MATCH_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DISPUTED: "DISPUTED",
} as const;

const MATCH_TYPE = {
  FRIENDLY: "FRIENDLY",
  LOCAL_TOURNAMENT: "LOCAL_TOURNAMENT",
} as const;

type MatchType = (typeof MATCH_TYPE)[keyof typeof MATCH_TYPE];

export interface CreateMatchInput {
  matchId?: string;
  sets: number;
  matchType: MatchType;
  countsForRanking: boolean;
  club?: string | null;
  courtNumber?: string | null;
  notes?: string | null;
  score?: string | null;
  slots: SlotPayload[];
}

export interface CreateMatchResponse {
  status: "ok" | "error";
  matchId?: string;
  shareUrl?: string;
  invitations?: Array<{
    email: string;
    displayName: string;
    link: string;
    position: number;
  }>;
  message?: string;
}

function isValidMatchType(value: string): value is MatchType {
  return Object.values(MATCH_TYPE).includes(value as MatchType);
}

export async function createMatchAction(input: CreateMatchInput): Promise<CreateMatchResponse> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "You must be signed in to create a match." };
  }

  if (!isValidMatchType(input.matchType)) {
    return { status: "error", message: "Invalid match type." };
  }

  if (Number.isNaN(input.sets) || input.sets < MIN_SETS || input.sets > MAX_SETS) {
    return {
      status: "error",
      message: `Sets must be between ${MIN_SETS} and ${MAX_SETS}.`,
    };
  }

  if (typeof input.countsForRanking !== "boolean") {
    return { status: "error", message: "Ranking flag must be provided." };
  }

  if (!Array.isArray(input.slots) || input.slots.length !== 4) {
    return { status: "error", message: "All four slots must be provided." };
  }

  const positions = new Set<number>();
  const playersToCreate: Array<{ position: number; userId: string | null; confirmed: boolean }> = [];
  const invitationsToCreate: Array<{ position: number; email: string; displayName: string; token: string }> = [];

  for (const slot of input.slots) {
    if (typeof slot.position !== "number" || slot.position < 0 || slot.position > 3) {
      return { status: "error", message: "Slot positions must be between 0 and 3." };
    }

    if (positions.has(slot.position)) {
      return { status: "error", message: "Duplicate slot positions detected." };
    }

    positions.add(slot.position);

    if (slot.kind === "user") {
      const confirmed = slot.userId === session.user.id;
      playersToCreate.push({ position: slot.position, userId: slot.userId, confirmed });
    } else if (slot.kind === "invite") {
      const normalizedEmail = slot.email.trim().toLowerCase();
      const trimmedDisplayName = slot.displayName.trim();
      if (normalizedEmail.length === 0) {
        return { status: "error", message: "Invitation email cannot be empty." };
      }
      if (trimmedDisplayName.length === 0) {
        return { status: "error", message: "Invitation name cannot be empty." };
      }

      let invitedUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

      if (!invitedUser) {
        invitedUser = await prisma.user.create({
          data: {
            email: normalizedEmail,
            displayName: trimmedDisplayName,
          },
        });
      }

      const token = slot.token && slot.token.length > 0 ? slot.token : generateMagicToken();
      playersToCreate.push({ position: slot.position, userId: invitedUser.id, confirmed: false });
      invitationsToCreate.push({
        position: slot.position,
        email: normalizedEmail,
        displayName: trimmedDisplayName,
        token,
      });
    } else {
      return { status: "error", message: "Unknown slot type." };
    }
  }

  if (!playersToCreate.some((player) => player.userId === session.user.id && player.position === 0)) {
    return { status: "error", message: "You must occupy position 0 of Team A." };
  }

  try {
    const match = await prisma.match.create({
      data: {
        creatorId: session.user.id,
        status: MATCH_STATUS.PENDING,
        sets: input.sets,
        matchType: input.matchType,
        club: input.club?.trim() || null,
        courtNumber: input.courtNumber?.trim() || null,
        notes: input.notes?.trim() || null,
        score: input.score?.trim() || null,
        players: {
          create: playersToCreate.map((player) => ({
            position: player.position,
            userId: player.userId,
            confirmed: player.confirmed,
          })),
        },
        invitations:
          invitationsToCreate.length > 0
            ? {
                create: invitationsToCreate.map((invite) => ({
                  email: invite.email,
                  token: invite.token,
                  position: invite.position,
                })),
              }
            : undefined,
      },
      include: {
        invitations: true,
      },
    });

    revalidatePath("/match");

    const shareUrl = createMagicLink({ resource: "match", identifier: match.id }).url;
    const invitations = match.invitations.map((invitation) => ({
      email: invitation.email,
      displayName:
        invitationsToCreate.find((candidate) => candidate.position === invitation.position)?.displayName ??
        invitation.email,
      position: invitation.position,
      link: createMagicLink({
        resource: "match",
        identifier: match.id,
        query: { token: invitation.token },
      }).url,
    }));

    return {
      status: "ok",
      matchId: match.id,
      shareUrl,
      invitations,
    };
  } catch (error) {
    console.error("createMatchAction failed", error);
    return {
      status: "error",
      message: "We could not create the match. Please try again.",
    };
  }
}

export interface SubmitResultInput {
  matchId: string;
  score: string;
  notes?: string | null;
}

export interface SubmitResultResponse {
  status: "ok" | "error";
  message?: string;
}

export interface MatchActionResponse {
  status: "ok" | "error";
  message?: string;
}

export async function submitMatchResultAction(
  input: SubmitResultInput,
): Promise<SubmitResultResponse> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "You must be signed in to submit results." };
  }

  if (!input.matchId || input.matchId.trim().length === 0) {
    return { status: "error", message: "Invalid match identifier." };
  }

  const score = input.score.trim();
  if (score.length === 0) {
    return { status: "error", message: "Please provide the match score." };
  }

  try {
    const updatedMatch = await prisma.$transaction(async (tx) => {
      const player = await tx.matchPlayer.findFirst({
        where: {
          matchId: input.matchId,
          userId: session.user.id,
        },
      });

      if (!player) {
        throw new Error("not-authorized");
      }

      const baseMatch = await tx.match.update({
        where: { id: input.matchId },
        data: {
          score,
          notes: input.notes?.trim() || null,
          players: {
            update: {
              where: { id: player.id },
              data: { confirmed: true },
            },
          },
        },
        include: {
          players: true,
        },
      });

      const teamAConfirmed = baseMatch.players.some((matchPlayer) => matchPlayer.position < 2 && matchPlayer.confirmed);
      const teamBConfirmed = baseMatch.players.some((matchPlayer) => matchPlayer.position >= 2 && matchPlayer.confirmed);

      if (teamAConfirmed && teamBConfirmed && baseMatch.status !== MATCH_STATUS.CONFIRMED) {
        return tx.match.update({
          where: { id: input.matchId },
          data: { status: MATCH_STATUS.CONFIRMED },
          include: { players: true },
        });
      }

      if ((!teamAConfirmed || !teamBConfirmed) && baseMatch.status !== MATCH_STATUS.PENDING) {
        return tx.match.update({
          where: { id: input.matchId },
          data: { status: MATCH_STATUS.PENDING },
          include: { players: true },
        });
      }

      return baseMatch;
    });

    if (!updatedMatch) {
      throw new Error("match-update-failed");
    }

    revalidatePath(`/match/${input.matchId}`);

    return { status: "ok" };
  } catch (error) {
    if (error instanceof Error && error.message === "not-authorized") {
      return { status: "error", message: "You cannot update a match you are not part of." };
    }
    console.error("submitMatchResultAction failed", error);
    return {
      status: "error",
      message: "We could not save the result. Please try again.",
    };
  }
}

interface UpdateMatchDetailsInput {
  matchId: string;
  club?: string | null;
  courtNumber?: string | null;
  notes?: string | null;
}

export async function updateMatchDetailsAction(input: UpdateMatchDetailsInput): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "You must be signed in to update the match." };
  }

  if (!input.matchId || input.matchId.trim().length === 0) {
    return { status: "error", message: "Invalid match identifier." };
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id: input.matchId },
      select: { creatorId: true },
    });

    if (!match) {
      return { status: "error", message: "Match not found." };
    }

    if (match.creatorId !== session.user.id) {
      return { status: "error", message: "Only the creator can edit the match." };
    }

    await prisma.match.update({
      where: { id: input.matchId },
      data: {
        club: input.club === undefined ? undefined : input.club?.trim() || null,
        courtNumber: input.courtNumber === undefined ? undefined : input.courtNumber?.trim() || null,
        notes: input.notes === undefined ? undefined : input.notes?.trim() || null,
      },
    });

    revalidatePath(`/match/${input.matchId}`);

    return { status: "ok" };
  } catch (error) {
    console.error("updateMatchDetailsAction failed", error);
    return {
      status: "error",
      message: "We could not update the match details.",
    };
  }
}

export async function confirmMatchResultAction(matchId: string): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "You must be signed in to confirm the result." };
  }

  if (!matchId || matchId.trim().length === 0) {
    return { status: "error", message: "Invalid match identifier." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const player = await tx.matchPlayer.findFirst({
        where: { matchId, userId: session.user.id },
      });

      if (!player) {
        throw new Error("not-authorized");
      }

      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: { players: true },
      });

      if (!match) {
        throw new Error("match-not-found");
      }

      if (!match.score || match.score.trim().length === 0) {
        throw new Error("missing-score");
      }

      if (player.confirmed) {
        return match;
      }

      const updated = await tx.match.update({
        where: { id: matchId },
        data: {
          players: {
            update: {
              where: { id: player.id },
              data: { confirmed: true },
            },
          },
        },
        include: { players: true },
      });

      const everyoneConfirmed = updated.players.every((current) => current.confirmed);

      if (everyoneConfirmed && updated.status !== MATCH_STATUS.CONFIRMED) {
        return tx.match.update({
          where: { id: matchId },
          data: { status: MATCH_STATUS.CONFIRMED },
          include: { players: true },
        });
      }

      return updated;
    });

    revalidatePath(`/match/${matchId}`);

    return { status: "ok" };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "not-authorized") {
        return { status: "error", message: "Solo los jugadores pueden confirmar el resultado." };
      }
      if (error.message === "match-not-found") {
        return { status: "error", message: "No encontramos este partido." };
      }
      if (error.message === "missing-score") {
        return { status: "error", message: "Primero cargá el resultado antes de confirmarlo." };
      }
    }

    console.error("confirmMatchResultAction failed", error);
    return {
      status: "error",
      message: "No pudimos confirmar tu asistencia. Intentá de nuevo.",
    };
  }
}

export async function finalizeMatchAction(matchId: string): Promise<MatchActionResponse> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "You must be signed in to finalize the match." };
  }

  if (!matchId || matchId.trim().length === 0) {
    return { status: "error", message: "Invalid match identifier." };
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: true },
    });

    if (!match) {
      return { status: "error", message: "Match not found." };
    }

    if (match.creatorId !== session.user.id) {
      return { status: "error", message: "Only the creator can finalize the match." };
    }

    if (!match.score || match.score.trim().length === 0) {
      return { status: "error", message: "Cargá el resultado antes de finalizar el partido." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.match.update({
        where: { id: matchId },
        data: {
          status: MATCH_STATUS.CONFIRMED,
          players: {
            updateMany: {
              where: { matchId },
              data: { confirmed: true },
            },
          },
        },
      });
    });

    revalidatePath(`/match/${matchId}`);

    return { status: "ok" };
  } catch (error) {
    console.error("finalizeMatchAction failed", error);
    return {
      status: "error",
      message: "No pudimos finalizar el partido. Intentá nuevamente.",
    };
  }
}
