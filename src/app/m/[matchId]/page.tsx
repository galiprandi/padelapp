import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/players/player-avatar";
import {
  Calendar,
  Clock,
  Trophy,
  Users,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

const MATCH_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DISPUTED: "DISPUTED",
  CANCELLED: "CANCELLED",
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
  const isParticipant = viewerId
    ? match.players.some((slot) => slot.userId === viewerId)
    : false;

  const dateStr = new Date(match.date).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-md flex flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-4">
        <Link
          href={session?.user ? "/me" : "/"}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Volver
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {match.matchType === "FRIENDLY" ? "Partido Amistoso" : "Torneo Local"}
          </h1>
          <p className="text-sm text-muted-foreground">Invitación de Partido</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground bg-muted/50 w-fit px-3 py-1.5 rounded-lg border border-border">
          <Calendar className="h-4 w-4 text-primary" />
          {dateStr}
        </div>
      </div>

      <Card className="rounded-xl border-border bg-card overflow-hidden">
        <CardHeader className="pb-4 pt-6 border-b border-border bg-muted/30">
          <CardTitle className="text-sm font-bold text-foreground">
            Información del encuentro
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-px bg-border p-0">
          <div className="bg-card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span className="text-xs font-semibold">Modalidad</span>
            </div>
            <p className="text-lg font-bold">{match.sets} sets</p>
          </div>

          <div className="bg-card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-semibold">Estado</span>
            </div>
            <p className="text-lg font-bold">{formatStatus(match.status)}</p>
          </div>

          <div className="col-span-2 bg-card p-4 flex items-center gap-4 border-t border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">
                {match.club || "Club por definir"}
              </p>
              <p className="text-xs text-muted-foreground">
                {match.courtNumber
                  ? `Cancha ${match.courtNumber}`
                  : "Sede del encuentro"}
              </p>
            </div>
          </div>
        </CardContent>
        {match.notes && (
          <div className="p-4 bg-muted/20 border-t border-border text-sm text-muted-foreground italic">
            <span className="block text-xs font-bold not-italic mb-1">
              Notas del organizador
            </span>
            "{match.notes}"
          </div>
        )}
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Jugadores convocados</h2>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid gap-6">
          {(["A", "B"] as const).map((teamKey) => {
            const teamPlayers = teamGroups[teamKey];
            if (teamPlayers.length === 0) return null;
            const label =
              teamPlayers[0]?.team?.label ??
              defaultTeamLabel(teamKey, totalPlayers);

            return (
              <div key={teamKey} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {label}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid gap-2">
                  {teamPlayers.map((player) => {
                    const name =
                      player.user?.displayName ??
                      player.displayName ??
                      `Cupo ${player.position + 1}`;
                    const isOccupied = !!player.userId;
                    const isConfirmed = player.resultConfirmed;
                    const isCreator = player.userId === match.creatorId;

                    if (!isOccupied) {
                      return (
                        <div
                          key={player.id}
                          className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-3 text-muted-foreground"
                        >
                          <div className="h-10 w-10 rounded-lg bg-muted border border-dashed border-border flex items-center justify-center text-lg">
                            🎾
                          </div>
                          <p className="text-xs font-semibold italic">
                            Cupo disponible
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={player.id}
                        className="flex items-center gap-3 rounded-xl bg-card p-3 border border-border"
                      >
                        <div className="relative">
                          <PlayerAvatar
                            name={name}
                            image={player.user?.image ?? undefined}
                            className="h-10 w-10"
                          />
                          {isConfirmed && (
                            <div className="absolute -right-1 -bottom-1 rounded-full bg-emerald-500 p-0.5 border-2 border-background">
                              <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate leading-tight">
                            {name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p
                              className={cn(
                                "text-[10px] font-semibold uppercase",
                                isConfirmed
                                  ? "text-emerald-600"
                                  : "text-muted-foreground",
                              )}
                            >
                              {isConfirmed ? "Confirmado" : "Pendiente"}
                            </p>
                            {player.user?.level && (
                              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                                Nivel {player.user.level}
                              </span>
                            )}
                          </div>
                        </div>
                        {isCreator && (
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                            Organizador
                          </span>
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

      <div className="flex flex-col gap-3 pt-6 border-t border-border">
        <Button asChild className="w-full h-12 rounded-lg text-base font-bold">
          <Link href={`/match/${match.id}`}>Ver partido en PadelApp</Link>
        </Button>

        {!session?.user ? (
          <Button
            asChild
            variant="ghost"
            className="w-full h-10 rounded-lg text-sm text-muted-foreground"
          >
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(`/match/${match.id}`)}`}
            >
              Iniciar sesión con Google
            </Link>
          </Button>
        ) : !isParticipant ? (
          <div className="rounded-xl p-4 bg-muted/50 border border-border text-center">
            <p className="text-xs text-muted-foreground">
              Para unirte, pedile al organizador tu enlace de cupo directo
            </p>
          </div>
        ) : (
          <div className="rounded-xl p-4 bg-primary/5 border border-primary/20 text-center">
            <p className="text-xs font-bold text-primary">
              ¡Ya formás parte de este partido!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
