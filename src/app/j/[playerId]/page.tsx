import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { matchPlayers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { JoinSlotButton } from "./join-slot-button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, UserCheck, Trophy, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function JoinSlotPage({ params }: JoinSlotPageProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md flex flex-col gap-6 px-6 py-10 pb-48">
      <div className="flex flex-col gap-4">
        <Link
          href="/me"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Volver
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Invitación a jugar
          </h1>
          <p className="text-sm text-muted-foreground">
            Invitación directa para partido de pádel
          </p>
        </div>
      </div>

      <Suspense fallback={<JoinSlotSkeleton />}>
        <JoinSlotContent params={params} />
      </Suspense>
    </main>
  );
}

async function JoinSlotContent({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const session = await auth();

  const player = await db.query.matchPlayers.findFirst({
    where: eq(matchPlayers.id, playerId),
    with: {
      user: true,
      team: true,
      match: {
        with: {
          creator: true,
          players: {
            orderBy: asc(matchPlayers.position),
            with: { user: true, team: true },
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
    <>
      <div className="rounded-lg bg-muted p-4 border border-border">
        <p className="text-sm font-medium text-muted-foreground">
          Te invitaron a sumarte como{" "}
          <span className="font-bold text-foreground">{teamLabel}</span>.
        </p>
      </div>

      <Card className="rounded-xl border-border bg-card overflow-hidden">
        <CardHeader className="pb-4 pt-6 border-b border-border bg-muted">
          <CardTitle className="text-xs font-bold text-muted-foreground">
            Detalle del partido
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
              <span className="text-xs font-semibold">Estado</span>
            </div>
            <div className="flex items-center pt-1">
              <Badge
                variant={match.status === "CONFIRMED" ? "success" : "default"}
                className="text-xs font-bold px-2 py-0.5 rounded"
              >
                {formatStatus(match.status)}
              </Badge>
            </div>
          </div>
          {match.club && (
            <div className="col-span-2 bg-card p-4 flex items-center gap-4 border-t border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">
                  {match.club}{" "}
                  {match.courtNumber ? `(Cancha ${match.courtNumber})` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sede del encuentro
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            Formación actual
          </h2>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid gap-6">
          {(["A", "B"] as const).map((key) => {
            const slots = teamGroups[key];
            if (slots.length === 0) return null;
            const label =
              slots[0]?.team?.label ?? defaultTeamLabel(key, totalPlayers);

            return (
              <div key={key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">
                    {label}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid gap-2">
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
                          "flex items-center gap-3 rounded-xl p-3 border",
                          isViewer
                            ? "bg-primary/5 border-primary/20"
                            : "bg-card border-border",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold shrink-0",
                            isOccupied
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground/30",
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
                              "text-sm font-bold truncate leading-tight",
                              isOccupied
                                ? "text-foreground"
                                : "text-muted-foreground italic",
                            )}
                          >
                            {name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Jugador {slot.position + 1}
                          </p>
                        </div>
                        {isOccupied && (
                          <Badge
                            variant="outline"
                            className="text-xs font-bold border-emerald-500/20 text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded"
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

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border z-50">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-muted-foreground leading-none mb-1">
                  Te unirás como
                </p>
                <p className="text-xl font-bold text-foreground truncate">
                  {teamLabel}
                </p>
              </div>
            </div>

            {helperMessage && (
              <div className="flex items-center gap-3 rounded-lg bg-destructive/5 p-3 text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-xs font-bold">{helperMessage}</p>
              </div>
            )}

            <div className="space-y-3">
              {!session?.user ? (
                <SignInForm
                  callbackUrl={`/j/${playerId}`}
                  label={`Iniciá sesión para unirte a ${match.club ?? "el partido"}`}
                  className="w-full h-12 rounded-lg text-base font-bold"
                />
              ) : slotTakenByViewer ? (
                <Button
                  asChild
                  variant="secondary"
                  className="w-full h-12 rounded-lg text-base font-bold"
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

              <Link
                href={`/match/${match.id}`}
                className="block text-center text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-1"
              >
                Ver todos los detalles del encuentro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function JoinSlotSkeleton() {
  return (
    <div className="space-y-6">
      {/* Detail card skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-10 bg-muted border-b border-border flex items-center px-4">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="grid grid-cols-2 gap-px bg-border">
          <div className="bg-card p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="bg-card p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>

      {/* Formation skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <div className="grid gap-2">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
