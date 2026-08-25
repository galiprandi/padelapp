"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RankingPodium } from "./ranking-podium";
import { RankingListItem } from "./ranking-list-item";
import { EmptyState } from "@/components/empty-state";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RankingPlayer {
  id: string;
  displayName: string;
  alias: string | null;
  image: string | null;
  rankingScore: number;
  rankingPosition: number | null;
  rankingDelta: number;
  wins: number;
  losses: number;
  attendanceScore: number;
  matchesPlayed: number;
  lastMatchAt: Date | null;
  matchPlayers: Array<{ position: number; match: { score: string | null } }>;
}

interface RankingFilterProps {
  players: RankingPlayer[];
  viewerId?: string | null;
  query?: string;
}

export function RankingFilter({ players, viewerId, query }: RankingFilterProps) {
  const [activeTab, setActiveTab] = useState<"activos" | "todos">("activos");

  // Filter players based on activity
  // Active players: matchesPlayed > 0
  const filteredPlayers = !query && activeTab === "activos"
    ? players.filter(p => p.matchesPlayed > 0)
    : players;

  const topThree = !query ? filteredPlayers.slice(0, 3) : [];
  const listPlayers = !query ? filteredPlayers.slice(3) : filteredPlayers;

  return (
    <div className="space-y-6">
      {!query && (
        <div className="flex flex-col gap-1.5">
          <span id="ranking-tabs-label" className="sr-only">
            Filtrar clasificación
          </span>
          <div
            role="radiogroup"
            aria-labelledby="ranking-tabs-label"
            className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl"
            onKeyDown={(e) => {
              const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
              if (buttons.length < 2) return;
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                setActiveTab("todos");
                buttons[1]?.focus();
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                setActiveTab("activos");
                buttons[0]?.focus();
              }
            }}
          >
            <button
              type="button"
              role="radio"
              aria-checked={activeTab === "activos"}
              tabIndex={activeTab === "activos" ? 0 : -1}
              onClick={() => setActiveTab("activos")}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                activeTab === "activos"
                  ? "bg-card border border-border text-foreground shadow-sm"
                  : "border-transparent text-muted-foreground hover:bg-card hover:text-foreground",
              )}
              aria-label="Mostrar jugadores activos únicamente"
            >
              Activos
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={activeTab === "todos"}
              tabIndex={activeTab === "todos" ? 0 : -1}
              onClick={() => setActiveTab("todos")}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                activeTab === "todos"
                  ? "bg-card border border-border text-foreground shadow-sm"
                  : "border-transparent text-muted-foreground hover:bg-card hover:text-foreground",
              )}
              aria-label="Mostrar todos los jugadores registrados"
            >
              Todos
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredPlayers.length > 0 ? (
          <>
            {!query && topThree.length > 0 && (
              <RankingPodium topThree={topThree} viewerId={viewerId} />
            )}

            <div className="space-y-2">
              {listPlayers.map((player, index) => {
                // Calculate position for list players
                // If query, actualIndex is index
                // If !query, listPlayers start from index 3 in filteredPlayers, so position starts from index + 3
                const actualIndex = query ? index : index + 3;
                const customPosition = !query && activeTab === "activos"
                  ? actualIndex + 1
                  : undefined;

                return (
                  <RankingListItem
                    key={player.id}
                    player={player}
                    index={actualIndex}
                    customPosition={customPosition}
                    viewerId={viewerId}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Users}
            title={query ? "No se encontraron jugadores" : "Sin jugadores"}
            description={
              query
                ? `No hay resultados para "${query}".`
                : "Aún no hay jugadores registrados."
            }
            action={
              query ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/ranking" prefetch={true}>Limpiar búsqueda</Link>
                </Button>
              ) : null
            }
          />
        )}
      </div>
    </div>
  );
}
