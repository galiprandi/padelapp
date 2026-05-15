import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockRanking, mockCurrentUserRanking } from "@/lib/mock-data";

export default function RankingPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Ranking & reputación</h1>
        <p className="text-sm text-muted-foreground">
          Puntos actualizados con decay mensual, categorías 1-8 y reputación por asistencia.
        </p>
      </header>

      {mockCurrentUserRanking.hasPosition ? (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">
                Tu posición: #{mockCurrentUserRanking.position}
              </CardTitle>
              <CardDescription>
                {mockCurrentUserRanking.points} pts · Nivel {mockCurrentUserRanking.level}
              </CardDescription>
            </div>
            <Badge variant="default">{mockCurrentUserRanking.trend}</Badge>
          </CardHeader>
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
        <TabsContent value="individual" className="space-y-3">
          {mockRanking.map((player) => (
            <Card key={player.position}>
              <CardHeader className="flex items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {player.position}. {player.name}
                  </CardTitle>
                  <CardDescription>
                    Nivel {player.level} · {player.points} pts
                  </CardDescription>
                </div>
                <Badge variant="outline">{player.trend}</Badge>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="parejas" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aún sin datos</CardTitle>
              <CardDescription>
                Cuando registres partidos con pareja fija verás su evolución aquí.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
