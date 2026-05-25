import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { levelLabels } from "@/lib/constants";
import Link from "next/link";
import { CalendarOff, Plus, Search, MapPin, Users, Trophy, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function TurnsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; club?: string }>;
}) {
  const { level, club } = await searchParams;
  const session = await auth();
  const viewerId = session?.user?.id;

  const turns = await prisma.turn.findMany({
    where: {
      status: "OPEN",
      ...(level ? { suggestedLevel: parseInt(level) } : {}),
      ...(club ? { club: { contains: club, mode: "insensitive" } } : {}),
    },
    include: {
      creator: true,
      _count: { select: { players: true } },
      players: {
        where: { userId: viewerId },
        select: { id: true },
      },
    },
    orderBy: { date: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Turnos abiertos"
        description="Compartí el link con tu equipo o únete al vuelo a partidos de tu nivel."
        action={
          <Button asChild className="rounded-full">
            <Link href="/turnos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Crear turno
            </Link>
          </Button>
        }
      />

      <form className="rounded-3xl border border-border/60 bg-muted/20 p-5 backdrop-blur-sm space-y-4">
        <div className="space-y-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 px-1">Filtrar por nivel</h3>
          <select
            name="level"
            defaultValue={level ?? ""}
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          >
            <option value="">Todos los niveles</option>
            {Object.entries(levelLabels).map(([val, label]) => (
              <option key={val} value={val}>
                Nivel {val} · {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 px-1">Ubicación</h3>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="club"
                defaultValue={club ?? ""}
                placeholder="Buscar club o ciudad"
                className="rounded-xl pl-9 h-11 bg-background"
              />
            </div>
            <Button type="submit" size="icon" className="h-11 w-11 rounded-xl">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>

      <div className="grid gap-4">
        {turns.length > 0 ? (
          turns.map((turn) => {
            const isJoined = turn.players.length > 0;
            const formattedDate = new Intl.DateTimeFormat("es-AR", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }).format(turn.date);

            return (
              <Link key={turn.id} href={`/t/${turn.id}`}>
                <div className={cn(
                  "relative overflow-hidden rounded-3xl border p-5 shadow-sm transition-all active:scale-[0.98]",
                  isJoined
                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/50 bg-card hover:border-primary/30"
                )}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg">{turn.club}</h4>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium capitalize">{formattedDate} · {turn.duration}m</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-full border border-border/50">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-bold">{turn._count.players}/{turn.maxPlayers}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2 text-primary">
                        <Trophy className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase">Nivel {turn.suggestedLevel}</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {levelLabels[turn.suggestedLevel]}
                      </span>
                    </div>
                    {isJoined && (
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-2 py-1 rounded-md">
                        Inscripto
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <EmptyState
            title="Sin turnos abiertos"
            description="No hay turnos que coincidan con tu búsqueda. ¡Sé el primero en crear uno!"
            icon={CalendarOff}
            action={
              <Button asChild size="sm" className="w-full max-w-xs rounded-full">
                <Link href="/turnos/nuevo">Crear turno ahora</Link>
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
