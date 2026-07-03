import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { Calendar, Clock, Trophy, Users, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

const MATCH_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DISPUTED: "DISPUTED",
} as const;

type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

interface InvitationPageProps {
  params: Promise<{ matchId: string }>;
}

function formatStatus(status: MatchStatus): string {
  switch (status) {
    case MATCH_STATUS.CONFIRMED:
      return "Confirmado";
    case MATCH_STATUS.DISPUTED:
      return "En disputa";
    case MATCH_STATUS.PENDING:
    default:
      return "Pendiente";
  }
}

function teamKeyForPosition(position: number, totalPlayers: number): "A" | "B" {
  if (totalPlayers <= 2) {
    return position === 0 ? "A" : "B";
  }
  return position < 2 ? "A" : "B";
}

function defaultTeamLabel(teamKey: "A" | "B", totalPlayers: number): string {
  if (totalPlayers <= 2) {
    return teamKey === "A" ? "Jugador A" : "Jugador B";
  }
  return teamKey === "A" ? "Pareja A" : "Pareja B";
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { matchId } = await params;
  const session = await auth();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      creator: true,
      players: {
        orderBy: { position: "asc" },
        include: { user: true, team: true },
      },
    },
  });

  if (!match) {
    notFound();
  }

  const totalPlayers = match.players.length;
  const teamGroups: Record<"A" | "B", typeof match.players> = { A: [], B: [] };

  for (const player of match.players) {
    const teamKey = teamKeyForPosition(player.position, totalPlayers);
    teamGroups[teamKey].push(player);
  }

  const viewerId = session?.user?.id ?? null;
  const isParticipant = viewerId ? match.players.some((slot) => slot.userId === viewerId) : false;

  const dateStr = new Date(match.date).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-md flex-col gap-12 px-6 py-10 pb-48 overflow-hidden animate-in fade-in duration-1000">
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/10 blur-[120px] -z-10 rounded-full" />

      <PageHeader
        title={match.matchType === "FRIENDLY" ? "Partido Amistoso" : "Torneo Local"}
        align="center"
        description={
          <span className="flex flex-col items-center gap-4 mt-2">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 shadow-sm">
              Invitación de Partido
            </span>
            <span className="flex items-center gap-2 capitalize font-black text-foreground/80 bg-muted/30 px-3 py-1 rounded-xl border border-border/40">
              <Calendar className="h-4 w-4 text-primary" />
              {dateStr}
            </span>
          </span>
        }
      />

      <Card className="relative rounded-[2.5rem] border-border/40 bg-card/40 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/20 blur-[80px] rounded-full pointer-events-none opacity-40" />

        <CardHeader className="relative z-10 pb-4 pt-8 text-center border-b border-border/20 bg-muted/10">
          <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Información del encuentro</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 grid grid-cols-2 gap-px bg-border/10 p-0">
          <div className="bg-card/20 p-6 flex flex-col items-center text-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">{match.sets} sets</p>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Modalidad</p>
            </div>
          </div>

          <div className="bg-card/20 p-6 flex flex-col items-center text-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">{formatStatus(match.status)}</p>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Estado</p>
            </div>
          </div>

          <div className="col-span-2 bg-card/20 p-6 flex items-center justify-center gap-4 border-t border-border/20">
             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 shadow-inner">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xl font-black tracking-tight truncate">{match.club || "Club por definir"}</p>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                {match.courtNumber ? `Cancha ${match.courtNumber}` : "Sede del encuentro"}
              </p>
            </div>
          </div>
        </CardContent>
        {match.notes && (
          <div className="bg-primary/5 p-8 text-center text-sm font-medium text-muted-foreground/80 border-t border-border/20 italic leading-relaxed">
            <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-primary/40 not-italic mb-2">Notas del organizador</span>
            "{match.notes}"
          </div>
        )}
      </Card>

      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Jugadores convocados</h2>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="grid gap-10">
          {(["A", "B"] as const).map((teamKey, teamIdx) => {
            const teamPlayers = teamGroups[teamKey];
            if (teamPlayers.length === 0) return null;
            const label = teamPlayers[0]?.team?.label ?? defaultTeamLabel(teamKey, totalPlayers);

            return (
              <div key={teamKey} className="space-y-4">
                <div className="flex items-center gap-3 px-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/20 to-transparent" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 whitespace-nowrap">
                    {label}
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/20 to-transparent" />
                </div>
                <div className="grid gap-3">
                  {teamPlayers.map((player, idx) => {
                    const name = player.user?.displayName ?? player.displayName ?? `Cupo ${player.position + 1}`;
                    const isOccupied = !!player.userId;
                    const isConfirmed = player.resultConfirmed;
                    const isCreator = player.userId === match.creatorId;

                    if (!isOccupied) {
                      return (
                        <div
                          key={player.id}
                          className="flex items-center gap-4 rounded-[2rem] border-2 border-dashed border-primary/10 bg-primary/5 p-4 text-primary/30 transition-all hover:bg-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-500"
                          style={{ animationDelay: `${(teamIdx * 2 + idx) * 100}ms` }}
                        >
                          <div className="h-12 w-12 rounded-full bg-primary/5 border-2 border-dashed border-primary/10 flex items-center justify-center text-xl grayscale opacity-20">
                            🎾
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest italic opacity-40">Cupo disponible</p>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={player.id}
                        className="flex items-center gap-4 rounded-[2rem] bg-card/40 p-4 border border-border/40 backdrop-blur-md shadow-sm transition-all hover:bg-card/60 active:scale-[0.98] group/player animate-in fade-in slide-in-from-bottom-4 duration-500"
                        style={{ animationDelay: `${(teamIdx * 2 + idx) * 100}ms` }}
                      >
                        <div className="relative">
                          <PlayerAvatar
                            name={name}
                            image={player.user?.image ?? undefined}
                            className="h-12 w-12 border-2 border-background shadow-md transition-transform group-hover/player:scale-110"
                          />
                          {isConfirmed && (
                            <div className="absolute -right-1 -bottom-1 rounded-full bg-emerald-500 p-1 border-2 border-background shadow-sm animate-in zoom-in duration-500">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-foreground truncate leading-tight group-hover/player:text-primary transition-colors tracking-tight text-lg">{name}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <p className={cn(
                              "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                              isConfirmed ? "text-emerald-500" : "text-muted-foreground/50"
                            )}>
                              {isConfirmed ? "Confirmado" : "Pendiente"}
                            </p>
                            {player.user?.level && (
                              <span className="text-[9px] font-black bg-primary/5 text-primary/60 px-1.5 py-0.5 rounded-md border border-primary/10">Nivel {player.user.level}</span>
                            )}
                          </div>
                        </div>
                        {isCreator && (
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-primary border border-primary/20 shrink-0 shadow-sm">Organizador</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none z-50 pb-10">
        <div className="max-w-md mx-auto pointer-events-auto space-y-4 animate-in slide-in-from-bottom-10 duration-1000">
          <Button asChild className="w-full rounded-2xl h-16 text-lg font-black shadow-2xl shadow-primary/30 transition-all active:scale-[0.98]" size="lg">
            <Link href={`/match/${match.id}`}>
              Ver partido en PadelApp
            </Link>
          </Button>

          {!session?.user ? (
            <Button asChild variant="ghost" className="w-full rounded-2xl h-12 text-muted-foreground/50 hover:bg-muted/10 font-black uppercase tracking-[0.2em] text-[10px]" size="sm">
              <Link href={`/login?callbackUrl=${encodeURIComponent(`/match/${match.id}`)}`}>
                Iniciar sesión con Google
              </Link>
            </Button>
          ) : !isParticipant ? (
            <div className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] p-6 border border-border/40 text-center shadow-lg relative overflow-hidden animate-in zoom-in-95 duration-1000 delay-500">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 relative z-10">
                Para unirte, pedile al organizador tu enlace de cupo directo
              </p>
            </div>
          ) : (
            <div className="bg-primary/5 backdrop-blur-xl rounded-[2.5rem] p-6 border border-primary/20 text-center shadow-lg animate-in zoom-in-95 duration-1000 delay-500">
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">
                ¡Ya formás parte de este partido!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
