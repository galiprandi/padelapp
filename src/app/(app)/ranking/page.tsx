import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getRankingAction } from "./actions";

export default async function RankingPage() {
  const { ranking, currentUserRanking } = await getRankingAction();

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Ranking & reputación</h1>
        <p className="text-sm text-muted-foreground">
          Puntos actualizados con cada partido confirmado y reputación por asistencia.
        </p>
      </header>

      {currentUserRanking ? (
        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tu posición global
              </CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground">#{currentUserRanking.position}</span>
                {currentUserRanking.positionChange !== 0 && (
                  <Badge
                    variant="default"
                    className={cn(
                      "border-none hover:bg-opacity-20 py-0 h-5",
                      currentUserRanking.positionChange > 0
                        ? "bg-green-500/10 text-green-600"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {currentUserRanking.positionChange > 0 ? "+" : ""}{currentUserRanking.positionChange}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-primary leading-none">{Math.round(currentUserRanking.score)}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">puntos</p>
            </div>
          </CardHeader>
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="font-bold py-0 h-5 bg-muted/50 border-none">Nivel {currentUserRanking.level}</Badge>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground font-medium italic">
                {currentUserRanking.wins} victorias · {currentUserRanking.losses} derrotas
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Aún sin posición</CardTitle>
            <CardDescription>
              Jugá tu primer partido para entrar al ranking.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="individual" className="w-full">
        <TabsList>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="parejas">Parejas</TabsTrigger>
        </TabsList>
        <TabsContent value="individual" className="space-y-2 pt-2">
          {ranking.length > 0 ? (
            ranking.map((player) => (
              <div
                key={player.userId}
                className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-3 shadow-sm transition-colors active:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground">
                  {player.position}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-sm">{player.displayName}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-4 px-1 text-[9px] font-black uppercase border-primary/20 text-primary/80">
                      Nivel {player.level}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-bold">{Math.round(player.score)} pts</span>
                  </div>
                </div>
                {player.positionChange !== 0 && (
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "text-xs font-black",
                      player.positionChange > 0 ? "text-green-600" : "text-destructive"
                    )}>
                      {player.positionChange > 0 ? "+" : ""}{player.positionChange}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <Card className="bg-muted/30 border-dashed">
              <CardHeader className="text-center py-10">
                <CardTitle className="text-base">El ranking está vacío</CardTitle>
                <CardDescription>
                  Sé el primero en registrar un partido confirmado.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="parejas" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Próximamente</CardTitle>
              <CardDescription>
                El ranking por parejas se activará cuando haya suficientes partidos jugados por equipos fijos.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
