import { auth } from "@/auth";
import { getTurnByIdAction, joinTurnAction, leaveTurnAction } from "@/app/(app)/turnos/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { EmptyState } from "@/components/empty-state";
import { levelOptions } from "@/lib/mock-data";
import { Calendar, Clock, MapPin, Users, Trophy, LogOut, UserPlus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import appSettings from "@/config/app-settings.json";
import type { Metadata } from "next";

interface TurnPageProps {
  params: Promise<{ id: string }>;
}

const brandWithEmoji = `🎾 ${appSettings.shortName}`;

export async function generateMetadata({ params }: TurnPageProps): Promise<Metadata> {
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
  const isFull = turn.players.length >= turn.maxPlayers;
  const suggestedLevelLabel = levelOptions.find((l) => l.value === turn.suggestedLevel.toString())?.label ?? turn.suggestedLevel;

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
    <main className="mx-auto min-h-screen w-full max-w-md space-y-6 px-5 py-10">
      <header className="space-y-2 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Turno Abierto</p>
        <h1 className="text-3xl font-bold tracking-tight">{turn.club}</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="capitalize">{dateStr}</span>
        </div>
      </header>

      <Card className="rounded-3xl border-none bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Detalles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{timeStr}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hora de inicio · {turn.duration} min</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{suggestedLevelLabel}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nivel sugerido</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{turn.players.length} / {turn.maxPlayers}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Jugadores confirmados</p>
            </div>
          </div>

          {turn.notes && (
            <div className="rounded-2xl bg-muted/30 p-4 text-sm italic text-muted-foreground">
              "{turn.notes}"
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1">Jugadores anotados</h2>
        <div className="grid grid-cols-1 gap-2">
          {turn.players.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm border border-border/40">
              <PlayerAvatar
                name={p.user.alias ?? p.user.displayName}
                image={p.user.image ?? undefined}
                className="h-10 w-10"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">{p.user.alias ?? p.user.displayName}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nivel {p.user.level}</p>
              </div>
              {p.userId === turn.creatorId && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-primary">Organizador</span>
              )}
            </div>
          ))}
          {Array.from({ length: turn.maxPlayers - turn.players.length }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-muted p-3 text-muted-foreground/50">
              <div className="h-10 w-10 rounded-full bg-muted/20" />
              <p className="text-sm font-medium italic">Cupo disponible</p>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-6 pt-4">
        {!viewerId ? (
          <Button asChild className="w-full rounded-full shadow-lg" size="lg">
            <Link href={`/login?callbackUrl=/t/${id}`}>
              Iniciá sesión para anotarte
            </Link>
          </Button>
        ) : isJoined ? (
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full rounded-full border-primary text-primary" size="lg" disabled>
              ¡Ya estás anotado!
            </Button>
            <LeaveTurnForm turnId={id} />
          </div>
        ) : isFull ? (
          <Button disabled className="w-full rounded-full opacity-70" size="lg">
            Turno completo
          </Button>
        ) : (
          <JoinTurnForm turnId={id} />
        )}
      </div>
    </main>
  );
}

function LeaveTurnForm({ turnId }: { turnId: string }) {
  async function handleLeave() {
    "use server";
    await leaveTurnAction(turnId);
  }

  return (
    <form action={handleLeave}>
      <Button type="submit" variant="ghost" className="w-full text-destructive hover:bg-destructive/10 rounded-full" size="sm">
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
      <Button type="submit" className="w-full rounded-full shadow-lg" size="lg">
        <UserPlus className="mr-2 h-5 w-5" />
        Anotarme ahora
      </Button>
    </form>
  );
}
