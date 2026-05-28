import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { levelOptions } from "@/lib/mock-data";
import Link from "next/link";
import { CalendarOff, MapPin, Clock, Users, Trophy, Plus } from "lucide-react";
import { auth } from "@/auth";

export default async function TurnsPage() {
  const session = await auth();

  const turns = await prisma.turn.findMany({
    where: {
      date: {
        gte: new Date(),
      },
      status: {
        in: ["OPEN", "FULL"],
      },
    },
    include: {
      players: true,
      creator: true,
    },
    orderBy: {
      date: "asc",
    },
    take: 20,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Turnos abiertos"
        description="Unite a partidos de tu nivel o creá uno nuevo para compartir."
        action={
          <Button asChild className="w-full justify-center py-2 text-base rounded-xl shadow-sm shadow-primary/20">
            <Link href="/turnos/nuevo">
              <Plus className="mr-2 h-5 w-5" />
              Crear turno
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4">
        {turns.length > 0 ? (
          turns.map((turn) => {
            const levelLabel = levelOptions.find(l => l.value === turn.suggestedLevel.toString())?.label ?? turn.suggestedLevel;
            const timeStr = new Date(turn.date).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const dateStr = new Date(turn.date).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            });

            return (
              <Link key={turn.id} href={`/t/${turn.id}`}>
                <Card className="overflow-hidden rounded-3xl border border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80 active:scale-[0.98]">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="flex flex-col items-center justify-center bg-primary/10 px-4 py-4 text-primary min-w-[70px]">
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">{dateStr.split(" ")[1]}</span>
                        <span className="text-2xl font-black leading-none mt-1">{dateStr.split(" ")[0]}</span>
                      </div>
                      <div className="flex flex-1 flex-col justify-center p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-foreground">{turn.club}</h3>
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {timeStr}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {turn.players.length}/{turn.maxPlayers}
                              </span>
                              <span className="flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                {levelLabel}
                              </span>
                            </div>
                          </div>
                          {turn.status === "FULL" && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">Completo</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : (
          <EmptyState
            title="Sin turnos abiertos"
            description="No hay turnos disponibles en este momento. ¡Sé el primero en crear uno!"
            icon={CalendarOff}
            action={
              <Button asChild className="w-full max-w-xs rounded-full">
                <Link href="/turnos/nuevo">Crear turno</Link>
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
