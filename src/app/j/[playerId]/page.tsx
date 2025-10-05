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
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-5 py-10">
      <header className="space-y-2 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Invitación directa</p>
        <h1 className="text-2xl font-semibold text-foreground">Unite como {teamLabel}</h1>
        <p className="text-sm text-muted-foreground">
          {match.creator.displayName} te compartió este enlace para completar el equipo.
        </p>
      </header>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Detalle del partido</CardTitle>
          <CardDescription>Confirmá que los datos sean correctos antes de sumarte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Organizador</span>
            <span className="font-medium text-foreground">{match.creator.displayName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estado</span>
            <span className="rounded-md bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {formatStatus(match.status)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Sets</span>
            <span className="font-medium text-foreground">{match.sets}</span>
          </div>
          {match.club ? (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Club</span>
              <span className="font-medium text-foreground">{match.club}</span>
            </div>
          ) : null}
          {match.courtNumber ? (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">N° de cancha</span>
              <span className="font-medium text-foreground">{match.courtNumber}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Jugadores</h2>
        <div className="grid gap-3">
          {(["A", "B"] as const).map((key) => {
            const slots = teamGroups[key];
            if (slots.length === 0) {
              return null;
            }
            const label = slots[0]?.team?.label ?? defaultTeamLabel(key, totalPlayers);

            return (
              <div key={key} className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                <div className="space-y-2">
                  {slots.map((slot) => {
                    const name = slot.user?.displayName ?? slot.displayName ?? `Jugador ${slot.position + 1}`;
                    const status = slot.userId ? (slot.resultConfirmed ? "Confirmado" : "Pendiente") : "Libre";

                    return (
                      <div key={slot.id} className="flex items-center gap-3 rounded-md border border-border/60 bg-background/80 px-3 py-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-semibold text-primary">
                          {initials(name)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground">Jugador {slot.position + 1}</p>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">{status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Tu cupo</CardTitle>
          <CardDescription>Este acceso es único. Al confirmar, tu nombre figurará como {teamLabel}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2">
            <div>
              <p className="font-semibold text-foreground">{slotName}</p>
              <p className="text-xs text-muted-foreground">Jugador {player.position + 1}</p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {slotTaken ? (slotTakenByViewer ? "Tu lugar" : "Ocupado") : "Libre"}
            </span>
          </div>

          {helperMessage ? <p className="text-xs text-destructive">{helperMessage}</p> : null}
          {!session?.user ? (
            <Button asChild className="w-full">
              <Link href={`/login?callbackUrl=${encodeURIComponent(`/j/${playerId}`)}`}>
                Iniciar sesión con Google
              </Link>
            </Button>
          ) : slotTakenByViewer ? (
            <Button asChild variant="secondary" className="w-full">
              <Link href={`/match/${match.id}`}>Ya confirmaste · Ver partido</Link>
            </Button>
          ) : (
            <JoinSlotButton
              playerId={player.id}
              matchId={match.id}
              disabled={joinDisabled}
              redirectOnSuccess={`/match/${match.id}`}
            />
          )}

          <Button asChild variant="ghost" className="w-full">
            <Link href={`/match/${match.id}`}>Ver detalles del partido</Link>
          </Button>

          {isOwner ? (
            <p className="text-xs text-muted-foreground">
              Sos el organizador. Podés liberar este cupo desde la vista completa del partido.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
