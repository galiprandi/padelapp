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
import { createMagicLink } from "@/lib/magic-link";
import { prisma } from "@/lib/prisma";
import { SubmitResultForm } from "../submit-result-form";
import { ShareButton } from "@/components/share/share-button";

interface MatchDetailPageProps {
  params: { matchId: string };
}

function describeSlot(position: number): string {
  const team = position < 2 ? "Team A" : "Team B";
  const index = position % 2 === 0 ? 1 : 2;
  return `${team} · Player ${index}`;
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const session = await auth();
  const match = await prisma.match.findUnique({
    where: { id: params.matchId },
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
  const pendingInvitations = match.invitations.filter((invite) => !invite.accepted);
  const confirmedPlayers = match.players.filter((player) => player.confirmed);

  const shareUrl = createMagicLink({ resource: "match", identifier: match.id }).url;

  const viewerCanSubmitResult = Boolean(viewerPlayer) && match.status !== "CONFIRMED";

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Match details</p>
        <h1 className="text-2xl font-bold">{match.matchType === "FRIENDLY" ? "Partido amistoso" : "Torneo local"}</h1>
        <p className="text-sm text-muted-foreground">
          Organizado por {match.creator.displayName}. Compartí el link para que los demás confirmen.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Compartir</CardTitle>
          <CardDescription>Enviá el link a tu grupo.</CardDescription>
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
            <span className="font-medium text-foreground">{match.status}</span>
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
          <CardTitle>Jugadores</CardTitle>
          <CardDescription>Estados de confirmación.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {match.players.map((player) => (
            <div key={player.id} className="space-y-2 rounded-xl border border-border/70 bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{player.user?.displayName ?? "Pendiente"}</p>
                  <p className="text-xs text-muted-foreground">{describeSlot(player.position)}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    player.confirmed ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {player.confirmed ? "Confirmado" : "Pendiente"}
                </span>
              </div>
              {player.score ? (
                <p className="text-xs text-muted-foreground">Marcador reportado: {player.score}</p>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      {pendingInvitations.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Invitaciones pendientes</CardTitle>
            <CardDescription>Envía el link directo a cada jugador.</CardDescription>
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

      {viewerCanSubmitResult ? (
        <Card>
          <CardHeader>
            <CardTitle>Confirmar resultado</CardTitle>
            <CardDescription>Registrá el marcador final para cerrar el partido.</CardDescription>
          </CardHeader>
          <CardContent>
            <SubmitResultForm matchId={match.id} initialScore={match.score} initialNotes={match.notes} />
          </CardContent>
        </Card>
      ) : null}

      {viewerPlayer && !viewerPlayer.confirmed ? (
        <p className="text-sm text-muted-foreground">
          Cuando guardes el resultado, el resto de los jugadores va a recibir la notificación para confirmarlo.
        </p>
      ) : confirmedPlayers.length < match.players.length ? (
        <p className="text-sm text-muted-foreground">Esperando confirmación del resto de los jugadores.</p>
      ) : null}
    </div>
  );
}
