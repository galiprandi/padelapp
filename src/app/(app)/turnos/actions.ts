"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TurnStatus } from "@prisma/client";

export type TurnActionResponse =
  | { status: "ok"; turnId?: string }
  | { status: "error"; message: string };

export async function createTurnAction(formData: {
  club: string;
  date: string;
  time: string;
  duration: number;
  maxPlayers: number;
  suggestedLevel: number;
  notes?: string;
}): Promise<TurnActionResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "Debes iniciar sesión para crear un turno." };
  }

  try {
    const combinedDate = new Date(`${formData.date}T${formData.time}`);

    const turn = await prisma.turn.create({
      data: {
        creatorId: session.user.id,
        club: formData.club,
        date: combinedDate,
        duration: formData.duration,
        maxPlayers: formData.maxPlayers,
        suggestedLevel: formData.suggestedLevel,
        notes: formData.notes,
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
    console.error("createTurnAction failed", error);
    return { status: "error", message: "No pudimos crear el turno. Intentá de nuevo." };
  }
}

export async function joinTurnAction(turnId: string): Promise<TurnActionResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "Debes iniciar sesión para unirte." };
  }

  try {
    const turn = await prisma.turn.findUnique({
      where: { id: turnId },
      include: { _count: { select: { players: true } } },
    });

    if (!turn) {
      return { status: "error", message: "Turno no encontrado." };
    }

    if (turn.status !== "OPEN") {
      return { status: "error", message: "Este turno ya no está abierto." };
    }

    if (turn._count.players >= turn.maxPlayers) {
      return { status: "error", message: "El turno está completo." };
    }

    await prisma.turnPlayer.create({
      data: {
        turnId,
        userId: session.user.id,
      },
    });

    // Update status to FULL if needed
    if (turn._count.players + 1 >= turn.maxPlayers) {
      await prisma.turn.update({
        where: { id: turnId },
        data: { status: "FULL" },
      });
    }

    revalidatePath("/turnos");
    revalidatePath(`/t/${turnId}`);
    return { status: "ok" };
  } catch (error) {
    console.error("joinTurnAction failed", error);
    return { status: "error", message: "No pudimos anotarte en el turno." };
  }
}

export async function getTurnsAction(filters?: { level?: number; club?: string }) {
  try {
    const turns = await prisma.turn.findMany({
      where: {
        status: "OPEN",
        ...(filters?.level ? { suggestedLevel: filters.level } : {}),
        ...(filters?.club ? { club: { contains: filters.club, mode: "insensitive" } } : {}),
      },
      include: {
        creator: true,
        _count: { select: { players: true } },
      },
      orderBy: { date: "asc" },
    });

    return { status: "ok", turns };
  } catch (error) {
    console.error("getTurnsAction failed", error);
    return { status: "error", message: "Error al cargar los turnos." };
  }
}
