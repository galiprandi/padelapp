import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
import { prisma } from "@/lib/prisma";
import { TrendingDown, TrendingUp, Minus, Users, Trophy, Medal } from "lucide-react";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { PlayerAvatar } from "@/components/players/player-avatar";
import Link from "next/link";

export default async function RankingPage() {
  const session = await auth();
  const viewerId = session?.user?.id;

  const players = await prisma.user.findMany({
    orderBy: [
      { rankingScore: "desc" },
      { displayName: "asc" },
    ],
    take: 50,
  });

  const currentUser = viewerId ? players.find(p => p.id === viewerId) : null;
  const topThree = players.slice(0, 3);
  const restOfPlayers = players.slice(3);

  return (
    <div className="flex flex-col gap-12 pb-8">
      <PageHeader
        title="Ranking"
        description="Posiciones actualizadas según resultados confirmados y actividad reciente."
        size="lg"
      />

      {currentUser && currentUser.matchesPlayed > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <UserRankingBanner
            position={currentUser.rankingPosition}
            score={currentUser.rankingScore}
            delta={currentUser.rankingDelta}
            wins={currentUser.wins}
            losses={currentUser.losses}
            level={currentUser.level}
          />
        </div>
      )}

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="bg-muted/40 p-1 rounded-2xl h-12 border border-border/20 backdrop-blur-sm">
          <TabsTrigger value="individual" className="rounded-xl h-full font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 transition-all uppercase tracking-widest text-[10px]">
            Ranking Individual
          </TabsTrigger>
        </TabsList>
        <TabsContent value="individual" className="space-y-6 pt-6">
          {players.length > 0 ? (
            <>
              <div className="px-1">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
                  Top Jugadores
                </h2>
              </div>
              {/* Podium Section */}
              <div className="grid grid-cols-3 items-end gap-2 px-2 pt-4 pb-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                {/* 2nd Place */}
                {topThree[1] && (
                  <Link href={`/p/${topThree[1].id}`} className="flex flex-col items-center gap-2 group/podium">
                    <div className="relative">
                      <PlayerAvatar
                        name={topThree[1].alias ?? topThree[1].displayName ?? "Player"}
                        image={topThree[1].image ?? undefined}
                        size={64}
                        className="border-4 border-slate-300 shadow-xl transition-transform group-hover/podium:scale-110"
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
                  <Link href={`/p/${topThree[0].id}`} className="flex flex-col items-center gap-3 -mt-4 group/podium">
                    <Trophy className="h-6 w-6 text-yellow-500 animate-bounce" />
                    <div className="relative">
                      <PlayerAvatar
                        name={topThree[0].alias ?? topThree[0].displayName ?? "Player"}
                        image={topThree[0].image ?? undefined}
                        size={80}
                        className="border-4 border-yellow-400 shadow-2xl scale-110 shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-transform group-hover/podium:scale-[1.2]"
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
                  <Link href={`/p/${topThree[2].id}`} className="flex flex-col items-center gap-2 group/podium">
                    <div className="relative">
                      <PlayerAvatar
                        name={topThree[2].alias ?? topThree[2].displayName ?? "Player"}
                        image={topThree[2].image ?? undefined}
                        size={56}
                        className="border-4 border-amber-600/50 shadow-lg transition-transform group-hover/podium:scale-110"
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

              {/* List Section */}
              <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className={cn(
                      "flex items-center gap-4 rounded-3xl border p-4 shadow-sm transition-all active:scale-[0.98]",
                      player.id === viewerId
                        ? "border-primary/50 bg-primary/10 backdrop-blur-sm ring-1 ring-primary/20"
                        : "border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-black text-lg shadow-inner",
                        player.id === viewerId
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : index === 0 ? "bg-yellow-400/20 text-yellow-600 border border-yellow-400/30"
                          : index === 1 ? "bg-slate-300/30 text-slate-600 border border-slate-300/40"
                          : index === 2 ? "bg-amber-600/20 text-amber-700 border border-amber-600/30"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {player.rankingPosition ?? index + 1}
                    </div>

                    <Link
                      href={`/p/${player.id}`}
                      className="flex items-center gap-3 flex-1 min-w-0 group/player"
                    >
                      <PlayerAvatar
                        name={player.alias ?? player.displayName ?? "Player"}
                        image={player.image ?? undefined}
                        size={40}
                        className="rounded-xl transition-transform group-hover/player:scale-110"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-black truncate text-sm tracking-tight group-hover/player:text-primary transition-colors",
                          player.id === viewerId ? "text-primary-foreground group-hover/player:text-primary-foreground" : "text-foreground"
                        )}>
                          {player.alias ?? player.displayName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-4 px-2 text-[8px] font-black uppercase",
                              player.id === viewerId
                                ? "border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10"
                                : "border-primary/30 text-primary bg-primary/5"
                            )}
                          >
                            Nivel {player.level}
                          </Badge>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            player.id === viewerId ? "text-primary-foreground/60" : "text-muted-foreground/50"
                          )}>
                            {player.wins}V - {player.losses}D
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex flex-col items-end gap-1 pr-1">
                      <span className={cn(
                        "text-base font-black tracking-tighter",
                        player.id === viewerId ? "text-primary-foreground" : "text-foreground"
                      )}>
                        {Math.round(player.rankingScore)}
                        <span className={cn(
                          "ml-1 text-[8px] font-black uppercase tracking-widest",
                          player.id === viewerId ? "text-primary-foreground/60" : "text-muted-foreground/60"
                        )}>pts</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {player.rankingDelta > 0 ? (
                          <div className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded-full border",
                            player.id === viewerId
                              ? "bg-green-400/20 border-green-400/30 text-green-400"
                              : "bg-green-500/10 border border-green-500/20 text-green-500"
                          )}>
                            <TrendingUp className="h-3 w-3" />
                            <span className="text-[9px] font-black">+{player.rankingDelta}</span>
                          </div>
                        ) : player.rankingDelta < 0 ? (
                          <div className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded-full border",
                            player.id === viewerId
                              ? "bg-red-400/20 border-red-400/30 text-red-400"
                              : "bg-red-500/10 border border-red-500/20 text-red-500"
                          )}>
                            <TrendingDown className="h-3 w-3" />
                            <span className="text-[9px] font-black">{player.rankingDelta}</span>
                          </div>
                        ) : (
                          <div className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-border/20",
                            player.id === viewerId ? "bg-white/10" : "bg-muted/20"
                          )}>
                            <Minus className={cn(
                              "h-3 w-3",
                              player.id === viewerId ? "text-primary-foreground/40" : "text-muted-foreground/40"
                            )} />
                            <span className={cn(
                              "text-[9px] font-black",
                              player.id === viewerId ? "text-primary-foreground/40" : "text-muted-foreground/40"
                            )}>0</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Users}
              title="Sin jugadores"
              description="Aún no hay jugadores registrados en la plataforma."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
