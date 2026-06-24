import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { TurnCard } from "@/components/turns/turn-card";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CalendarOff, Plus } from "lucide-react";
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
    <div className="relative flex flex-col gap-12 pb-8 animate-in fade-in duration-1000">
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-primary/5 blur-[100px] -z-10" />

      <PageHeader
        title="Turnos abiertos"
        description="Unite a partidos de tu nivel o creá uno nuevo."
        size="lg"
        descriptionClassName="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50"
        backHref="/me"
        action={
          <Button asChild className="w-full rounded-2xl font-black h-14 shadow-lg shadow-primary/20 active:scale-[0.98]">
            <Link href="/turnos/nuevo">
              <Plus className="mr-2 h-5 w-5" />
              Crear turno
            </Link>
          </Button>
        }
      />

      <div className="hidden md:block animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 fill-mode-both">
        <Card className="rounded-[2.5rem] bg-card/50 backdrop-blur-md p-10 border border-border/40 shadow-xl shadow-primary/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-3xl -z-10 rounded-full" />
          <div className="flex items-center justify-between gap-8">
            <div className="flex-1 space-y-3">
              <CardTitle className="text-2xl font-black">¿No encontrás tu partido?</CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 leading-relaxed max-w-sm">
                Creá un turno y compartí el link con tu grupo para completar los cupos rápidamente.
              </CardDescription>
            </div>
            <Button asChild className="rounded-2xl h-14 px-10 font-black shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
              <Link href="/turnos/nuevo">Crear turno ahora</Link>
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            Próximos turnos
          </h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-1 rounded-lg">
            {turns.length} {turns.length === 1 ? 'Disponible' : 'Disponibles'}
          </span>
        </div>

        <div className="grid gap-3">
          {turns.length > 0 ? (
            turns.map((turn, index) => (
              <div
                key={turn.id}
                className="animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <TurnCard
                  turn={turn}
                  isJoined={turn.players.some((p) => p.userId === session?.user?.id)}
                  isCreator={turn.creatorId === session?.user?.id}
                />
              </div>
            ))
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
              <EmptyState
                title="Sin turnos abiertos"
                description="No hay turnos disponibles en este momento. ¡Sé el primero en crear uno!"
                icon={CalendarOff}
                action={
                  <Button asChild className="w-full max-w-xs rounded-2xl h-14 font-black shadow-lg shadow-primary/20">
                    <Link href="/turnos/nuevo">Crear turno ahora</Link>
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-24 right-6 md:hidden z-40 animate-in slide-in-from-bottom-8 duration-700 fill-mode-both">
        <Button asChild size="icon" className="h-16 w-16 rounded-[1.25rem] shadow-2xl shadow-primary/40 active:scale-90 transition-all border-4 border-background">
          <Link href="/turnos/nuevo">
            <Plus className="h-8 w-8 stroke-[3]" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
