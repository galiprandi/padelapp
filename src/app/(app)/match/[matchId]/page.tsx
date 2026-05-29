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
    <form action={handleConfirm} className="w-full">
      <Button type="submit" className="w-full rounded-2xl h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
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

  // Obtener datos del match
  const result = await getMatchByIdAction(matchId);

  if (!result.match) {
    return (
      <div className="flex flex-col gap-6 px-5 py-10">
        <PageHeader
          title="Partido no encontrado"
          description="El partido que estás buscando no se encuentra. Sin embargo, puedes crear uno nuevo."
          align="center"
          action={
            <Button
              asChild
              variant="default"
              className="w-full justify-center py-2 text-base rounded-xl"
            >
              <Link href="/match/new">
                <PlusCircle className="mr-2 h-5 w-5" />
                Crear Partido
              </Link>
            </Button>
          }
        />
      </div>
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

  const isPendingConfirmation = match.score && match.status !== 'CONFIRMED';
  const userNeedsToConfirm = viewerId && match.players.some(p => p.userId === viewerId && !p.resultConfirmed);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <PageHeader
        title={`Partido ${getMatchTypeLabel(match.matchType)}`}
        description={
          <span className="flex flex-col gap-3">
            <span className="flex items-center gap-2">
              <Badge variant={match.status === 'CONFIRMED' ? 'success' : 'default'} className="uppercase text-[10px] tracking-widest font-black py-0.5">
                {match.status === 'PENDING' ? 'Pendiente' : match.status === 'CONFIRMED' ? 'Confirmado' : 'En disputa'}
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">
                Creado por <span className="text-foreground font-bold">{match.creator?.displayName || 'Usuario'}</span>
              </span>
            </span>
            {match.club && (
              <span className="text-sm font-bold text-foreground bg-primary/5 px-3 py-1 rounded-full border border-primary/10 inline-flex items-center w-fit">
                📍 {match.club}{match.courtNumber ? ` · Cancha ${match.courtNumber}` : ''}
              </span>
            )}
          </span>
        }
        action={
          !isClosed ? (
            <div className="flex flex-col gap-3 w-full">
              <Button
                asChild
                className="w-full h-12 justify-center text-base rounded-2xl shadow-lg shadow-primary/20 font-bold"
              >
                <Link href={`/match/${match.id}/result`}>
                  <FileText className="mr-2 h-5 w-5" />
                  Ingresar Resultado
                </Link>
              </Button>
              <p className="text-[10px] font-black uppercase tracking-widest text-center text-muted-foreground/60">
                Una vez jugado, cargá el resultado acá
              </p>
            </div>
          ) : null
        }
      />

      {isClosed ? (
        <div className="space-y-6">
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
             <MatchResultCompact
              match={matchResultData}
              matchDate={match.createdAt}
              detailUrl={`/match/${match.id}`}
            />
          </div>

          {isPendingConfirmation && (
            <section className="space-y-6 rounded-[2.5rem] bg-card/50 p-8 backdrop-blur-md border border-border/40 shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-foreground">Confirmación pendiente</h2>
                </div>
                <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                  Al menos un jugador de cada equipo debe confirmar el resultado para que impacte en el ranking.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 relative">
                <div className="absolute left-1/2 top-4 bottom-0 w-px bg-border/40 -translate-x-1/2 hidden sm:block" />
                {teams.map((team) => (
                  <div key={team.id} className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 border-b border-border/20 pb-1">{team.label}</p>
                    <div className="space-y-4">
                      {team.players.map((player: {
                        id: string;
                        name: string;
                        image?: string | null;
                        isConfirmed?: boolean;
                      }) => (
                        <div key={player.id} className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <PlayerAvatar name={player.name} image={player.image ?? undefined} className="h-10 w-10 border-2 border-background shadow-sm" />
                            <div className={cn(
                              "absolute -right-1 -bottom-1 rounded-full p-0.5 border-2 border-background shadow-sm transition-colors",
                              player.isConfirmed ? "bg-emerald-500" : "bg-muted"
                            )}>
                              {player.isConfirmed ? (
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              ) : (
                                <Clock className="h-3 w-3 text-muted-foreground/50" />
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className={cn(
                              "text-xs font-black truncate leading-none",
                              player.isConfirmed ? "text-foreground" : "text-muted-foreground/60"
                            )}>
                              {player.name}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">
                              {player.isConfirmed ? "Confirmado" : "Esperando"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {userNeedsToConfirm && (
                <div className="pt-6 border-t border-border/40 mt-2">
                  <ConfirmResultForm matchId={match.id} />
                </div>
              )}
            </section>
          )}

          {!isPendingConfirmation && match.status === 'CONFIRMED' && (
            <div className="flex justify-center">
               <Badge variant="success" className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm shadow-emerald-500/20">
                 <CheckCircle2 className="mr-2 h-4 w-4" />
                 Partido procesado
               </Badge>
            </div>
          )}
        </div>
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
