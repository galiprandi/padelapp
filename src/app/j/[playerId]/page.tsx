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
import { prisma } from "@/lib/prisma";
import { JoinSlotButton } from "./join-slot-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const MATCH_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DISPUTED: "DISPUTED",
} as const;

type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

interface JoinSlotPageProps {
  params: Promise<{ playerId: string }>;
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

export default async function JoinSlotPage({ params }: JoinSlotPageProps) {
  const { playerId } = await params;
  const session = await auth();

  const player = await prisma.matchPlayer.findUnique({
    where: { id: playerId },
    include: {
      user: true,
      team: true,
      match: {
        include: {
          creator: true,
          players: {
            orderBy: { position: "asc" },
            include: { user: true, team: true },
          },
        },
      },
    },
  });

  if (!player) {
    notFound();
  }

  const match = player.match;
  const totalPlayers = match.players.length;
  const teamKey = teamKeyForPosition(player.position, totalPlayers);
  const teamLabel = player.team?.label ?? defaultTeamLabel(teamKey, totalPlayers);
  const viewerId = session?.user?.id ?? null;
  const isOwner = viewerId === match.creatorId;
  const slotTaken = Boolean(player.userId);
  const slotTakenByViewer = slotTaken && player.userId === viewerId;
  const viewerAlreadyInMatch = viewerId ? match.players.some((slot) => slot.userId === viewerId) : false;
  const matchClosed = match.status !== MATCH_STATUS.PENDING;

  const slotName = player.user?.displayName ?? player.displayName ?? `Jugador ${player.position + 1}`;

  const teamGroups: Record<"A" | "B", typeof match.players> = { A: [], B: [] };
  for (const slot of match.players) {
    const key = teamKeyForPosition(slot.position, totalPlayers);
    teamGroups[key].push(slot);
  }

  let helperMessage: string | null = null;
  if (slotTaken && !slotTakenByViewer) {
    helperMessage = "Cupo ocupado, hablá con el organizador del partido.";
  } else if (matchClosed) {
    helperMessage = "El partido ya no admite nuevas confirmaciones.";
  } else if (viewerAlreadyInMatch && !slotTakenByViewer) {
    helperMessage = "Ya estás inscripto en otro cupo para este partido.";
  }

  const joinDisabled = Boolean(helperMessage) || !session?.user;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 px-6 py-10 pb-32">
      <PageHeader
        title={`Invitación a jugar`}
        align="center"
        description={
          <span className="flex flex-col items-center gap-1">
             <span className="text-xs font-black uppercase tracking-widest text-primary">Invitación directa</span>
             <span className="text-sm text-muted-foreground text-center">
              {match.creator.displayName} te invitó a sumarte como <span className="font-black text-foreground underline decoration-primary decoration-2 underline-offset-2">{teamLabel}</span>.
             </span>
          </span>
        }
      />

      <Card className="rounded-3xl border-border/40 bg-card/50 shadow-xl backdrop-blur-md overflow-hidden">
        <CardHeader className="pb-4 pt-6 border-b border-border/40 bg-muted/20">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/80">Detalle del partido</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Organizador</p>
              <p className="font-black">{match.creator.displayName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Estado</p>
              <Badge variant={match.status === 'CONFIRMED' ? 'success' : 'default'} className="uppercase text-[8px] font-black tracking-widest">
                {formatStatus(match.status)}
              </Badge>
            </div>
            {match.club && (
              <div className="col-span-2 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Club / Cancha</p>
                <p className="font-black">{match.club} {match.courtNumber ? `(Cancha ${match.courtNumber})` : ''}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">Formación actual</h2>
        <div className="grid gap-4">
          {(["A", "B"] as const).map((key) => {
            const slots = teamGroups[key];
            if (slots.length === 0) {
              return null;
            }
            const label = slots[0]?.team?.label ?? defaultTeamLabel(key, totalPlayers);

            return (
              <div key={key} className="space-y-3 rounded-3xl border border-border/40 bg-card/40 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-1">{label}</p>
                <div className="space-y-3">
                  {slots.map((slot) => {
                    const name = slot.user?.displayName ?? slot.displayName ?? `Jugador ${slot.position + 1}`;
                    const isOccupied = Boolean(slot.userId);
                    const isViewer = slot.userId === viewerId;

                    return (
                      <div key={slot.id} className={cn(
                        "flex items-center gap-3 rounded-2xl border px-3 py-2 transition-all",
                        isViewer ? "bg-primary/10 border-primary/30" : "bg-background/50 border-border/40"
                      )}>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary shadow-inner">
                          {initials(name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-black truncate", isOccupied ? "text-foreground" : "text-muted-foreground/60 italic")}>
                            {name}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Jugador {slot.position + 1}</p>
                        </div>
                        {isOccupied && (
                          <Badge variant="outline" className="text-[8px] uppercase font-black tracking-widest border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                            {slot.resultConfirmed ? "Confirmado" : "Pendiente"}
                          </Badge>
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

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <Card className="rounded-[2rem] border-primary/20 bg-card/80 shadow-2xl backdrop-blur-xl border-2 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 leading-none">Te unirás como</p>
                  <p className="text-xl font-black text-foreground">{teamLabel}</p>
                </div>
              </div>

              {helperMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-destructive border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="text-xs font-black leading-tight">{helperMessage}</p>
                </div>
              )}

              <div className="space-y-3">
                {!session?.user ? (
                  <Button asChild className="w-full rounded-2xl h-14 text-lg font-black shadow-xl shadow-primary/20" size="lg">
                    <Link href={`/login?callbackUrl=${encodeURIComponent(`/j/${playerId}`)}`}>
                      Continuar con Google
                    </Link>
                  </Button>
                ) : slotTakenByViewer ? (
                  <Button asChild variant="secondary" className="w-full rounded-2xl h-14 text-lg font-black" size="lg">
                    <Link href={`/match/${match.id}`}>Ya estás unido · Ver partido</Link>
                  </Button>
                ) : (
                  <JoinSlotButton
                    playerId={player.id}
                    matchId={match.id}
                    disabled={joinDisabled}
                    redirectOnSuccess={`/match/${match.id}`}
                  />
                )}

                <div className="flex flex-col gap-2 pt-1">
                   <Link href={`/match/${match.id}`} className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    Ver todos los detalles
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
