import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { ShareButton } from "@/components/share/share-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createMagicLink } from "@/lib/magic-link";
import { prisma } from "@/lib/prisma";
import { ConfirmResultButton } from "./confirm-result-button";
import { EditMatchDetailsDialog } from "./edit-match-dialog";
import { ResultDialog } from "./result-dialog";
import { RenameTeamForm } from "./rename-team-form";
import { RenamePlaceholderForm } from "./rename-placeholder-form";
import { ReleaseSlotButton } from "./release-slot-button";

interface MatchDetailPageParams {
  matchId: string;
}

const MATCH_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DISPUTED: "DISPUTED",
} as const;

type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

interface MatchDetailPageProps {
  params: Promise<MatchDetailPageParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

function slotLabel(position: number, totalPlayers: number, teamLabel: string): string {
  const index = totalPlayers <= 2 ? position + 1 : (position % 2 === 0 ? 1 : 2);
  return `${teamLabel} · Jugador ${index}`;
}

function defaultTeamLabel(teamKey: "A" | "B", totalPlayers: number): string {
  if (totalPlayers <= 2) {
    return teamKey === "A" ? "Jugador A" : "Jugador B";
  }
  return teamKey === "A" ? "Pareja A" : "Pareja B";
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
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

  const viewerId = session?.user?.id ?? null;
  const viewerPlayer = match.players.find((player) => player.userId === viewerId);
  const isCreator = viewerId === match.creatorId;
  const isParticipant = Boolean(viewerPlayer);
  const viewerConfirmed = viewerPlayer?.resultConfirmed ?? false;

  type PlayerEntry = (typeof match.players)[number];
  const totalPlayers = match.players.length;
  const teamGroups: Record<"A" | "B", PlayerEntry[]> = { A: [], B: [] };

  for (const player of match.players) {
    const teamKey = teamKeyForPosition(player.position, totalPlayers);
    teamGroups[teamKey].push(player);
  }

  const teamMeta: Record<"A" | "B", { label: string; teamId: string | null }> = {
    A: { label: defaultTeamLabel("A", totalPlayers), teamId: null },
    B: { label: defaultTeamLabel("B", totalPlayers), teamId: null },
  };

  (Object.keys(teamGroups) as Array<"A" | "B">).forEach((teamKey) => {
    const sample = teamGroups[teamKey][0];
    if (sample?.team) {
      teamMeta[teamKey].label = sample.team.label;
      teamMeta[teamKey].teamId = sample.teamId ?? null;
    } else if (sample?.teamId) {
      teamMeta[teamKey].teamId = sample.teamId;
    }
  });

  const shareUrl = createMagicLink({ resource: "match", identifier: match.id }).url;

  const slotLinks = match.players.map((player) => {
    const teamKey = teamKeyForPosition(player.position, totalPlayers);
    const teamLabel = teamMeta[teamKey].label;
    return {
      playerId: player.id,
      team: teamKey,
      teamLabel,
      position: player.position,
      occupied: Boolean(player.userId),
      displayName: player.user?.displayName ?? player.displayName ?? null,
      link: createMagicLink({ resource: "player", identifier: player.id }).url,
    };
  });

  const canSubmitResult = isParticipant && match.status !== MATCH_STATUS.CONFIRMED;
  const canConfirmResult = isParticipant && !viewerConfirmed && Boolean(match.score);

  const showViewOnlyNotice = !isCreator && !canSubmitResult && !canConfirmResult;
  const showActionBar = canSubmitResult || canConfirmResult || isCreator || showViewOnlyNotice;

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">
          {match.matchType === "FRIENDLY" ? "Partido amistoso" : "Torneo local"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Organizado por {match.creator.displayName}. Compartí el link para sumar a tu equipo y cerrar el resultado.
        </p>
      </header>

      {showActionBar ? (
        <section className="space-y-3">
          <div className="flex flex-col gap-2">
            {canSubmitResult ? (
              <ResultDialog
                matchId={match.id}
                initialScore={match.score}
                initialNotes={match.notes}
                triggerLabel={match.score && isCreator ? "Modificar resultado" : "Cargar resultado"}
                sets={match.sets}
              />
            ) : null}

            {canConfirmResult ? (
              <ConfirmResultButton matchId={match.id} alreadyConfirmed={viewerConfirmed} />
            ) : null}
          </div>

          {isCreator ? (
            <div className="pt-1">
              <EditMatchDetailsDialog
                matchId={match.id}
                initialClub={match.club}
                initialCourtNumber={match.courtNumber}
                initialNotes={match.notes}
              />
            </div>
          ) : null}

          {showViewOnlyNotice ? (
            <p className="text-xs text-muted-foreground">Solo podés ver el detalle de este partido.</p>
          ) : null}
        </section>
      ) : null}

      <Card className="rounded-lg">
        <CardHeader className="rounded-lg bg-muted/30">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Resumen</CardTitle>
            <span className="rounded-md bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {formatStatus(match.status)}
            </span>
          </div>
          <CardDescription>Información general del partido.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
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
          {match.score ? (
            <div className="space-y-1">
              <span className="text-muted-foreground">Resultado</span>
              <p className="font-medium text-foreground">{match.score}</p>
            </div>
          ) : null}
          {match.notes ? (
            <div className="space-y-1">
              <span className="text-muted-foreground">Notas</span>
              <p className="text-foreground">{match.notes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader className="rounded-lg bg-muted/30">
          <CardTitle>Compartir</CardTitle>
          <CardDescription>Enviá el link general o compartí cada cupo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-3 text-sm">
            <p className="break-words text-foreground">{shareUrl}</p>
            <div className="flex flex-wrap gap-2">
              <ShareButton
                url={shareUrl}
                size="sm"
                variant="secondary"
                copyMessage="Link copiado"
                successMessage="Link compartido"
              />
              <Button type="button" size="sm" variant="secondary" asChild>
                <a href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">
                  Compartir en WhatsApp
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Links por cupo</p>
            <div className="space-y-3">
              {slotLinks.map((slot) => (
                <div key={slot.playerId} className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{slotLabel(slot.position, totalPlayers, slot.teamLabel)}</p>
                      <p className="text-xs text-muted-foreground">
                        {slot.occupied ? slot.displayName ?? "Confirmado" : "Pendiente de confirmación"}
                      </p>
                    </div>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${slot.occupied ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                      {slot.occupied ? "Ocupado" : "Pendiente"}
                    </span>
                  </div>
                  <p className="break-words text-muted-foreground">{slot.link}</p>
                  <ShareButton
                    url={slot.link}
                    size="sm"
                    variant="outline"
                    copyMessage="Link copiado"
                    successMessage="Link compartido"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold">Parejas</h2>
          <p className="text-sm text-muted-foreground">Seguimiento de confirmaciones por jugador.</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["A", "B"] as const).map((teamKey) => {
            const teamPlayers = teamGroups[teamKey];
            const meta = teamMeta[teamKey];

            return (
              <div key={teamKey} className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">{meta.label}</p>
                  {isCreator && meta.teamId ? (
                    <RenameTeamForm teamId={meta.teamId} matchId={match.id} initialLabel={meta.label} />
                  ) : null}
                </div>

                <div className="space-y-3">
                  {teamPlayers.map((player) => {
                    const resolvedName =
                      player.user?.displayName ??
                      player.displayName ??
                      `Jugador ${player.position + 1}`;
                    const linkLabel = slotLabel(player.position, totalPlayers, meta.label);
                    const statusLabel = player.userId
                      ? player.resultConfirmed
                        ? "Confirmado"
                        : "Pendiente"
                      : "Libre";
                    const statusClass = player.userId
                      ? player.resultConfirmed
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                      : "bg-muted text-muted-foreground";

                    return (
                      <div key={player.id} className="space-y-3 rounded-md border border-border/60 bg-muted/30 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background text-sm font-semibold text-primary">
                            {initials(resolvedName)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{resolvedName}</p>
                            <p className="text-xs text-muted-foreground">{linkLabel}</p>
                          </div>
                          <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
                        </div>

                        {isCreator && !player.userId ? (
                          <RenamePlaceholderForm
                            playerId={player.id}
                            initialDisplayName={player.displayName ?? resolvedName}
                          />
                        ) : null}

                        {isCreator && player.userId ? (
                          <div className="pt-1">
                            <ReleaseSlotButton playerId={player.id} displayName={player.displayName ?? resolvedName} />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {canSubmitResult || canConfirmResult ? (
        <p className="text-sm text-muted-foreground">
          Los resultados impactarán en tu reputación una vez confirmados por ambos equipos.
        </p>
      ) : match.status !== MATCH_STATUS.CONFIRMED ? (
        <p className="text-sm text-muted-foreground">
          Aguardando confirmaciones de los jugadores para cerrar el encuentro.
        </p>
      ) : null}
    </div>
  );
}
