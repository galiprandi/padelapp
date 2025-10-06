"use client";

import { Fragment, useState, useTransition, useEffect } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getMatchByIdAction, saveMatchResultAction } from '@/app/(app)/match/actions';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PairInline } from "@/components/players/player-cards";

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
    const [scores, setScores] = useState<number[][]>([[0, 0], [0, 0], [0, 0]]);
    const [pending, startTransition] = useTransition();

    useEffect(() => {
        params.then(({ matchId }) => {
            getMatchByIdAction(matchId).then(result => {
                if (result.status === 'ok' && result.match) {
                    setMatch(result.match);
                    if (result.match.score) {
                        const parsedScores = result.match.score.split(',').map(s => s.trim().split('-').map(Number));
                        // Ensure we always have at least 3 sets
                        while (parsedScores.length < 3) {
                            parsedScores.push([0, 0]);
                        }
                        // Ensure each set has exactly 2 scores (for 2 teams)
                        const normalizedScores = parsedScores.map(set => {
                            const normalizedSet = [...set];
                            while (normalizedSet.length < 2) {
                                normalizedSet.push(0);
                            }
                            return normalizedSet.slice(0, 2); // Ensure max 2 scores per set
                        });
                        setScores(normalizedScores);
                    }
                } else {
                    notFound();
                }
                setLoading(false);
            });
        });
    }, []);

    if (loading) return <div>Cargando...</div>;
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
        const scoreStr = scores.map(set => `${set[0]}-${set[1]}`).join(', ');
        startTransition(async () => {
            const res = await saveMatchResultAction({ matchId: match.id, score: scoreStr });
            if (res.status === 'ok') {
                alert('Resultado guardado');
            } else {
                alert(res.message || 'Error');
            }
        });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Resultado del partido"
                description={isClosed
                    ? `El resultado ya fue registrado: ${match.score}`
                    : "La funcionalidad de registro de resultados estará disponible próximamente"
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
                                                {[0, 1, 2].map((setIndex) => (
                                                    <div key={setIndex} className="flex flex-col items-center gap-2">
                                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                            Set {setIndex + 1}
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={7}
                                                            placeholder="0"
                                                            className="w-12 h-12 text-center text-lg font-semibold"
                                                            value={scores[setIndex][index]}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                setScores(prev => {
                                                                    const newScores = prev.map(s => [...s]);
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
                        <div className="flex justify-center mt-6">
                            <Button onClick={save} disabled={pending || isClosed} className="w-full">Guardar</Button>
                        </div>
                    </Fragment>
                )}
            </div>
        </div>
    );
}
