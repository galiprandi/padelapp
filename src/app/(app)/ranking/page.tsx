import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";

export default async function RankingPage() {
  const players = await prisma.user.findMany({
    orderBy: [
      { level: "asc" },
      { displayName: "asc" },
    ],
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Ranking de jugadores</h1>
        <p className="text-sm text-muted-foreground">
          Jugadores ordenados por nivel y actividad en la plataforma.
        </p>
      </header>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList>
          <TabsTrigger value="individual">Individual</TabsTrigger>
        </TabsList>
        <TabsContent value="individual" className="space-y-2 pt-2">
          {players.length > 0 ? (
            players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-3 shadow-sm transition-colors active:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-sm">
                    {player.alias ?? player.displayName}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-4 px-1 text-[9px] font-black uppercase border-primary/20 text-primary/80">
                      Nivel {player.level}
                    </Badge>
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
