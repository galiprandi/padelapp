import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UsersRound } from "lucide-react";

const SAMPLE_PLAYERS = [
  {
    id: "player-1",
    name: "Lucía Ferreyra",
    role: "Pareja A · Jugadora 1",
    image: "https://lh3.googleusercontent.com/a/ACg8ocKQQbUOpdcWM2l5uGjq5gtLt1Lnmzyi-F4iWWWNzIj38QdLkrN9pA=s96-c",
    isConfirmed: true,
  },
  {
    id: "player-2",
    name: "Diego Morales",
    role: "Pareja A · Jugador 2",
    image: "",
    isConfirmed: false,
  },
];

function PlayerPreview({ name, role, image, isConfirmed }: (typeof SAMPLE_PLAYERS)[number]) {
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

      <p className="flex-1 truncate text-sm font-semibold text-foreground">
        {name}
        <span className="block text-xs font-normal text-muted-foreground">{role}</span>
      </p>

      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon" aria-label={isConfirmed ? "Gestionar jugador" : "Invitar jugador"}>
          <UsersRound className="h-4 w-4" />
        </Button>
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
          Este patrón replica la ficha utilizada en `/match/new` para asignar o invitar jugadores a un
          partido.
        </p>

        <div className="space-y-3 rounded-xl border border-border/80 bg-card p-4">
          {SAMPLE_PLAYERS.map((player) => (
            <PlayerPreview key={player.id} {...player} />
          ))}
        </div>
      </section>
    </div>
  );
}
