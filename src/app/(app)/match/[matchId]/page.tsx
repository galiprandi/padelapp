import { MatchStatus } from "@prisma/client";
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
import { FinalizeMatchButton } from "./finalize-match-button";
import { ResultDialog } from "./result-dialog";

interface MatchDetailPageParams {
  matchId: string;
}

interface MatchDetailPageProps {
  params: Promise<MatchDetailPageParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function describeSlot(position: number): string {
  const team = position < 2 ? "Pareja A" : "Pareja B";
  const index = position % 2 === 0 ? 1 : 2;
  return `${team} · Jugador ${index}`;
}

function formatStatus(status: MatchStatus): string {
  switch (status) {
    case MatchStatus.CONFIRMED:
      return "Confirmado";
    case MatchStatus.DISPUTED:
      return "En disputa";
    case MatchStatus.PENDING:
    default:
      return "Pendiente";
  }
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
        include: { user: true },
      },
      invitations: true,
    },
  });

  if (!match) {
    notFound();
  }

  const viewerId = session?.user?.id ?? null;
  const viewerPlayer = match.players.find((player) => player.userId === viewerId);
  const isCreator = viewerId === match.creatorId;
  const isParticipant = Boolean(viewerPlayer);
  const viewerConfirmed = viewerPlayer?.confirmed ?? false;

  const shareUrl = createMagicLink({ resource: "match", identifier: match.id }).url;
  const teamPlayers = {
    A: match.players.filter((player) => player.position < 2),
    B: match.players.filter((player) => player.position >= 2),
  } as const;

  const pendingInvitations = isCreator ? match.invitations.filter((invite) => !invite.accepted) : [];

  const canSubmitResult = isParticipant && match.status !== MatchStatus.CONFIRMED;
  const canConfirmResult = isParticipant && !viewerConfirmed && Boolean(match.score);
  const canFinalizeMatch = isCreator && match.status !== MatchStatus.CONFIRMED && Boolean(match.score);

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Partido creado</p>
            <h1 className="text-2xl font-bold">
              {match.matchType === "FRIENDLY" ? "Partido amistoso" : "Torneo local"}
            </h1>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            {formatStatus(match.status)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Organizado por {match.creator.displayName}. Compartí el link para invitar y confirmar a tu equipo.
        </p>
      </header>

      {(canSubmitResult || canConfirmResult || isCreator) && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
            <CardDescription>
              Gestioná el partido, actualizá los datos o completá el resultado final.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {canSubmitResult ? (
              <ResultDialog
                matchId={match.id}
                initialScore={match.score}
                initialNotes={match.notes}
                triggerLabel={match.score ? "Actualizar resultado" : "Cargar resultado"}
              />
            ) : null}

            {canConfirmResult ? (
              <ConfirmResultButton matchId={match.id} alreadyConfirmed={viewerConfirmed} />
            ) : null}

            {isCreator ? (
              <EditMatchDetailsDialog
                matchId={match.id}
                initialClub={match.club}
                initialCourtNumber={match.courtNumber}
                initialNotes={match.notes}
              />
            ) : null}

            {isCreator ? (
              <FinalizeMatchButton matchId={match.id} disabled={!canFinalizeMatch} />
            ) : null}

            {!canSubmitResult && !canConfirmResult && !isCreator ? (
              <span className="text-sm text-muted-foreground">
                Solo podés ver el detalle de este partido.
              </span>
            ) : null}

            {isCreator && !match.score ? (
              <span className="text-xs text-muted-foreground">
                Cargá el resultado antes de finalizar el partido.
              </span>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Compartir</CardTitle>
          <CardDescription>Enviá el link para sumar confirmaciones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3 text-sm">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
          <CardDescription>Información general del partido.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estado</span>
            <span className="font-medium text-foreground">{formatStatus(match.status)}</span>
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

      <Card>
        <CardHeader>
          <CardTitle>Parejas</CardTitle>
          <CardDescription>Seguimiento de confirmaciones por equipo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(["A", "B"] as const).map((team) => {
            const entries = teamPlayers[team];
            return (
              <div key={team} className="space-y-3 rounded-xl border border-border/70 bg-muted/30 p-4">
                <p className="text-sm font-semibold text-muted-foreground">
                  {team === "A" ? "Pareja A" : "Pareja B"}
                </p>
                <div className="space-y-2">
                  {entries.map((player) => (
                    <div key={player.id} className="space-y-1 rounded-lg border border-border/60 bg-background/80 p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">{player.user?.displayName ?? "Pendiente"}</p>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            player.confirmed
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {player.confirmed ? "Confirmado" : "Pendiente"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{describeSlot(player.position)}</p>
                      {player.score ? (
                        <p className="text-xs text-muted-foreground">Marcador reportado: {player.score}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {pendingInvitations.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Invitaciones pendientes</CardTitle>
            <CardDescription>Enviá los links directos para completar el equipo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingInvitations.map((invitation) => {
              const playerForInvitation = match.players.find(
                (player) => player.position === invitation.position,
              );
              const inviteContact = playerForInvitation?.user?.displayName ?? invitation.email;
              const invitationUrl = createMagicLink({
                resource: "match",
                identifier: match.id,
                query: { token: invitation.token },
              }).url;

              return (
                <div
                  key={invitation.id}
                  className="space-y-2 rounded-lg border border-dashed border-border/70 bg-muted/20 p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{inviteContact}</p>
                      <p className="text-xs text-muted-foreground">
                        {invitation.email} · {describeSlot(invitation.position)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Expira {invitation.expiresAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ShareButton
                      url={invitationUrl}
                      size="sm"
                      variant="secondary"
                      copyMessage={`Link para ${inviteContact} copiado`}
                      successMessage="Invitación compartida"
                    />
                    <Button type="button" size="sm" variant="secondary" asChild>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `¡Hola ${inviteContact}! Confirmá tu lugar en PadelApp: ${invitationUrl}`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Enviar por WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      {canSubmitResult || canConfirmResult ? (
        <p className="text-sm text-muted-foreground">
          Los resultados impactarán en tu reputación una vez confirmados por ambos equipos.
        </p>
      ) : match.status !== MatchStatus.CONFIRMED ? (
        <p className="text-sm text-muted-foreground">
          Aguardando confirmaciones de los jugadores para cerrar el encuentro.
        </p>
      ) : null}
    </div>
  );
}
