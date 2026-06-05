"use client";

import { Fragment, useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { getMatchByIdAction, saveMatchResultAction } from '@/app/(app)/match/actions';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { MatchNavigation } from "@/components/matches/match-navigation";
import { PairInline } from "@/components/players/player-cards";
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
                    setMatch(result.match);
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
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Cargando datos del partido...</p>
            </div>
        );
    }
    if (!match) return <div>No encontrado</div>;

    const isClosed = Boolean(match.score) || match.status === 'CONFIRMED';

    const teamsMap = new Map();
    match.players.forEach(player => {
        if (player.teamId) {
            if (!teamsMap.has(player.teamId)) {
                teamsMap.set(player.teamId, {
                    id: player.teamId,
                    label: player.team?.label || `Equipo ${player.teamId.slice(-4)}`,
                    players: []
                });
            }
            teamsMap.get(player.teamId).players.push({
                id: player.id,
                name: player.displayName || player.user?.displayName || `Jugador ${player.position + 1}`,
                image: player.user?.image ? player.user.image : undefined,
                isConfirmed: player.resultConfirmed,
                category: player.user ? 5 : undefined, // Placeholder para categoría
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
                router.push('/match');
                router.refresh();
            } else {
                showToast(res.message || 'No se pudo guardar el resultado', { duration: 4000 });
            }
        });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Resultado del partido"
                description={isClosed
                    ? `El resultado ya fue registrado: ${match.score}`
                    : "Ingresá los juegos ganados en cada set por cada equipo."
                }
            />

            <div className="max-w-2xl mx-auto">
                {isClosed ? (
                    <div className="text-center space-y-4">
                        <div className="text-2xl font-bold text-foreground">
                            {match.score}
                        </div>
                        <p className="text-muted-foreground">
                            Este partido ya tiene resultado confirmado
                        </p>
                        <Button asChild className="w-full max-w-xs">
                            <Link href={`/match/${match.id}`}>Volver al partido</Link>
                        </Button>
                    </div>
                ) : (
                    <Fragment>
                        <div className="space-y-10">
                            {Array.from({ length: Math.max(1, match.sets || 1) }, (_, setIndex) => (
                                <section
                                    key={setIndex}
                                    className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                                    style={{ animationDelay: `${setIndex * 100}ms` }}
                                >
                                    <div className="flex items-center justify-between px-1">
                                        <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Set {setIndex + 1}</h2>
                                        <div className="h-px flex-1 mx-4 bg-border/40" />
                                    </div>

                                    <div className="grid gap-8">
                                        {teams.map((team, teamIndex) => (
                                            <div key={team.id} className="space-y-4">
                                                <div className="flex items-center justify-between px-2">
                                                    <div className="flex flex-col gap-1 min-w-0">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{team.label}</span>
                                                        <span className="text-sm font-bold text-foreground truncate leading-none">
                                                            {team.players.map((p: { name: string }) => p.name).join(" & ")}
                                                        </span>
                                                    </div>
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-black text-primary border border-primary/20 shadow-inner">
                                                        {scores[setIndex]?.[teamIndex] ?? 0}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-4 gap-2">
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
                                                                    "h-14 rounded-2xl border text-xl font-black transition-all active:scale-[0.95] relative overflow-hidden",
                                                                    isSelected
                                                                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                                        : "bg-card/40 border-border/40 text-muted-foreground/70 hover:bg-card/60"
                                                                )}
                                                            >
                                                                {num}
                                                                {isSelected && (
                                                                    <div className="absolute top-1 right-1">
                                                                        <Check className="h-3 w-3 opacity-50" />
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
                        <div className="mt-12 pt-6 border-t border-border/40">
                            <MatchNavigation
                                primaryButtonText={pending ? "Guardando..." : "Guardar resultado"}
                                onPrimaryClick={save}
                                primaryDisabled={pending || isClosed}
                                primaryLoading={pending}
                                secondaryButtonText="Volver al partido"
                                onSecondaryClick={() => router.push(`/match/${match.id}`)}
                            />
                        </div>
                    </Fragment>
                )}
            </div>
        </div>
    );
}
