import { auth } from "@/auth";
import {
  getMatchByIdAction,
  confirmMatchResultAction,
  cancelMatchAction,
} from "@/app/(app)/match/actions";
import { Button } from "@/components/ui/button";
import { MatchResultCompact } from "@/components/matches/match-result-card";
import { MatchPlayersManager } from "@/components/matches/match-players-manager";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { ShareButton } from "@/components/share/share-button";
import { FileText, CheckCircle2, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { createMagicLink } from "@/lib/magic-link";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

interface MatchPageProps {
  params: Promise<{
    matchId: string;
  }>;
}

async function ConfirmResultForm({ matchId }: { matchId: string }) {
  async function handleConfirm() {
    "use server";
    await confirmMatchResultAction(matchId);
    redirect(`/match/${matchId}`);
  }

  return (
    <form action={handleConfirm} className="w-full">
      <Button type="submit" className="w-full h-12">
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Confirmar Resultado
      </Button>
    </form>
  );
}

async function CancelMatchForm({ matchId }: { matchId: string }) {
  async function handleCancel() {
    "use server";
    const result = await cancelMatchAction(matchId);
    if (result.status === "ok") {
      redirect("/match");
    }
    // Note: In a real RSC scenario we might want to handle the error state better,
    // but for now this follows the pattern of redirecting only on success.
  }

  return (
    <form action={handleCancel} className="w-full">
      <Button
        type="submit"
        variant="ghost"
        className="w-full text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Eliminar Partido
      </Button>
    </form>
  );
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { matchId } = await params;
  const session = await auth();
  const viewerId = session?.user?.id;

  // Obtener datos del match
  const result = await getMatchByIdAction(matchId);

  if (!result.match) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold text-foreground">
          Partido no encontrado
        </h1>
        <Button asChild>
          <Link href="/match/new">Crear partido</Link>
        </Button>
      </div>
    );
  }
  const match = result.match;

  const isClosed = Boolean(match.score) || match.status === "CONFIRMED";
  const isCancelled = match.status === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold text-foreground">Partido cancelado</h1>
        <Button asChild variant="ghost">
          <Link href="/match">Volver a mis partidos</Link>
        </Button>
      </div>
    );
  }

  // Agrupar jugadores por equipo
  const teamsMap = new Map();
  match.players.forEach((player) => {
    if (player.teamId) {
      if (!teamsMap.has(player.teamId)) {
        teamsMap.set(player.teamId, {
          id: player.teamId,
          label: player.team?.label || `Equipo ${player.teamId.slice(-4)}`,
          players: [],
        });
      }
      const displayName =
        player.displayName ||
        player.user?.displayName ||
        `Jugador ${player.position + 1}`;
      teamsMap.get(player.teamId).players.push({
        id: player.id,
        userId: player.userId,
        name: displayName,
        image: player.user?.image,
        isConfirmed: player.resultConfirmed,
        category: player.user ? 5 : undefined, // Placeholder para categoría
        placeholderName: player.displayName || displayName,
      });
    }
  });

  const teams = Array.from(teamsMap.values());

  // Transform match data for MatchResultCompact component
  const matchResultData = {
    id: match.id,
    createdAt: match.createdAt,
    score: match.score,
    status: match.status,
    players: match.players.map((player) => ({
      id: player.id,
      position: player.position,
      user: player.user
        ? {
            id: player.user.id,
            displayName: player.user.displayName,
            image: player.user.image,
          }
        : null,
    })),
  };

  const isPendingConfirmation = match.score && match.status !== "CONFIRMED";
  const userNeedsToConfirm =
    viewerId &&
    match.players.some((p) => p.userId === viewerId && !p.resultConfirmed);

  return (
    <div className={cn("flex flex-col gap-6", userNeedsToConfirm && "pb-32")}>
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Partido {getMatchTypeLabel(match.matchType)}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-semibold",
              match.status === "CONFIRMED"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            {match.status === "PENDING"
              ? "Pendiente"
              : match.status === "CONFIRMED"
                ? "Confirmado"
                : "En disputa"}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(match.date).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {match.club && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
            <span className="text-xs text-muted-foreground">Club:</span>
            <span className="text-sm font-semibold text-foreground truncate">
              {match.club}
              {match.courtNumber ? ` · Cancha ${match.courtNumber}` : ""}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
          <PlayerAvatar
            name={match.creator?.displayName || "U"}
            image={match.creator?.image ?? undefined}
            className="h-8 w-8 rounded-lg"
          />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Organizador</span>
            <span className="text-sm font-semibold text-foreground">
              {match.creator?.displayName || "Usuario"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {!isClosed ? (
          <>
            <Button asChild className="w-full h-12">
              <Link href={`/match/${match.id}/result`}>
                <FileText className="mr-2 h-4 w-4" />
                Ingresar Resultado
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1 h-10">
                <Link href={`/match/${match.id}/edit`}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <ShareButton
                title="Invitación a partido de Pádel"
                text={`¡Sumate a mi partido de pádel el ${new Date(match.date).toLocaleDateString()}!`}
                url={
                  createMagicLink({ resource: "match", identifier: match.id })
                    .url
                }
                variant="outline"
                aria-label="Compartir invitación al partido"
                className="flex-1 h-10"
              />
            </div>
            {viewerId === match.creatorId && (
              <CancelMatchForm matchId={match.id} />
            )}
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1 h-10">
                <Link href={`/match/${match.id}/edit`}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <ShareButton
                title="Resultado de Pádel"
                text="¡Mira el resultado de nuestro partido de pádel!"
                url={
                  createMagicLink({ resource: "match", identifier: match.id })
                    .url
                }
                variant="outline"
                aria-label="Compartir resultado del partido"
                className="flex-1 h-10"
              />
            </div>
            {viewerId === match.creatorId && match.status !== "CONFIRMED" && (
              <CancelMatchForm matchId={match.id} />
            )}
          </>
        )}
      </div>

      {isClosed ? (
        <div className="space-y-6">
          <section className="flex flex-col items-center justify-center text-center py-10 rounded-xl border border-border bg-card">
            <span className="text-xs text-muted-foreground mb-4">
              Resultado Final
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 px-4">
              {match.score?.split(",").map((set, idx) => (
                <div
                  key={idx}
                  className="text-5xl font-bold tracking-tight text-foreground leading-none"
                >
                  {set.trim()}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="flex -space-x-2 items-center">
                {match.players
                  .sort((a, b) => a.position - b.position)
                  .map((p) => (
                    <PlayerAvatar
                      key={p.id}
                      name={p.displayName || p.user?.displayName || ""}
                      image={p.user?.image ?? undefined}
                      className="border-2 border-background"
                      size={40}
                    />
                  ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Modalidad {getMatchTypeLabel(match.matchType)}
              </p>
            </div>
          </section>

          <MatchResultCompact
            match={matchResultData}
            matchDate={match.createdAt}
            detailUrl={`/match/${match.id}`}
            viewerId={viewerId}
          />

          {isPendingConfirmation && (
            <section className="space-y-4 rounded-xl border border-border bg-card p-4">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-foreground">
                  Estado de Confirmación
                </h2>
                <p className="text-xs text-muted-foreground">
                  Para que este resultado impacte en el ranking, un jugador de
                  cada equipo debe validarlo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {match.players
                  .sort((a, b) => a.position - b.position)
                  .map((player) => {
                    const displayName =
                      player.displayName ||
                      player.user?.displayName ||
                      `Jugador ${player.position + 1}`;
                    const isConfirmed = player.resultConfirmed;
                    const isViewer = player.userId === viewerId;

                    return (
                      <div
                        key={player.id}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-lg border",
                          isConfirmed
                            ? "bg-primary/5 border-primary/20"
                            : "bg-card border-border",
                        )}
                      >
                        <div className="relative">
                          <PlayerAvatar
                            name={displayName}
                            image={player.user?.image ?? undefined}
                            className={cn(
                              "h-12 w-12 border-2 border-background",
                              !isConfirmed && "opacity-60",
                            )}
                          />
                          <div
                            className={cn(
                              "absolute -right-0.5 -bottom-0.5 rounded-full p-0.5 border border-background",
                              isConfirmed ? "bg-primary" : "bg-muted",
                            )}
                          >
                            {isConfirmed ? (
                              <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-col items-center text-center gap-0.5 min-w-0 w-full">
                          <span
                            className={cn(
                              "text-xs font-semibold truncate w-full",
                              isConfirmed
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {isViewer ? "Tú" : displayName}
                          </span>
                          <span
                            className={cn(
                              "text-xs",
                              isConfirmed
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          >
                            {isConfirmed ? "Confirmado" : "Pendiente"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

            </section>
          )}

          {userNeedsToConfirm && (
            <div className="fixed bottom-20 left-0 right-0 z-30 px-5 pb-4">
              <div className="mx-auto max-w-md rounded-xl border border-primary/20 bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">
                      Confirmación pendiente
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Validá el resultado para impactar el ranking.
                    </span>
                  </div>
                </div>
                <ConfirmResultForm matchId={match.id} />
              </div>
            </div>
          )}

          {!isPendingConfirmation && match.status === "CONFIRMED" && (
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Partido procesado en el Ranking
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">
              Formación de equipos
            </h2>
            <MatchPlayersManager
              matchId={match.id}
              creatorId={match.creatorId}
              teams={teams.map((team) => ({
                id: team.id,
                label: team.label,
                players: team.players.map(
                  (player: {
                    id: string;
                    userId?: string | null;
                    name: string;
                    image?: string | null;
                    isConfirmed?: boolean;
                    placeholderName: string;
                  }) => ({
                    matchPlayerId: player.id,
                    userId: player.userId,
                    name: player.name,
                    image: player.image,
                    isConfirmed: player.isConfirmed,
                    placeholderName: player.placeholderName,
                  }),
                ),
              }))}
            />
          </section>

          {match.notes && (
            <section className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-2">
                Notas del organizador
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                &ldquo;{match.notes}&rdquo;
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

const getMatchTypeLabel = (matchType: string) => {
  switch (matchType) {
    case "FRIENDLY":
      return "amistoso";
    case "LOCAL_TOURNAMENT":
      return "torneo";
    default:
      return matchType;
  }
};
