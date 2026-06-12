import { auth } from "@/auth";
import { MatchResultCompact } from "@/components/matches/match-result-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getEnhancedUserMatches } from "@/lib/match-queries";
import Link from "next/link";
import { PlusCircle, CalendarOff, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MatchListPage() {
  const session = await auth();
  const viewerId = session?.user?.id;

  const matches = viewerId ? await getEnhancedUserMatches(viewerId) : [];

  return (
    <div className="flex flex-col gap-12 pb-8 animate-in fade-in duration-700">
      <PageHeader
        title="Partidos"
        description="Revisá tus partidos jugados y compartí el marcador con tu equipo."
        size="lg"
        backHref="/me"
        action={
          <Button asChild className="w-full justify-center py-2 text-base rounded-2xl font-black h-12 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
            <Link href="/match/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              Crear Partido
            </Link>
          </Button>
        }
      />

      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">Historial de partidos</h2>
        </div>

        <div className="grid gap-4">
          {viewerId ? (
            matches.length > 0 ? (
              matches.map((match) => (
                <MatchResultCompact key={match.id} match={match} detailUrl={`/match/${match.id}`} />
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
