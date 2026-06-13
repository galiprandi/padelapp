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
    <div className="flex flex-col gap-12 pb-8">
      <PageHeader
        title="Turnos abiertos"
        description="Unite a partidos de tu nivel o creá uno nuevo."
        size="lg"
        action={
          <Button asChild className="w-full md:w-auto rounded-xl h-11 font-black">
            <Link href="/turnos/nuevo">
              <Plus className="mr-2 h-5 w-5" />
              Crear turno
            </Link>
          </Button>
        }
      />

      <div className="hidden md:block">
        <Card className="rounded-3xl bg-card/50 backdrop-blur-sm p-6 border border-border/40 shadow-sm">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 space-y-1">
              <CardTitle className="text-base font-black">¿No encontrás tu partido?</CardTitle>
              <CardDescription className="text-xs">Creá un turno y compartí el link con tu grupo.</CardDescription>
            </div>
            <Button asChild className="rounded-xl px-8 font-black">
              <Link href="/turnos/nuevo">Crear turno</Link>
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-3">
        {turns.length > 0 ? (
          turns.map((turn) => (
            <TurnCard
              key={turn.id}
              turn={turn}
              isJoined={turn.players.some((p) => p.userId === session?.user?.id)}
              isCreator={turn.creatorId === session?.user?.id}
            />
          ))
        ) : (
          <EmptyState
            title="Sin turnos abiertos"
            description="No hay turnos disponibles en este momento. ¡Sé el primero en crear uno!"
            icon={CalendarOff}
            action={
              <Button asChild className="w-full max-w-xs rounded-xl h-11 font-black">
                <Link href="/turnos/nuevo">Crear turno ahora</Link>
              </Button>
            }
          />
        )}
      </div>

      <div className="fixed bottom-24 right-5 md:hidden z-40">
        <Button asChild size="icon" className="h-14 w-14 rounded-2xl shadow-2xl shadow-primary/40 active:scale-90 transition-all">
          <Link href="/turnos/nuevo">
            <Plus className="h-7 w-7" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
