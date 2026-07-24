import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { TurnCard } from "@/components/turns/turn-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCachedOpenTurns } from "@/lib/queries";
import Link from "next/link";
import { CalendarOff, Plus } from "lucide-react";
import { auth } from "@/auth";

export default function TurnsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Turnos abiertos</h1>
          <p className="text-sm text-muted-foreground">
            Unite a partidos de tu nivel.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/turnos/nuevo">
            <Plus className="mr-1 h-4 w-4" />
            Crear
          </Link>
        </Button>
      </div>

      <Suspense fallback={<TurnsListSkeleton />}>
        <TurnsList />
      </Suspense>
    </div>
  );
}

async function TurnsList() {
  const session = await auth();
  const turns = await getCachedOpenTurns();

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Próximos turnos</h2>
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
          {turns.length} {turns.length === 1 ? "disponible" : "disponibles"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {turns.length > 0 ? (
          turns.map((turn) => (
            <TurnCard
              key={turn.id}
              turn={turn}
              isJoined={turn.players.some(
                (p) => p.userId === session?.user?.id,
              )}
              isSubstitute={turn.substitutes?.some(
                (s) => s.userId === session?.user?.id,
              )}
              isCreator={turn.creatorId === session?.user?.id}
            />
          ))
        ) : (
          <EmptyState
            title="Sin turnos abiertos"
            description="No hay turnos disponibles. ¡Sé el primero en crear uno!"
            icon={CalendarOff}
            action={
              <Button asChild className="w-full">
                <Link href="/turnos/nuevo">Crear turno</Link>
              </Button>
            }
          />
        )}
      </div>
    </section>
  );
}

function TurnsListSkeleton() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </section>
  );
}
