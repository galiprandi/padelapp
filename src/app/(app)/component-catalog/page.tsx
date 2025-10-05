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
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-16 pt-8">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Catálogo de componentes</h1>
        <p className="text-sm text-muted-foreground">
          Centralizamos ejemplos reutilizables para mantener consistencia en las vistas.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Cómo renderizar jugadores
        </h2>
        <p className="text-sm text-muted-foreground">
          Patrón base utilizado en `/match/new` para invitar o gestionar jugadores dentro de un turno.
        </p>

        <div className="space-y-3">
          {SAMPLE_PLAYERS.map((player) => (
            <PlayerPreview key={player.id} {...player} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Variante con ranking
        </h2>
        <p className="text-sm text-muted-foreground">
          Útil para listados donde el CTA se reemplaza por la posición actual del jugador.
        </p>

        <div className="space-y-3">
          {SAMPLE_PLAYERS.map((player) => (
            <PlayerWithRanking key={`ranking-${player.id}`} {...player} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Variante compacta
        </h2>
        <p className="text-sm text-muted-foreground">
          Solo conserva el nombre y ranking para listas de acceso rápido.
        </p>

        <div className="space-y-3">
          {SAMPLE_PLAYERS.map((player) => (
            <PlayerCompact key={`compact-${player.id}`} {...player} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Vista de parejas</h2>
        <p className="text-sm text-muted-foreground">
          Agrupa fichas de jugadores bajo un encabezado para representar Pareja A/B tanto en `/match`
          como en futuros rankings dobles.
        </p>

        <div className="space-y-3">
          <PairPreview label="Pareja A" players={SAMPLE_PLAYERS.slice(0, 2)} />
          <PairPreview label="Pareja B" players={SAMPLE_PLAYERS.slice(0, 2)} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Pareja en una sola línea
        </h2>
        <p className="text-sm text-muted-foreground">
          Presentación compacta para resúmenes de partidos o historial, sin botones de acción.
        </p>

        <PairInline label="Pareja A" players={SAMPLE_PLAYERS.slice(0, 2)} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Layout de resultado de partido
        </h2>

        <MatchResultCompact label="Resultado ejemplo" match={SAMPLE_MATCH} detailUrl={`/match/${SAMPLE_MATCH.id}`} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Estados vacíos</h2>
        <p className="text-sm text-muted-foreground">
          Bloques neutrales para comunicar que una sección no tiene datos y sugerir el siguiente paso.
        </p>

        <div className="space-y-3">
          <EmptyState
            title="Sin partidos todavía"
            description="Cuando quieras, creá un partido nuevo y administralo desde tu tablero."
            action={
              <Button size="sm" className="w-full">
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

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Barra de navegación inferior
        </h2>
        <p className="text-sm text-muted-foreground">
          Barra persistente en mobile, plana sobre el fondo y centrada en íconos. Incluye un ejemplo de badge de notificaciones.
        </p>

        <BottomNav position="static" notificationsCount={3} notificationsHref="/notifications" />
      </section>
    </div>
  );
}
