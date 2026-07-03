"use client";

import { Fragment, useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { getMatchByIdAction, saveMatchResultAction } from '@/app/(app)/match/actions';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Trophy, Sparkles } from "lucide-react";
import { MatchNavigation } from "@/components/matches/match-navigation";
import { PlayerAvatar } from "@/components/players/player-avatar";
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
    status: string;
    sets: number;
    matchType: string;
    club: string | null;
    courtNumber: string | null;
    notes: string | null;
    score: string | null;
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

export default function MatchResultPage({ params }: { params: Promise<{ matchId: string }> }) {
    const [match, setMatch] = useState<MatchData | null>(null);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState<number[][]>([]);
    const [pending, startTransition] = useTransition();
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        params.then(({ matchId }) => {
            getMatchByIdAction(matchId).then(result => {
                if (result.status === 'ok' && result.match) {
                    const setsCount = Math.max(1, result.match.sets || 1);
                    setMatch(result.match as unknown as MatchData);
                    if (result.match.score) {
                        const parsedScores = result.match.score
                            .split(',')
                            .map(s => s.trim().split('-').map(Number));

                        while (parsedScores.length < setsCount) {
                            parsedScores.push([0, 0]);
                        }

                        const normalizedScores = parsedScores.map(set => {
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
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center px-6">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 animate-pulse">
                    Preparando el marcador...
                </p>
            </div>
        );
    }
    if (!match) return <div>No encontrado</div>;

    const isClosed = Boolean(match.score) || match.status === 'CONFIRMED';

    const teamsMap = new Map<string, TeamDisplay>();
    match.players.forEach(player => {
        if (player.teamId) {
            if (!teamsMap.has(player.teamId)) {
                teamsMap.set(player.teamId, {
                    id: player.teamId,
                    label: player.team?.label || `Equipo ${player.teamId.slice(-4)}`,
                    players: []
                });
            }
            teamsMap.get(player.teamId)!.players.push({
                id: player.id,
                name: player.displayName || player.user?.displayName || `Jugador ${player.position + 1}`,
                image: player.user?.image ? player.user.image : undefined,
                isConfirmed: player.resultConfirmed,
                category: player.user ? 5 : undefined,
            });
        }
    });
    const teams = Array.from(teamsMap.values());

    const save = () => {
        const setsCount = Math.max(1, match.sets || 1);
        const scoreStr = scores
            .slice(0, setsCount)
            .map(set => `${set[0]}-${set[1]}`)
            .join(', ');
        startTransition(async () => {
            const res = await saveMatchResultAction({ matchId: match.id, score: scoreStr });
            if (res.status === 'ok') {
                showToast('Resultado guardado');
                router.push(`/match/${match.id}`);
                router.refresh();
            } else {
                showToast(res.message || 'No se pudo guardar el resultado', { duration: 4000 });
            }
        });
    };

    return (
        <div className="relative flex flex-col gap-12 pb-8 animate-in fade-in duration-1000 px-6 overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/10 blur-[120px] -z-10 rounded-full" />

            <PageHeader
                size="lg"
                title="Cargar Resultado"
                description={isClosed
                    ? `Este partido ya tiene un marcador registrado: ${match.score}`
                    : "Ingresá los juegos ganados por cada equipo para cerrar el partido."
                }
                backHref={`/match/${match.id}`}
            />

            <div className="flex flex-col gap-10">
                {isClosed ? (
                    <section className="flex flex-col items-center justify-center text-center py-16 px-8 rounded-[2.5rem] bg-card/40 border border-border/40 backdrop-blur-md shadow-xl animate-in zoom-in-95 duration-700">
                        <div className="h-16 w-16 rounded-[2rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 shadow-inner border border-emerald-500/20">
                            <Trophy className="h-8 w-8" />
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter mb-2">{match.score}</h2>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-8">
                            Partido ya confirmado
                        </p>
                        <Button asChild className="w-full rounded-2xl font-black h-14 shadow-lg shadow-primary/20 active:scale-[0.98]">
                            <Link href={`/match/${match.id}`}>Volver al detalle</Link>
                        </Button>
                    </section>
                ) : (
                    <Fragment>
                        <div className="flex flex-col gap-12">
                            {Array.from({ length: Math.max(1, match.sets || 1) }, (_, setIndex) => (
                                <section
                                    key={setIndex}
                                    className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000"
                                    style={{ animationDelay: `${setIndex * 150}ms` }}
                                >
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
                                            <span className="text-[10px] font-black">{setIndex + 1}</span>
                                        </div>
                                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Set {setIndex + 1}</h2>
                                        <div className="h-px flex-1 bg-gradient-to-r from-border/40 to-transparent" />
                                    </div>

                                    <div className="flex flex-col gap-8">
                                        {teams.map((team, teamIndex) => (
                                            <div key={team.id} className="space-y-4 rounded-[2.5rem] bg-card/30 border border-border/40 p-8 backdrop-blur-md shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-8 opacity-5 -z-10 group-hover:scale-110 transition-transform duration-700">
                                                    <Users className="h-24 w-24 text-primary" />
                                                </div>

                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="flex -space-x-3">
                                                            {team.players.map((p) => (
                                                                <PlayerAvatar
                                                                    key={p.id}
                                                                    name={p.name}
                                                                    image={p.image}
                                                                    className="h-10 w-10 border-2 border-background shadow-md"
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">{team.label}</span>
                                                            <span className="text-base font-black text-foreground truncate leading-none">
                                                                {team.players.map((p) => p.name).join(" & ")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl font-black text-primary border border-primary/20 shadow-inner shrink-0">
                                                        {scores[setIndex]?.[teamIndex] ?? 0}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-4 gap-3">
                                                    {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => {
                                                        const isSelected = (scores[setIndex]?.[teamIndex] ?? 0) === num;
                                                        return (
                                                            <button
                                                                key={num}
                                                                type="button"
                                                                onClick={() => {
                                                                    setScores(prev => {
                                                                        const newScores = prev.map(s => [...s]);
                                                                        if (!newScores[setIndex]) newScores[setIndex] = [0, 0];
                                                                        newScores[setIndex][teamIndex] = num;
                                                                        return newScores;
                                                                    });
                                                                }}
                                                                className={cn(
                                                                    "h-16 rounded-2xl border text-2xl font-black transition-all active:scale-[0.95] relative overflow-hidden flex items-center justify-center",
                                                                    isSelected
                                                                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/40 scale-105 z-10"
                                                                        : "bg-background/40 border-border/40 text-muted-foreground/60 hover:bg-background/60 hover:border-border/60"
                                                                )}
                                                            >
                                                                {num}
                                                                {isSelected && (
                                                                    <div className="absolute top-1 right-1 opacity-40">
                                                                        <Sparkles className="h-3 w-3" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>

                        <div className="mt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                            <MatchNavigation
                                primaryButtonText={pending ? "Guardando..." : "Registrar Resultado"}
                                onPrimaryClick={save}
                                primaryDisabled={pending || isClosed}
                                primaryLoading={pending}
                                secondaryButtonText="Cancelar"
                                onSecondaryClick={() => router.push(`/match/${match.id}`)}
                            />
                        </div>
                    </Fragment>
                )}
            </div>
        </div>
    );
}
