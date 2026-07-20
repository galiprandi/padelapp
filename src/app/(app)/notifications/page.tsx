import { Suspense } from "react";
import { auth } from "@/auth";
import { getPendingActions } from "@/lib/queries";
import { MatchResultCompact } from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Notificaciones</h1>
        <p className="text-sm text-muted-foreground">
          Confirmaciones y resultados pendientes.
        </p>
      </div>

      <Suspense fallback={<NotificationsListSkeleton />}>
        <NotificationsList />
      </Suspense>
    </div>
  );
}

async function NotificationsList() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const pendingActions = await getPendingActions(userId);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-foreground">
          Acciones requeridas
        </h2>
        {pendingActions.length > 0 && (
          <span className="rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
            {pendingActions.length}
          </span>
        )}
      </div>

      {pendingActions.length > 0 ? (
        <div className="space-y-2">
          {pendingActions.map((match) => {
            const needsScore = !match.score;
            return (
              <MatchResultCompact
                key={match.id}
                match={match}
                detailUrl={
                  needsScore
                    ? `/match/${match.id}/result`
                    : `/match/${match.id}`
                }
                label={needsScore ? "Cargar resultado" : "Confirmar"}
                viewerId={userId}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BellOff}
          title="Todo al día"
          description="No tenés acciones pendientes por ahora."
          action={
            <Button asChild className="w-full">
              <Link href="/me">Volver al inicio</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}

function NotificationsListSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-8 rounded-md" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
