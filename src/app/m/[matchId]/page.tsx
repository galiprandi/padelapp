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

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-5 py-10">
      <header className="space-y-2 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Partido compartido</p>
        <h1 className="text-2xl font-semibold text-foreground">{match.matchType === "FRIENDLY" ? "Partido amistoso" : "Torneo local"}</h1>
        <p className="text-sm text-muted-foreground">
          {match.creator.displayName} organizó este partido. Iniciá sesión para verlo completo o sumarte desde tu cupo.
        </p>
      </header>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Resumen</CardTitle>
          <CardDescription>Estado y datos principales.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
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
          {(["A", "B"] as const).map((teamKey) => {
            const teamPlayers = teamGroups[teamKey];
            if (teamPlayers.length === 0) {
              return null;
            }
            const label = teamPlayers[0]?.team?.label ?? defaultTeamLabel(teamKey, totalPlayers);

            return (
              <div key={teamKey} className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                <div className="space-y-2">
                  {teamPlayers.map((player) => {
                    const name = player.user?.displayName ?? player.displayName ?? `Jugador ${player.position + 1}`;
                    const status = player.userId ? (player.resultConfirmed ? "Confirmado" : "Pendiente") : "Libre";

                    return (
                      <div key={player.id} className="flex items-center gap-3 rounded-md border border-border/60 bg-background/80 px-3 py-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-semibold text-primary">
                          {initials(name)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground">Jugador {player.position + 1}</p>
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
          <CardTitle>¿Querés participar?</CardTitle>
          <CardDescription>
            Accedé a tu enlace personalizado desde el creador o iniciá sesión para gestionar tus partidos desde la app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href={`/match/${match.id}`}>Ver partido en PadelApp</Link>
          </Button>
          {!session?.user ? (
            <Button asChild variant="outline" className="w-full">
              <Link href={`/login?callbackUrl=${encodeURIComponent(`/match/${match.id}`)}`}>Iniciar sesión con Google</Link>
            </Button>
          ) : !isParticipant ? (
            <p className="text-xs text-muted-foreground">
              Pedile al organizador el enlace directo de tu cupo (`/j/${viewerPlayerId}`) para confirmar tu asistencia.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Ya formás parte de este partido.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
