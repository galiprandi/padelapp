import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCachedOpenTurns, getPadelContacts } from "@/lib/queries";
import { TurnsFilter } from "@/components/turns/turns-filter";
import Link from "next/link";
import { Plus } from "lucide-react";
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
  let contacts: any[] = [];
  if (session?.user?.id) {
    contacts = await getPadelContacts(session.user.id);
  }

  return (
    <TurnsFilter
      turns={turns}
      userId={session?.user?.id ?? null}
      contacts={contacts}
    />
  );
}

function TurnsListSkeleton() {
  return (
    <section className="flex flex-col gap-3">
      {/* Skeleton for tab filter bar */}
      <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </section>
  );
}
