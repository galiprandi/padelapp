import { auth } from "@/auth";
import { getTurnByIdAction, joinTurnAction, leaveTurnAction, convertTurnToMatchAction, cancelTurnAction } from "@/app/(app)/turnos/actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { PageHeader } from "@/components/page-header";
import { levelOptions } from "@/lib/mock-data";
import { Calendar, Clock, Trophy, LogOut, UserPlus, Play, Users, ChevronRight, Zap, Edit3, Trash2 } from "lucide-react";
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

  if (result.status !== "ok" || !result.turn) {
     notFound();
  }

  const turn = result.turn;
  const viewerId = session?.user?.id;
  const isJoined = turn.players.some((p) => p.userId === viewerId);
  const isCancelled = turn.status === "CANCELLED";

  if (isCancelled) {
     return (
      <main className="relative mx-auto min-h-screen w-full max-w-md space-y-10 px-6 py-10 pb-48 overflow-hidden">
        <PageHeader
          title="Turno cancelado"
          align="center"
          size="lg"
          description="Este turno ha sido cancelado por el organizador."
        />
        <div className="flex flex-col gap-4">
           <Button asChild className="w-full rounded-[2rem] h-16 text-lg font-black shadow-2xl shadow-primary/30 transition-all active:scale-[0.98]" size="lg">
             <Link href="/turnos">
                Ver otros turnos
             </Link>
           </Button>
        </div>
      </main>
    );
  }
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
    <main className="relative mx-auto min-h-screen w-full max-w-md space-y-10 px-6 py-10 pb-48 overflow-hidden">
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/10 blur-[120px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10 rounded-full" />

      <PageHeader
        title={turn.club}
        align="center"
        size="lg"
        description={
          <span className="flex flex-col items-center gap-3 mt-2">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
              <Zap className="h-3 w-3 fill-current animate-pulse" />
              Turno Abierto
            </span>
            <span className="flex items-center gap-2 capitalize font-black text-foreground/80 tracking-tight">
              <Calendar className="h-4 w-4 text-primary" />
              {dateStr}
            </span>
          </span>
        }
      />

      <Card className="relative rounded-[2.5rem] border-border/40 bg-card/40 shadow-2xl backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none opacity-40" />

        <CardHeader className="relative z-10 pb-6 pt-10 text-center">
          <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Especificaciones</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 grid grid-cols-2 gap-px bg-border/10 p-0">
          <div className="bg-card/30 p-8 flex flex-col items-center text-center gap-3 transition-colors hover:bg-card/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary/10 text-primary shadow-inner">
              <Clock className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">{timeStr}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-1">{turn.duration} min</p>
            </div>
          </div>

          <div className="bg-card/30 p-8 flex flex-col items-center text-center gap-3 transition-colors hover:bg-card/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary/10 text-primary shadow-inner">
              <Trophy className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">{suggestedLevelLabel}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-1">Nivel</p>
            </div>
          </div>

          <div className="col-span-2 bg-card/40 p-8 flex items-center justify-center gap-6 border-t border-border/20 transition-colors hover:bg-card/50">
             <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary/10 text-primary shrink-0 shadow-inner">
              <Users className="h-7 w-7" />
            </div>
            <div className="text-left">
              <p className="text-3xl font-black tracking-tight">{turn.players.length} / {turn.maxPlayers}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-1">Jugadores confirmados</p>
            </div>
          </div>
        </CardContent>
        {turn.notes && (
          <div className="bg-primary/5 p-8 text-center text-sm font-medium text-muted-foreground/80 border-t border-border/20 italic leading-relaxed">
            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 not-italic mb-2">Notas del organizador</span>
            "{turn.notes}"
          </div>
        )}
      </Card>

      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Lista de jugadores</h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            {turn.maxPlayers - turn.players.length} cupos disponibles
          </span>
        </div>
        <div className="grid gap-3">
          {turn.players.map((p, index) => (
            <Link
              key={p.id}
              href={`/p/${p.userId}`}
              className="flex items-center gap-4 rounded-[2rem] bg-card/40 p-5 border border-border/40 backdrop-blur-md shadow-sm transition-all hover:bg-card/60 active:scale-[0.98] group/player animate-in fade-in slide-in-from-bottom-6 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PlayerAvatar
                name={p.user.alias ?? p.user.displayName}
                image={p.user.image ?? undefined}
                className="h-14 w-14 border-2 border-background shadow-md transition-transform group-hover/player:scale-105"
              />
              <div className="flex-1 min-w-0">
                <p className="font-black text-foreground text-lg truncate leading-tight group-hover/player:text-primary transition-colors tracking-tight">{p.user.alias ?? p.user.displayName}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Nivel {p.user.level}</p>
              </div>
              <div className="flex items-center gap-3">
                {p.userId === turn.creatorId && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-primary border border-primary/20 shrink-0">Organizador</span>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground/20 group-hover/player:text-primary/40 transition-colors" />
              </div>
            </Link>
          ))}
          {Array.from({ length: turn.maxPlayers - turn.players.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center gap-4 rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/5 p-5 text-primary/30 transition-all hover:bg-primary/10 animate-in fade-in slide-in-from-bottom-6 duration-1000"
              style={{ animationDelay: `${(turn.players.length + i) * 100}ms` }}
            >
              <div className="h-14 w-14 rounded-full bg-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center text-2xl grayscale opacity-20">
                🎾
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic opacity-40">Lugar reservado</p>
                <p className="text-[11px] font-black uppercase tracking-widest mt-1 opacity-20">Esperando jugador...</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none z-50 pb-12">
        <div className="max-w-md mx-auto pointer-events-auto animate-in slide-in-from-bottom-10 duration-1000 fill-mode-both">
          {!viewerId ? (
            <Button asChild className="w-full rounded-[2rem] h-16 text-lg font-black shadow-2xl shadow-primary/30 transition-all active:scale-[0.98]" size="lg">
              <Link href={`/login?callbackUrl=/t/${id}`}>
                Iniciá sesión para anotarte
              </Link>
            </Button>
          ) : isFull ? (
            <div className="flex flex-col gap-4">
              {viewerId === turn.creatorId && turn.status !== "COMPLETED" && (
                <>
                  <StartMatchForm turnId={id} />
                  <div className="flex gap-4">
                    <Button asChild variant="outline" className="flex-1 rounded-2xl h-12 font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98] border-primary/20 text-primary">
                      <Link href={`/turnos/${id}/editar`}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                    <CancelTurnForm turnId={id} />
                  </div>
                </>
              )}
              <Button disabled className="w-full rounded-[2rem] h-16 opacity-50 bg-muted text-muted-foreground cursor-not-allowed font-black" size="lg">
                {turn.status === "COMPLETED" ? "Turno finalizado" : "Turno completo"}
              </Button>
              {isJoined && turn.status !== "COMPLETED" && <LeaveTurnForm turnId={id} />}
            </div>
          ) : isJoined ? (
            <div className="flex flex-col gap-4">
              <div className="w-full rounded-[2rem] h-16 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 font-black text-xl shadow-inner animate-in zoom-in-95 duration-500">
                ¡Ya estás anotado!
              </div>
              {viewerId === turn.creatorId && (
                 <div className="flex gap-4">
                    <Button asChild variant="outline" className="flex-1 rounded-2xl h-12 font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98] border-primary/20 text-primary">
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
            <div className="flex flex-col gap-4">
               {viewerId === turn.creatorId && (
                 <div className="flex gap-4">
                    <Button asChild variant="outline" className="flex-1 rounded-2xl h-12 font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98] border-primary/20 text-primary">
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
      <Button type="submit" variant="ghost" className="w-full text-destructive hover:bg-destructive/10 rounded-2xl h-12 font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98]" size="sm">
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
      <Button type="submit" className="w-full rounded-[2rem] h-16 text-lg font-black shadow-2xl bg-emerald-500 hover:bg-emerald-600 text-white border-none transition-all active:scale-[0.98] shadow-emerald-500/20" size="lg">
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
      <Button type="submit" variant="ghost" className="w-full text-destructive hover:bg-destructive/10 rounded-2xl h-12 font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98]" size="sm">
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
      <Button type="submit" className="w-full rounded-[2rem] h-16 text-lg font-black shadow-2xl shadow-primary/30 transition-all active:scale-[0.98]" size="lg">
        <UserPlus className="mr-2 h-6 w-6" />
        Anotarme ahora
      </Button>
    </form>
  );
}
