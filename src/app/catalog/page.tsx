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
import { SlotDisplay } from "@/components/matches/slot-display";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// The catalog is a tool for developers to see UI components in isolation.
// Using local sample data here is appropriate as it serves as documentation
// and doesn't affect the production app's user data.
const SAMPLE_PLAYERS: PlayerPreviewProps[] = [
  {
    id: "catalog-player-1",
    name: "Carolina Ferrante",
    role: "Pareja A · Jugador 1",
    image: "",
    isConfirmed: true,
    ranking: 1,
    category: 1,
  },
  {
    id: "catalog-player-2",
    name: "Bautista Cañas",
    role: "Pareja A · Jugador 2",
    image: "",
    isConfirmed: false,
    ranking: 2,
    category: 2,
  },
];

const SAMPLE_MATCH: MatchResultCompactMatch = {
  id: "match-sample",
  createdAt: "2024-05-31T18:00:00.000Z",
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
    { id: "ui", name: "UI Básica", icon: "🎨" },
    { id: "players", name: "Jugadores", icon: "👥" },
    { id: "matches", name: "Partidos", icon: "🎾" },
    { id: "states", name: "Estados", icon: "📋" },
    { id: "navigation", name: "Navegación", icon: "🧭" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex gap-12 max-w-none">
        <aside className="w-64 shrink-0">
          <div className="sticky top-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Vista
              </h3>
              <div className="flex bg-muted/40 backdrop-blur-sm rounded-xl p-1 border border-border/20">
                <button
                  onClick={() => setViewportMode("mobile")}
                  className={`flex-1 px-3 py-2 text-xs font-black rounded-lg transition-all ${viewportMode === "mobile"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  📱 Mobile
                </button>
                <button
                  onClick={() => setViewportMode("desktop")}
                  className={`flex-1 px-3 py-2 text-xs font-black rounded-lg transition-all ${viewportMode === "desktop"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  🖥️ Desktop
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Secciones
              </h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left rounded-2xl transition-all active:scale-[0.98]",
                      activeCategory === section.id
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-black text-[11px] uppercase tracking-widest">{section.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="mb-12">
            <PageHeader
              title="Catálogo de componentes"
              description="Centralizamos ejemplos reutilizables para mantener consistencia en las vistas bajo el Bubble Aesthetic V5."
              size="lg"
            />
          </header>

          <div
            className={`space-y-16 ${viewportMode === "mobile"
              ? "max-w-sm mx-auto"
              : "w-full"
              }`}
          >
            <section id="headers" className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-border/20 pb-2">📝 Encabezado de Página</h2>
              <div className="p-8 border border-border/40 rounded-[2.5rem] bg-card/30 backdrop-blur-md shadow-xl space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Estándar</h3>
                  <PageHeader
                    title="Título de la Página"
                    description="Descripción opcional con jerarquía visual de alto impacto."
                    size="lg"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Con botón Volver</h3>
                  <PageHeader
                    title="Detalle de Partido"
                    backHref="#"
                    description="Ejemplo con navegación de regreso integrada."
                    size="md"
                  />
                </div>
              </div>
            </section>

            <section id="ui" className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-border/20 pb-2">🎨 UI Básica</h2>
              <div className="p-8 border border-border/40 rounded-[2.5rem] bg-card/30 backdrop-blur-md shadow-xl space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Botones (rounded-xl)</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button className="rounded-xl font-black">Primary</Button>
                    <Button variant="secondary" className="rounded-xl font-black">Secondary</Button>
                    <Button variant="outline" className="rounded-xl font-black">Outline</Button>
                    <Button variant="ghost" className="rounded-xl font-black">Ghost</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Badges (rounded-xl)</h3>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="rounded-xl font-black uppercase text-[10px] tracking-widest px-3 py-1">Default</Badge>
                    <Badge variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-3 py-1">Outline</Badge>
                    <Badge variant="success" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-3 py-1">Success</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Selectores Táctiles (Grid)</h3>
                  <div className="grid grid-cols-3 gap-2 max-w-xs">
                    {["1", "3", "5"].map((option) => (
                      <button
                        key={option}
                        className={cn(
                          "flex items-center justify-center py-3 rounded-2xl border transition-all text-sm font-black active:scale-[0.98]",
                          option === "3"
                            ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20"
                            : "bg-background/40 border-border/40 text-muted-foreground hover:bg-background/60"
                        )}
                      >
                        {option} {option === "1" ? 'Set' : 'Sets'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="players" className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-border/20 pb-2">👥 Jugadores</h2>
              <div className="p-8 border border-border/40 rounded-[2.5rem] bg-card/30 backdrop-blur-md shadow-xl space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Individual (Cards Premium)</h3>
                  <div className="grid gap-3">
                    <PlayerPreview {...SAMPLE_PLAYERS[0]} />
                    <PlayerWithRanking {...SAMPLE_PLAYERS[1]} ranking={12} />
                    <PlayerCompact {...SAMPLE_PLAYERS[0]} ranking={1} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Parejas (PairPreview)</h3>
                  <PairPreview label="Pareja A" players={SAMPLE_PLAYERS} />
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Parejas (PairInline)</h3>
                  <PairInline label="Pareja B" players={SAMPLE_PLAYERS} />
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Slot Display</h3>
                  <div className="grid gap-3">
                    <SlotDisplay
                      team="A"
                      index={1}
                      slot={null}
                      userDisplayName="Usuario"
                      isActive={false}
                      onSlotClick={() => {}}
                      onManageClick={() => {}}
                    />
                    <SlotDisplay
                      team="A"
                      index={1}
                      slot={null}
                      userDisplayName="Usuario"
                      isActive={true}
                      onSlotClick={() => {}}
                      onManageClick={() => {}}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section id="matches" className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-border/20 pb-2">🎾 Partidos y Turnos</h2>
              <div className="p-8 border border-border/40 rounded-[2.5rem] bg-card/30 backdrop-blur-md shadow-xl space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Resultado (MatchResultCompact)</h3>
                  <MatchResultCompact
                    label="Resultado ejemplo"
                    match={SAMPLE_MATCH}
                    detailUrl={`/match/${SAMPLE_MATCH.id}`}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Turno (TurnCard)</h3>
                  <TurnCard turn={SAMPLE_TURN} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Turno Recomendado</h3>
                  <TurnCard turn={SAMPLE_TURN} variant="recommended" />
                </div>
              </div>
            </section>

            <section id="states" className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-border/20 pb-2">📋 Estados</h2>
              <div className="p-8 border border-border/40 rounded-[2.5rem] bg-card/30 backdrop-blur-md shadow-xl">
                <EmptyState
                  title="Estado vacío"
                  description="Descripción del estado vacío con estética unificada."
                  action={<Button className="rounded-xl font-black px-8">Acción</Button>}
                />
              </div>
            </section>

            <section id="navigation" className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-border/20 pb-2">🧭 Navegación</h2>
              <div className="p-8 border border-border/40 rounded-[2.5rem] bg-card/30 backdrop-blur-md shadow-xl overflow-hidden">
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
