import { auth } from "@/auth";
import { getMatchByIdAction, confirmMatchResultAction } from '@/app/(app)/match/actions';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchResultCompact } from "@/components/matches/match-result-card";
import { MatchPlayersManager } from "@/components/matches/match-players-manager";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { ShareButton } from "@/components/share/share-button";
import { PlusCircle, FileText, CheckCircle2, Clock, AlertCircle, Users } from "lucide-react";
import Link from "next/link";
import { createMagicLink } from "@/lib/magic-link";
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
      <Button type="submit" className="w-full rounded-2xl h-14 text-lg font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
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
      <div className="flex flex-col gap-6 py-10">
        <PageHeader
          size="lg"
          title="Partido no encontrado"
          description="El partido que estás buscando no se encuentra. Sin embargo, puedes crear uno nuevo."
          align="center"
          action={
            <Button
              asChild
              variant="default"
              className="w-full justify-center py-2 text-base rounded-2xl font-black h-12 shadow-lg shadow-primary/20 active:scale-[0.98]"
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
    <div className="flex flex-col gap-12 pb-8 animate-in fade-in duration-700 px-6">
      <PageHeader
        size="lg"
        title={`Partido ${getMatchTypeLabel(match.matchType)}`}
        backHref="/match"
        description={
          <div className="flex flex-col gap-6 mt-4">
            <div className="flex items-center gap-3">
              <Badge variant={match.status === 'CONFIRMED' ? 'success' : 'default'} className="uppercase text-[10px] tracking-widest font-black py-1 px-3 rounded-xl shadow-sm">
                {match.status === 'PENDING' ? 'Pendiente' : match.status === 'CONFIRMED' ? 'Confirmado' : 'En disputa'}
              </Badge>
              <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-3 py-1 border border-border/40">
                <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                   <Clock className="h-2.5 w-2.5 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {new Date(match.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {match.club && (
                <div className="group flex items-center gap-4 rounded-2xl bg-card/40 p-4 border border-border/40 backdrop-blur-sm shadow-sm transition-all hover:bg-card/60">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                    <span className="text-lg">📍</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Club y Cancha</span>
                    <span className="text-sm font-black truncate text-foreground leading-tight">
                      {match.club}{match.courtNumber ? ` · Cancha ${match.courtNumber}` : ''}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 rounded-2xl bg-card/40 p-4 border border-border/40 backdrop-blur-sm shadow-sm transition-all hover:bg-card/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                  <PlayerAvatar name={match.creator?.displayName || 'U'} image={match.creator?.image ?? undefined} className="h-8 w-8" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Organizador</span>
                  <span className="text-sm font-black truncate text-foreground leading-tight">
                    {match.creator?.displayName || 'Usuario'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        }
        action={
          <div className="flex flex-col gap-3 w-full">
            {!isClosed ? (
              <>
                <Button
                  asChild
                  className="w-full h-12 justify-center text-base rounded-2xl shadow-lg shadow-primary/20 font-black active:scale-[0.98]"
                >
                  <Link href={`/match/${match.id}/result`}>
                    <FileText className="mr-2 h-5 w-5" />
                    Ingresar Resultado
                  </Link>
                </Button>
                <ShareButton
                  title="Invitación a partido de Pádel"
                  text={`¡Sumate a mi partido de pádel el ${new Date(match.date).toLocaleDateString()}!`}
                  url={createMagicLink({ resource: "match", identifier: match.id }).url}
                  variant="outline"
                  className="w-full h-12 rounded-2xl font-black border-primary/20 hover:bg-primary/5 text-primary active:scale-[0.98]"
                />
              </>
            ) : (
              <ShareButton
                title="Resultado de Pádel"
                text="¡Mira el resultado de nuestro partido de pádel!"
                url={createMagicLink({ resource: "match", identifier: match.id }).url}
                variant="outline"
                className="w-full h-12 rounded-2xl font-black border-primary/20 hover:bg-primary/5 text-primary active:scale-[0.98]"
              />
            )}
          </div>
        }
      />

      {isClosed ? (
        <div className="space-y-12">
          <section className="flex flex-col items-center justify-center text-center py-12 animate-in zoom-in duration-1000 relative overflow-hidden rounded-[3.5rem] bg-card/20 backdrop-blur-2xl border border-border/40 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none opacity-50" />

            <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
              Resultado Final
            </span>

            <div className="relative z-10 group">
              <div className="absolute -inset-12 bg-primary/30 rounded-[5rem] blur-3xl group-hover:bg-primary/40 transition-all duration-1000 opacity-30 animate-pulse" />
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 px-6">
                {match.score?.split(',').map((set, idx) => (
                  <div key={idx}
                    className="relative text-7xl md:text-9xl font-black tracking-tighter text-foreground drop-shadow-[0_8px_24px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom-12 duration-1000"
                    style={{ animationDelay: `${idx * 200}ms` }}
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                      {set.trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-16 flex flex-col items-center gap-8">
              <div className="flex -space-x-4 items-center">
                {match.players.sort((a, b) => a.position - b.position).map((p, i) => (
                  <div
                    key={p.id}
                    className="animate-in fade-in zoom-in duration-700 hover:z-20 hover:scale-110 transition-transform"
                    style={{ animationDelay: `${600 + i * 150}ms` }}
                  >
                    <PlayerAvatar
                      name={p.displayName || p.user?.displayName || ""}
                      image={p.user?.image ?? undefined}
                      className="border-4 border-background shadow-2xl ring-1 ring-primary/10"
                      size={64}
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Modalidad {getMatchTypeLabel(match.matchType)}</p>
                <div className="h-1 w-8 rounded-full bg-primary/20" />
              </div>
            </div>
          </section>

          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
             <MatchResultCompact
              match={matchResultData}
              matchDate={match.createdAt}
              detailUrl={`/match/${match.id}`}
              viewerId={viewerId}
            />
          </div>

          {isPendingConfirmation && (
            <section className="space-y-8 rounded-[2.5rem] bg-card/40 p-8 backdrop-blur-md border border-border/40 shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm shadow-primary/5">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Confirmación pendiente</h2>
                </div>
                <p className="text-[11px] font-medium leading-relaxed text-muted-foreground/40 max-w-sm">
                  Al menos un jugador de cada equipo debe confirmar el resultado para que impacte en el ranking.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {match.players.sort((a, b) => a.position - b.position).map((player, idx) => {
                  const displayName = player.displayName || player.user?.displayName || `Jugador ${player.position + 1}`;
                  const isConfirmed = player.resultConfirmed;

                  return (
                    <div
                      key={player.id}
                      className={cn(
                        "relative flex flex-col items-center gap-3 p-5 rounded-[2rem] border transition-all duration-500 animate-in zoom-in-95",
                        isConfirmed
                          ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_8px_20px_-12px_rgba(16,185,129,0.3)]"
                          : "bg-card/30 border-border/20"
                      )}
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="relative">
                        <PlayerAvatar
                          name={displayName}
                          image={player.user?.image ?? undefined}
                          className={cn(
                            "h-16 w-16 border-4 border-background shadow-xl transition-all duration-500",
                            isConfirmed ? "ring-2 ring-emerald-500/20 scale-105" : "grayscale-[0.5] opacity-80"
                          )}
                        />
                        <div className={cn(
                          "absolute -right-1 -bottom-1 rounded-full p-1.5 border-2 border-background shadow-lg transition-all duration-700",
                          isConfirmed ? "bg-emerald-500 scale-110 rotate-0" : "bg-muted scale-75 rotate-45"
                        )}>
                          {isConfirmed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-muted-foreground/50" />
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center text-center gap-1 min-w-0 w-full">
                        <span className={cn(
                          "text-[13px] font-black truncate leading-none px-2 w-full",
                          isConfirmed ? "text-foreground" : "text-foreground/50"
                        )}>
                          {displayName}
                        </span>
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-[0.2em] transition-colors",
                          isConfirmed ? "text-emerald-500" : "text-muted-foreground/30"
                        )}>
                          {isConfirmed ? "Confirmado" : "Pendiente"}
                        </span>
                      </div>

                      {player.userId === viewerId && !isConfirmed && (
                        <div className="absolute inset-0 rounded-[2rem] ring-2 ring-primary/20 animate-pulse pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>

              {userNeedsToConfirm && (
                <div className="pt-8 border-t border-border/40 mt-2">
                  <ConfirmResultForm matchId={match.id} />
                </div>
              )}
            </section>
          )}

          {!isPendingConfirmation && match.status === 'CONFIRMED' && (
            <div className="flex justify-center">
               <Badge variant="success" className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm shadow-emerald-500/20">
                 <CheckCircle2 className="mr-2 h-4 w-4" />
                 Partido procesado
               </Badge>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <section className="space-y-6">
             <div className="flex items-center justify-between px-1">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Formación de equipos
                </h2>
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5 rounded-full px-3">
                  Listo para jugar
                </Badge>
             </div>

             <MatchPlayersManager
                matchId={match.id}
                creatorId={match.creatorId}
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
          </section>

          {match.notes && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
               <div className="rounded-[2.5rem] bg-card/30 border border-border/40 p-8 backdrop-blur-md shadow-sm">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notas del organizador
                  </h3>
                  <p className="text-base font-medium text-foreground/80 leading-relaxed italic">
                    "{match.notes}"
                  </p>
               </div>
            </section>
          )}
        </div>
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
