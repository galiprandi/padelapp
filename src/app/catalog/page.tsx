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
  OpenToNetworkButton,
} from "@/components/turns/open-to-network-button";
import {
  MatchResultCompact,
  type MatchResultCompactMatch,
} from "@/components/matches/match-result-card";
import { RankingSearch } from "@/components/ranking/ranking-search";
import { RankingListItem } from "@/components/ranking/ranking-list-item";
import { RankingPodium } from "@/components/ranking/ranking-podium";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
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

// The catalog is a tool for developers to see UI components in isolation.
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
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground">
                Vista
              </h3>
              <div className="flex bg-muted rounded-xl p-1 border border-border">
                <button
                  onClick={() => setViewportMode("mobile")}
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all ${viewportMode === "mobile"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  📱 Mobile
                </button>
                <button
                  onClick={() => setViewportMode("desktop")}
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all ${viewportMode === "desktop"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  🖥️ Desktop
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground">
                Secciones
              </h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 text-left rounded-lg transition-colors",
                      activeCategory === section.id
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="text-sm">{section.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="mb-12">
            <h1 className="text-xl font-bold text-foreground">Catálogo de componentes</h1>
            <p className="text-sm text-muted-foreground">Componentes estandarizados bajo el Minimal Design System.</p>
          </header>

          <div
            className={`space-y-16 ${viewportMode === "mobile"
              ? "max-w-sm mx-auto"
              : "w-full"
              }`}
          >
            <section id="headers" className="space-y-6">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">📝 Encabezados</h2>
              <div className="p-6 border border-border rounded-xl bg-card">
                <h1 className="text-xl font-bold text-foreground">Título de la Página</h1>
                <p className="text-sm text-muted-foreground">Descripción clara y directa del contenido.</p>
              </div>
            </section>

            <section id="ui" className="space-y-6">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">🎨 UI Básica</h2>
              <div className="p-6 border border-border rounded-xl bg-card space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Botones</h3>
                  <div className="flex flex-col gap-3">
                    <Button className="h-12 w-full rounded-lg">Acción Primaria (h-12)</Button>
                    <Button variant="secondary" className="h-10 w-full rounded-lg">Acción Secundaria (h-10)</Button>
                    <Button variant="ghost" className="h-10 w-full rounded-lg text-muted-foreground">Botón Ghost (h-10)</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Neutral (Default)</Badge>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </div>
              </div>
            </section>

            <section id="forms" className="space-y-6">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">📋 Formularios</h2>
              <div className="p-6 border border-border rounded-xl bg-card space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Nombre Completo</Label>
                  <Input placeholder="Ej: Carolina Ferrante" className="h-10 rounded-lg" />
                  <p className="text-xs text-muted-foreground">Ingresá tu nombre tal como aparece en tu DNI.</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Selección de Nivel</Label>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "Nivel 5 - Avanzado", selected: true },
                      { label: "Nivel 4 - Intermedio", selected: false }
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl border transition-colors text-sm font-medium text-left",
                          opt.selected
                            ? "bg-primary/5 border-primary text-foreground"
                            : "bg-card border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <span>{opt.label}</span>
                        {opt.selected && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="players" className="space-y-6">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">👥 Jugadores</h2>
              <div className="p-6 border border-border rounded-xl bg-card space-y-8">
                <div className="grid gap-3">
                  <PlayerPreview {...SAMPLE_PLAYERS[0]} />
                  <PlayerWithRanking {...SAMPLE_PLAYERS[1]} ranking={12} />
                  <PlayerCompact {...SAMPLE_PLAYERS[0]} ranking={1} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Parejas</h3>
                  <PairPreview label="Pareja A" players={SAMPLE_PLAYERS} />
                </div>
              </div>
            </section>

            <section id="ranking" className="space-y-6">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">🏆 Ranking</h2>
              <div className="p-6 border border-border rounded-xl bg-card space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Stats del Usuario</h3>
                  <UserRankingBanner
                    position={1}
                    score={1250}
                    delta={5}
                    wins={15}
                    losses={5}
                    level={5}
                    attendanceScore={0.95}
                    matchesPlayed={20}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Podio</h3>
                  <RankingPodium
                    topThree={[
                      { ...SAMPLE_RANKING_PLAYER, id: "1", rankingScore: 1250 },
                      { ...SAMPLE_RANKING_PLAYER, id: "2", rankingScore: 1100 },
                      { ...SAMPLE_RANKING_PLAYER, id: "3", rankingScore: 1050 },
                    ]}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Búsqueda y Lista</h3>
                  <Suspense fallback={<div className="h-10 w-full bg-muted animate-pulse rounded-lg" />}>
                    <RankingSearch />
                  </Suspense>
                  <div className="space-y-2">
                    <RankingListItem player={SAMPLE_RANKING_PLAYER} index={0} viewerId="other" />
                    <RankingListItem player={{ ...SAMPLE_RANKING_PLAYER, id: "viewer" }} index={1} viewerId="viewer" />
                  </div>
                </div>
              </div>
            </section>

            <section id="matches" className="space-y-6">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">🎾 Partidos y Turnos</h2>
              <div className="p-6 border border-border rounded-xl bg-card space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Turnos</h3>
                  <div className="space-y-2">
                    <TurnCard turn={SAMPLE_TURN} />
                    <TurnCard
                      turn={SAMPLE_TURN}
                      isJoined={true}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Botón "Abrir a mi red"</h3>
                  <div className="space-y-3">
                    <OpenToNetworkButton turnId="sample" club="Padel Center" variant="default" />
                    <OpenToNetworkButton
                      turnId="sample"
                      club="Padel Center"
                      variant="default"
                      label="Salvar turno: Notificar a mi red"
                      className="bg-amber-500 hover:bg-amber-600"
                    />
                    <div className="flex gap-2 items-center">
                      <p className="text-xs text-muted-foreground mr-2">Icono solo:</p>
                      <OpenToNetworkButton
                        turnId="sample"
                        club="Padel Center"
                        variant="outline"
                        size="icon"
                        showText={false}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Resultado de Partido</h3>
                  <MatchResultCompact
                    label="Último partido"
                    match={SAMPLE_MATCH}
                    detailUrl={`/match/${SAMPLE_MATCH.id}`}
                  />
                </div>

                <div className="flex gap-2">
                  <ShareButton
                    url="https://padelap.vercel.app"
                    title="PadelApp"
                    text="¡Sumate a PadelApp!"
                    className="flex-1 h-10"
                    variant="outline"
                  />
                </div>
              </div>
            </section>

            <section id="states" className="space-y-6">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">📋 Estados</h2>
              <div className="p-6 border border-border rounded-xl bg-card">
                <EmptyState
                  title="No hay partidos programados"
                  description="Cuando crees o te sumes a un partido, aparecerá aquí."
                  action={<Button className="h-10 rounded-lg">Crear primer partido</Button>}
                />
              </div>
            </section>

            <section id="navigation" className="space-y-6 pb-20">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">🧭 Navegación</h2>
              <div className="border border-border rounded-xl bg-card overflow-hidden">
                <BottomNav position="static" notificationsCount={3} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
