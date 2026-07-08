"use client";
import { useState, Suspense, Fragment } from "react";
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
import { RankingSearch } from "@/components/ranking/ranking-search";
import { RankingListItem } from "@/components/ranking/ranking-list-item";
import { ShareButton } from "@/components/share/share-button";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, UserCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

const SAMPLE_RANKING_PLAYER = {
  id: "catalog-ranking-player",
  displayName: "Carolina Ferrante",
  alias: "Caro",
  image: null,
  level: 5,
  rankingScore: 1250,
  rankingPosition: 1,
  rankingDelta: 2,
  wins: 15,
  losses: 5,
  attendanceScore: 0.95,
  matchPlayers: [
    { position: 0, match: { score: "6-4, 6-4" } },
    { position: 0, match: { score: "6-2, 6-3" } },
    { position: 2, match: { score: "4-6, 3-6" } },
  ]
};

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
  const [activeCategory, setActiveCategory] = useState("headers");
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
    { id: "profile", name: "Perfil", icon: "👤" },
    { id: "ui", name: "UI Básica", icon: "🎨" },
    { id: "forms", name: "Formularios", icon: "📋" },
    { id: "players", name: "Jugadores", icon: "👥" },
    { id: "ranking", name: "Ranking", icon: "🏆" },
    { id: "matches", name: "Partidos", icon: "🎾" },
    { id: "states", name: "Estados", icon: "📋" },
    { id: "navigation", name: "Navegación", icon: "🧭" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex gap-12 max-w-none">
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Vista
              </h3>
              <div className="flex bg-muted rounded-lg p-1 border border-border">
                <button
                  onClick={() => setViewportMode("mobile")}
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded-md transition-colors ${viewportMode === "mobile"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  📱 Mobile
                </button>
                <button
                  onClick={() => setViewportMode("desktop")}
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded-md transition-colors ${viewportMode === "desktop"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  🖥️ Desktop
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Secciones
              </h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-colors",
                      activeCategory === section.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-semibold text-sm">{section.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="mb-12">
            <h1 className="text-2xl font-bold text-foreground">Catálogo de componentes</h1>
            <p className="text-muted-foreground">Centralizamos ejemplos reutilizables para mantener consistencia bajo el Minimal Design System.</p>
          </header>

          <div
            className={`space-y-16 ${viewportMode === "mobile"
              ? "max-w-sm mx-auto"
              : "w-full"
              }`}
          >
            <section id="headers" className="space-y-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase border-b border-border pb-2">📝 Encabezado de Página</h2>
              <div className="p-6 border border-border rounded-xl bg-card shadow-sm">
                <h1 className="text-xl font-bold text-foreground">Título de la Página</h1>
                <p className="text-sm text-muted-foreground">Descripción opcional con jerarquía visual de bajo impacto y alta claridad.</p>
              </div>
            </section>

            <section id="profile" className="space-y-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase border-b border-border pb-2">👤 Perfil</h2>
              <div className="space-y-4">
                <Card className="rounded-xl bg-card border-border overflow-hidden">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="relative w-20 h-20 rounded-lg bg-muted flex items-center justify-center border border-border">
                      <UserCircle className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground">Nombre de Google</p>
                      <h2 className="text-lg font-bold text-foreground">Carolina Ferrante</h2>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section id="ui" className="space-y-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase border-b border-border pb-2">🎨 UI Básica</h2>
              <div className="p-6 border border-border rounded-xl bg-card space-y-8 shadow-sm">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase">Botones Primarios</h3>
                  <div className="flex flex-col gap-3">
                    <Button className="w-full rounded-lg font-bold h-12">Primary Action</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase">Variantes de Botón</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button className="rounded-lg font-bold h-10">Primary</Button>
                    <Button variant="secondary" className="rounded-lg font-bold h-10">Secondary</Button>
                    <Button variant="outline" className="rounded-lg font-bold h-10">Outline</Button>
                    <Button variant="ghost" className="rounded-lg font-bold h-10">Ghost</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase">Badges</h3>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="rounded-md font-bold px-2 py-0.5">Default</Badge>
                    <Badge variant="success" className="rounded-md font-bold px-2 py-0.5">Success</Badge>
                    <Badge className="rounded-md bg-primary/10 text-primary border border-primary/20 px-2 py-0.5">Premium</Badge>
                  </div>
                </div>
              </div>
            </section>

            <section id="forms" className="space-y-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase border-b border-border pb-2">📋 Formularios</h2>
              <div className="p-6 border border-border rounded-xl bg-card shadow-sm space-y-6">
                <div className="space-y-2">
                  <Label
                    requiredIndicator="*"
                    className="text-sm font-semibold"
                  >
                    Campo Requerido
                  </Label>
                  <Input
                    placeholder="Input con aria-required"
                    required
                    aria-required="true"
                    className="h-10 rounded-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Selector de Opción</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: "Nivel 5 - Avanzado", selected: true },
                      { label: "Nivel 4 - Intermedio", selected: false }
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-lg border transition-colors text-sm font-bold text-left",
                          opt.selected
                            ? "bg-primary border-primary text-primary-foreground shadow-sm"
                            : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <span>{opt.label}</span>
                        {opt.selected ? (
                          <div className="h-5 w-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-border" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="players" className="space-y-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase border-b border-border pb-2">👥 Jugadores</h2>
              <div className="p-6 border border-border rounded-xl bg-card shadow-sm space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase">Individual (Cards)</h3>
                  <div className="grid gap-3">
                    <PlayerPreview {...SAMPLE_PLAYERS[0]} />
                    <PlayerWithRanking {...SAMPLE_PLAYERS[1]} ranking={12} />
                    <PlayerCompact {...SAMPLE_PLAYERS[0]} ranking={1} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase">Parejas</h3>
                  <PairPreview label="Pareja A" players={SAMPLE_PLAYERS} />
                </div>
              </div>
            </section>

            <section id="ranking" className="space-y-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase border-b border-border pb-2">🏆 Ranking</h2>
              <div className="p-6 border border-border rounded-xl bg-card shadow-sm space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase">Buscador</h3>
                  <Suspense fallback={<div className="h-12 w-full bg-muted animate-pulse rounded-lg" />}>
                    <RankingSearch />
                  </Suspense>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase">Item de Lista</h3>
                  <RankingListItem player={SAMPLE_RANKING_PLAYER} index={0} viewerId="other" />
                </div>
              </div>
            </section>

            <section id="matches" className="space-y-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase border-b border-border pb-2">🎾 Partidos y Turnos</h2>
              <div className="p-6 border border-border rounded-xl bg-card shadow-sm space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase">Resultado</h3>
                  <MatchResultCompact
                    label="Resultado ejemplo"
                    match={SAMPLE_MATCH}
                    detailUrl={`/match/${SAMPLE_MATCH.id}`}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase">Botón de Compartir</h3>
                  <div className="flex gap-4">
                    <ShareButton
                      url="https://padelapp.app"
                      title="PadelApp"
                      text="¡Sumate a PadelApp!"
                      className="rounded-lg font-bold h-10"
                      variant="outline"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase">Turno</h3>
                  <TurnCard turn={SAMPLE_TURN} />
                </div>
              </div>
            </section>

            <section id="states" className="space-y-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase border-b border-border pb-2">📋 Estados</h2>
              <div className="p-6 border border-border rounded-xl bg-card shadow-sm">
                <EmptyState
                  title="Estado vacío"
                  description="Descripción del estado vacío con estética unificada."
                  action={<Button className="rounded-lg font-bold px-8 h-10">Acción</Button>}
                />
              </div>
            </section>

            <section id="navigation" className="space-y-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase border-b border-border pb-2">🧭 Navegación</h2>
              <div className="p-6 border border-border rounded-xl bg-card shadow-sm overflow-hidden">
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
