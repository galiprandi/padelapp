import { auth } from "@/auth";
import { getPendingActions } from "@/lib/match-queries";
import { PageHeader } from "@/components/page-header";
import { MatchResultCompact } from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const pendingActions = await getPendingActions(userId);

  return (
    <div className="flex flex-col gap-12 pb-8 animate-in fade-in duration-700">
      <PageHeader
        title="Notificaciones"
        description="Gestioná tus confirmaciones y cargas de resultados pendientes."
        size="lg"
        backHref="/me"
      />

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
              Acciones requeridas
            </h2>
            {pendingActions.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground animate-in zoom-in duration-300">
                {pendingActions.length}
              </span>
            )}
          </div>
        </div>

        {pendingActions.length > 0 ? (
          <div className="grid gap-3">
            {pendingActions.map((match, index) => {
              const needsScore = !match.score;
              return (
                <div
                  key={match.id}
                  className="animate-in fade-in slide-in-from-bottom-6 duration-700"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <MatchResultCompact
                    match={match}
                    detailUrl={needsScore ? `/match/${match.id}/result` : `/match/${match.id}`}
                    label={needsScore ? "Cargar resultado" : "Confirmación pendiente"}
                    viewerId={userId}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="pt-4">
            <EmptyState
              icon={BellOff}
              title="Todo al día"
              description="No tenés acciones pendientes por ahora. ¡Buen trabajo!"
              action={
                <Button className="w-full max-w-xs rounded-xl font-black" asChild>
                  <Link href="/me">Volver al inicio</Link>
                </Button>
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}
