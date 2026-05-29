import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
import { prisma } from "@/lib/prisma";
import { TrendingDown, TrendingUp, Minus, Users } from "lucide-react";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

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

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Ranking"
        description="Posiciones actualizadas según resultados confirmados y actividad reciente."
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
          <TabsTrigger value="individual" className="rounded-xl h-full font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 transition-all uppercase tracking-widest text-[10px]">
            Ranking Individual
          </TabsTrigger>
        </TabsList>
        <TabsContent value="individual" className="space-y-3 pt-4">
          {players.length > 0 ? (
            players.map((player) => (
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
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-black text-lg",
                    player.id === viewerId ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
                  )}
                >
                  {player.rankingPosition ?? "-"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black truncate text-sm">
                    {player.alias ?? player.displayName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="h-4 px-2 text-[8px] font-black uppercase border-primary/30 text-primary bg-primary/5"
                    >
                      Nivel {player.level}
                    </Badge>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                      {player.wins}V - {player.losses}D
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 pr-1">
                  <span className="text-base font-black tracking-tighter">
                    {Math.round(player.rankingScore)}
                    <span className="ml-1 text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">pts</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {player.rankingDelta > 0 ? (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-[9px] font-black text-green-500">+{player.rankingDelta}</span>
                      </div>
                    ) : player.rankingDelta < 0 ? (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        <span className="text-[9px] font-black text-red-500">{player.rankingDelta}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/20 border border-border/20">
                        <Minus className="h-3 w-3 text-muted-foreground/40" />
                        <span className="text-[9px] font-black text-muted-foreground/40">0</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
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
