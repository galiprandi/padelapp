import { auth } from "@/auth";
import {
  getTurnByIdAction,
  joinTurnAction,
  leaveTurnAction,
  convertTurnToMatchAction,
  cancelTurnAction,
  scheduleNextTurnAction,
} from "@/app/(app)/turnos/actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { levelOptions } from "@/lib/mock-data";
import { LocalDate, LocalTime } from "@/components/ui/local-date";
import { ShareButton } from "@/components/share/share-button";
import { createMagicLink } from "@/lib/magic-link";
import {
  Calendar,
  Clock,
  Trophy,
  LogOut,
  UserPlus,
  Play,
  Users,
  ChevronRight,
  ChevronLeft,
  Edit3,
  Trash2,
  MapPin,
  CalendarPlus,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import appSettings from "@/config/app-settings.json";
import type { Metadata } from "next";
import { OpenToNetworkButton } from "@/components/turns/open-to-network-button";

interface TurnPageProps {
  params: Promise<{ id: string }>;
}

const brandWithEmoji = `🎾 ${appSettings.shortName}`;

export async function generateMetadata({
  params,
}: TurnPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getTurnByIdAction(id);

  if (result.status !== "ok" || !result.turn) {
    return { title: "Turno no encontrado" };
  }

  const turn = result.turn;
  const title = `Turno en ${turn.club} - ${brandWithEmoji}`;
  const description = `Unite al turno en ${turn.club} el ${new Date(turn.date).toLocaleDateString("es-ES", { timeZone: "America/Argentina/Buenos_Aires" })}.`;

  return {
    title,
    description,
  };
}

export default async function TurnPublicPage({ params }: TurnPageProps) {
  const { id } = await params;
  const session = await auth();
  const result = await getTurnByIdAction(id);

  if (result.status !== "ok" || !result.turn) {
    notFound();
  }

  const turn = result.turn;
  const viewerId = session?.user?.id;
  const isJoined = turn.players.some((p) => p.userId === viewerId);
  const isCancelled = turn.status === "CANCELLED";

  if (isCancelled) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md flex flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-4">
          <Link
            href={viewerId ? "/me" : "/"}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Turno cancelado</h1>
            <p className="text-sm text-muted-foreground">Este turno ha sido cancelado por el organizador.</p>
          </div>
        </div>
        <Button asChild className="w-full h-12 rounded-lg text-base font-bold">
          <Link href="/turnos">Ver otros turnos</Link>
        </Button>
      </main>
    );
  }
  const isFull = turn.players.length >= turn.maxPlayers;
  const suggestedLevelLabel =
    levelOptions.find((l) => l.value === turn.suggestedLevel.toString())
      ?.label ?? turn.suggestedLevel;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md flex flex-col gap-6 px-6 py-10 pb-32">
      <div className="flex items-center gap-4">
        <Link
          href={viewerId ? "/me" : "/"}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Detalle del Turno</h1>
          <p className="text-sm text-muted-foreground">
            {isFull ? "Turno completo" : "¡Sumate a este partido!"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Información del turno
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-px bg-border">
          <div className="bg-card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">Horario</span>
            </div>
            <p className="text-lg font-bold">
              <LocalTime date={turn.date} />
            </p>
          </div>

          <div className="bg-card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">Nivel sugerido</span>
            </div>
            <p className="text-lg font-bold">{suggestedLevelLabel}</p>
          </div>

          <div className="col-span-2 bg-card p-4 flex items-center gap-4 border-t border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{turn.club}</p>
              <p className="text-xs text-muted-foreground">
                <LocalDate date={turn.date} />
              </p>
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
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Lista de jugadores
          </h2>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary border border-primary/20">
            {turn.maxPlayers - turn.players.length} cupos libres
          </span>
        </div>

        <div className="grid gap-2">
          {turn.players.map((p) => (
            <Link
              key={p.id}
              href={`/p/${p.userId}`}
              className="flex items-center gap-3 rounded-xl bg-card p-3 border border-border transition-colors hover:bg-muted/50 group"
            >
              <PlayerAvatar
                name={p.user.alias ?? p.user.displayName}
                image={p.user.image ?? undefined}
                size={40}
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate leading-tight group-hover:text-primary transition-colors">
                  {p.user.alias ?? p.user.displayName}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                  Nivel {p.user.level}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {p.userId === turn.creatorId && (
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary border border-primary/20">
                    Organizador
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
              </div>
            </Link>
          ))}
          {Array.from({ length: turn.maxPlayers - turn.players.length }).map(
            (_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted p-3 text-muted-foreground"
              >
                <div className="h-10 w-10 rounded-lg bg-background border border-dashed border-border flex items-center justify-center text-xl">
                  🎾
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold italic opacity-60">
                    Cupo disponible
                  </p>
                </div>
              </div>
            ),
          )}
        </div>

        {isJoined && !isFull && turn.status === "OPEN" && (
          <OpenToNetworkButton turnId={id} club={turn.club} />
        )}
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border z-50">
        <div className="max-w-md mx-auto">
          {!viewerId ? (
            <div className="flex flex-col gap-3">
              <Button
                asChild
                className="w-full h-12 rounded-lg text-base font-bold"
              >
                <Link href={`/login?callbackUrl=/t/${id}`}>
                  Iniciá sesión para anotarte
                </Link>
              </Button>
              <ShareButton
                title="Sumate al Turno"
                text={`¡Sumate a mi turno de pádel en ${turn.club}!`}
                url={createMagicLink({ resource: "turn", identifier: id }).url}
                variant="outline"
                className="w-full h-12 rounded-lg text-base font-bold"
              />
            </div>
          ) : isFull ? (
            <div className="flex flex-col gap-3">
              {viewerId === turn.creatorId && turn.status !== "COMPLETED" && (
                <>
                  <StartMatchForm turnId={id} />
                  <ScheduleNextTurnForm turnId={id} />
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 h-10 rounded-lg font-bold text-xs"
                    >
                      <Link href={`/turnos/${id}/editar`}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                    <CancelTurnForm turnId={id} />
                  </div>
                </>
              )}
              <Button
                disabled
                className="w-full h-12 rounded-lg font-bold bg-muted text-muted-foreground"
              >
                {turn.status === "COMPLETED"
                  ? "Turno finalizado"
                  : "Turno completo"}
              </Button>
              {turn.status !== "COMPLETED" && (
                <ShareButton
                  title="Sumate al Turno"
                  text={`¡Sumate a mi turno de pádel en ${turn.club}!`}
                  url={createMagicLink({ resource: "turn", identifier: id }).url}
                  variant="outline"
                  className="w-full h-12 rounded-lg text-base font-bold"
                />
              )}
              {isJoined && turn.status !== "COMPLETED" && (
                <LeaveTurnForm turnId={id} />
              )}
            </div>
          ) : isJoined ? (
            <div className="flex flex-col gap-3">
              <div className="w-full h-12 rounded-lg flex items-center justify-center bg-primary/10 text-primary border border-primary/20 font-bold shadow-sm">
                ¡Ya estás anotado!
              </div>
              {turn.status !== "COMPLETED" && (
                <ShareButton
                  title="Sumate al Turno"
                  text={`¡Sumate a mi turno de pádel en ${turn.club}!`}
                  url={createMagicLink({ resource: "turn", identifier: id }).url}
                  className="w-full h-12 rounded-lg text-base font-bold"
                />
              )}
              {viewerId === turn.creatorId && (
                <>
                  <ScheduleNextTurnForm turnId={id} />
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 h-10 rounded-lg font-bold text-xs"
                    >
                      <Link href={`/turnos/${id}/editar`}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                    <CancelTurnForm turnId={id} />
                  </div>
                </>
              )}
              <LeaveTurnForm turnId={id} />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {viewerId === turn.creatorId && (
                <>
                  <ScheduleNextTurnForm turnId={id} />
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 h-10 rounded-lg font-bold text-xs"
                    >
                      <Link href={`/turnos/${id}/editar`}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                    <CancelTurnForm turnId={id} />
                  </div>
                </>
              )}
              <div className="flex gap-2 w-full">
                <div className="flex-1">
                  <JoinTurnForm turnId={id} />
                </div>
                {turn.status !== "COMPLETED" && (
                  <ShareButton
                    title="Sumate al Turno"
                    text={`¡Sumate a mi turno de pádel en ${turn.club}!`}
                    url={createMagicLink({ resource: "turn", identifier: id }).url}
                    variant="outline"
                    iconOnly
                    className="h-12 w-12 rounded-lg shrink-0"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function CancelTurnForm({ turnId }: { turnId: string }) {
  async function handleCancel() {
    "use server";
    const result = await cancelTurnAction(turnId);
    if (result.status === "ok") {
      redirect("/turnos");
    }
  }

  return (
    <form action={handleCancel} className="flex-1">
      <Button
        type="submit"
        variant="ghost"
        className="w-full h-10 rounded-lg text-xs font-bold text-destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Eliminar
      </Button>
    </form>
  );
}

function StartMatchForm({ turnId }: { turnId: string }) {
  async function handleStart() {
    "use server";
    const result = await convertTurnToMatchAction(turnId);
    if (result.status === "ok" && result.matchId) {
      return redirect(`/match/${result.matchId}`);
    }
  }

  return (
    <form action={handleStart}>
      <Button
        type="submit"
        className="w-full h-12 rounded-lg text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <Play className="mr-2 h-5 w-5 fill-current" />
        Iniciar partido
      </Button>
    </form>
  );
}

function LeaveTurnForm({ turnId }: { turnId: string }) {
  async function handleLeave() {
    "use server";
    await leaveTurnAction(turnId);
  }

  return (
    <form action={handleLeave}>
      <Button
        type="submit"
        variant="ghost"
        className="w-full h-10 rounded-lg text-xs font-bold text-destructive"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Bajarme del turno
      </Button>
    </form>
  );
}

function JoinTurnForm({ turnId }: { turnId: string }) {
  async function handleJoin() {
    "use server";
    await joinTurnAction(turnId);
  }

  return (
    <form action={handleJoin} className="w-full">
      <Button
        type="submit"
        className="w-full h-12 rounded-lg text-base font-bold"
      >
        <UserPlus className="mr-2 h-5 w-5" />
        Anotarme ahora
      </Button>
    </form>
  );
}

function ScheduleNextTurnForm({ turnId }: { turnId: string }) {
  async function handleScheduleNext() {
    "use server";
    const result = await scheduleNextTurnAction(turnId);
    if (result.status === "ok" && result.turnId) {
      redirect(`/t/${result.turnId}`);
    }
  }

  return (
    <form action={handleScheduleNext}>
      <Button
        type="submit"
        variant="outline"
        className="w-full h-10 rounded-lg text-xs font-bold"
      >
        <CalendarPlus className="mr-2 h-4 w-4" />
        Programar próximo turno
      </Button>
    </form>
  );
}
