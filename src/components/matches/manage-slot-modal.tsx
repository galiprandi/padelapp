"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, UserMinus, ArrowUpDown, Search, UserPlus, Check, Loader2 } from "lucide-react";
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
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/players?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if (data.players) {
          setSearchResults(data.players);
        }
      } catch (err) {
        console.error("Failed to fetch players", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(handler);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 backdrop-blur-md transition-all duration-500 animate-in fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-sm space-y-8 rounded-[2.5rem] border border-border/40 bg-card/95 p-8 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/5 blur-3xl -z-10" />

        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-black text-foreground tracking-tight">
            Gestionar jugador
          </h2>
          <div className="flex gap-2">
            {onSwap && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10 rounded-xl h-9 font-black uppercase tracking-[0.2em] text-[9px] active:scale-95 transition-all px-3"
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
                className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl h-9 font-black uppercase tracking-[0.2em] text-[9px] active:scale-95 transition-all px-3"
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
                className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1"
              >
                Buscar en la plataforma
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <Input
                  id="player-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nombre o email..."
                  className="h-14 pl-11 pr-4 rounded-2xl bg-background/50 border-border/40 focus:bg-background transition-all text-sm font-medium shadow-sm"
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
                )}
              </div>

              {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="px-1 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/40 italic">
                    No se encontraron jugadores
                  </p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-2xl border border-border/40 bg-background/30 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  {searchResults.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => handleSelectPlayer(player)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-all text-left active:scale-[0.98]"
                    >
                      <PlayerAvatar name={player.displayName} image={player.image ?? undefined} size={32} className="rounded-lg shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black truncate">{player.displayName}</p>
                        <p className="text-[10px] font-medium text-muted-foreground truncate opacity-60">{player.email}</p>
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
            <Label htmlFor="slot-name" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">
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
                    "h-14 px-5 rounded-2xl bg-background/50 border-border/40 focus:bg-background transition-all text-sm font-medium shadow-sm",
                    isUserSlot && "border-primary/20 bg-primary/5 text-primary font-black"
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
                  className="h-14 w-14 rounded-2xl border-border/40 text-primary active:scale-95 transition-all"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              )}
            </div>
            {isUserSlot && (
              <p className="text-[10px] font-medium text-muted-foreground/60 leading-relaxed px-1">
                Este cupo está ocupado por un perfil verificado. Si querés cambiarlo, debés "Quitar" al jugador primero.
              </p>
            )}
            {error ? <p className="text-[11px] font-black text-destructive px-1 uppercase tracking-wider">{error}</p> : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          {!isUserSlot && (
            <Button
              type="button"
              className="w-full h-16 rounded-[2rem] font-black text-base shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all"
              onClick={handleAccept}
            >
              Guardar nombre
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            className="w-full h-14 rounded-2xl font-black text-muted-foreground uppercase tracking-[0.2em] text-[11px] active:scale-[0.98] transition-all"
            onClick={onClose}
          >
            {isUserSlot ? "Cerrar" : "Cancelar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
