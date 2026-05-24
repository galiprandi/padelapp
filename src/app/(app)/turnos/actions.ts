"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateTurnInput = {
  club: string;
  date: string; // ISO string
  duration: number;
  maxPlayers: number;
  suggestedLevel: number;
  notes?: string;
};

export async function createTurnAction(input: CreateTurnInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    const turn = await prisma.turn.create({
      data: {
        creatorId: session.user.id,
        club: input.club,
        date: new Date(input.date),
        duration: input.duration,
        maxPlayers: input.maxPlayers,
        suggestedLevel: input.suggestedLevel,
        notes: input.notes,
        players: {
          create: {
            userId: session.user.id,
          },
        },
      },
    });

    revalidatePath("/turnos");
    return { status: "ok", turnId: turn.id };
  } catch (error) {
    console.error("Error creating turn:", error);
    return { status: "error", message: "Error al crear el turno" };
  }
}

export async function joinTurnAction(turnId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    const turn = await prisma.turn.findUnique({
      where: { id: turnId },
      include: { players: true },
    });

    if (!turn) {
      return { status: "error", message: "Turno no encontrado" };
    }

    if (turn.players.length >= turn.maxPlayers) {
      return { status: "error", message: "Turno completo" };
    }

    const isAlreadyIn = turn.players.some((p) => p.userId === session.user.id);
    if (isAlreadyIn) {
      return { status: "ok" };
    }

    await prisma.turnPlayer.create({
      data: {
        turnId,
        userId: session.user.id,
      },
    });

    // Update status if full
    if (turn.players.length + 1 >= turn.maxPlayers) {
      await prisma.turn.update({
        where: { id: turnId },
        data: { status: "FULL" },
      });
    }

    revalidatePath(`/t/${turnId}`);
    revalidatePath("/turnos");
    return { status: "ok" };
  } catch (error) {
    console.error("Error joining turn:", error);
    return { status: "error", message: "Error al unirse al turno" };
  }
}

export async function leaveTurnAction(turnId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    const turn = await prisma.turn.findUnique({
      where: { id: turnId },
      select: { status: true },
    });

    await prisma.turnPlayer.delete({
      where: {
        turnId_userId: {
          turnId,
          userId: session.user.id,
        },
      },
    });

    // Re-open turn ONLY if it was full
    if (turn?.status === "FULL") {
      await prisma.turn.update({
        where: { id: turnId },
        data: { status: "OPEN" },
      });
    }

    revalidatePath(`/t/${turnId}`);
    revalidatePath("/turnos");
    return { status: "ok" };
  } catch (error) {
    console.error("Error leaving turn:", error);
    return { status: "error", message: "Error al salir del turno" };
  }
}

export async function getTurnByIdAction(turnId: string) {
  try {
    const turn = await prisma.turn.findUnique({
      where: { id: turnId },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            alias: true,
            image: true,
          },
        },
        players: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                alias: true,
                image: true,
                level: true,
              },
            },
          },
        },
      },
    });

    return { status: "ok", turn };
  } catch (error) {
    console.error("Error fetching turn:", error);
    return { status: "error", message: "Error al obtener el turno" };
  }
}
