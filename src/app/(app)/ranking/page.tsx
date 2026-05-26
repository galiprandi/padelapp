import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
import { prisma } from "@/lib/prisma";
import { TrendingDown, TrendingUp, Minus, Users } from "lucide-react";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Ranking de jugadores</h1>
        <p className="text-sm text-muted-foreground">
          Posiciones actualizadas según resultados confirmados y actividad.
        </p>
      </header>

      {currentUser && currentUser.matchesPlayed > 0 && (
        <UserRankingBanner
          position={currentUser.rankingPosition}
          score={currentUser.rankingScore}
          delta={currentUser.rankingDelta}
          wins={currentUser.wins}
          losses={currentUser.losses}
          level={currentUser.level}
        />
      )}

      <Tabs defaultValue="individual" className="w-full">
        <TabsList>
          <TabsTrigger value="individual">Individual</TabsTrigger>
        </TabsList>
        <TabsContent value="individual" className="space-y-2 pt-2">
          {players.length > 0 ? (
            players.map((player) => (
              <div
                key={player.id}
                className={cn(
                  "flex items-center gap-4 rounded-3xl border p-3 shadow-sm transition-all active:scale-[0.98]",
                  player.id === viewerId
                    ? "border-primary/50 bg-primary/10 backdrop-blur-sm ring-1 ring-primary/20"
                    : "border-border/40 bg-card/50 backdrop-blur-sm"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-black",
                    player.id === viewerId ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {player.rankingPosition ?? "-"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-sm">
                    {player.alias ?? player.displayName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant="outline"
                      className="h-4 px-1.5 text-[9px] font-black uppercase border-primary/30 text-primary bg-primary/5"
                    >
                      Nivel {player.level}
                    </Badge>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/70">
                      {player.wins}V - {player.losses}D
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 pr-2">
                  <span className="text-sm font-black tracking-tight">
                    {Math.round(player.rankingScore)}
                    <span className="ml-0.5 text-[10px] font-bold text-muted-foreground/60 uppercase">pts</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {player.rankingDelta > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-[10px] font-black text-green-500">+{player.rankingDelta}</span>
                      </>
                    ) : player.rankingDelta < 0 ? (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        <span className="text-[10px] font-black text-red-500">{player.rankingDelta}</span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-3 w-3 text-muted-foreground/40" />
                        <span className="text-[10px] font-black text-muted-foreground/40">0</span>
                      </>
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
