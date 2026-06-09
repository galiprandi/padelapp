import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { MatchResultCompact } from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { getEnhancedUserMatches, getPendingActions } from "@/lib/match-queries";
import { Bell, BellOff } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const allPendingMatches = await getEnhancedUserMatches(userId, "PENDING");
  const now = new Date();

  // We only show matches that already happened (need score or confirmation)
  const pendingActions = getPendingActions(allPendingMatches, now);

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-500">
      <PageHeader
        title="Notificaciones"
        description="Acciones pendientes que requieren tu atención."
        icon={<Bell className="h-6 w-6 text-primary" />}
        size="lg"
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Pendientes de acción</h2>
        </div>

        <div className="grid gap-3">
          {pendingActions.length > 0 ? (
            pendingActions.map((match) => {
              const needsScore = !match.score;
              return (
                <MatchResultCompact
                  key={match.id}
                  match={match}
                  detailUrl={needsScore ? `/match/${match.id}/result` : `/match/${match.id}`}
                  label={needsScore ? "Cargar resultado" : "Confirmación pendiente"}
                />
              );
            })
          ) : (
            <EmptyState
              icon={BellOff}
              title="Todo al día"
              description="No tenés acciones pendientes por ahora. ¡Seguí jugando!"
              className="py-12"
            />
          )}
        </div>
      </section>
    </div>
  );
}
