"use client";

import { Fragment, useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  getMatchByIdAction,
  saveMatchResultAction,
} from "@/app/(app)/match/actions";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy } from "lucide-react";
import { MatchNavigation } from "@/components/matches/match-navigation";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { AttendanceMarker } from "@/components/matches/attendance-marker";
import { useToast } from "@/components/toast/use-toast";
import { cn } from "@/lib/utils";

interface MatchPlayer {
  id: string;
  position: number;
  userId: string | null;
  displayName: string | null;
  teamId: string | null;
  resultConfirmed: boolean;
  joinedAt: Date | null;
  attendance: string | null;
  side: "RIGHT" | "LEFT" | null;
  user?: {
    id: string;
    displayName: string | null;
    image: string | null;
  } | null;
  team?: {
    id: string;
    label: string;
  } | null;
}

interface MatchData {
  id: string;
  creatorId: string;
  status: string;
  sets: number;
  matchType: string;
  club: string | null;
  courtNumber: string | null;
  notes: string | null;
  score: string | null;
  date: Date;
  createdAt: Date;
  creator?: {
    id: string;
    displayName: string | null;
    image: string | null;
  } | null;
  players: MatchPlayer[];
}

interface TeamDisplayPlayer {
  id: string;
  name: string;
  image?: string;
  isConfirmed: boolean;
  category?: number;
}

interface TeamDisplay {
  id: string;
  label: string;
  players: TeamDisplayPlayer[];
}

export default function MatchResultPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<number[][]>([]);
  const [playerSides, setPlayerSides] = useState<Record<string, "RIGHT" | "LEFT" | null>>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    params.then(({ matchId }) => {
      getMatchByIdAction(matchId).then((result) => {
        if (result.status === "ok" && result.match) {
          const setsCount = Math.max(1, result.match.sets || 1);
          setMatch(result.match as unknown as MatchData);

          // Initialize player sides
          const sidesInit: Record<string, "RIGHT" | "LEFT" | null> = {};
          result.match.players.forEach((p) => {
            sidesInit[p.id] = (p.side as "RIGHT" | "LEFT" | null) ?? null;
          });
          setPlayerSides(sidesInit);

          if (result.match.score) {
            const parsedScores = result.match.score
              .split(",")
              .map((s) => s.trim().split("-").map(Number));

            while (parsedScores.length < setsCount) {
              parsedScores.push([0, 0]);
            }

            const normalizedScores = parsedScores.map((set) => {
              const normalizedSet = [...set];
              while (normalizedSet.length < 2) {
                normalizedSet.push(0);
              }
              return normalizedSet.slice(0, 2);
            });
            setScores(normalizedScores.slice(0, setsCount));
          } else {
            setScores(Array.from({ length: setsCount }, () => [0, 0]));
          }
        } else {
          notFound();
        }
        setLoading(false);
      });
    });
  }, [params]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando marcador...</p>
      </div>
    );
  }
  if (!match) return <div>No encontrado</div>;

  const isClosed = Boolean(match.score) || match.status === "CONFIRMED";

  const teamsMap = new Map<string, TeamDisplay>();
  match.players.forEach((player) => {
    if (player.teamId) {
      if (!teamsMap.has(player.teamId)) {
        teamsMap.set(player.teamId, {
          id: player.teamId,
          label: player.team?.label || `Equipo ${player.teamId.slice(-4)}`,
          players: [],
        });
      }
      teamsMap.get(player.teamId)!.players.push({
        id: player.id,
        name:
          player.displayName ||
          player.user?.displayName ||
          `Jugador ${player.position + 1}`,
        image: player.user?.image ? player.user.image : undefined,
        isConfirmed: player.resultConfirmed,
        category: player.user ? 5 : undefined,
      });
    }
  });
  const teams = Array.from(teamsMap.values());

  const handleSideChange = (playerId: string, side: "RIGHT" | "LEFT") => {
    setPlayerSides((prev) => {
      const next = { ...prev };
      const currentSide = next[playerId];
      const newSide = currentSide === side ? null : side;
      next[playerId] = newSide;

      // Find the teammate in the current team
      const team = teams.find((t) => t.players.some((p) => p.id === playerId));
      if (team && team.players.length === 2) {
        const teammate = team.players.find((p) => p.id !== playerId);
        if (teammate) {
          if (newSide !== null) {
            next[teammate.id] = newSide === "RIGHT" ? "LEFT" : "RIGHT";
          } else {
            next[teammate.id] = null;
          }
        }
      }
      return next;
    });
  };

  const save = () => {
    const setsCount = Math.max(1, match.sets || 1);
    const scoreStr = scores
      .slice(0, setsCount)
      .map((set) => `${set[0]}-${set[1]}`)
      .join(", ");

    const sidesPayload = Object.entries(playerSides)
      .filter(([_, side]) => side !== null)
      .map(([playerId, side]) => ({ playerId, side: side! }));

    startTransition(async () => {
      const res = await saveMatchResultAction({
        matchId: match.id,
        score: scoreStr,
        sides: sidesPayload,
      });
      if (res.status === "ok") {
        showToast("Resultado guardado");
        router.push(`/match/${match.id}`);
        router.refresh();
      } else {
        showToast(res.message || "No se pudo guardar el resultado", {
          duration: 4000,
        });
      }
    });
  };

  const subtitle = isClosed
    ? `Marcador registrado: ${match.score}`
    : "Ingresá los juegos ganados por cada equipo.";

  const isCreator = session?.user?.id === match.creatorId;
  const oneHourAfterMatch = new Date(
    new Date(match.date).getTime() + 60 * 60 * 1000,
  );
  const canMarkAttendance =
    isCreator && new Date() > oneHourAfterMatch;

  const attendancePlayers = match.players
    .filter((p) => p.userId !== null)
    .map((p) => ({
      id: p.id,
      name:
        p.displayName ||
        p.user?.displayName ||
        `Jugador ${p.position + 1}`,
      image: p.user?.image ?? undefined,
      currentStatus: (p.attendance as "ATTENDED" | "LATE" | "NO_SHOW" | null) ?? null,
    }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Cargar Resultado</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-6">
        {isClosed ? (
          <section className="flex flex-col items-center justify-center text-center py-10 rounded-xl border border-border bg-card">
            <Trophy className="h-8 w-8 text-primary mb-3" />
            <h2 className="text-3xl font-bold mb-1">{match.score}</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Partido ya confirmado
            </p>
            <Button asChild className="w-full">
              <Link href={`/match/${match.id}`}>Volver al detalle</Link>
            </Button>
          </section>
        ) : (
          <Fragment>
            <div className="flex flex-col gap-6">
              {Array.from(
                { length: Math.max(1, match.sets || 1) },
                (_, setIndex) => (
                  <section key={setIndex} className="space-y-3">
                    <h2 className="text-sm font-bold text-foreground">
                      Set {setIndex + 1}
                    </h2>

                    <div className="flex flex-col gap-4">
                      {teams.map((team, teamIndex) => (
                        <div
                          key={team.id}
                          className="space-y-3 rounded-xl border border-border bg-card p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="flex -space-x-2">
                                {team.players.map((p) => (
                                  <PlayerAvatar
                                    key={p.id}
                                    name={p.name}
                                    image={p.image}
                                    className="h-8 w-8 border-2 border-card"
                                  />
                                ))}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs text-muted-foreground">
                                  {team.label}
                                </span>
                                <span className="text-sm font-semibold text-foreground truncate">
                                  {team.players.map((p) => p.name).join(" & ")}
                                </span>
                              </div>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl font-bold text-primary shrink-0">
                              {scores[setIndex]?.[teamIndex] ?? 0}
                            </div>
                          </div>

                          <div
                            className="grid grid-cols-4 gap-2"
                            role="radiogroup"
                            aria-labelledby={`team-${team.id}-label`}
                          >
                            <span id={`team-${team.id}-label`} className="sr-only">
                              Puntaje para {team.label}
                            </span>
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => {
                              const isSelected =
                                (scores[setIndex]?.[teamIndex] ?? 0) === num;
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  role="radio"
                                  aria-checked={isSelected}
                                  aria-label={`${num} juegos`}
                                  onClick={() => {
                                    setScores((prev) => {
                                      const newScores = prev.map((s) => [...s]);
                                      if (!newScores[setIndex])
                                        newScores[setIndex] = [0, 0];
                                      newScores[setIndex][teamIndex] = num;
                                      return newScores;
                                    });
                                  }}
                                  className={cn(
                                      "h-12 rounded-lg border text-lg font-bold transition-all active:scale-[0.98] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                                    isSelected
                                        ? "bg-primary border-primary text-primary-foreground shadow-sm"
                                      : "bg-card border-border text-muted-foreground hover:bg-muted",
                                  )}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ),
              )}
            </div>

            {/* Side selection section */}
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-foreground">
                Posición en cancha (Derecha / Revés)
              </h2>
              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                {teams.map((team) => (
                  <div key={team.id} className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      {team.label}
                    </span>
                    <div className="divide-y divide-border">
                      {team.players.map((p) => (
                        <div key={p.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <PlayerAvatar name={p.name} image={p.image} className="h-8 w-8" />
                            <span className="text-sm font-semibold text-foreground truncate">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg" role="radiogroup" aria-label={`Lado para ${p.name}`}>
                            <button
                              type="button"
                              role="radio"
                              aria-checked={playerSides[p.id] === "RIGHT"}
                              onClick={() => handleSideChange(p.id, "RIGHT")}
                              className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                                playerSides[p.id] === "RIGHT"
                                  ? "bg-background text-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              Derecha
                            </button>
                            <button
                              type="button"
                              role="radio"
                              aria-checked={playerSides[p.id] === "LEFT"}
                              onClick={() => handleSideChange(p.id, "LEFT")}
                              className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                                playerSides[p.id] === "LEFT"
                                  ? "bg-background text-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              Revés
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <MatchNavigation
              primaryButtonText={
                pending ? "Guardando..." : "Registrar Resultado"
              }
              onPrimaryClick={save}
              primaryDisabled={pending || isClosed}
              primaryLoading={pending}
              secondaryButtonText="Cancelar"
              onSecondaryClick={() => router.push(`/match/${match.id}`)}
            />
          </Fragment>
        )}
      </div>

      {canMarkAttendance && (
        <AttendanceMarker
          matchId={match.id}
          players={attendancePlayers}
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  );
}