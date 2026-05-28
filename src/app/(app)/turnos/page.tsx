import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { TurnCard } from "@/components/turns/turn-card";
import { prisma } from "@/lib/prisma";
import { levelOptions } from "@/lib/mock-data";
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Turnos abiertos"
        description="Unite a partidos de tu nivel o creá uno nuevo."
        action={
          <Button asChild className="w-full md:w-auto rounded-xl">
            <Link href="/turnos/nuevo">
              <Plus className="mr-2 h-5 w-5" />
              Crear turno
            </Link>
          </Button>
        }
      />

      <div className="hidden md:block">
        <Card className="rounded-3xl border-none bg-card/50 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <CardTitle className="text-base">¿No encontrás tu partido?</CardTitle>
              <CardDescription>Creá un turno y compartí el link con tu grupo.</CardDescription>
            </div>
            <Button asChild className="rounded-full px-8">
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
            />
          ))
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

      <div className="fixed bottom-24 right-5 md:hidden">
        <Button asChild size="lg" className="h-14 w-14 rounded-full shadow-2xl">
          <Link href="/turnos/nuevo">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
