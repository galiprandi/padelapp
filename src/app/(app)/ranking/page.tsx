import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
import { RankingSearch } from "@/components/ranking/ranking-search";
import { prisma } from "@/lib/prisma";
import { Trophy, History, Users } from "lucide-react";
import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { PlayerAvatar } from "@/components/players/player-avatar";
import Link from "next/link";
import { RankingListItem } from "@/components/ranking/ranking-list-item";

interface RankingPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function RankingPage({ searchParams }: RankingPageProps) {
  const session = await auth();
  const viewerId = session?.user?.id;
  const { q: query } = await searchParams;

  // Fetch players with attendanceScore and lastMatchAt from User table
  const players = await prisma.user.findMany({
    where: query ? {
      OR: [
        { displayName: { contains: query, mode: 'insensitive' } },
        { alias: { contains: query, mode: 'insensitive' } },
      ]
    } : undefined,
    orderBy: [
      { rankingScore: "desc" },
      { attendanceScore: "desc" },
      { wins: "desc" },
      { lastMatchAt: "desc" },
      { displayName: "asc" },
    ],
    take: query ? 20 : 50,
    include: {
      matchPlayers: {
        where: {
          match: {
            status: "CONFIRMED"
          }
        },
        orderBy: {
          match: {
            date: "desc"
          }
        },
        take: 5,
        include: {
          match: true
        }
      }
    }
  });

  const currentUser = viewerId ? await prisma.user.findUnique({
    where: { id: viewerId },
    include: {
      matchPlayers: {
        where: { match: { status: "CONFIRMED" } },
        orderBy: { match: { date: "desc" } },
        take: 5,
        include: { match: true }
      }
    }
  }) : null;

  const topThree = !query ? players.slice(0, 3) : [];
  const listPlayers = !query ? players.slice(3) : players;

  // Get the most recent update time from the database
  const lastUpdateRaw = await prisma.user.aggregate({
    _max: { updatedAt: true }
  });
  const lastUpdate = lastUpdateRaw._max.updatedAt || new Date();

  return (
    <div className="flex flex-col gap-12 pb-8 animate-in fade-in duration-1000">
      <div className="space-y-4">
        <PageHeader
          title="Ranking"
          description="Posiciones actualizadas según resultados confirmados y actividad reciente."
          size="lg"
        />
        <div className="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          <History className="h-3 w-3" />
          Actualizado el {lastUpdate.toLocaleDateString()} a las {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="px-1">
        <RankingSearch />
      </div>

      {currentUser && currentUser.matchesPlayed > 0 && !query && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          <UserRankingBanner
            position={currentUser.rankingPosition}
            score={currentUser.rankingScore}
            delta={currentUser.rankingDelta}
            wins={currentUser.wins}
            losses={currentUser.losses}
            level={currentUser.level}
            attendanceScore={currentUser.attendanceScore}
            matchesPlayed={currentUser.matchesPlayed}
          />
        </div>
      )}

      <Tabs defaultValue="individual" className="w-full">
        <div className="space-y-6">
          <TabsList className="bg-muted/40 p-1 rounded-2xl h-12 border border-border/20 backdrop-blur-sm w-full">
            <TabsTrigger value="individual" className="flex-1 rounded-xl h-full font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 transition-all uppercase tracking-widest text-[10px]">
              Ranking Individual
            </TabsTrigger>
          </TabsList>

          <RankingSearch />
        </div>

        <TabsContent value="individual" className="space-y-6 pt-6">
          {players.length > 0 ? (
            <>
              {!query && topThree.length > 0 && (
                <div className="space-y-4">
                  <div className="px-2">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                      Podio de Honor
                    </h2>
                  </div>
                  {/* Podium Section */}
                  <div className="relative p-6 rounded-[2.5rem] border border-border/40 bg-card/30 backdrop-blur-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/5 blur-3xl -z-10" />

                    <div className="grid grid-cols-3 items-end gap-2 relative z-10">
                      {/* 2nd Place */}
                      {topThree[1] && (
                        <Link href={`/p/${topThree[1].id}`} className="flex flex-col items-center gap-2 group/podium transition-all hover:scale-105 active:scale-95">
                          <div className="relative">
                            <PlayerAvatar
                              name={topThree[1].alias ?? topThree[1].displayName ?? "Player"}
                              image={topThree[1].image ?? undefined}
                              size={64}
                              className="border-4 border-slate-300 shadow-xl"
                            />
                            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-[10px] font-black text-slate-700 shadow-md border-2 border-background">
                              2
                            </div>
                          </div>
                          <div className="text-center w-full">
                            <p className="text-[11px] font-black truncate max-w-full px-1 group-hover/podium:text-primary transition-colors">
                              {topThree[1].alias ?? topThree[1].displayName}
                            </p>
                            <p className="text-[10px] font-black text-muted-foreground">
                              {Math.round(topThree[1].rankingScore)} pts
                            </p>
                          </div>
                        </Link>
                      )}

                      {/* 1st Place */}
                      {topThree[0] && (
                        <Link href={`/p/${topThree[0].id}`} className="flex flex-col items-center gap-3 group/podium transition-all hover:scale-105 active:scale-95">
                          <Trophy className="h-5 w-5 text-yellow-500 animate-bounce" />
                          <div className="relative">
                            <PlayerAvatar
                              name={topThree[0].alias ?? topThree[0].displayName ?? "Player"}
                              image={topThree[0].image ?? undefined}
                              size={80}
                              className="border-4 border-yellow-400 shadow-2xl scale-110 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                            />
                            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-yellow-900 shadow-md border-2 border-background">
                              1
                            </div>
                          </div>
                          <div className="text-center w-full">
                            <p className="text-sm font-black truncate max-w-full px-1 group-hover/podium:text-primary transition-colors">
                              {topThree[0].alias ?? topThree[0].displayName}
                            </p>
                            <p className="text-xs font-black text-primary">
                              {Math.round(topThree[0].rankingScore)} pts
                            </p>
                          </div>
                        </Link>
                      )}

                      {/* 3rd Place */}
                      {topThree[2] && (
                        <Link href={`/p/${topThree[2].id}`} className="flex flex-col items-center gap-2 group/podium transition-all hover:scale-105 active:scale-95">
                          <div className="relative">
                            <PlayerAvatar
                              name={topThree[2].alias ?? topThree[2].displayName ?? "Player"}
                              image={topThree[2].image ?? undefined}
                              size={56}
                              className="border-4 border-amber-600/50 shadow-lg"
                            />
                            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[9px] font-black text-amber-50 shadow-md border-2 border-background">
                              3
                            </div>
                          </div>
                          <div className="text-center w-full">
                            <p className="text-[10px] font-black truncate max-w-full px-1 group-hover/podium:text-primary transition-colors">
                              {topThree[2].alias ?? topThree[2].displayName}
                            </p>
                            <p className="text-[10px] font-black text-muted-foreground">
                              {Math.round(topThree[2].rankingScore)} pts
                            </p>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* List Section */}
              <div className="grid gap-3">
                {listPlayers.map((player, index) => (
                  <RankingListItem
                    key={player.id}
                    player={player}
                    index={query ? index : index + 3}
                    viewerId={viewerId}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Users}
              title={query ? "No se encontraron jugadores" : "Sin jugadores"}
              description={query ? `No hay resultados para "${query}". Reintentá con otro nombre.` : "Aún no hay jugadores registrados en la plataforma."}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
