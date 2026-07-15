"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyUsers, getUserDisplayName } from "@/lib/notifications";
import { revalidatePath, revalidateTag } from "next/cache";
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
    revalidateTag("turns", "default");
    return { status: "ok", turnId: turn.id };
  } catch (error) {
    console.error("Error creating turn:", error);
    return { status: "error", message: "Error al crear el turno" };
  }
}

export async function updateTurnAction(turnId: string, input: CreateTurnInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    const turn = await prisma.turn.findUnique({
      where: { id: turnId },
      select: { creatorId: true, status: true },
    });

    if (!turn) {
      return { status: "error", message: "Turno no encontrado" };
    }

    if (turn.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Solo el organizador puede editar el turno",
      };
    }

    if (turn.status === "COMPLETED") {
      return {
        status: "error",
        message: "No se puede editar un turno ya finalizado",
      };
    }

    await prisma.turn.update({
      where: { id: turnId },
      data: {
        club: input.club,
        date: new Date(input.date),
        duration: input.duration,
        maxPlayers: input.maxPlayers,
        suggestedLevel: input.suggestedLevel,
        notes: input.notes,
      },
    });

    revalidatePath("/turnos");
    revalidatePath(`/t/${turnId}`);
    revalidateTag("turns", "default");

    return { status: "ok" };
  } catch (error) {
    console.error("Error updating turn:", error);
    return { status: "error", message: "Error al actualizar el turno" };
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

    const willBeFull = turn.players.length + 1 >= turn.maxPlayers;

    // Update status if full
    if (willBeFull) {
      await prisma.turn.update({
        where: { id: turnId },
        data: { status: "FULL" },
      });
    }

    revalidatePath(`/t/${turnId}`);
    revalidatePath("/turnos");
    revalidateTag("turns", "default");

    // Push notifications (non-blocking, best-effort)
    const turnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${turnId}`;
    const joinerName = await getUserDisplayName(session.user.id);
    const newPlayerCount = turn.players.length + 1;

    if (willBeFull) {
      // #3: Turn complete — notify all enrolled players
      const allUserIds = [
        ...turn.players.map((p) => p.userId),
        session.user.id,
      ];
      void notifyUsers(allUserIds, {
        title: `¡Turno completo en ${turn.club}!`,
        body: `Nos vemos ${new Date(turn.date).toLocaleDateString("es-ES", { weekday: "short", hour: "2-digit", minute: "2-digit" })}.`,
        url: turnUrl,
      });
    } else {
      // #4: New player joined — notify existing players + creator (excluding joiner)
      const recipientIds = [
        ...new Set([
          ...turn.players.map((p) => p.userId),
          turn.creatorId,
        ]),
      ].filter((id) => id !== session.user.id);
      void notifyUsers(recipientIds, {
        title: `${joinerName} se sumó al turno`,
        body: `${turn.club} — ${newPlayerCount}/${turn.maxPlayers} jugadores.`,
        url: turnUrl,
      });
    }

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
      include: { players: { select: { userId: true } } },
    });

    if (!turn) {
      return { status: "error", message: "Turno no encontrado" };
    }

    await prisma.turnPlayer.delete({
      where: {
        turnId_userId: {
          turnId,
          userId: session.user.id,
        },
      },
    });

    // Re-open turn ONLY if it was full
    if (turn.status === "FULL") {
      await prisma.turn.update({
        where: { id: turnId },
        data: { status: "OPEN" },
      });
    }

    revalidatePath(`/t/${turnId}`);
    revalidatePath("/turnos");
    revalidateTag("turns", "default");

    // #2: Player left — notify remaining players + creator (excluding leaver)
    const remainingSlots = turn.maxPlayers - (turn.players.length - 1);
    const leaverName = await getUserDisplayName(session.user.id);
    const recipientIds = [
      ...new Set([
        ...turn.players.map((p) => p.userId),
        turn.creatorId,
      ]),
    ].filter((id) => id !== session.user.id);

    const turnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${turnId}`;
    void notifyUsers(recipientIds, {
      title: `${leaverName} salió del turno`,
      body: `Faltan ${remainingSlots} ${remainingSlots === 1 ? "cupo" : "cupos"} en ${turn.club}.`,
      url: turnUrl,
    });

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

export async function convertTurnToMatchAction(turnId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    const turn = await prisma.turn.findUnique({
      where: { id: turnId },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                alias: true,
                image: true,
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!turn) {
      return { status: "error", message: "Turno no encontrado" };
    }

    if (turn.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Solo el organizador puede iniciar el partido",
      };
    }

    if (turn.players.length < 4) {
      return {
        status: "error",
        message: "Se necesitan 4 jugadores para iniciar el partido",
      };
    }

    // Use a transaction to create the match and update the turn
    const matchId = await prisma.$transaction(async (tx) => {
      // 1. Create Teams (Pareja A and Pareja B)
      const teamA = await tx.team.create({ data: { label: "Pareja A" } });
      const teamB = await tx.team.create({ data: { label: "Pareja B" } });

      // 2. Create the Match
      const match = await tx.match.create({
        data: {
          creatorId: session.user.id,
          club: turn.club,
          status: "PENDING",
          date: turn.date,
          sets: 3,
          matchType: "FRIENDLY",
          turnId: turn.id,
          players: {
            create: turn.players.slice(0, 4).map((p, index) => ({
              userId: p.userId,
              position: index,
              teamId: index < 2 ? teamA.id : teamB.id,
              displayName: p.user.alias ?? p.user.displayName,
              joinedAt: p.joinedAt,
            })),
          },
        },
      });

      // 3. Update Turn status to COMPLETED
      await tx.turn.update({
        where: { id: turnId },
        data: { status: "COMPLETED" },
      });

      return match.id;
    });

    revalidatePath("/turnos");
    revalidatePath(`/t/${turnId}`);
    revalidatePath("/me");
    revalidateTag("turns", "default");
    revalidateTag("matches", "default");

    return { status: "ok", matchId };
  } catch (error) {
    console.error("Error converting turn to match:", error);
    return {
      status: "error",
      message: "Error al convertir el turno en partido",
    };
  }
}

export async function cancelTurnAction(turnId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    const turn = await prisma.turn.findUnique({
      where: { id: turnId },
      include: { players: { select: { userId: true } } },
    });

    if (!turn) {
      return { status: "error", message: "Turno no encontrado" };
    }

    if (turn.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Solo el organizador puede cancelar el turno",
      };
    }

    if (turn.status === "COMPLETED") {
      return {
        status: "error",
        message: "No se puede cancelar un turno ya finalizado",
      };
    }

    await prisma.turn.update({
      where: { id: turnId },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/turnos");
    revalidatePath(`/t/${turnId}`);
    revalidatePath("/me");
    revalidateTag("turns", "default");

    // #6: Turn cancelled — notify all enrolled players (excluding creator)
    const recipientIds = turn.players
      .map((p) => p.userId)
      .filter((id) => id !== session.user.id);

    const turnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${turnId}`;
    const dateStr = new Date(turn.date).toLocaleDateString("es-ES", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    void notifyUsers(recipientIds, {
      title: `Turno cancelado en ${turn.club}`,
      body: `El turno de ${dateStr} fue cancelado por el organizador.`,
      url: turnUrl,
    });

    return { status: "ok" };
  } catch (error) {
    console.error("Error cancelling turn:", error);
    return { status: "error", message: "Error al cancelar el turno" };
  }
}

export async function openToNetworkAction(turnId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    const turn = await prisma.turn.findUnique({
      where: { id: turnId },
      include: { players: { select: { userId: true } } },
    });

    if (!turn) {
      return { status: "error", message: "Turno no encontrado" };
    }

    // Only enrolled players can open to their network
    const isEnrolled = turn.players.some((p) => p.userId === session.user.id);
    if (!isEnrolled) {
      return {
        status: "error",
        message: "Solo los inscriptos pueden abrir el turno a su red",
      };
    }

    if (turn.status === "COMPLETED" || turn.status === "CANCELLED") {
      return { status: "error", message: "Este turno ya no está disponible" };
    }

    if (turn.players.length >= turn.maxPlayers) {
      return { status: "error", message: "El turno ya está completo" };
    }

    const { getTurnNetworkContacts } = await import("@/lib/padel-contacts");
    const { sendPushToUser } = await import("@/lib/firebase-admin");

    const contacts = await getTurnNetworkContacts(turnId);

    if (contacts.length === 0) {
      return {
        status: "error",
        message: "No hay contactos recientes para notificar",
      };
    }

    const turnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${turnId}`;
    const openSlots = turn.maxPlayers - turn.players.length;
    const organizerName = (await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { alias: true, displayName: true },
    }))?.alias ?? "Un jugador";

    let sent = 0;
    for (const contact of contacts) {
      const success = await sendPushToUser(contact.id, {
        title: `¡Cupo abierto en ${turn.club}!`,
        body: `${organizerName} busca jugadores para ${openSlots} ${openSlots === 1 ? "cupo" : "cupos"}. ${turn.club} — ${new Date(turn.date).toLocaleDateString("es-ES", { weekday: "short", hour: "2-digit", minute: "2-digit" })}`,
        url: turnUrl,
      });
      if (success > 0) sent++;
    }

    return {
      status: "ok",
      notifiedCount: sent,
      totalContacts: contacts.length,
    };
  } catch (error) {
    console.error("Error opening turn to network:", error);
    return { status: "error", message: "Error al abrir el turno a tu red" };
  }
}
