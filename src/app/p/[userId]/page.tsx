import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
import { MatchResultCompact, type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { Trophy, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PublicProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      alias: true,
      image: true,
      level: true,
      rankingScore: true,
      rankingPosition: true,
      rankingDelta: true,
      wins: true,
      losses: true,
      matchesPlayed: true,
    },
  });

  if (!user) {
    notFound();
  }

  const matches = await prisma.match.findMany({
    where: {
      status: "CONFIRMED",
      players: {
        some: { userId },
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
      date: "desc",
    },
    take: 5,
  });

  const formattedMatches = matches.map<MatchResultCompactMatch>((match) => ({
    id: match.id,
    createdAt: match.date,
    score: match.score,
    status: match.status,
    date: match.date,
    players: match.players.map((player) => {
      const preferredName = player.user && player.user.alias
        ? player.user.alias
        : player.user?.displayName;
      return {
        id: player.id,
        position: player.position,
        displayName: player.displayName,
        user: player.user
          ? {
            id: player.user.id,
            displayName: preferredName ?? null,
            image: player.user.image ?? undefined,
          }
          : null,
      };
    }),
  }));

  const displayName = user.alias ?? user.displayName ?? "Jugador";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-12 px-6 py-10 pb-20 animate-in fade-in duration-700">
      <section className="space-y-6">
        <PageHeader
          title={displayName}
          description={`Perfil de jugador de pádel • Nivel ${user.level}`}
          size="lg"
          align="center"
        />

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <UserRankingBanner
            position={user.rankingPosition}
            score={user.rankingScore}
            delta={user.rankingDelta}
            wins={user.wins}
            losses={user.losses}
            level={user.level}
          />
        </div>
      </section>

      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
            Últimos partidos
          </h2>
        </div>
        <div className="grid gap-3">
          {formattedMatches.length > 0 ? (
            formattedMatches.map((match) => (
              <MatchResultCompact
                key={match.id}
                match={match}
                detailUrl={`/match/${match.id}`}
              />
            ))
          ) : (
            <EmptyState
              icon={Trophy}
              title="Sin resultados todavía"
              description="Este jugador aún no tiene partidos confirmados."
            />
          )}
        </div>
      </section>

      <div className="flex flex-col gap-3 pt-4">
        <Button asChild variant="outline" className="w-full rounded-xl font-black">
          <Link href="/ranking">Volver al ranking</Link>
        </Button>
      </div>
    </div>
  );
}
