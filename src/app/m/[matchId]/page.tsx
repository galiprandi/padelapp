import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { Calendar, Clock, Trophy, Users, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

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

function initials(value: string): string {
  return value
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
  const viewerPlayer = viewerId ? match.players.find((player) => player.userId === viewerId) : null;
  const viewerPlayerId = viewerPlayer?.id;
  const isParticipant = viewerId ? match.players.some((slot) => slot.userId === viewerId) : false;

  const dateStr = new Date(match.date).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-12 px-6 py-10 pb-48 animate-in fade-in duration-700">
      <PageHeader
        title={match.matchType === "FRIENDLY" ? "Partido Amistoso" : "Torneo Local"}
        align="center"
        description={
          <span className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Invitación de Partido</span>
            <span className="flex items-center gap-1.5 capitalize font-black text-foreground/80">
              <Calendar className="h-4 w-4 text-primary" />
              {dateStr}
            </span>
          </span>
        }
      />

      <Card className="rounded-[2.5rem] border-border/40 bg-card/50 shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="pb-4 pt-8 text-center border-b border-border/20 bg-muted/30">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Información del partido</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-px bg-border/20 p-0">
          <div className="bg-card/40 p-6 flex flex-col items-center text-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-black">{match.sets} sets</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Modalidad</p>
            </div>
          </div>

          <div className="bg-card/40 p-6 flex flex-col items-center text-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-black">{formatStatus(match.status)}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Estado</p>
            </div>
          </div>

          <div className="col-span-2 bg-card/40 p-6 flex items-center justify-center gap-4 border-t border-border/20">
             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="text-xl font-black">{match.club || "Club por definir"}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                {match.courtNumber ? `Cancha ${match.courtNumber}` : "Sede del encuentro"}
              </p>
            </div>
          </div>
        </CardContent>
        {match.notes && (
          <div className="bg-primary/5 p-6 text-center text-sm font-medium text-muted-foreground/80 border-t border-border/20 italic">
            "{match.notes}"
          </div>
        )}
      </Card>

      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Jugadores convocados</h2>
        </div>
        <div className="grid gap-8">
          {(["A", "B"] as const).map((teamKey) => {
            const teamPlayers = teamGroups[teamKey];
            if (teamPlayers.length === 0) {
              return null;
            }
            const label = teamPlayers[0]?.team?.label ?? defaultTeamLabel(teamKey, totalPlayers);

            return (
              <div key={teamKey} className="space-y-4">
                <p className="px-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                  <span className="h-px w-4 bg-border/40" />
                  {label}
                </p>
                <div className="grid gap-3">
                  {teamPlayers.map((player) => {
                    const name = player.user?.displayName ?? player.displayName ?? `Cupo ${player.position + 1}`;
                    const isOccupied = !!player.userId;
                    const isConfirmed = player.resultConfirmed;
                    const isCreator = player.userId === match.creatorId;

                    if (!isOccupied) {
                      return (
                        <div key={player.id} className="flex items-center gap-4 rounded-3xl border-2 border-dashed border-border/40 bg-muted/5 p-4 text-muted-foreground/30 transition-all hover:bg-muted/10">
                          <div className="h-12 w-12 rounded-full bg-muted/10 border-2 border-dashed border-muted/20" />
                          <p className="text-[10px] font-black uppercase tracking-widest italic opacity-60">Cupo disponible</p>
                        </div>
                      );
                    }

                    return (
                      <div key={player.id} className="flex items-center gap-4 rounded-3xl bg-card/50 p-4 border border-border/40 backdrop-blur-sm shadow-sm transition-all hover:bg-card/80 group/player">
                        <div className="relative">
                          <PlayerAvatar
                            name={name}
                            image={player.user?.image ?? undefined}
                            className="h-12 w-12 border-2 border-background shadow-md transition-transform group-hover/player:scale-110"
                          />
                          {isConfirmed && (
                            <div className="absolute -right-1 -bottom-1 rounded-full bg-emerald-500 p-1 border-2 border-background shadow-sm">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-foreground truncate leading-tight group-hover/player:text-primary transition-colors">{name}</p>
                          <p className={cn(
                            "mt-1 text-[10px] font-black uppercase tracking-widest transition-colors",
                            isConfirmed ? "text-emerald-600" : "text-muted-foreground/40"
                          )}>
                            {isConfirmed ? "Confirmado" : "Pendiente"}
                          </p>
                        </div>
                        {isCreator && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-primary border border-primary/20 shrink-0">Organizador</span>
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

      <div className="fixed bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto space-y-3">
          <Button asChild className="w-full rounded-2xl h-14 text-lg font-black shadow-2xl shadow-primary/30" size="lg">
            <Link href={`/match/${match.id}`}>
              Ver partido en PadelApp
            </Link>
          </Button>
          {!session?.user ? (
            <Button asChild variant="ghost" className="w-full rounded-xl py-2 text-muted-foreground hover:bg-muted/10" size="sm">
              <Link href={`/login?callbackUrl=${encodeURIComponent(`/match/${match.id}`)}`}>
                Iniciar sesión con Google
              </Link>
            </Button>
          ) : !isParticipant ? (
            <div className="bg-card/80 backdrop-blur-md rounded-2xl p-4 border border-border/40 text-center">
              <p className="text-xs font-medium text-muted-foreground">
                Para unirte, pedile al organizador tu enlace de cupo directo
              </p>
            </div>
          ) : (
            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20 text-center">
              <p className="text-xs font-black text-primary uppercase tracking-widest">
                ¡Ya formás parte de este partido!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
