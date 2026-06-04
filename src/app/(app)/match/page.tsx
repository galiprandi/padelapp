import { auth } from "@/auth";
import { MatchResultCompact, type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, CalendarOff, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

async function getUserMatches(userId: string): Promise<MatchResultCompactMatch[]> {
  const matches = await prisma.match.findMany({
    where: {
      players: {
        some: {
          userId,
        },
      },
    },
    include: {
      players: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 20,
  });

  return matches.map((match) => ({
    id: match.id,
    createdAt: match.updatedAt ?? match.createdAt,
    score: match.score,
    status: match.status,
    players: match.players.map((player) => ({
      id: player.id,
      position: player.position,
      displayName: player.displayName,
      user: player.user
        ? {
          id: player.user.id,
          displayName: player.user.displayName,
          image: player.user.image,
        }
        : null,
    })),
  }));
}

export default async function MatchListPage() {
  const session = await auth();
  const viewerId = session?.user?.id;

  const matches = viewerId ? await getUserMatches(viewerId) : [];

  return (
    <div className="flex flex-col gap-12 pb-8 animate-in fade-in duration-700">
      <PageHeader
        title="Partidos"
        description="Revisá tus partidos jugados y compartí el marcador con tu equipo."
        size="lg"
        action={
          <Button asChild className="w-full justify-center py-2 text-base rounded-xl font-black h-11 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
            <Link href="/match/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              Crear Partido
            </Link>
          </Button>
        }
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-black tracking-tight uppercase tracking-widest text-[11px] text-muted-foreground/70">Historial de partidos</h2>
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
                  <Button asChild className="w-full max-w-xs rounded-xl font-bold active:scale-[0.98] transition-all">
                    <Link href="/match/new">Crear partido</Link>
                  </Button>
                }
              />
            )
          ) : (
            <Card className="rounded-[2.5rem] border-border/40 bg-card/50 backdrop-blur-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-500">
              <CardHeader className="space-y-2 pt-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl shadow-inner mb-2">
                  🎾
                </div>
                <CardTitle className="text-xl font-black">Iniciá sesión</CardTitle>
                <CardDescription className="font-medium">Ingresá con Google para ver tus partidos recientes y el ranking.</CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <Button asChild className="w-full rounded-xl font-black h-12 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
                  <Link href="/login">Ir al login</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {viewerId && (
        <div className="fixed bottom-24 right-5 md:hidden z-40 animate-in slide-in-from-bottom-8 duration-700">
          <Button asChild size="icon" className="h-14 w-14 rounded-2xl shadow-2xl shadow-primary/40 active:scale-90 transition-all">
            <Link href="/match/new">
              <Plus className="h-7 w-7" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
