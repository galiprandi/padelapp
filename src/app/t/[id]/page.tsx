import { auth } from "@/auth";
import { getTurnByIdAction, joinTurnAction, leaveTurnAction, convertTurnToMatchAction } from "@/app/(app)/turnos/actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { PageHeader } from "@/components/page-header";
import { levelOptions } from "@/lib/mock-data";
import { Calendar, Clock, Trophy, LogOut, UserPlus, Play, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import appSettings from "@/config/app-settings.json";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";

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

  // If turn is not found, we show a generic not found page
  if (result.status !== "ok" || !result.turn) {
     return (
       <main className="mx-auto min-h-screen w-full max-w-md flex items-center justify-center px-5">
         <PageHeader
           title="Turno no encontrado"
           description="El turno que buscas no existe o ya no está disponible."
           align="center"
           action={
             <Button asChild className="w-full rounded-xl">
               <Link href="/">Volver al inicio</Link>
             </Button>
           }
         />
       </main>
     );
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
    <main className="mx-auto min-h-screen w-full max-w-md space-y-8 px-5 py-10 pb-32">
      <PageHeader
        title={turn.club}
        align="center"
        description={
          <span className="flex flex-col items-center gap-1">
            <span className="text-xs font-black uppercase tracking-widest text-primary">Turno Abierto</span>
            <span className="flex items-center gap-1.5 capitalize">
              <Calendar className="h-3.5 w-3.5 text-primary/70" />
              {dateStr}
            </span>
          </span>
        }
      />

      <Card className="rounded-[2.5rem] border-border/40 bg-card/50 shadow-xl backdrop-blur-md overflow-hidden">
        <CardHeader className="pb-4 pt-8 text-center border-b border-border/40 bg-muted/20">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/80">Información del turno</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-px bg-border/40 p-0">
          <div className="bg-card/50 p-6 flex flex-col items-center text-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black">{timeStr}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{turn.duration} min</p>
            </div>
          </div>

          <div className="bg-card/50 p-6 flex flex-col items-center text-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black">{suggestedLevelLabel}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Nivel sugerido</p>
            </div>
          </div>

          <div className="col-span-2 bg-card/50 p-6 flex items-center justify-center gap-4">
             <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-lg font-black">{turn.players.length} / {turn.maxPlayers}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Jugadores confirmados</p>
            </div>
          </div>
        </CardContent>
        {turn.notes && (
          <div className="bg-muted/30 p-6 text-center text-sm italic text-muted-foreground border-t border-border/40">
            "{turn.notes}"
          </div>
        )}
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Jugadores anotados</h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {turn.maxPlayers - turn.players.length} cupos libres
          </span>
        </div>
        <div className="grid gap-3">
          {turn.players.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-3xl bg-card/50 p-4 border border-border/40 backdrop-blur-sm shadow-sm transition-all hover:bg-card/80">
              <PlayerAvatar
                name={p.user.alias ?? p.user.displayName}
                image={p.user.image ?? undefined}
                className="h-12 w-12 border-2 border-background shadow-sm"
              />
              <div className="flex-1">
                <p className="font-bold text-foreground leading-none">{p.user.alias ?? p.user.displayName}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Nivel {p.user.level}</p>
              </div>
              {p.userId === turn.creatorId && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-primary border border-primary/20">Organizador</span>
              )}
            </div>
          ))}
          {Array.from({ length: turn.maxPlayers - turn.players.length }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-3xl border-2 border-dashed border-border/40 bg-muted/10 p-4 text-muted-foreground/40">
              <div className="h-12 w-12 rounded-full bg-muted/20 border-2 border-dashed border-muted/30" />
              <p className="text-sm font-bold uppercase tracking-widest italic opacity-60">Cupo disponible</p>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          {!viewerId ? (
            <Button asChild className="w-full rounded-2xl h-14 text-lg font-bold shadow-2xl shadow-primary/30" size="lg">
              <Link href={`/login?callbackUrl=/t/${id}`}>
                Iniciá sesión para anotarte
              </Link>
            </Button>
          ) : isFull ? (
            <div className="flex flex-col gap-3">
              {viewerId === turn.creatorId && turn.status !== "COMPLETED" && (
                <StartMatchForm turnId={id} />
              )}
              <Button disabled className="w-full rounded-2xl h-14 opacity-70 bg-muted text-muted-foreground" size="lg">
                {turn.status === "COMPLETED" ? "Turno finalizado" : "Turno completo"}
              </Button>
              {isJoined && turn.status !== "COMPLETED" && <LeaveTurnForm turnId={id} />}
            </div>
          ) : isJoined ? (
            <div className="flex flex-col gap-3">
              <div className="w-full rounded-2xl h-14 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 font-bold">
                ¡Ya estás anotado!
              </div>
              <LeaveTurnForm turnId={id} />
            </div>
          ) : (
            <JoinTurnForm turnId={id} />
          )}
        </div>
      </div>
    </main>
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
      <Button type="submit" className="w-full rounded-2xl h-14 text-lg font-bold shadow-2xl bg-emerald-500 hover:bg-emerald-600 text-white border-none" size="lg">
        <Play className="mr-2 h-6 w-6 fill-current" />
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
      <Button type="submit" variant="ghost" className="w-full text-destructive hover:bg-destructive/10 rounded-xl py-2" size="sm">
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
      <Button type="submit" className="w-full rounded-2xl h-14 text-lg font-bold shadow-2xl shadow-primary/30" size="lg">
        <UserPlus className="mr-2 h-6 w-6" />
        Anotarme ahora
      </Button>
    </form>
  );
}
