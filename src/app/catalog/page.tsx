"use client";
import { useState } from "react";
import {
  PairInline,
  PairPreview,
  PlayerCompact,
  PlayerPreview,
  PlayerPreviewProps,
  PlayerWithRanking,
} from "@/components/players/player-cards";
import {
  TurnCard,
} from "@/components/turns/turn-card";
import {
  MatchResultCompact,
  type MatchResultCompactMatch,
} from "@/components/matches/match-result-card";
import { MatchNavigation } from "@/components/matches/match-navigation";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { PlusCircle } from "lucide-react";

// The catalog is a tool for developers to see UI components in isolation.
// Using local sample data here is appropriate as it serves as documentation
// and doesn't affect the production app's user data.
const SAMPLE_PLAYERS: PlayerPreviewProps[] = [
  {
    id: "catalog-player-1",
    name: "Ejemplo Jugador 1",
    role: "Pareja A · Jugador 1",
    image: "",
    isConfirmed: true,
    ranking: 1,
    category: 1,
  },
  {
    id: "catalog-player-2",
    name: "Ejemplo Jugador 2",
    role: "Pareja A · Jugador 2",
    image: "",
    isConfirmed: false,
    ranking: 2,
    category: 2,
  },
];

const SAMPLE_MATCH: MatchResultCompactMatch = {
  id: "match-sample",
  createdAt: new Date().toISOString(),
  score: "6-4, 6-4",
  status: "CONFIRMED",
  players: SAMPLE_PLAYERS.map((p, i) => ({
    id: `match-player-${i}`,
    position: i,
    user: {
      id: p.id,
      displayName: p.name,
      image: null,
    },
  })),
};

const SAMPLE_TURN = {
  id: "turn-sample",
  club: "Padel Center",
  date: "2024-05-31T18:00:00.000Z",
  players: [{}, {}],
  maxPlayers: 4,
  suggestedLevel: 5,
  status: "OPEN",
};

export default function ComponentCatalogPage() {
  const [activeCategory, setActiveCategory] = useState("players");
  const [viewportMode, setViewportMode] = useState<"mobile" | "desktop">(
    "mobile"
  );

  const scrollToSection = (sectionId: string) => {
    setActiveCategory(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const sections = [
    { id: "headers", name: "Encabezados", icon: "📝" },
    { id: "players", name: "Jugadores", icon: "👥" },
    { id: "matches", name: "Partidos", icon: "🎾" },
    { id: "states", name: "Estados", icon: "📋" },
    { id: "navigation", name: "Navegación", icon: "🧭" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex gap-8 max-w-none">
        <aside className="w-64 shrink-0">
          <div className="sticky top-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Vista
              </h3>
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewportMode("mobile")}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${viewportMode === "mobile"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  📱 Mobile
                </button>
                <button
                  onClick={() => setViewportMode("desktop")}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${viewportMode === "desktop"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  🖥️ Desktop
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Secciones
              </h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={
                      activeCategory === section.id
                        ? "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors bg-primary text-primary-foreground"
                        : "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
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

        <div className="flex-1 min-w-0">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Catálogo de componentes</h1>
            <p className="text-muted-foreground">
              Centralizamos ejemplos reutilizables para mantener consistencia en
              las vistas.
            </p>
          </header>

          <div
            className={`space-y-12 ${viewportMode === "mobile"
              ? "max-w-sm mx-auto"
              : "w-full"
              }`}
          >
            <section id="headers" className="space-y-6">
              <h2 className="text-lg font-semibold">📝 Encabezado de Página</h2>
              <div className="p-4 border rounded-lg bg-muted/50">
                <PageHeader
                  title="Título de la Página"
                  description="Descripción opcional."
                />
              </div>
            </section>

            <section id="players" className="space-y-6">
              <h2 className="text-lg font-semibold mb-3">👥 Jugadores</h2>
              <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Individual</h3>
                  {SAMPLE_PLAYERS.map((player) => (
                    <PlayerPreview key={player.id} {...player} />
                  ))}
                  <PlayerWithRanking {...SAMPLE_PLAYERS[0]} ranking={5} />
                  <PlayerCompact {...SAMPLE_PLAYERS[1]} ranking={12} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Parejas (PairPreview)</h3>
                  <PairPreview label="Pareja A" players={SAMPLE_PLAYERS} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Parejas (PairInline)</h3>
                  <PairInline label="Pareja B" players={SAMPLE_PLAYERS} />
                </div>
              </div>
            </section>

            <section id="matches" className="space-y-6">
              <h2 className="text-lg font-semibold mb-3">🎾 Partidos y Turnos</h2>
              <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Resultado (MatchResultCompact)</h3>
                  <MatchResultCompact
                    label="Resultado ejemplo"
                    match={SAMPLE_MATCH}
                    detailUrl={`/match/${SAMPLE_MATCH.id}`}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Turno (TurnCard)</h3>
                  <TurnCard turn={SAMPLE_TURN} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Turno Recomendado</h3>
                  <TurnCard turn={SAMPLE_TURN} variant="recommended" />
                </div>
              </div>
            </section>

            <section id="states" className="space-y-4">
              <h2 className="text-lg font-semibold mb-3">📋 Estados</h2>
              <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                <EmptyState
                  title="Estado vacío"
                  description="Descripción del estado vacío."
                  action={<Button size="sm">Acción</Button>}
                />
              </div>
            </section>

            <section id="navigation" className="space-y-4">
              <h2 className="text-lg font-semibold mb-3">🧭 Navegación</h2>
              <div className="p-4 border rounded-lg bg-muted/50">
                <BottomNav
                  position="static"
                  notificationsCount={3}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
