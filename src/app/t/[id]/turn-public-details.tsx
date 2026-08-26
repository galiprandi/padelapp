import { auth } from "@/auth";
import { getTurnByIdAction } from "@/app/(app)/turnos/actions";
import { getCachedPadelContacts, type PadelContact } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { LocalDate, LocalTime } from "@/components/ui/local-date";
import { ShareButton } from "@/components/share/share-button";
import { LeaveTurnButton } from "@/components/turns/leave-turn-button";
import {
  RemovePlayerButton,
  AssignSubstituteButton,
} from "@/components/turns/organizer-actions";
import { createMagicLink } from "@/lib/magic-link";
import { SignInForm } from "@/components/auth/sign-in-form";
import {
  Calendar,
  Clock,
  Users,
  ChevronRight,
  ChevronLeft,
  Edit3,
  MapPin,
  Info,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { WhatsAppInviteButton } from "@/components/turns/whatsapp-invite-button";
import { TurnChat } from "@/components/turns/turn-chat";
import { getTurnSalvageShareMessage, getTurnSalvageBannerText } from "@/components/turns/turn-utils";
import {
  CancelTurnForm,
  StartMatchForm,
  JoinTurnForm,
  JoinSubstituteForm,
  LeaveSubstituteForm,
  TakeOpenSlotForm,
  ScheduleNextTurnForm,
  PlayCasualForm,
  QuickJoinEmptySlotButton,
} from "@/components/turns/turn-actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OpenToNetworkButton } from "@/components/turns/open-to-network-button";
import { AddToCalendarButton } from "@/components/turns/add-to-calendar";
import { AddPlayerButton } from "@/components/turns/add-player-button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { playerEdges } from "@/db/schema";
import { and, inArray } from "drizzle-orm";

interface TurnPublicDetailsProps {
  params: Promise<{ id: string }>;
}

/** Shared share button for the turn detail page — avoids 6× repetition. */
function TurnShareButton({
  shareUrl,
  club,
  date,
  openSlots = 0,
  variant = "full",
  className,
}: {
  shareUrl: string;
  club: string;
  date: Date;
  openSlots?: number;
  variant?: "full" | "icon";
  className?: string;
}) {
  const shareText =
    openSlots > 0
      ? getTurnSalvageShareMessage({ club, date, openSlots })
      : undefined;

  return (
    <ShareButton
      title="Sumate al Turno"
      text={shareText}
      shareData={
        openSlots <= 0
          ? { type: "turn", club, date }
          : undefined
      }
      url={shareUrl}
      variant="outline"
      iconOnly={variant === "icon"}
      className={
        variant === "full"
          ? "w-full h-12 rounded-lg text-base font-bold"
          : className
      }
    />
  );
}

export async function TurnPublicDetails({ params }: TurnPublicDetailsProps) {
  const { id } = await params;
  const session = await auth();
  const result = await getTurnByIdAction(id);

  if (result.status !== "ok" || !result.turn) {
    notFound();
  }

  const turn = result.turn;
  const viewerId = session?.user?.id;
  const isJoined = turn.players.some((p) => p.userId === viewerId);
  const isCreator = turn.creatorId === viewerId;
  const isCancelled = turn.status === "CANCELLED";
  const isCompleted = turn.status === "COMPLETED";
  const isFull = turn.players.length >= turn.maxPlayers;
  const isSubstitute = turn.substitutes.some((s) => s.userId === viewerId);
  const hasOpenSlot = turn.players.length < turn.maxPlayers;

  // Compute share URL once instead of 6 times
  const shareUrl = createMagicLink({ resource: "turn", identifier: id }).url;

  // Fetch viewer's contacts
  let viewerContacts: PadelContact[] = [];
  if (viewerId) {
    viewerContacts = await getCachedPadelContacts(viewerId);
  }
  const contactIds = new Set(viewerContacts.map((c) => c.id));

  // Fetch prioritized salvage recommendations for the network section
  let suggestedContacts: PadelContact[] = [];
  if (viewerId && (isJoined || isCreator) && hasOpenSlot && !isCompleted) {
    const { getCachedTurnNetworkContacts } = await import("@/lib/queries");
    suggestedContacts = await getCachedTurnNetworkContacts(id);
  }

  // Find mutual contact connections among players and substitutes
  const allTurnUserIds = [
    ...turn.players.map((p) => p.userId),
    ...turn.substitutes.map((s) => s.userId),
  ];

  const connectionMap: Record<string, string> = {};
  if (allTurnUserIds.length >= 2 && !(process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true")) {
    const edges = await db
      .select()
      .from(playerEdges)
      .where(
        and(
          inArray(playerEdges.playerAId, allTurnUserIds),
          inArray(playerEdges.playerBId, allTurnUserIds)
        )
      );

    // Build map of userId -> userName
    const userNamesMap = new Map<string, string>();
    for (const p of turn.players) {
      userNamesMap.set(p.userId, p.user.alias ?? p.user.displayName);
    }
    for (const s of turn.substitutes) {
      userNamesMap.set(s.userId, s.user.alias ?? s.user.displayName);
    }

    // Sort all participants by joinedAt to establish connection direction (who joined first)
    const sortedParticipants = [
      ...turn.players.map((p) => ({ userId: p.userId, joinedAt: p.joinedAt })),
      ...turn.substitutes.map((s) => ({ userId: s.userId, joinedAt: s.joinedAt })),
    ].sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());

    for (let i = 0; i < sortedParticipants.length; i++) {
      const current = sortedParticipants[i];
      // Check if current has an edge with any participant who joined BEFORE them
      const connectedTo = sortedParticipants.slice(0, i).find((other) => {
        return edges.some(
          (edge) =>
            (edge.playerAId === current.userId && edge.playerBId === other.userId) ||
            (edge.playerAId === other.userId && edge.playerBId === current.userId)
        );
      });

      if (connectedTo) {
        const name = userNamesMap.get(connectedTo.userId);
        if (name) {
          connectionMap[current.userId] = name;
        }
      }
    }
  }

  if (isCancelled) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Link
            href={viewerId ? "/me" : "/"}
            aria-label="Volver"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Turno cancelado
            </h1>
            <p className="text-sm text-muted-foreground">
              Este turno ha sido cancelado por el organizador.
            </p>
          </div>
        </div>
        <Button asChild className="w-full h-12 rounded-lg text-base font-bold">
          <Link href="/turnos" prefetch={true}>Ver otros turnos</Link>
        </Button>
      </div>
    );
  }

  // Compact date for subtitle (server-side, Argentina timezone)
  const turnDateObj = new Date(turn.date);
  const turnDateStr = turnDateObj.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });
  const turnTimeStr = turnDateObj.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
  const compactDate = `${turnDateStr} · ${turnTimeStr}`;

  // Expanded subtitle logic — covers all viewer states
  const subtitle = !viewerId
    ? `Te invita ${turn.creator.alias ?? turn.creator.displayName} · ${compactDate}`
    : isSubstitute
      ? `Suplente #${turn.substitutes.findIndex((s) => s.userId === viewerId) + 1} de ${turn.substitutes.length}`
      : isJoined
        ? isCompleted
          ? "Turno finalizado"
          : `Ya te sumaste · ${compactDate}`
        : isFull
          ? `Turno completo · ${turn.substitutes.length} ${turn.substitutes.length === 1 ? "suplente" : "suplentes"}`
          : `Sumate a este turno · ${compactDate}`;

  const openSlotsCount = turn.maxPlayers - turn.players.length;
  const salvageBannerText = hasOpenSlot && !isCompleted ? getTurnSalvageBannerText(openSlotsCount) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href={viewerId ? "/me" : "/"}
          aria-label="Volver"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Detalle del Turno
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {salvageBannerText && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-100 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 shadow-xs">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Salvataje de turno
            </p>
            <p className="text-sm font-semibold mt-0.5 leading-snug">
              {salvageBannerText}
            </p>
          </div>
          <TurnShareButton
            shareUrl={shareUrl}
            club={turn.club}
            date={turn.date}
            openSlots={openSlotsCount}
            variant="icon"
            className="h-9 w-9 rounded-lg shrink-0 border-amber-300 dark:border-amber-700 bg-amber-200/50 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900"
          />
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Información del turno
          </h2>
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold border ${
              isCompleted
                ? "bg-muted text-muted-foreground border-border"
                : isFull
                  ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800"
                  : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800"
            }`}
          >
            {isCompleted ? "Finalizado" : isFull ? "Completo" : "Abierto"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border">
          <div className="bg-card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">Horario</span>
            </div>
            <p className="text-lg font-bold">
              <LocalTime date={turn.date} />
            </p>
          </div>

          <div className="bg-card p-4 flex items-center gap-4 border-t border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{turn.club}</p>
              <p className="text-xs text-muted-foreground">
                <LocalDate date={turn.date} />
              </p>
            </div>
          </div>

          <div className="bg-card p-4 border-t border-border flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground">Cupos cubiertos</span>
              <span className="text-xs font-bold text-foreground tabular-nums">
                {turn.players.length} de {turn.maxPlayers}
              </span>
            </div>
            <div
              className="w-full bg-muted h-2 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={turn.players.length}
              aria-valuemin={0}
              aria-valuemax={turn.maxPlayers}
              aria-label="Progreso de inscripción de jugadores"
            >
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${(turn.players.length / turn.maxPlayers) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {turn.notes && (
          <div className="p-4 bg-muted border-t border-border text-sm text-muted-foreground italic leading-relaxed">
            <span className="block text-xs font-bold not-italic mb-1 text-foreground">
              Notas del organizador
            </span>
            &ldquo;{turn.notes}&rdquo;
          </div>
        )}

        {(isJoined || isCreator) && (
          <div className="p-4 border-t border-border bg-card">
            <AddToCalendarButton
              turnId={id}
              club={turn.club}
              date={turn.date}
              duration={turn.duration}
              notes={turn.notes}
            />
          </div>
        )}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Lista de jugadores
          </h2>
          <Badge variant="primary">
            {turn.maxPlayers - turn.players.length} cupos libres
          </Badge>
        </div>

        <div className="grid gap-2">
          {turn.players.map((p) => {
            const isContact = contactIds.has(p.userId);
            return (
              <Link
                key={p.id}
                href={`/p/${p.userId}`}
                prefetch={true}
                className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 border border-border transition-all active:scale-[0.98] hover:bg-muted group"
              >
                <PlayerAvatar
                  name={p.user.alias ?? p.user.displayName}
                  image={p.user.image ?? undefined}
                  size={40}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate leading-tight group-hover:text-primary transition-colors flex items-center gap-1.5">
                    {p.user.alias ?? p.user.displayName}
                    {isContact && (
                      <span
                        className="h-2 w-2 rounded-full bg-primary"
                        title="Contacto"
                        aria-label="Contacto frecuente"
                      />
                    )}
                  </p>
                  {connectionMap[p.userId] && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1" aria-label={`Contacto de ${connectionMap[p.userId]}`}>
                      <Info className="h-3 w-3 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                      <span>Contacto de {connectionMap[p.userId]}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {p.userId === turn.creatorId && (
                    <Badge variant="primary">
                      Organizador
                    </Badge>
                  )}
                  {isCreator &&
                    p.userId !== turn.creatorId &&
                    turn.status !== "COMPLETED" && (
                      <RemovePlayerButton
                        turnId={id}
                        playerUserId={p.userId}
                        playerName={p.user.alias ?? p.user.displayName}
                      />
                    )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                </div>
              </Link>
            );
          })}
          {Array.from({ length: turn.maxPlayers - turn.players.length }).map(
            (_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted px-4 py-3 text-muted-foreground"
              >
                <div className="h-10 w-10 rounded-lg bg-background border border-dashed border-border flex items-center justify-center">
                  <Users className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <div className="flex-1 flex items-center justify-between min-w-0 gap-2">
                  <p className="text-xs font-semibold italic opacity-60 truncate">
                    Cupo disponible
                  </p>
                  {isJoined || isCreator ? (
                    <TurnShareButton
                      shareUrl={shareUrl}
                      club={turn.club}
                      date={turn.date}
                      openSlots={turn.maxPlayers - turn.players.length}
                      variant="icon"
                      className="h-8 w-8 rounded-lg shrink-0"
                    />
                  ) : (
                    viewerId && !isSubstitute && turn.status === "OPEN" && (
                      <QuickJoinEmptySlotButton turnId={id} />
                    )
                  )}
                </div>
              </div>
            ),
          )}
        </div>

        {isCreator && hasOpenSlot && !isCompleted && (
          <AddPlayerButton
            turnId={id}
            existingPlayerIds={turn.players.map((p) => p.userId)}
          />
        )}

        {isJoined && !isFull && turn.status === "OPEN" && (
          <OpenToNetworkButton
            turnId={id}
            club={turn.club}
            lastNetworkNotificationAt={turn.lastNetworkNotificationAt}
          />
        )}
      </section>

      {suggestedContacts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
              Sugeridos para invitar 🧠
            </h2>
            <span className="text-xs text-muted-foreground">
              De tu red de contactos
            </span>
          </div>

          <div className="grid gap-2">
            {suggestedContacts.slice(0, 4).map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 border border-border"
              >
                <PlayerAvatar
                  name={contact.alias ?? contact.displayName}
                  image={contact.image ?? undefined}
                  size={40}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate leading-tight">
                    {contact.alias ?? contact.displayName}
                  </p>
                </div>
                <WhatsAppInviteButton
                  club={turn.club}
                  date={turn.date}
                  contactName={contact.alias ?? contact.displayName}
                  openSlots={turn.maxPlayers - turn.players.length}
                  shareUrl={shareUrl}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {turn.substitutes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Lista de suplentes
            </h2>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground border border-border">
              {turn.substitutes.length} {turn.substitutes.length === 1 ? "suplente" : "suplentes"}
            </span>
          </div>
          <div className="grid gap-2">
            {turn.substitutes.map((s, index) => {
              const isContact = contactIds.has(s.userId);
              return (
                <Link
                  key={s.id}
                  href={`/p/${s.userId}`}
                  prefetch={true}
                  className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 border border-border transition-all active:scale-[0.98] hover:bg-muted group"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <PlayerAvatar
                    name={s.user.alias ?? s.user.displayName}
                    image={s.user.image ?? undefined}
                    size={40}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate leading-tight group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {s.user.alias ?? s.user.displayName}
                      {isContact && (
                        <span
                          className="h-2 w-2 rounded-full bg-primary"
                          title="Contacto"
                          aria-label="Contacto frecuente"
                        />
                      )}
                    </p>
                    {connectionMap[s.userId] && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1" aria-label={`Contacto de ${connectionMap[s.userId]}`}>
                        <Info className="h-3 w-3 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                        <span>Contacto de {connectionMap[s.userId]}</span>
                      </p>
                    )}
                  </div>
                  {s.userId === viewerId && (
                    <Badge variant="primary">
                      Vos
                    </Badge>
                  )}
                  {isCreator &&
                    hasOpenSlot &&
                    turn.status !== "COMPLETED" &&
                    s.userId !== viewerId && (
                      <AssignSubstituteButton
                        turnId={id}
                        substituteUserId={s.userId}
                        substituteName={s.user.alias ?? s.user.displayName}
                      />
                    )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {(isJoined || isCreator || isSubstitute) && (
        <section className="space-y-4 mb-6">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Chat del turno 💬
          </h2>
          <TurnChat turnId={id} currentUserId={viewerId} />
        </section>
      )}

      <div className="h-64" />

      <div
        className="fixed bottom-0 left-0 right-0 p-6 pb-safe bg-background border-t border-border z-50"
        role="region"
        aria-label="Acciones del turno"
      >
        <div className="max-w-md mx-auto">
          <TurnActions
            viewerId={viewerId}
            isSubstitute={isSubstitute}
            isFull={isFull}
            isJoined={isJoined}
            isCreator={isCreator}
            isCompleted={isCompleted}
            hasOpenSlot={hasOpenSlot}
            openSlots={turn.maxPlayers - turn.players.length}
            turnId={id}
            club={turn.club}
            date={turn.date}
            shareUrl={shareUrl}
            playersCount={turn.players.length}
          />
        </div>
      </div>
    </div>
  );
}

/** Bottom action bar — extracted from 235-line ternary into a clear component. */
function TurnActions({
  viewerId,
  isSubstitute,
  isFull,
  isJoined,
  isCreator,
  isCompleted,
  hasOpenSlot,
  openSlots,
  turnId,
  club,
  date,
  shareUrl,
  playersCount,
}: {
  viewerId: string | undefined;
  isSubstitute: boolean;
  isFull: boolean;
  isJoined: boolean;
  isCreator: boolean;
  isCompleted: boolean;
  hasOpenSlot: boolean;
  openSlots: number;
  turnId: string;
  club: string;
  date: Date;
  shareUrl: string;
  playersCount: number;
}) {
  // State 1: Not logged in
  if (!viewerId) {
    return (
      <div className="flex flex-col gap-3">
        <SignInForm
          callbackUrl={`/t/${turnId}`}
          label={`Iniciá sesión para sumarte a ${club}`}
          className="w-full h-12 rounded-lg text-base font-bold"
        />
        <TurnShareButton shareUrl={shareUrl} club={club} date={date} openSlots={openSlots} />
      </div>
    );
  }

  // State 2: Substitute
  if (isSubstitute) {
    return (
      <div className="flex flex-col gap-3">
        {hasOpenSlot ? (
          <TakeOpenSlotForm turnId={turnId} />
        ) : (
          <>
            <div className="w-full h-12 rounded-lg flex items-center justify-center bg-muted text-muted-foreground font-bold border border-border">
              No hay cupos libres todavía
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Estás en la lista de espera. Te avisaremos cuando se libere un cupo.
            </p>
          </>
        )}
        {!isCompleted && (
          <TurnShareButton shareUrl={shareUrl} club={club} date={date} openSlots={openSlots} />
        )}
        <LeaveSubstituteForm turnId={turnId} hasOpenSlot={hasOpenSlot} />
      </div>
    );
  }

  // State 3: Full turn
  if (isFull) {
    return (
      <div className="flex flex-col gap-3">
        {isCreator && !isCompleted && (
          <>
            <StartMatchForm turnId={turnId} />
            <ScheduleNextTurnForm turnId={turnId} />
            <div className="flex gap-2">
              <Button
                asChild
                variant="outline"
                className="flex-1 h-10 rounded-lg font-bold text-xs"
              >
                <Link href={`/turnos/${turnId}/editar`} prefetch={true}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <CancelTurnForm turnId={turnId} />
            </div>
          </>
        )}
        {isCompleted ? (
          <Button
            disabled
            className="w-full h-12 rounded-lg font-bold bg-muted text-muted-foreground"
          >
            Turno finalizado
          </Button>
        ) : isJoined ? (
          <Button
            disabled
            className="w-full h-12 rounded-lg font-bold bg-muted text-muted-foreground border border-border"
          >
            Ya te sumaste
          </Button>
        ) : (
          <JoinSubstituteForm turnId={turnId} />
        )}
        {!isCompleted && (
          <TurnShareButton shareUrl={shareUrl} club={club} date={date} />
        )}
        {isJoined && !isCompleted && (
          <LeaveTurnButton
            turnId={turnId}
            club={club}
            wasFull
            isCreator={isCreator}
            date={date}
          />
        )}
      </div>
    );
  }

  // State 4: Joined (not full)
  if (isJoined) {
    return (
      <div className="flex flex-col gap-3">
        {isCreator && (
          <>
            {playersCount >= 4 && !isCompleted && (
              <StartMatchForm turnId={turnId} />
            )}
            {playersCount >= 2 && playersCount < 4 && !isCompleted && (
              <PlayCasualForm turnId={turnId} />
            )}
            <div className="flex gap-2 w-full">
              <div className="flex-1">
                <ScheduleNextTurnForm turnId={turnId} />
              </div>
              {!isCompleted && (
                <TurnShareButton
                  shareUrl={shareUrl}
                  club={club}
                  date={date}
                  openSlots={openSlots}
                  variant="icon"
                  className="h-10 w-10 rounded-lg shrink-0"
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                asChild
                variant="outline"
                className="flex-1 h-10 rounded-lg font-bold text-xs"
              >
                <Link href={`/turnos/${turnId}/editar`} prefetch={true}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <CancelTurnForm turnId={turnId} />
            </div>
            <LeaveTurnButton
              turnId={turnId}
              club={club}
              isCreator={isCreator}
              date={date}
            />
          </>
        )}
        {!isCreator && (
          <div className="flex gap-2 w-full">
            <div className="flex-1">
              <LeaveTurnButton
                turnId={turnId}
                club={club}
                isCreator={isCreator}
                date={date}
              />
            </div>
            {!isCompleted && (
              <TurnShareButton
                shareUrl={shareUrl}
                club={club}
                date={date}
                openSlots={openSlots}
                variant="icon"
                className="h-10 w-10 rounded-lg shrink-0"
              />
            )}
          </div>
        )}
      </div>
    );
  }

  // State 5: Not joined (open turn)
  return (
    <div className="flex flex-col gap-3">
      {isCreator && (
        <>
          {playersCount >= 2 && playersCount < 4 && !isCompleted && (
            <PlayCasualForm turnId={turnId} />
          )}
          <ScheduleNextTurnForm turnId={turnId} />
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              className="flex-1 h-10 rounded-lg font-bold text-xs"
            >
              <Link href={`/turnos/${turnId}/editar`} prefetch={true}>
                <Edit3 className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <CancelTurnForm turnId={turnId} />
          </div>
        </>
      )}
      <div className="flex gap-2 w-full">
        <div className="flex-1">
          <Suspense fallback={null}>
            <JoinTurnForm turnId={turnId} />
          </Suspense>
        </div>
        {!isCompleted && (
          <TurnShareButton
            shareUrl={shareUrl}
            club={club}
            date={date}
            openSlots={openSlots}
            variant="icon"
            className="h-12 w-12 rounded-lg shrink-0"
          />
        )}
      </div>
    </div>
  );
}
