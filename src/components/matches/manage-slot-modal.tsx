"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, UserMinus, ArrowUpDown, Search, UserPlus, Check, Loader2, X } from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { cn } from "@/lib/utils";
import type { SlotValue, PlayerOption } from "@/lib/match-types";

interface ManageSlotModalProps {
  open: boolean;
  slot: SlotValue | null;
  placeholderName: string;
  onSave: (value: SlotValue) => void;
  onShare: (name: string) => void;
  onRelease?: () => void;
  onSwap?: () => void;
  onClose: () => void;
}

export function ManageSlotModal({
  open,
  slot,
  placeholderName,
  onSave,
  onShare,
  onRelease,
  onSwap,
  onClose,
}: ManageSlotModalProps) {
  const [name, setName] = useState(placeholderName);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlayerOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (open) {
      const initialName =
        slot?.kind === "user"
          ? slot.player.displayName
          : slot?.kind === "placeholder"
            ? slot.displayName
            : placeholderName;
      setName(initialName);
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
      setError(null);
    }
  }, [open, slot, placeholderName]);

  // Debounced search
  useEffect(() => {
    let active = true;

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/players?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if (active && data.players) {
          setSearchResults(data.players);
        }
      } catch (err) {
        if (active) console.error("Failed to fetch players", err);
      } finally {
        if (active) setIsSearching(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [searchQuery]);

  if (!open) {
    return null;
  }

  function handleAccept() {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError("Ingresá un nombre");
      return;
    }
    setError(null);
    onSave({ kind: "placeholder", displayName: trimmed });
  }

  function handleSelectPlayer(player: PlayerOption) {
    onSave({ kind: "user", player });
  }

  async function handleShare() {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError("Ingresá un nombre antes de compartir");
      return;
    }
    onShare(trimmed);
  }

  const isUserSlot = slot?.kind === "user";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-sm space-y-8 rounded-xl border border-border bg-card p-8 shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-bold text-foreground">
            Gestionar jugador
          </h2>
          <div className="flex gap-2">
            {onSwap && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10 rounded-lg h-8 font-semibold text-xs px-3"
                onClick={onSwap}
              >
                <ArrowUpDown className="mr-1.5 h-3 w-3" />
                Mover
              </Button>
            )}
            {onRelease && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg h-8 font-semibold text-xs px-3"
                onClick={onRelease}
              >
                <UserMinus className="mr-1.5 h-3 w-3" />
                Quitar
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Buscar Jugador */}
          {!isUserSlot && (
            <div className="space-y-4">
              <div className="sr-only" aria-live="polite">
                {isSearching
                  ? "Buscando jugadores..."
                  : searchQuery.trim().length >= 2 && searchResults.length === 0
                    ? "No se encontraron jugadores"
                    : searchResults.length > 0
                      ? `${searchResults.length} jugadores encontrados`
                      : ""}
              </div>
              <Label
                htmlFor="player-search"
                className="text-sm font-semibold text-muted-foreground px-1"
              >
                Buscar en la plataforma
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <Input
                  ref={inputRef}
                  id="player-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleClearSearch();
                    }
                  }}
                  placeholder="Nombre o email..."
                  className="h-12 pl-11 pr-11 rounded-lg bg-background border-border text-sm font-medium"
                />
                {isSearching && (
                  <Loader2 className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin",
                    searchQuery ? "right-10" : "right-4"
                  )} />
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground/40 hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="px-1 py-2">
                  <p className="text-xs font-medium text-muted-foreground italic">
                    No se encontraron jugadores
                  </p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-muted/30 p-2 space-y-1">
                  {searchResults.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => handleSelectPlayer(player)}
                      aria-label={`Seleccionar a ${player.displayName}`}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors text-left"
                    >
                      <PlayerAvatar name={player.displayName} image={player.image ?? undefined} size={32} className="rounded-lg shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{player.displayName}</p>
                        <p className="text-xs font-medium text-muted-foreground truncate opacity-60">{player.email}</p>
                      </div>
                      <UserPlus className="h-4 w-4 text-primary" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Nombre Manual / Placeholder */}
          <div className="space-y-4">
            <Label htmlFor="slot-name" className="text-sm font-semibold text-muted-foreground px-1">
              {isUserSlot ? "Jugador Confirmado" : "O asignar nombre manual"}
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id="slot-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej: Diego Morales"
                  autoSelect
                  disabled={isUserSlot}
                  className={cn(
                    "h-12 px-5 rounded-lg bg-background border-border text-sm font-medium",
                    isUserSlot && "border-primary/20 bg-primary/5 text-primary font-bold"
                  )}
                />
                {isUserSlot && <Check className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />}
              </div>
              {!isUserSlot && (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Compartir enlace"
                  onClick={handleShare}
                  className="h-12 w-12 rounded-lg border-border text-primary"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              )}
            </div>
            {isUserSlot && (
              <p className="text-xs font-medium text-muted-foreground/60 leading-relaxed px-1">
                Este cupo está ocupado por un perfil verificado. Si querés cambiarlo, debés "Quitar" al jugador primero.
              </p>
            )}
            {error ? <p className="text-xs font-semibold text-destructive px-1">{error}</p> : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          {!isUserSlot && (
            <Button
              type="button"
              className="w-full h-12 rounded-lg font-bold text-base"
              onClick={handleAccept}
            >
              Guardar nombre
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            className="w-full h-10 rounded-lg font-medium text-muted-foreground text-sm"
            onClick={onClose}
          >
            {isUserSlot ? "Cerrar" : "Cancelar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
