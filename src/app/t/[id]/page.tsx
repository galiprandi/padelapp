import { auth } from "@/auth";
import {
  getTurnByIdAction,
  joinTurnAction,
  leaveTurnAction,
  convertTurnToMatchAction,
  cancelTurnAction,
} from "@/app/(app)/turnos/actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { levelOptions } from "@/lib/mock-data";
import {
  Calendar,
  Clock,
  Trophy,
  LogOut,
  UserPlus,
  Play,
  Users,
  ChevronRight,
  Zap,
  Edit3,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import appSettings from "@/config/app-settings.json";
import type { Metadata } from "next";

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
  const description = `Unite al turno en ${turn.club} el ${new Date(turn.date).toLocaleDateString("es-ES")}.`;

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
            className="text-sm font-semibold text-primary hover:underline"
          >
            Volver
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

  const dateStr = new Date(turn.date).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const timeStr = new Date(turn.date).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-md flex flex-col gap-6 px-6 py-10 pb-48">
      <div className="flex flex-col gap-4">
        <Link
          href={viewerId ? "/me" : "/"}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Volver
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">{turn.club}</h1>
          <p className="text-sm text-muted-foreground">Detalle del Turno</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
            <Zap className="h-3 w-3 fill-current" />
            Turno Abierto
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border text-xs font-bold text-foreground">
            <Calendar className="h-3 w-3 text-primary" />
            {dateStr}
          </div>
        </div>
      </div>

      <Card className="rounded-xl border-border bg-card overflow-hidden">
        <CardHeader className="pb-4 pt-6 border-b border-border bg-muted">
          <CardTitle className="text-xs font-bold text-muted-foreground">
            Especificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-px bg-border p-0">
          <div className="bg-card p-6 flex flex-col items-center text-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{timeStr}</p>
              <p className="text-xs font-bold text-muted-foreground mt-0.5">
                {turn.duration} min
              </p>
            </div>
          </div>

          <div className="bg-card p-6 flex flex-col items-center text-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">
                {suggestedLevelLabel}
              </p>
              <p className="text-xs font-bold text-muted-foreground mt-0.5">
                Nivel
              </p>
            </div>
          </div>

          <div className="col-span-2 bg-card p-6 flex items-center justify-center gap-4 border-t border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xl font-bold">
                {turn.players.length} / {turn.maxPlayers}
              </p>
              <p className="text-xs font-bold text-muted-foreground mt-0.5">
                Jugadores confirmados
              </p>
            </div>
          </div>
        </CardContent>
        {turn.notes && (
          <div className="p-4 bg-muted/20 border-t border-border text-sm text-muted-foreground italic">
            <span className="block text-xs font-bold not-italic mb-1">
              Notas del organizador
            </span>
            "{turn.notes}"
          </div>
        )}
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            Lista de jugadores
          </h2>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
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
                className="h-10 w-10"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate leading-tight group-hover:text-primary transition-colors">
                  {p.user.alias ?? p.user.displayName}
                </p>
                <p className="mt-0.5 text-xs font-bold text-muted-foreground">
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
                <div className="h-10 w-10 rounded-lg bg-muted border border-dashed border-border flex items-center justify-center text-xl">
                  🎾
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold italic opacity-60">
                    Lugar reservado
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border z-50">
        <div className="max-w-md mx-auto">
          {!viewerId ? (
            <Button
              asChild
              className="w-full h-12 rounded-lg text-base font-bold"
            >
              <Link href={`/login?callbackUrl=/t/${id}`}>
                Iniciá sesión para anotarte
              </Link>
            </Button>
          ) : isFull ? (
            <div className="flex flex-col gap-3">
              {viewerId === turn.creatorId && turn.status !== "COMPLETED" && (
                <>
                  <StartMatchForm turnId={id} />
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
              {isJoined && turn.status !== "COMPLETED" && (
                <LeaveTurnForm turnId={id} />
              )}
            </div>
          ) : isJoined ? (
            <div className="flex flex-col gap-3">
              <div className="w-full h-12 rounded-lg flex items-center justify-center bg-primary/10 text-primary border border-primary/20 font-bold">
                ¡Ya estás anotado!
              </div>
              {viewerId === turn.creatorId && (
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
              )}
              <LeaveTurnForm turnId={id} />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {viewerId === turn.creatorId && (
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
              )}
              <JoinTurnForm turnId={id} />
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
    <form action={handleJoin}>
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
