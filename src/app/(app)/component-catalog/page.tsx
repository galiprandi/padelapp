import { Fragment } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UsersRound } from "lucide-react";

const SAMPLE_PLAYERS = [
  {
    id: "player-1",
    name: "Germán Aliprandi",
    role: "Pareja A · Jugadora 1",
    image: "https://lh3.googleusercontent.com/a/ACg8ocKQQbUOpdcWM2l5uGjq5gtLt1Lnmzyi-F4iWWWNzIj38QdLkrN9pA=s96-c",
    isConfirmed: true,
    ranking: 2,
    category: 2,
  },
  {
    id: "player-2",
    name: "Diego Morales",
    role: "Pareja A · Jugador 2",
    image: "",
    isConfirmed: false,
    ranking: 5,
    category: 4,
  },
];

type PlayerPreviewProps = (typeof SAMPLE_PLAYERS)[number];

function PlayerPreview({ name, role, image, isConfirmed, category }: PlayerPreviewProps) {
  const initials = name
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-primary">
        {image ? (
          <Image src={image} alt={name} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>

      <div className="flex-1 truncate">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {role} · Categoría {category}
        </p>
      </div>

      <Button type="button" variant="ghost" size="icon" aria-label={isConfirmed ? "Gestionar jugador" : "Invitar jugador"}>
        <UsersRound className="h-4 w-4" />
      </Button>
    </div>
  );
}

function PlayerWithRanking({ name, role, image, ranking, category }: PlayerPreviewProps) {
  const initials = name
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-primary">
        {image ? (
          <Image src={image} alt={name} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>

      <div className="flex-1 truncate">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {role} · Categoría {category}
        </p>
      </div>

      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">#{ranking}</span>
    </div>
  );
}

function PlayerCompact({ name, image, ranking }: PlayerPreviewProps) {
  const initials = name
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-primary">
        {image ? (
          <Image src={image} alt={name} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>

      <p className="flex-1 truncate text-sm font-semibold text-foreground">{name}</p>

      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">#{ranking}</span>
    </div>
  );
}

function PairPreview({ players, label }: { players: PlayerPreviewProps[]; label: string }) {
  const hasConnector = players.length > 1;

  return (
    <div className="relative rounded-xl border border-border/80 bg-muted/30">
      <span className="absolute left-4 top-0 -translate-y-1/2 rounded-full bg-background px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="relative space-y-3 p-4 pt-2">
        {hasConnector ? (
          <div
            className="pointer-events-none absolute left-1 top-1 bottom-1 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent"
            aria-hidden
          />
        ) : null}
        {players.map((player) => (
          <div key={`pair-${label}-${player.id}`} className="relative">
            {hasConnector ? (
              <span
                className="pointer-events-none absolute left-[-28px] top-1/2 h-px w-7 -translate-y-1/2 bg-gradient-to-r from-primary/30 via-primary/40 to-transparent"
                aria-hidden
              />
            ) : null}
            <PlayerPreview {...player} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PairInline({ players, label }: { players: PlayerPreviewProps[]; label: string }) {
  return (
    <div className="relative rounded-xl border border-border/80 bg-muted/30">
      <span className="absolute left-4 top-0 -translate-y-1/2 rounded-full bg-background px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>

      <div className="flex items-center gap-4 pr-5 pb-4 pt-6 pl-7">
        {players.map((player, index) => {
          const initials = player.name
            .split(" ")
            .map((segment) => segment[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <Fragment key={`pair-inline-${label}-${player.id}`}>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-primary">
                  {player.image ? (
                    <Image
                      src={player.image}
                      alt={player.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{player.name}</p>
                  <p className="truncate text-xs text-muted-foreground">Categoría {player.category}</p>
                </div>
              </div>
              {index < players.length - 1 ? <span className="h-10 w-px bg-border" aria-hidden /> : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
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
    </div>
  );
}
