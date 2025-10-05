"use client";

import { useState } from 'react';
import {
  PairInline,
  PairPreview,
  PlayerCompact,
  PlayerPreview,
  PlayerPreviewProps,
  PlayerWithRanking,
} from "@/components/players/player-cards";
import { MatchResultCompact, type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { mockPlayers } from "@/lib/mock-data";

const SAMPLE_PLAYERS = mockPlayers as PlayerPreviewProps[];
const SAMPLE_MATCH: MatchResultCompactMatch = {
  id: "match-sample",
  createdAt: "2025-01-18T18:00:00.000Z",
  score: "7-3, 3-7, 7-5",
  status: "CONFIRMED",
  players: [
    {
      id: "match-player-1",
      position: 0,
      user: {
        id: SAMPLE_PLAYERS[0]?.id ?? "player-1",
        displayName: SAMPLE_PLAYERS[0]?.name ?? "Jugador 1",
        image: SAMPLE_PLAYERS[0]?.image ?? null,
      },
    },
    {
      id: "match-player-2",
      position: 1,
      user: {
        id: SAMPLE_PLAYERS[1]?.id ?? "player-2",
        displayName: SAMPLE_PLAYERS[1]?.name ?? "Jugador 2",
        image: SAMPLE_PLAYERS[1]?.image ?? null,
      },
    },
    {
      id: "match-player-3",
      position: 2,
      user: {
        id: SAMPLE_PLAYERS[2]?.id ?? "player-3",
        displayName: SAMPLE_PLAYERS[2]?.name ?? "Jugador 3",
        image: SAMPLE_PLAYERS[2]?.image ?? null,
      },
    },
    {
      id: "match-player-4",
      position: 3,
      user: {
        id: SAMPLE_PLAYERS[3]?.id ?? "player-4",
        displayName: SAMPLE_PLAYERS[3]?.name ?? "Jugador 4",
        image: SAMPLE_PLAYERS[3]?.image ?? null,
      },
    },
  ],
};

export default function ComponentCatalogPage() {
  const [activeCategory, setActiveCategory] = useState('players');
  const [viewportMode, setViewportMode] = useState<'mobile' | 'desktop'>('desktop');

  const scrollToSection = (sectionId: string) => {
    setActiveCategory(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    { id: 'players', name: 'Jugadores', icon: '👥' },
    { id: 'ranking', name: 'Con ranking', icon: '🏆' },
    { id: 'compact', name: 'Compactos', icon: '📱' },
    { id: 'pairs', name: 'Parejas', icon: '👫' },
    { id: 'inline', name: 'En línea', icon: '➡️' },
    { id: 'matches', name: 'Partidos', icon: '🎾' },
    { id: 'states', name: 'Estados', icon: '📋' },
    { id: 'navigation', name: 'Navegación', icon: '🧭' },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex gap-8 max-w-none">
        {/* Sidebar - Always visible with full content */}
        <aside className="w-64 shrink-0">
          <div className="sticky top-6 space-y-6">
            {/* Viewport Toggle */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Vista</h3>
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewportMode('mobile')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewportMode === 'mobile'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  📱 Mobile
                </button>
                <button
                  onClick={() => setViewportMode('desktop')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewportMode === 'desktop'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🖥️ Desktop
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {viewportMode === 'mobile' ? '📱 Componentes en vista mobile' : '🖥️ Componentes en vista desktop'}
              </p>
            </div>

            {/* Navigation - Always visible */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Secciones</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={
                      activeCategory === section.id
                        ? 'w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors bg-primary text-primary-foreground'
                        : 'w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground'
                    }
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-medium text-sm">{section.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Catálogo de componentes</h1>
            </div>
            
            <p className="text-muted-foreground">
              Centralizamos ejemplos reutilizables para mantener consistencia en las vistas.
              <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                {viewportMode === 'mobile' ? '📱 Modo Mobile' : '🖥️ Modo Desktop'}
              </span>
            </p>
          </header>

          {/* Components Container - Only this changes with viewport mode */}
          <div className={`space-y-12 ${
            viewportMode === 'mobile' 
              ? 'max-w-sm mx-auto' // Mobile: contenido limitado pero sidebar oculto
              : 'w-full' // Desktop: contenido completo
          }`}>
            <section id="players" className="space-y-4">
              <h2 className="text-lg font-semibold mb-3">👥 Jugadores</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Patrón base utilizado en `/match/new` para invitar o gestionar jugadores dentro de un turno.
              </p>

              <div className="p-4 border rounded-lg bg-muted/50">
                {SAMPLE_PLAYERS.map((player) => (
                  <PlayerPreview key={player.id} {...player} />
                ))}
              </div>
            </section>

            <section id="ranking" className="space-y-4">
              <h2 className="text-lg font-semibold mb-3">🏆 Con ranking</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Útil para listados donde el CTA se reemplaza por la posición actual del jugador.
              </p>

              <div className="p-4 border rounded-lg bg-muted/50">
                {SAMPLE_PLAYERS.map((player) => (
                  <PlayerWithRanking key={`ranking-${player.id}`} {...player} />
                ))}
              </div>
            </section>

            <section id="compact" className="space-y-4">
              <h2 className="text-lg font-semibold mb-3">📱 Compactos</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Solo conserva el nombre y ranking para listas de acceso rápido.
              </p>

              <div className="p-4 border rounded-lg bg-muted/50">
                {SAMPLE_PLAYERS.map((player) => (
                  <PlayerCompact key={`compact-${player.id}`} {...player} />
                ))}
              </div>
            </section>

            <section id="pairs" className="space-y-4">
              <h2 className="text-lg font-semibold mb-3">👫 Parejas</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Agrupa fichas de jugadores bajo un encabezado para representar Pareja A/B.
              </p>

              <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                <PairPreview label="Pareja A" players={SAMPLE_PLAYERS.slice(0, 2)} />
                <PairPreview label="Pareja B" players={SAMPLE_PLAYERS.slice(2, 4)} />
              </div>
            </section>

            <section id="inline" className="space-y-4">
              <h2 className="text-lg font-semibold mb-3">➡️ En línea</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Presentación compacta para resúmenes de partidos o historial, sin botones de acción.
              </p>

              <div className="p-4 border rounded-lg bg-muted/50">
                <PairInline label="Pareja A" players={SAMPLE_PLAYERS.slice(0, 2)} />
              </div>
            </section>

            <section id="matches" className="space-y-4">
              <h2 className="text-lg font-semibold mb-3">🎾 Partidos</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Componentes relacionados con partidos y resultados.
              </p>

              <div className="p-4 border rounded-lg bg-muted/50">
                <MatchResultCompact label="Resultado ejemplo" match={SAMPLE_MATCH} detailUrl={`/match/${SAMPLE_MATCH.id}`} />
              </div>
            </section>

            <section id="states" className="space-y-4">
              <h2 className="text-lg font-semibold mb-3">📋 Estados</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Bloques neutrales para comunicar que una sección no tiene datos y sugerir el siguiente paso.
              </p>

              <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                <EmptyState
                  title="Sin partidos todavía"
                  description="Cuando quieras, creá un partido nuevo y administralo desde tu tablero."
                  action={
                    <Button size="sm" className="w-full max-w-xs">
                      Crear partido
                    </Button>
                  }
                />
                <EmptyState
                  title="No hay turnos próximos"
                  description="Publicá un turno abierto para invitar a la comunidad."
                />
              </div>
            </section>

            <section id="navigation" className="space-y-4">
              <h2 className="text-lg font-semibold mb-3">🧭 Navegación</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Barra persistente en mobile, plana sobre el fondo y centrada en íconos. Incluye un ejemplo de badge de notificaciones.
              </p>

              <div className="p-4 border rounded-lg bg-muted/50">
                <BottomNav position="static" notificationsCount={3} notificationsHref="/notifications" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
