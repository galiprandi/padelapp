import { auth } from "@/auth";
import { MatchResultCompact } from "@/components/matches/match-result-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getEnhancedUserMatches, getPendingActions } from "@/lib/match-queries";
import Link from "next/link";
import { PlusCircle, CalendarOff, Plus, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MatchListPage() {
  const session = await auth();
  const viewerId = session?.user?.id;

  const [matches, pendingActions] = await Promise.all([
    viewerId ? getEnhancedUserMatches(viewerId) : Promise.resolve([]),
    viewerId ? getPendingActions(viewerId) : Promise.resolve([]),
  ]);

  // Agrupar partidos por mes y año
  const groupedMatches = matches.reduce((groups: Record<string, typeof matches>, match) => {
    const date = new Date(match.date || match.createdAt);
    const month = date.toLocaleString("es-AR", { month: "long" });
    const year = date.getFullYear();
    const key = `${month} ${year}`;

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(match);
    return groups;
  }, {});

  return (
    <div className="flex flex-col gap-12 pb-8 animate-in fade-in duration-700">
      <PageHeader
        title="Partidos"
        description="Revisá tus partidos jugados y gestioná tus resultados pendientes."
        size="lg"
        backHref="/me"
        action={
          <Button asChild className="w-full rounded-2xl font-black h-14 shadow-lg shadow-primary/20 active:scale-[0.98]">
            <Link href="/match/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              Crear Partido
            </Link>
          </Button>
        }
      />

      {pendingActions.length > 0 && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                Acciones pendientes
              </h2>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground animate-in zoom-in duration-300">
                {pendingActions.length}
              </span>
            </div>
            {pendingActions.length > 3 && (
              <Button variant="link" size="sm" asChild className="text-primary font-black uppercase tracking-widest text-[10px] h-auto p-0 flex items-center gap-1 active:scale-95 transition-transform">
                <Link href="/notifications">
                  Ver todas
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
          <div className="grid gap-3">
            {pendingActions.slice(0, 3).map((match) => {
              const needsScore = !match.score;
              return (
                <MatchResultCompact
                  key={match.id}
                  match={match}
                  detailUrl={needsScore ? `/match/${match.id}/result` : `/match/${match.id}`}
                  label={needsScore ? "Cargar resultado" : "Confirmación pendiente"}
                  viewerId={viewerId}
                />
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-8">
        <div className="flex items-center justify-between px-1 border-b border-border/10 pb-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Historial de partidos</h2>
        </div>

        <div className="space-y-12">
          {viewerId ? (
            matches.length > 0 ? (
              Object.entries(groupedMatches).map(([monthYear, monthMatches], groupIdx) => (
                <div key={monthYear} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${groupIdx * 100}ms` }}>
                  <div className="flex items-center gap-4 px-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/20 to-transparent" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 whitespace-nowrap">
                      {monthYear}
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/20 to-transparent" />
                  </div>
                  <div className="grid gap-4">
                    {monthMatches.map((match) => (
                      <MatchResultCompact
                        key={match.id}
                        match={match}
                        detailUrl={`/match/${match.id}`}
                        viewerId={viewerId}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="Sin partidos todavía"
                description="Todavía no participaste de ningún partido. Cuando quieras, podés crear uno nuevo y gestionarlo desde acá."
                icon={CalendarOff}
                action={
                  <div className="flex flex-col w-full gap-3">
                    <Button asChild className="w-full rounded-2xl font-black h-12 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
                      <Link href="/match/new">Crear partido</Link>
                    </Button>
                  </div>
                }
              />
            )
          ) : (
            <Card className="rounded-[2.5rem] border-primary/10 bg-card/50 backdrop-blur-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-500 border">
              <CardHeader className="space-y-4 pt-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[2rem] bg-primary/10 text-3xl shadow-inner mb-2 animate-pulse">
                  🎾
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-black tracking-tight">Iniciá sesión</CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground/80 px-6">
                    Ingresá con Google para ver tus partidos recientes, el ranking y estadísticas detalladas.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-10 px-8">
                <Button asChild className="w-full rounded-2xl font-black h-14 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all text-lg">
                  <Link href="/login">Ir al login</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {viewerId && (
        <div className="fixed bottom-24 right-6 md:hidden z-40 animate-in slide-in-from-bottom-8 duration-700">
          <Button asChild size="icon" className="h-16 w-16 rounded-[1.25rem] shadow-2xl shadow-primary/40 active:scale-90 transition-all border-4 border-background">
            <Link href="/match/new">
              <Plus className="h-8 w-8 stroke-[3]" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
