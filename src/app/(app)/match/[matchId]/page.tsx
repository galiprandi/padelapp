import { auth } from "@/auth";
import { getMatchByIdAction, confirmMatchResultAction } from '@/app/(app)/match/actions';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchResultCompact } from "@/components/matches/match-result-card";
import { MatchPlayersManager } from "@/components/matches/match-players-manager";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { PlusCircle, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

interface MatchPageProps {
  params: Promise<{
    matchId: string;
  }>;
}

async function ConfirmResultForm({ matchId }: { matchId: string }) {
  async function handleConfirm() {
    "use server";
    await confirmMatchResultAction(matchId);
    redirect(`/match/${matchId}`);
  }

  return (
    <form action={handleConfirm}>
      <Button type="submit" className="w-full rounded-2xl py-6 text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
        <CheckCircle2 className="mr-2 h-6 w-6" />
        Confirmar Resultado
      </Button>
    </form>
  );
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { matchId } = await params;
  const session = await auth();
  const viewerId = session?.user?.id;

  // Obtener datos del match pero no renderizar nada
  const result = await getMatchByIdAction(matchId);

  if (!result.match) {
    return (
      <PageHeader
        title="Partido no encontrado"
        description="El partido que estás buscando no se encuentra. Sin embargo, puedes crear uno nuevo."
        action={
          <Button
            asChild
            variant="default"
            className="w-full justify-center py-2 text-base"
          >
            <Link href="/match/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              Crear Partido
            </Link>
          </Button>
        }
      />
    );
  }
  const match = result.match;

  // Verificar si el partido está cerrado (tiene resultado o está confirmado)
  const isClosed = Boolean(match.score) || match.status === 'CONFIRMED';

  // Agrupar jugadores por equipo
  const teamsMap = new Map();
  match.players.forEach(player => {
    if (player.teamId) {
      if (!teamsMap.has(player.teamId)) {
        teamsMap.set(player.teamId, {
          id: player.teamId,
          label: player.team?.label || `Equipo ${player.teamId.slice(-4)}`,
          players: []
        });
      }
      const displayName = player.displayName || player.user?.displayName || `Jugador ${player.position + 1}`;
      teamsMap.get(player.teamId).players.push({
        id: player.id,
        userId: player.userId,
        name: displayName,
        image: player.user?.image,
        isConfirmed: player.resultConfirmed,
        category: player.user ? 5 : undefined, // Placeholder para categoría
        placeholderName: player.displayName || displayName,
      });
    }
  });

  const teams = Array.from(teamsMap.values());

  // Transform match data for MatchResultCompact component
  const matchResultData = {
    id: match.id,
    createdAt: match.createdAt,
    score: match.score,
    status: match.status,
    players: match.players.map(player => ({
      id: player.id,
      position: player.position,
      user: player.user ? {
        id: player.user.id,
        displayName: player.user.displayName,
        image: player.user.image
      } : null
    }))
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Partido ${getMatchTypeLabel(match.matchType)}`}
        description={
          <span className="flex flex-col gap-2">
            <span className="flex items-center gap-2">
              <Badge variant={match.status === 'CONFIRMED' ? 'success' : 'default'} className="uppercase text-[10px] tracking-widest font-bold">
                {match.status === 'PENDING' ? 'Pendiente' : match.status === 'CONFIRMED' ? 'Confirmado' : 'En disputa'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Creado por {match.creator?.displayName || 'Usuario'}
              </span>
            </span>
            <span className="text-sm text-muted-foreground">
              {match.club ? `${match.club}` : ''}{match.courtNumber ? ` - Cancha ${match.courtNumber}` : ''}
            </span>
          </span>
        }
        action={
          !isClosed ? (
            <Button
              asChild
              variant="default"
              className="w-full justify-center py-2 text-base rounded-xl shadow-sm shadow-primary/20"
            >
              <Link href={`/match/${match.id}/result`}>
                <FileText className="mr-2 h-5 w-5" />
                Ingresar Resultado
              </Link>
            </Button>
          ) : null
        }
      />

      {isClosed ? (
        <>
          <MatchResultCompact
            match={matchResultData}
            matchDate={match.createdAt}
            detailUrl={`/match/${match.id}`}
          />

          {match.score && match.status !== 'CONFIRMED' && (
            <section className="space-y-4 rounded-3xl bg-card/50 p-6 backdrop-blur-sm border border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Confirmación pendiente</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Al menos un jugador de cada equipo debe confirmar el resultado para que el partido impacte en el ranking.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {teams.map((team) => (
                  <div key={team.id} className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-1">{team.label}</p>
                    <div className="space-y-3">
                      {team.players.map((player: {
                        id: string;
                        name: string;
                        image?: string | null;
                        isConfirmed?: boolean;
                      }) => (
                        <div key={player.id} className="flex items-center gap-3">
                          <div className="relative">
                            <PlayerAvatar name={player.name} image={player.image ?? undefined} className="h-9 w-9 border-2 border-background" />
                            {player.isConfirmed ? (
                              <div className="absolute -right-1 -bottom-1 rounded-full bg-background p-0.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500/20" />
                              </div>
                            ) : (
                              <div className="absolute -right-1 -bottom-1 rounded-full bg-background p-0.5">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <span className={cn(
                            "text-xs font-bold truncate leading-none",
                            player.isConfirmed ? "text-foreground" : "text-muted-foreground/70"
                          )}>
                            {player.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {viewerId && match.players.some(p => p.userId === viewerId && !p.resultConfirmed) && (
                <div className="pt-6 border-t border-border/40 mt-6">
                  <ConfirmResultForm matchId={match.id} />
                </div>
              )}
            </section>
          )}
        </>
      ) : (
        <MatchPlayersManager
          teams={teams.map((team) => ({
            id: team.id,
            label: team.label,
            players: team.players.map((player: {
              id: string;
              userId?: string | null;
              name: string;
              image?: string | null;
              isConfirmed?: boolean;
              placeholderName: string;
            }) => ({
              matchPlayerId: player.id,
              userId: player.userId,
              name: player.name,
              image: player.image,
              isConfirmed: player.isConfirmed,
              placeholderName: player.placeholderName,
            })),
          }))}
        />
      )}
    </div>
  );
}

const getMatchTypeLabel = (matchType: string) => {
  switch (matchType) {
    case "FRIENDLY":
      return "amistoso";
    case "LOCAL_TOURNAMENT":
      return "torneo";
    default:
      return matchType;
  }
};
