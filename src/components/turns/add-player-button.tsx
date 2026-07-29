"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Search, Loader2, X, Check } from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { addPlayerAction } from "@/app/(app)/turnos/actions";
import { useToast } from "@/components/toast/use-toast";

interface PlayerOption {
  id: string;
  displayName: string;
  email?: string;
  image?: string | null;
  isContact?: boolean;
}

interface AddPlayerButtonProps {
  turnId: string;
  existingPlayerIds: string[];
}

export function AddPlayerButton({
  turnId,
  existingPlayerIds,
}: AddPlayerButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when expanded
  useEffect(() => {
    if (expanded) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  // Debounced search
  useEffect(() => {
    let active = true;
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setIsSearching(false);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/players?q=${encodeURIComponent(trimmed)}`,
        );
        const data = await res.json();
        if (active && data.players) {
          // Filter out players already in the turn
          setResults(
            data.players.filter(
              (p: PlayerOption) => !existingPlayerIds.includes(p.id),
            ),
          );
        }
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setIsSearching(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [query, existingPlayerIds]);

  async function handleAdd(player: PlayerOption) {
    setAddingId(player.id);
    const result = await addPlayerAction(turnId, player.id);
    if (result.status === "ok") {
      showToast(`${player.displayName} fue agregado al turno.`);
      setExpanded(false);
      setQuery("");
      setResults([]);
      router.refresh();
    } else {
      showToast(result.message ?? "Error al agregar al jugador");
    }
    setAddingId(null);
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-primary transition-colors hover:bg-primary/10 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        aria-label="Agregar jugador al turno"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <UserPlus className="h-5 w-5" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold">Agregar jugador</p>
          <p className="text-xs text-muted-foreground">
            Para confirmaciones fuera de la app
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Search header */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar jugador..."
            autoCapitalize="words"
            className="h-10 w-full pl-9 pr-9 rounded-lg bg-background border border-border text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
          )}
          {query && !isSearching && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              aria-label="Limpiar"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setExpanded(false);
            setQuery("");
            setResults([]);
          }}
          className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Cancelar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Results */}
      {query.trim().length >= 2 && (
        <div className="max-h-64 overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-2 space-y-1">
              {results.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleAdd(player)}
                  disabled={addingId !== null}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all text-left disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                  aria-label={`Agregar a ${player.displayName}`}
                >
                  <PlayerAvatar
                    name={player.displayName}
                    image={player.image ?? undefined}
                    size={32}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">
                      {player.displayName}
                    </p>
                    {player.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {player.email}
                      </p>
                    )}
                  </div>
                  {addingId === player.id ? (
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            !isSearching && (
              <p className="text-xs text-muted-foreground italic p-4 text-center">
                No se encontraron jugadores con ese nombre.
              </p>
            )
          )}
        </div>
      )}

      {query.trim().length < 2 && (
        <p className="text-xs text-muted-foreground p-4 text-center">
          Escribí al menos 2 caracteres para buscar.
        </p>
      )}
    </div>
  );
}
