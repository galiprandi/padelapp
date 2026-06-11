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

  // If turn is not found, we show a generic not found page (handled by Next.js not-found)
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
    <main className="mx-auto min-h-screen w-full max-w-md space-y-10 px-6 py-10 pb-40">
      <PageHeader
        title={turn.club}
        align="center"
        description={
          <span className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Turno Abierto</span>
            <span className="flex items-center gap-1.5 capitalize font-black text-foreground/80">
              <Calendar className="h-4 w-4 text-primary" />
              {dateStr}
            </span>
          </span>
        }
      />

      <Card className="rounded-[2.5rem] border-border/40 bg-card/50 shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="pb-4 pt-8 text-center border-b border-border/20 bg-muted/30">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Detalles del encuentro</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-px bg-border/20 p-0">
          <div className="bg-card/40 p-6 flex flex-col items-center text-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-black">{timeStr}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{turn.duration} min</p>
            </div>
          </div>

          <div className="bg-card/40 p-6 flex flex-col items-center text-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-black">{suggestedLevelLabel}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Nivel sugerido</p>
            </div>
          </div>

          <div className="col-span-2 bg-card/40 p-6 flex items-center justify-center gap-4 border-t border-border/20">
             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="text-xl font-black">{turn.players.length} / {turn.maxPlayers}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Jugadores anotados</p>
            </div>
          </div>
        </CardContent>
        {turn.notes && (
          <div className="bg-primary/5 p-6 text-center text-sm font-medium text-muted-foreground/80 border-t border-border/20 italic">
            "{turn.notes}"
          </div>
        )}
      </Card>

      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Lista de jugadores</h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            {turn.maxPlayers - turn.players.length} cupos libres
          </span>
        </div>
        <div className="grid gap-3">
          {turn.players.map((p) => (
            <Link
              key={p.id}
              href={`/p/${p.userId}`}
              className="flex items-center gap-4 rounded-3xl bg-card/50 p-4 border border-border/40 backdrop-blur-sm shadow-sm transition-all hover:bg-card/80 active:scale-[0.99] group/player"
            >
              <PlayerAvatar
                name={p.user.alias ?? p.user.displayName}
                image={p.user.image ?? undefined}
                className="h-12 w-12 border-2 border-background shadow-sm transition-transform group-hover/player:scale-110"
              />
              <div className="flex-1 min-w-0">
                <p className="font-black text-foreground truncate leading-tight group-hover/player:text-primary transition-colors">{p.user.alias ?? p.user.displayName}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Nivel {p.user.level}</p>
              </div>
              {p.userId === turn.creatorId && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-primary border border-primary/20 shrink-0">Organizador</span>
              )}
            </Link>
          ))}
          {Array.from({ length: turn.maxPlayers - turn.players.length }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-3xl border-2 border-dashed border-border/40 bg-muted/5 p-4 text-muted-foreground/30 transition-all hover:bg-muted/10">
              <div className="h-12 w-12 rounded-full bg-muted/10 border-2 border-dashed border-muted/20" />
              <p className="text-[10px] font-black uppercase tracking-widest italic opacity-60">Cupo disponible</p>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none z-50">
        <div className="max-w-md mx-auto pointer-events-auto">
          {!viewerId ? (
            <Button asChild className="w-full rounded-2xl h-14 text-lg font-black shadow-2xl shadow-primary/30" size="lg">
              <Link href={`/login?callbackUrl=/t/${id}`}>
                Iniciá sesión para anotarte
              </Link>
            </Button>
          ) : isFull ? (
            <div className="flex flex-col gap-4">
              {viewerId === turn.creatorId && turn.status !== "COMPLETED" && (
                <StartMatchForm turnId={id} />
              )}
              <Button disabled className="w-full rounded-2xl h-14 opacity-50 bg-muted text-muted-foreground cursor-not-allowed" size="lg">
                {turn.status === "COMPLETED" ? "Turno finalizado" : "Turno completo"}
              </Button>
              {isJoined && turn.status !== "COMPLETED" && <LeaveTurnForm turnId={id} />}
            </div>
          ) : isJoined ? (
            <div className="flex flex-col gap-4">
              <div className="w-full rounded-2xl h-14 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 font-black text-lg shadow-inner">
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
      <Button type="submit" className="w-full rounded-2xl h-14 text-lg font-black shadow-2xl bg-emerald-500 hover:bg-emerald-600 text-white border-none transition-all active:scale-[0.98]" size="lg">
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
      <Button type="submit" variant="ghost" className="w-full text-destructive hover:bg-destructive/10 rounded-2xl h-10 font-black uppercase tracking-widest text-[10px] transition-all" size="sm">
        <LogOut className="mr-2 h-3.5 w-3.5" />
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
      <Button type="submit" className="w-full rounded-2xl h-14 text-lg font-black shadow-2xl shadow-primary/30 transition-all active:scale-[0.98]" size="lg">
        <UserPlus className="mr-2 h-6 w-6" />
        Anotarme ahora
      </Button>
    </form>
  );
}
