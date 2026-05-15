"use client";

import { Fragment, useState, useTransition, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { getMatchByIdAction, saveMatchResultAction } from '@/app/(app)/match/actions';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { MatchNavigation } from "@/components/matches/match-navigation";
import { PairInline } from "@/components/players/player-cards";
import { useToast } from "@/components/toast/use-toast";

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
                            <a href={`/match/${match.id}`}>Volver al partido</a>
                        </Button>
                    </div>
                ) : (
                    <Fragment>
                        <div className="space-y-4">
                            {teams.map((team, index) => (
                                <Fragment key={team.id}>
                                    <PairInline
                                        players={team.players}
                                        label={team.label}
                                    />
                                    <div className="relative rounded-xl border border-border/80 bg-muted/30 mt-4">
                                        <span className="absolute left-4 top-0 -translate-y-1/2 rounded-full bg-background px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Sets
                                        </span>
                                        <div className="p-4 pt-6">
                                            <div className="flex items-center justify-center gap-6">
                                                {Array.from({ length: Math.max(1, match.sets || 1) }, (_, setIndex) => (
                                                    <div key={setIndex} className="flex flex-col items-center gap-2">
                                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                            Set {setIndex + 1}
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            inputMode="numeric"
                                                            aria-label={`Juegos del equipo ${team.label} en set ${setIndex + 1}`}
                                                            min={0}
                                                            max={7}
                                                            placeholder="0"
                                                            className="w-12 h-12 text-center text-lg font-semibold px-0"
                                                            value={scores[setIndex]?.[index] ?? 0}
                                                            onFocus={(e) => e.currentTarget.select()}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                setScores(prev => {
                                                                    const newScores = prev.map(s => [...s]);
                                                                    if (!newScores[setIndex]) {
                                                                        newScores[setIndex] = [0, 0];
                                                                    }
                                                                    newScores[setIndex][index] = val;
                                                                    return newScores;
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Fragment>
                            ))}
                        </div>
                        <div className="mt-6">
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
