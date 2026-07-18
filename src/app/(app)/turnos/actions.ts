"use server";

import { and, eq, asc, count } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import {
  turns,
  turnPlayers,
  turnSubstitutes,
  users,
  matches,
  matchPlayers,
  teams,
} from "@/db/schema";
import { notifyUsers, getUserDisplayName } from "@/lib/notifications";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getTurnLabel } from "@/lib/utils";

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
      const turnLabel = getTurnLabel(turn.club, turn.date);
      void notifyUsers(allUserIds, {
        title: `¡Turno completo! ${turnLabel}`,
        body: `Nos vemos.`,
        url: turnUrl,
      });
    } else {
      // #4: New player joined — notify existing players + creator (excluding joiner)
      const recipientIds = [
        ...new Set([...turn.players.map((p) => p.userId), turn.creatorId]),
      ].filter((id) => id !== session.user.id);
      void notifyUsers(recipientIds, {
        title: `${joinerName} se sumó a ${getTurnLabel(turn.club, turn.date)}`,
        body: `${newPlayerCount}/${turn.maxPlayers} jugadores.`,
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
  },
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
      title: `¡Cupo abierto! ${getTurnLabel(turn.club, turn.date)}`,
      body: `${openSlots} ${openSlots === 1 ? "cupo" : "cupos"} disponible${openSlots === 1 ? "" : "s"}.`,
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
      with: {
        players: { columns: { userId: true, joinedAt: true } },
        substitutes: {
          columns: { userId: true },
          orderBy: asc(turnSubstitutes.joinedAt),
        },
      },
    });

    if (!turn) {
      return { status: "error", message: "Turno no encontrado" };
    }

    const wasFull = turn.status === "FULL";
    const isOrganizerLeaving = turn.creatorId === session.user.id;

    // If organizer is leaving, find the earliest-joined player to transfer ownership
    let newCreatorId: string | null = null;
    if (isOrganizerLeaving) {
      const remainingPlayers = turn.players
        .filter((p) => p.userId !== session.user.id)
        .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
      if (remainingPlayers.length > 0) {
        newCreatorId = remainingPlayers[0].userId;
      }
    }

    await db
      .delete(turnPlayers)
      .where(
        and(
          eq(turnPlayers.turnId, turnId),
          eq(turnPlayers.userId, session.user.id),
        ),
      );

    // Transfer ownership if organizer is leaving
    if (isOrganizerLeaving && newCreatorId) {
      await db
        .update(turns)
        .set({ creatorId: newCreatorId })
        .where(eq(turns.id, turnId));
    }

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
      ...new Set([...turn.players.map((p) => p.userId), turn.creatorId]),
    ].filter((id) => id !== session.user.id);

    const turnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${turnId}`;
    const turnLabel = getTurnLabel(turn.club, turn.date);
    void notifyUsers(recipientIds, {
      title: `${leaverName} salió de ${turnLabel}`,
      body: `Faltan ${remainingSlots} ${remainingSlots === 1 ? "cupo" : "cupos"}.`,
      url: turnUrl,
    });

    // Notify new organizer if ownership was transferred
    if (isOrganizerLeaving && newCreatorId) {
      void notifyUsers([newCreatorId], {
        title: `Sos el nuevo organizador de ${turnLabel}`,
        body: `${leaverName} te transfirió la organización.`,
        url: turnUrl,
      });
    }

    // Notify substitutes when a spot opens (in join order — no priority)
    if (wasFull && turn.substitutes.length > 0) {
      const subTurnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${turnId}`;
      const turnDate = new Date(turn.date);
      const now = new Date();
      const hoursUntil = Math.round(
        (turnDate.getTime() - now.getTime()) / (1000 * 60 * 60),
      );
      const timeContext =
        hoursUntil <= 0
          ? "¡Ahora!"
          : hoursUntil <= 3
            ? `En ${hoursUntil}h`
            : "";

      const substituteIds = turn.substitutes.map((s) => s.userId);
      void notifyUsers(substituteIds, {
        title: `¡Cupo libre! ${turnLabel}`,
        body: timeContext
          ? `${timeContext} Tocá rápido para ocuparlo.`
          : "Tocá rápido para ocuparlo.",
        url: subTurnUrl,
      });
    }

    // Late leave penalty: if leaving < 2h before turn, reduce attendance score
    const turnDate = new Date(turn.date);
    const hoursUntilTurn =
      (turnDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    if (hoursUntilTurn < 2 && !isOrganizerLeaving) {
      const penalty = 0.05;
      const currentUser = await db
        .select({ attendanceScore: users.attendanceScore })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

      if (currentUser.length > 0) {
        const newScore = Math.max(0, currentUser[0].attendanceScore - penalty);
        await db
          .update(users)
          .set({ attendanceScore: newScore })
          .where(eq(users.id, session.user.id));

        void notifyUsers([session.user.id], {
          title: `Baja tardía en ${turnLabel}`,
          body: `Te bajaste a menos de 2h del turno. Tu reputación bajó a ${Math.round(newScore * 100)}%.`,
          url: turnUrl,
        });
      }
    }

    // Auto-fire: notify network when turn drops from FULL to OPEN and no substitutes
    if (wasFull && turn.substitutes.length === 0) {
      void notifyNetworkForTurn(turnId, turn);
    }

    return {
      status: "ok",
      hadSubstitutes: wasFull && turn.substitutes.length > 0,
    };
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
        substitutes: {
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
          orderBy: asc(turnSubstitutes.joinedAt),
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
        substitutes: {
          columns: { userId: true },
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

      // 5. Clean up substitutes
      await tx
        .delete(turnSubstitutes)
        .where(eq(turnSubstitutes.turnId, turnId));

      return match.id;
    });

    revalidatePath("/turnos");
    revalidatePath(`/t/${turnId}`);
    revalidatePath("/me");
    revalidateTag("turns", "default");
    revalidateTag("matches", "default");

    // Notify substitutes that the match started
    if (turn.substitutes.length > 0) {
      const turnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${turnId}`;
      void notifyUsers(
        turn.substitutes.map((s) => s.userId),
        {
          title: `El partido empezó: ${getTurnLabel(turn.club, turn.date)}`,
          body: `No se liberaron más cupos. ¡Gracias por anotarte como suplente!`,
          url: turnUrl,
        },
      );
    }

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
      with: {
        players: { columns: { userId: true } },
        substitutes: { columns: { userId: true } },
      },
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

    // Clean up substitutes
    await db.delete(turnSubstitutes).where(eq(turnSubstitutes.turnId, turnId));

    revalidatePath("/turnos");
    revalidatePath(`/t/${turnId}`);
    revalidatePath("/me");
    revalidateTag("turns", "default");

    // Notify all enrolled players + substitutes (excluding creator)
    const turnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${turnId}`;
    const recipientIds = [
      ...turn.players.map((p) => p.userId),
      ...turn.substitutes.map((s) => s.userId),
    ].filter((id) => id !== session.user.id);

    void notifyUsers(recipientIds, {
      title: `Turno cancelado: ${getTurnLabel(turn.club, turn.date)}`,
      body: `El organizador canceló el turno.`,
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

    const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
    const now = new Date();

    if (
      turn.lastNetworkNotificationAt &&
      now.getTime() - turn.lastNetworkNotificationAt.getTime() < COOLDOWN_MS
    ) {
      const minutesLeft = Math.ceil(
        (COOLDOWN_MS -
          (now.getTime() - turn.lastNetworkNotificationAt.getTime())) /
          (60 * 1000),
      );
      return {
        status: "error",
        message: `Ya se notificó a la red recientemente. Esperá ${minutesLeft} ${minutesLeft === 1 ? "minuto" : "minutos"} para volver a enviar.`,
      };
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

export async function joinSubstituteAction(turnId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    const turn = await db.query.turns.findFirst({
      where: eq(turns.id, turnId),
      with: {
        players: { columns: { userId: true } },
        substitutes: { columns: { userId: true } },
      },
    });

    if (!turn) {
      return { status: "error", message: "Turno no encontrado" };
    }

    if (turn.status === "CANCELLED" || turn.status === "COMPLETED") {
      return { status: "error", message: "Turno no disponible" };
    }

    const isPlayer = turn.players.some((p) => p.userId === session.user.id);
    if (isPlayer) {
      return { status: "error", message: "Ya estás inscripto en este turno" };
    }

    const isSubstitute = turn.substitutes.some(
      (s) => s.userId === session.user.id,
    );
    if (isSubstitute) {
      return { status: "ok" };
    }

    if (turn.players.length < turn.maxPlayers) {
      return { status: "error", message: "Aún hay cupos disponibles" };
    }

    if (turn.substitutes.length >= turn.maxPlayers) {
      return { status: "error", message: "Lista de suplentes completa" };
    }

    await db.insert(turnSubstitutes).values({
      turnId,
      userId: session.user.id,
    });

    revalidatePath(`/t/${turnId}`);
    revalidatePath("/turnos");
    revalidateTag("turns", "default");

    return { status: "ok" };
  } catch (error) {
    console.error("Error joining as substitute:", error);
    return { status: "error", message: "Error al anotarse como suplente" };
  }
}

export async function leaveSubstituteAction(turnId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    await db
      .delete(turnSubstitutes)
      .where(
        and(
          eq(turnSubstitutes.turnId, turnId),
          eq(turnSubstitutes.userId, session.user.id),
        ),
      );

    revalidatePath(`/t/${turnId}`);
    revalidatePath("/turnos");
    revalidateTag("turns", "default");

    return { status: "ok" };
  } catch (error) {
    console.error("Error leaving substitutes:", error);
    return { status: "error", message: "Error al salir de suplentes" };
  }
}

export async function takeOpenSlotAction(turnId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    const turn = await db.query.turns.findFirst({
      where: eq(turns.id, turnId),
      with: {
        players: { columns: { userId: true } },
        substitutes: { columns: { userId: true } },
      },
    });

    if (!turn) {
      return { status: "error", message: "Turno no encontrado" };
    }

    if (turn.status === "CANCELLED" || turn.status === "COMPLETED") {
      return { status: "error", message: "Turno no disponible" };
    }

    const isPlayer = turn.players.some((p) => p.userId === session.user.id);
    if (isPlayer) {
      return { status: "error", message: "Ya estás inscripto" };
    }

    const isSubstitute = turn.substitutes.some(
      (s) => s.userId === session.user.id,
    );
    if (!isSubstitute) {
      return { status: "error", message: "No estás en la lista de suplentes" };
    }

    await db.transaction(async (tx) => {
      const [{ total }] = await tx
        .select({ total: count() })
        .from(turnPlayers)
        .where(eq(turnPlayers.turnId, turnId));

      if (total >= turn.maxPlayers) {
        throw new Error("El cupo ya fue ocupado");
      }

      await tx.insert(turnPlayers).values({
        turnId,
        userId: session.user.id,
      });

      await tx
        .delete(turnSubstitutes)
        .where(
          and(
            eq(turnSubstitutes.turnId, turnId),
            eq(turnSubstitutes.userId, session.user.id),
          ),
        );

      if (total + 1 >= turn.maxPlayers) {
        await tx
          .update(turns)
          .set({ status: "FULL" })
          .where(eq(turns.id, turnId));
      } else {
        await tx
          .update(turns)
          .set({ status: "OPEN" })
          .where(eq(turns.id, turnId));
      }
    });

    revalidatePath(`/t/${turnId}`);
    revalidatePath("/turnos");
    revalidateTag("turns", "default");

    // Notify everyone (players + creator + remaining substitutes) with clear status
    const takerName = await getUserDisplayName(session.user.id);
    const newPlayerCount = turn.players.length + 1;
    const isNowFull = newPlayerCount >= turn.maxPlayers;
    const turnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${turnId}`;
    const turnLabel = getTurnLabel(turn.club, turn.date);

    // Players + creator (excluding taker)
    const playerRecipientIds = [
      ...new Set([...turn.players.map((p) => p.userId), turn.creatorId]),
    ].filter((id) => id !== session.user.id);

    // Remaining substitutes
    const otherSubstituteIds = turn.substitutes
      .map((s) => s.userId)
      .filter((id) => id !== session.user.id);

    // One unified notification to players
    void notifyUsers(playerRecipientIds, {
      title: `${takerName} ocupó un cupo en ${turnLabel}`,
      body: isNowFull
        ? `Turno completo. ${newPlayerCount}/${turn.maxPlayers} jugadores.`
        : `${newPlayerCount}/${turn.maxPlayers} jugadores. Quedan ${turn.maxPlayers - newPlayerCount} ${turn.maxPlayers - newPlayerCount === 1 ? "cupo" : "cupos"}.`,
      url: turnUrl,
    });

    // To substitutes: clear message about whether there are still spots
    if (otherSubstituteIds.length > 0) {
      void notifyUsers(otherSubstituteIds, {
        title: `${takerName} ocupó un cupo en ${turnLabel}`,
        body: isNowFull
          ? `Turno completo. Seguís en la lista de suplentes.`
          : `Todavía hay ${turn.maxPlayers - newPlayerCount} ${turn.maxPlayers - newPlayerCount === 1 ? "cupo libre" : "cupos libres"}. ¡Tocá para ocuparlo!`,
        url: turnUrl,
      });
    }

    return { status: "ok" };
  } catch (error) {
    if (error instanceof Error && error.message === "El cupo ya fue ocupado") {
      return { status: "error", message: error.message };
    }
    console.error("Error taking open slot:", error);
    return { status: "error", message: "Error al ocupar el cupo" };
  }
}

export async function removePlayerAction(turnId: string, playerUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    const turn = await db.query.turns.findFirst({
      where: eq(turns.id, turnId),
      with: {
        players: { columns: { userId: true } },
        substitutes: { columns: { userId: true } },
      },
    });

    if (!turn) {
      return { status: "error", message: "Turno no encontrado" };
    }

    if (turn.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Solo el organizador puede remover jugadores",
      };
    }

    if (turn.status === "CANCELLED" || turn.status === "COMPLETED") {
      return { status: "error", message: "Turno no disponible" };
    }

    const isPlayer = turn.players.some((p) => p.userId === playerUserId);
    if (!isPlayer) {
      return { status: "error", message: "Ese jugador no está en el turno" };
    }

    const wasFull = turn.status === "FULL";

    await db
      .delete(turnPlayers)
      .where(
        and(
          eq(turnPlayers.turnId, turnId),
          eq(turnPlayers.userId, playerUserId),
        ),
      );

    if (wasFull) {
      await db
        .update(turns)
        .set({ status: "OPEN" })
        .where(eq(turns.id, turnId));
    }

    revalidatePath(`/t/${turnId}`);
    revalidatePath("/turnos");
    revalidatePath("/me");
    revalidateTag("turns", "default");

    const turnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${turnId}`;
    const turnLabel = getTurnLabel(turn.club, turn.date);
    const removerName = await getUserDisplayName(session.user.id);
    const remainingSlots = turn.maxPlayers - (turn.players.length - 1);

    // Notify the removed player
    void notifyUsers([playerUserId], {
      title: `Fuiste removido de ${turnLabel}`,
      body: `${removerName} te sacó del turno.`,
      url: turnUrl,
    });

    // Notify remaining players + creator (excluding removed player and remover)
    const recipientIds = [
      ...new Set([...turn.players.map((p) => p.userId), turn.creatorId]),
    ].filter((id) => id !== playerUserId && id !== session.user.id);

    void notifyUsers(recipientIds, {
      title: `${removerName} removió a un jugador de ${turnLabel}`,
      body: `Faltan ${remainingSlots} ${remainingSlots === 1 ? "cupo" : "cupos"}.`,
      url: turnUrl,
    });

    // Notify substitutes when a spot opens
    if (wasFull && turn.substitutes.length > 0) {
      const substituteIds = turn.substitutes.map((s) => s.userId);
      const turnDate = new Date(turn.date);
      const now = new Date();
      const hoursUntil = Math.round(
        (turnDate.getTime() - now.getTime()) / (1000 * 60 * 60),
      );
      const timeContext =
        hoursUntil <= 0
          ? "¡Ahora!"
          : hoursUntil <= 3
            ? `En ${hoursUntil}h`
            : "";
      void notifyUsers(substituteIds, {
        title: `¡Cupo libre! ${turnLabel}`,
        body: timeContext
          ? `${timeContext} Tocá rápido para ocuparlo.`
          : "Tocá rápido para ocuparlo.",
        url: turnUrl,
      });
    }

    // Auto-fire: notify network when no substitutes
    if (wasFull && turn.substitutes.length === 0) {
      void notifyNetworkForTurn(turnId, turn);
    }

    return { status: "ok" };
  } catch (error) {
    console.error("Error removing player:", error);
    return { status: "error", message: "Error al remover jugador" };
  }
}

export async function assignSubstituteAction(
  turnId: string,
  substituteUserId: string,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  try {
    const turn = await db.query.turns.findFirst({
      where: eq(turns.id, turnId),
      with: {
        players: { columns: { userId: true } },
        substitutes: { columns: { userId: true } },
      },
    });

    if (!turn) {
      return { status: "error", message: "Turno no encontrado" };
    }

    if (turn.creatorId !== session.user.id) {
      return {
        status: "error",
        message: "Solo el organizador puede asignar suplentes",
      };
    }

    if (turn.status === "CANCELLED" || turn.status === "COMPLETED") {
      return { status: "error", message: "Turno no disponible" };
    }

    const isSubstitute = turn.substitutes.some(
      (s) => s.userId === substituteUserId,
    );
    if (!isSubstitute) {
      return { status: "error", message: "Ese jugador no es suplente" };
    }

    if (turn.players.length >= turn.maxPlayers) {
      return { status: "error", message: "No hay cupos libres" };
    }

    await db.transaction(async (tx) => {
      const [{ total }] = await tx
        .select({ total: count() })
        .from(turnPlayers)
        .where(eq(turnPlayers.turnId, turnId));

      if (total >= turn.maxPlayers) {
        throw new Error("El cupo ya fue ocupado");
      }

      await tx.insert(turnPlayers).values({
        turnId,
        userId: substituteUserId,
      });

      await tx
        .delete(turnSubstitutes)
        .where(
          and(
            eq(turnSubstitutes.turnId, turnId),
            eq(turnSubstitutes.userId, substituteUserId),
          ),
        );

      if (total + 1 >= turn.maxPlayers) {
        await tx
          .update(turns)
          .set({ status: "FULL" })
          .where(eq(turns.id, turnId));
      } else {
        await tx
          .update(turns)
          .set({ status: "OPEN" })
          .where(eq(turns.id, turnId));
      }
    });

    revalidatePath(`/t/${turnId}`);
    revalidatePath("/turnos");
    revalidatePath("/me");
    revalidateTag("turns", "default");

    const turnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${turnId}`;
    const turnLabel = getTurnLabel(turn.club, turn.date);
    const assigneeName = await getUserDisplayName(substituteUserId);
    const newPlayerCount = turn.players.length + 1;
    const isNowFull = newPlayerCount >= turn.maxPlayers;

    // Notify the assigned substitute
    void notifyUsers([substituteUserId], {
      title: `¡Te asignaron un cupo en ${turnLabel}!`,
      body: `El organizador te asignó al turno.`,
      url: turnUrl,
    });

    // Notify existing players + creator (excluding assignee)
    const recipientIds = [
      ...new Set([...turn.players.map((p) => p.userId), turn.creatorId]),
    ].filter((id) => id !== substituteUserId);

    void notifyUsers(recipientIds, {
      title: `${assigneeName} ocupó un cupo en ${turnLabel}`,
      body: isNowFull
        ? `Turno completo. ${newPlayerCount}/${turn.maxPlayers} jugadores.`
        : `${newPlayerCount}/${turn.maxPlayers} jugadores. Quedan ${turn.maxPlayers - newPlayerCount} ${turn.maxPlayers - newPlayerCount === 1 ? "cupo" : "cupos"}.`,
      url: turnUrl,
    });

    // Notify other substitutes with clear status
    const otherSubstituteIds = turn.substitutes
      .map((s) => s.userId)
      .filter((id) => id !== substituteUserId);
    if (otherSubstituteIds.length > 0) {
      void notifyUsers(otherSubstituteIds, {
        title: `${assigneeName} ocupó un cupo en ${turnLabel}`,
        body: isNowFull
          ? `Turno completo. Seguís en la lista de suplentes.`
          : `Todavía hay ${turn.maxPlayers - newPlayerCount} ${turn.maxPlayers - newPlayerCount === 1 ? "cupo libre" : "cupos libres"}. ¡Tocá para ocuparlo!`,
        url: turnUrl,
      });
    }

    return { status: "ok" };
  } catch (error) {
    if (error instanceof Error && error.message === "El cupo ya fue ocupado") {
      return { status: "error", message: error.message };
    }
    console.error("Error assigning substitute:", error);
    return { status: "error", message: "Error al asignar suplente" };
  }
}
