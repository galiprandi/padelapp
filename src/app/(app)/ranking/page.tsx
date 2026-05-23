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
                  "flex items-center gap-4 rounded-xl border p-3 shadow-sm transition-colors active:bg-muted/50",
                  player.id === viewerId
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/50 bg-card"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground">
                  {player.rankingPosition ?? "-"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-sm">
                    {player.alias ?? player.displayName}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-4 px-1 text-[9px] font-black uppercase border-primary/20 text-primary/80">
                      Nivel {player.level}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {player.wins}V - {player.losses}D
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold">
                    {Math.round(player.rankingScore)} pts
                  </span>
                  <div className="flex items-center gap-1">
                    {player.rankingDelta > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-[10px] font-medium text-green-500">+{player.rankingDelta}</span>
                      </>
                    ) : player.rankingDelta < 0 ? (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        <span className="text-[10px] font-medium text-red-500">{player.rankingDelta}</span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground">0</span>
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
