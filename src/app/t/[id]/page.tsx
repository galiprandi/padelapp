import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { levelLabels } from "@/lib/constants";
import { Trophy, Users, Clock, MapPin, CheckCircle2, UserPlus } from "lucide-react";
import { joinTurnAction } from "@/app/(app)/turnos/actions";
import { revalidatePath } from "next/cache";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const turn = await prisma.turn.findUnique({
    where: { id },
  });

  if (!turn) return { title: "Turno no encontrado" };

  return {
    title: `Turno en ${turn.club} | PadelApp`,
    description: `Únete al turno de pádel el ${new Intl.DateTimeFormat("es-AR", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(turn.date)}.`,
  };
}

export default async function TurnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const viewerId = session?.user?.id;

  const turn = await prisma.turn.findUnique({
    where: { id },
    include: {
      creator: true,
      players: {
        include: { user: true },
      },
      _count: { select: { players: true } },
    },
  });

  if (!turn) {
    notFound();
  }

  const isJoined = turn.players.some((p) => p.userId === viewerId);
  const isFull = turn.players.length >= turn.maxPlayers;

  const formattedDate = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(turn.date);

  async function handleJoin() {
    "use server";
    if (!viewerId) redirect("/login");
    await joinTurnAction(id);
    revalidatePath(`/t/${id}`);
  }

  return (
    <div className="mx-auto max-w-md flex flex-col gap-6 px-4 py-8">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="bg-primary/10 p-3 rounded-full mb-2">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">{turn.club}</h1>
        <p className="text-muted-foreground font-medium capitalize">{formattedDate}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Nivel</span>
          <span className="font-bold">Nivel {turn.suggestedLevel}</span>
          <span className="text-xs text-muted-foreground">{levelLabels[turn.suggestedLevel]}</span>
        </div>
        <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Cupos</span>
          <span className="font-bold">{turn._count.players} / {turn.maxPlayers}</span>
          <span className="text-xs text-muted-foreground">Jugadores unidos</span>
        </div>
      </div>

      <div className="bg-muted/30 border border-border/50 rounded-3xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Ubicación</span>
            <span className="font-semibold">{turn.club}</span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Duración</span>
            <span className="font-semibold">{turn.duration} minutos</span>
          </div>
        </div>
        {turn.notes && (
          <div className="flex items-start gap-3 pt-2 border-t border-border/50">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-1">Notas del organizador</span>
              <p className="text-sm text-muted-foreground italic">"{turn.notes}"</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70 px-1 text-center">Jugadores inscriptos</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {turn.players.map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center font-bold text-primary">
                {p.user.alias?.[0] ?? p.user.displayName[0]}
              </div>
              <span className="text-[10px] font-bold max-w-[60px] truncate">{p.user.alias ?? p.user.displayName}</span>
            </div>
          ))}
          {Array.from({ length: turn.maxPlayers - turn.players.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex flex-col items-center gap-1 opacity-40">
              <div className="h-12 w-12 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-[10px] font-bold">Libre</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border/50 max-w-md mx-auto z-50">
        {isJoined ? (
          <Button disabled className="w-full h-14 rounded-2xl bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/10 opacity-100">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Ya estás inscripto
          </Button>
        ) : isFull ? (
          <Button disabled className="w-full h-14 rounded-2xl opacity-70">
            Cupo completo
          </Button>
        ) : (
          <form action={handleJoin}>
            <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20">
              <UserPlus className="mr-2 h-6 w-6" />
              Anotarme ahora
            </Button>
          </form>
        )}
      </div>

      {/* Spacer for fixed bottom */}
      <div className="h-20" />
    </div>
  );
}
