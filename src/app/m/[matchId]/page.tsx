import { auth } from "@/auth";
import { db } from "@/db";
import { matches, matchPlayers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Trophy,
  MapPin,
  Users,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import appSettings from "@/config/app-settings.json";
import { LocalDate } from "@/components/ui/local-date";

interface InvitationPageProps {
  params: Promise<{ matchId: string }>;
}

const brandWithEmoji = `🎾 ${appSettings.shortName}`;

export async function generateMetadata({
  params,
}: InvitationPageProps): Promise<Metadata> {
  const { matchId } = await params;
  const [match] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId))
    .limit(1);

  if (!match) {
    return { title: "Partido no encontrado" };
  }

  return {
    title: `Invitación a Partido - ${brandWithEmoji}`,
    description: `Sumate al partido en ${match.club || "el club"} el ${new Date(match.date).toLocaleDateString("es-AR")}.`,
  };
}

const MATCH_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DISPUTED: "DISPUTED",
  CANCELLED: "CANCELLED",
} as const;

type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

function formatStatus(status: string) {
  switch (status) {
    case MATCH_STATUS.PENDING:
      return "Pendiente";
    case MATCH_STATUS.CONFIRMED:
      return "Confirmado";
    case MATCH_STATUS.DISPUTED:
      return "En disputa";
    case MATCH_STATUS.CANCELLED:
      return "Cancelado";
    default:
      return status;
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

  const match = await db.query.matches.findFirst({
    where: eq(matches.id, matchId),
    with: {
      creator: true,
      players: {
        orderBy: asc(matchPlayers.position),
        with: { user: true, team: true },
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

  // dateStr is computed client-side via LocalDate to avoid hydration mismatch

  return (
    <main className="mx-auto min-h-screen w-full max-w-md flex flex-col gap-6 px-6 py-10 pb-32">
      <div className="flex items-center gap-4">
        <Link
          href={session?.user ? "/me" : "/"}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {match.matchType === "FRIENDLY"
              ? "Partido Amistoso"
              : "Torneo Local"}
          </h1>
          <p className="text-sm text-muted-foreground">Invitación de Partido</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Información del encuentro
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-px bg-border">
          <div className="bg-card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">Modalidad</span>
            </div>
            <p className="text-lg font-bold">{match.sets} sets</p>
          </div>

          <div className="bg-card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
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
                <LocalDate
                  date={match.date}
                  options={{ weekday: "long", day: "numeric", month: "long" }}
                />
                {match.courtNumber ? ` • Cancha ${match.courtNumber}` : ""}
              </p>
            </div>
          </div>
        </div>

        {match.notes && (
          <div className="p-4 bg-muted border-t border-border text-sm text-muted-foreground italic leading-relaxed">
            <span className="block text-xs font-bold not-italic mb-1 text-foreground">
              Notas del organizador
            </span>
            &ldquo;{match.notes}&rdquo;
          </div>
        )}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Jugadores convocados
          </h2>
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
                  <span className="text-xs font-bold text-muted-foreground">
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
                          className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted p-3 text-muted-foreground"
                        >
                          <div className="h-10 w-10 rounded-lg bg-background border border-dashed border-border flex items-center justify-center text-lg">
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
                            size={40}
                          />
                          {isConfirmed && (
                            <div className="absolute -right-1 -bottom-1 rounded-full bg-emerald-500 p-0.5 border-2 border-card">
                              <CheckCircle2 className="h-3 w-3 text-white" />
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
                                "text-xs font-semibold",
                                isConfirmed
                                  ? "text-emerald-600"
                                  : "text-muted-foreground",
                              )}
                            >
                              {isConfirmed ? "Confirmado" : "Pendiente"}
                            </p>
                            {player.user?.level && (
                              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
                                Nivel {player.user.level}
                              </span>
                            )}
                          </div>
                        </div>
                        {isCreator && (
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary border border-primary/20">
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

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border z-50">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <Button
            asChild
            className="w-full h-12 rounded-lg text-base font-bold shadow-sm"
          >
            <Link href={`/match/${match.id}`}>Ver partido en PadelApp</Link>
          </Button>

          {!session?.user ? (
            <Button
              asChild
              variant="ghost"
              className="w-full h-10 rounded-lg text-sm font-semibold text-muted-foreground"
            >
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(`/match/${match.id}`)}`}
              >
                Iniciar sesión con Google
              </Link>
            </Button>
          ) : !isParticipant ? (
            <div className="rounded-xl p-3 bg-muted border border-border text-center">
              <p className="text-xs font-medium text-muted-foreground">
                Para unirte, pedile al organizador tu enlace de cupo directo
              </p>
            </div>
          ) : (
            <div className="rounded-xl p-3 bg-primary/5 border border-primary/20 text-center">
              <p className="text-xs font-bold text-primary">
                ¡Ya formás parte de este partido!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
