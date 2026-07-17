"use server";

import { and, eq, asc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import {
  turns,
  turnPlayers,
  users,
  matches,
  matchPlayers,
  teams,
} from "@/db/schema";
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
    const [turn] = await db
      .insert(turns)
      .values({
        creatorId: session.user.id,
        club: input.club,
        date: new Date(input.date),
        duration: input.duration,
        maxPlayers: input.maxPlayers,
        suggestedLevel: input.suggestedLevel,
        notes: input.notes,
      })
      .returning();

    await db.insert(turnPlayers).values({
      turnId: turn.id,
      userId: session.user.id,
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
    const [turn] = await db
      .select({ creatorId: turns.creatorId, status: turns.status })
      .from(turns)
      .where(eq(turns.id, turnId))
      .limit(1);

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

    await db
      .update(turns)
      .set({
        club: input.club,
        date: new Date(input.date),
        duration: input.duration,
        maxPlayers: input.maxPlayers,
        suggestedLevel: input.suggestedLevel,
        notes: input.notes,
      })
      .where(eq(turns.id, turnId));

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
    const turn = await db.query.turns.findFirst({
      where: eq(turns.id, turnId),
      with: { players: true },
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

    await db.insert(turnPlayers).values({
      turnId,
      userId: session.user.id,
    });

    const willBeFull = turn.players.length + 1 >= turn.maxPlayers;

    // Update status if full
    if (willBeFull) {
      await db
        .update(turns)
        .set({ status: "FULL" })
        .where(eq(turns.id, turnId));
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

async function notifyNetworkForTurn(
  turnId: string,
  turn: {
    club: string;
    date: Date;
    maxPlayers: number;
    players: { userId: string }[];
    lastNetworkNotificationAt: Date | null;
  }
) {
  const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
  const now = new Date();

  if (
    turn.lastNetworkNotificationAt &&
    now.getTime() - turn.lastNetworkNotificationAt.getTime() < COOLDOWN_MS
  ) {
    return;
  }

  const { getTurnNetworkContacts } = await import("@/lib/queries");
  const { sendPushToUser } = await import("@/lib/firebase-admin");

  const contacts = await getTurnNetworkContacts(turnId);
  if (contacts.length === 0) return;

  const turnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${turnId}`;
  const openSlots = turn.maxPlayers - turn.players.length;

  let sent = 0;
  for (const contact of contacts) {
    const success = await sendPushToUser(contact.id, {
      title: `¡Cupo abierto en ${turn.club}!`,
      body: `${turn.club} — ${openSlots} ${openSlots === 1 ? "cupo" : "cupos"} disponible${openSlots === 1 ? "" : "s"}. ${new Date(turn.date).toLocaleDateString("es-ES", { weekday: "short", hour: "2-digit", minute: "2-digit" })}`,
      url: turnUrl,
    });
    if (success > 0) sent++;
  }

  if (sent > 0) {
    await db
      .update(turns)
      .set({ lastNetworkNotificationAt: now })
      .where(eq(turns.id, turnId));
  }
}

export async function leaveTurnAction(turnId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    const turn = await db.query.turns.findFirst({
      where: eq(turns.id, turnId),
      with: { players: { columns: { userId: true } } },
    });

    if (!turn) {
      return { status: "error", message: "Turno no encontrado" };
    }

    const wasFull = turn.status === "FULL";

    await db
      .delete(turnPlayers)
      .where(
        and(
          eq(turnPlayers.turnId, turnId),
          eq(turnPlayers.userId, session.user.id),
        ),
      );

    // Re-open turn ONLY if it was full
    if (wasFull) {
      await db
        .update(turns)
        .set({ status: "OPEN" })
        .where(eq(turns.id, turnId));
    }

    revalidatePath(`/t/${turnId}`);
    revalidatePath("/turnos");
    revalidateTag("turns", "default");

    // Notify remaining players + creator (excluding leaver)
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

    // Auto-fire: notify network when turn drops from FULL to OPEN
    if (wasFull) {
      void notifyNetworkForTurn(turnId, turn);
    }

    return { status: "ok" };
  } catch (error) {
    console.error("Error leaving turn:", error);
    return { status: "error", message: "Error al salir del turno" };
  }
}

export async function getTurnByIdAction(turnId: string) {
  try {
    const turn = await db.query.turns.findFirst({
      where: eq(turns.id, turnId),
      with: {
        creator: {
          columns: {
            id: true,
            displayName: true,
            alias: true,
            image: true,
          },
        },
        players: {
          with: {
            user: {
              columns: {
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
    const turn = await db.query.turns.findFirst({
      where: eq(turns.id, turnId),
      with: {
        players: {
          with: {
            user: {
              columns: {
                id: true,
                displayName: true,
                alias: true,
                image: true,
              },
            },
          },
          orderBy: asc(turnPlayers.joinedAt),
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
    const matchId = await db.transaction(async (tx) => {
      // 1. Create Teams (Pareja A and Pareja B)
      const [teamA] = await tx
        .insert(teams)
        .values({ label: "Pareja A" })
        .returning();
      const [teamB] = await tx
        .insert(teams)
        .values({ label: "Pareja B" })
        .returning();

      // 2. Create the Match
      const [match] = await tx
        .insert(matches)
        .values({
          creatorId: session.user.id,
          club: turn.club,
          status: "PENDING",
          date: turn.date,
          sets: 3,
          matchType: "FRIENDLY",
          turnId: turn.id,
        })
        .returning();

      // 3. Create MatchPlayers
      const playerValues = turn.players.slice(0, 4).map((p, index) => ({
        matchId: match.id,
        userId: p.userId,
        position: index,
        teamId: index < 2 ? teamA.id : teamB.id,
        displayName: p.user.alias ?? p.user.displayName,
        joinedAt: p.joinedAt,
      }));
      await tx.insert(matchPlayers).values(playerValues);

      // 4. Update Turn status to COMPLETED
      await tx
        .update(turns)
        .set({ status: "COMPLETED" })
        .where(eq(turns.id, turnId));

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
    const turn = await db.query.turns.findFirst({
      where: eq(turns.id, turnId),
      with: { players: { columns: { userId: true } } },
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

    await db
      .update(turns)
      .set({ status: "CANCELLED" })
      .where(eq(turns.id, turnId));

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

export async function scheduleNextTurnAction(turnId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    const [turn] = await db
      .select({
        creatorId: turns.creatorId,
        club: turns.club,
        date: turns.date,
        duration: turns.duration,
        maxPlayers: turns.maxPlayers,
        suggestedLevel: turns.suggestedLevel,
        notes: turns.notes,
      })
      .from(turns)
      .where(eq(turns.id, turnId))
      .limit(1);

    if (!turn) {
      return { status: "error", message: "Turno no encontrado" };
    }

    if (turn.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Solo el organizador puede programar el próximo turno",
      };
    }

    // Same day next week (+7 days)
    const nextDate = new Date(turn.date);
    nextDate.setDate(nextDate.getDate() + 7);

    const [newTurn] = await db
      .insert(turns)
      .values({
        creatorId: session.user.id,
        club: turn.club,
        date: nextDate,
        duration: turn.duration,
        maxPlayers: turn.maxPlayers,
        suggestedLevel: turn.suggestedLevel,
        notes: turn.notes,
      })
      .returning();

    await db.insert(turnPlayers).values({
      turnId: newTurn.id,
      userId: session.user.id,
    });

    revalidatePath("/turnos");
    revalidateTag("turns", "default");

    return { status: "ok", turnId: newTurn.id };
  } catch (error) {
    console.error("Error scheduling next turn:", error);
    return { status: "error", message: "Error al programar el próximo turno" };
  }
}

export async function openToNetworkAction(turnId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    const turn = await db.query.turns.findFirst({
      where: eq(turns.id, turnId),
      with: { players: { columns: { userId: true } } },
    });

    if (!turn) {
      return { status: "error", message: "Turno no encontrado" };
    }

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

    const { getTurnNetworkContacts } = await import("@/lib/queries");
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
    const [organizer] = await db
      .select({ alias: users.alias, displayName: users.displayName })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    const organizerName = organizer?.alias ?? "Un jugador";

    let sent = 0;
    for (const contact of contacts) {
      const success = await sendPushToUser(contact.id, {
        title: `¡Cupo abierto en ${turn.club}!`,
        body: `${organizerName} busca jugadores para ${openSlots} ${openSlots === 1 ? "cupo" : "cupos"}. ${turn.club} — ${new Date(turn.date).toLocaleDateString("es-ES", { weekday: "short", hour: "2-digit", minute: "2-digit" })}`,
        url: turnUrl,
      });
      if (success > 0) sent++;
    }

    // Update cooldown timestamp
    await db
      .update(turns)
      .set({ lastNetworkNotificationAt: new Date() })
      .where(eq(turns.id, turnId));

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
