import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { JoinSlotButton } from "./join-slot-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  UserCheck,
  Trophy,
  MapPin,
  Users,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MATCH_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DISPUTED: "DISPUTED",
  CANCELLED: "CANCELLED",
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
    case MATCH_STATUS.CANCELLED:
      return "Cancelado";
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
  const teamLabel =
    player.team?.label ?? defaultTeamLabel(teamKey, totalPlayers);
  const viewerId = session?.user?.id ?? null;
  const slotTaken = Boolean(player.userId);
  const slotTakenByViewer = slotTaken && player.userId === viewerId;
  const viewerAlreadyInMatch = viewerId
    ? match.players.some((slot) => slot.userId === viewerId)
    : false;
  const matchClosed = match.status !== MATCH_STATUS.PENDING;

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
    <main className="relative mx-auto min-h-screen w-full max-w-md flex-col gap-12 px-6 py-10 pb-48 overflow-hidden animate-in fade-in duration-1000">
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/10 blur-[120px] -z-10 rounded-full" />

      <PageHeader
        title={`Invitación a jugar`}
        align="center"
        backHref={session?.user ? "/me" : "/"}
        description={
          <span className="flex flex-col items-center gap-4 mt-2">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 shadow-sm">
              Invitación directa
            </span>
            <span className="text-sm font-medium text-muted-foreground text-center max-w-[280px]">
              {match.creator.displayName} te invitó a sumarte como{" "}
              <span className="font-black text-foreground underline decoration-primary decoration-2 underline-offset-2">
                {teamLabel}
              </span>
              .
            </span>
          </span>
        }
      />

      <Card className="relative rounded-[2.5rem] border-border/40 bg-card/40 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/20 blur-[80px] rounded-full pointer-events-none opacity-40" />

        <CardHeader className="relative z-10 pb-4 pt-8 text-center border-b border-border/20 bg-muted/10">
          <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            Detalle del partido
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 grid grid-cols-2 gap-px bg-border/10 p-0">
          <div className="bg-card/20 p-6 flex flex-col items-center text-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight">
                {match.sets} sets
              </p>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                Modalidad
              </p>
            </div>
          </div>
          <div className="bg-card/20 p-6 flex flex-col items-center text-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <Badge
                variant={match.status === "CONFIRMED" ? "success" : "default"}
                className="uppercase text-[8px] font-black tracking-[0.2em] py-0.5 px-2 rounded-lg"
              >
                {formatStatus(match.status)}
              </Badge>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mt-1">
                Estado
              </p>
            </div>
          </div>
          {match.club && (
            <div className="col-span-2 bg-card/20 p-5 flex items-center justify-center gap-4 border-t border-border/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 shadow-inner">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-base font-black tracking-tight truncate">
                  {match.club}{" "}
                  {match.courtNumber ? `(Cancha ${match.courtNumber})` : ""}
                </p>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                  Sede del encuentro
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            Formación actual
          </h2>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="grid gap-6">
          {(["A", "B"] as const).map((key) => {
            const slots = teamGroups[key];
            if (slots.length === 0) return null;
            const label =
              slots[0]?.team?.label ?? defaultTeamLabel(key, totalPlayers);

            return (
              <div key={key} className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/20 to-transparent" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap">
                    {label}
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/20 to-transparent" />
                </div>
                <div className="grid gap-3">
                  {slots.map((slot) => {
                    const name =
                      slot.user?.displayName ??
                      slot.displayName ??
                      `Cupo ${slot.position + 1}`;
                    const isOccupied = Boolean(slot.userId);
                    const isViewer = slot.userId === viewerId;

                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          "flex items-center gap-4 rounded-[2rem] p-4 border transition-all duration-300 backdrop-blur-sm",
                          isViewer
                            ? "bg-primary/5 border-primary/20 shadow-sm"
                            : "bg-card/40 border-border/40",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black shadow-inner shrink-0",
                            isOccupied
                              ? "bg-primary/10 text-primary"
                              : "bg-muted/30 text-muted-foreground/30",
                          )}
                        >
                          {isOccupied
                            ? name
                                .split(" ")
                                .map((s) => s[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            : "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-base font-black truncate leading-tight tracking-tight",
                              isOccupied
                                ? "text-foreground"
                                : "text-muted-foreground/40 italic",
                            )}
                          >
                            {name}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 mt-1">
                            Jugador {slot.position + 1}
                          </p>
                        </div>
                        {isOccupied && (
                          <Badge
                            variant="outline"
                            className="text-[8px] uppercase font-black tracking-[0.2em] border-emerald-500/20 text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded-lg"
                          >
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

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background via-background to-background pointer-events-none z-50 pb-10">
        <div className="max-w-md mx-auto pointer-events-auto">
          <Card className="rounded-[2.5rem] border-primary/20 bg-card/80 shadow-2xl backdrop-blur-xl border-2 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 shrink-0">
                  <UserCheck className="h-8 w-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none mb-1">
                    Te unirás como
                  </p>
                  <p className="text-2xl font-black text-foreground truncate tracking-tight">
                    {teamLabel}
                  </p>
                </div>
              </div>

              {helperMessage && (
                <div className="flex items-center gap-3 rounded-2xl bg-destructive/5 p-4 text-destructive border border-destructive/20 animate-in shake duration-500">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed">
                    {helperMessage}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {!session?.user ? (
                  <Button
                    asChild
                    className="w-full rounded-2xl h-16 text-lg font-black shadow-xl shadow-primary/30 transition-all active:scale-[0.98]"
                    size="lg"
                  >
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(`/j/${playerId}`)}`}
                    >
                      Continuar con Google
                    </Link>
                  </Button>
                ) : slotTakenByViewer ? (
                  <Button
                    asChild
                    variant="secondary"
                    className="w-full rounded-2xl h-16 text-lg font-black shadow-lg active:scale-[0.98]"
                    size="lg"
                  >
                    <Link href={`/match/${match.id}`}>
                      Ya estás unido · Ver partido
                    </Link>
                  </Button>
                ) : (
                  <JoinSlotButton
                    playerId={player.id}
                    matchId={match.id}
                    disabled={joinDisabled}
                    redirectOnSuccess={`/match/${match.id}`}
                  />
                )}

                <div className="flex flex-col gap-2">
                  <Link
                    href={`/match/${match.id}`}
                    className="text-center text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 hover:text-primary transition-colors py-2"
                  >
                    Ver todos los detalles del encuentro
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
