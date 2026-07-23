"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, UserMinus, ArrowUpDown, Search, UserPlus, Check, Loader2, X, Clock } from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { capitalizeName } from "@/lib/utils";
import type { SlotValue, PlayerOption } from "@/lib/match-types";

interface RecentPlayer {
  id: string;
  displayName: string;
  image: string | null;
}

interface ManageSlotModalProps {
  open: boolean;
  slot: SlotValue | null;
  placeholderName: string;
  allowReplaceUser?: boolean;
  onSave: (value: SlotValue) => void;
  onShare?: (name: string) => void;
  onRelease?: () => void;
  onSwap?: () => void;
  onClose: () => void;
}

export function ManageSlotModal({
  open,
  slot,
  placeholderName,
  allowReplaceUser = false,
  onSave,
  onShare,
  onRelease,
  onSwap,
  onClose,
}: ManageSlotModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<PlayerOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentPlayers, setRecentPlayers] = useState<RecentPlayer[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const initial =
        slot?.kind === "user"
          ? slot.player.displayName
          : slot?.kind === "placeholder"
            ? slot.displayName
            : placeholderName;
      setInputValue(initial);
      setSearchResults([]);
      setIsSearching(false);
      setError(null);
    }
  }, [open, slot, placeholderName]);

  // Fetch recent players (added by this user in previous matches)
  useEffect(() => {
    if (!open) return;
    let active = true;
    fetch("/api/recent")
      .then((res) => res.json())
      .then((data) => {
        if (active && data.recentPlayers) {
          setRecentPlayers(data.recentPlayers);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [open]);

  // Global Escape key listener for closing modal
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // Autofocus the input field upon opening
  useEffect(() => {
    if (open && slot?.kind !== "user") {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, slot?.kind]);

  // Debounced search — uses inputValue as the query.
  useEffect(() => {
    let active = true;

    const fetchPlayers = async (query: string) => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/players${query ? `?q=${encodeURIComponent(query)}` : ""}`);
        const data = await response.json();
        if (active && data.players) {
          setSearchResults(data.players);
        }
      } catch (err) {
        if (active) console.error("Failed to fetch players", err);
      } finally {
        if (active) setIsSearching(false);
      }
    };

    const query = inputValue.trim();

    if (query.length === 0) {
      fetchPlayers("");
      return;
    }

    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const handler = setTimeout(() => {
      fetchPlayers(query);
    }, 300);

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [inputValue]);

  if (!open) {
    return null;
  }

  function handleSave() {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) {
      setError("Ingresá un nombre");
      return;
    }
    setError(null);
    onSave({ kind: "placeholder", displayName: capitalizeName(trimmed) });
  }

  function handleSelectPlayer(player: PlayerOption) {
    onSave({ kind: "user", player });
  }

  function handleSelectRecentPlayer(player: RecentPlayer) {
    onSave({
      kind: "user",
      player: {
        id: player.id,
        displayName: player.displayName,
        email: "",
        image: player.image,
      },
    });
  }

  async function handleShare() {
    if (!onShare) return;
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) {
      setError("Ingresá un nombre antes de compartir");
      return;
    }
    onShare(capitalizeName(trimmed));
  }

  const isUserSlot = slot?.kind === "user";
  const canEdit = !isUserSlot || allowReplaceUser;
  const query = inputValue.trim();
  const showResults = query.length >= 2 && searchResults.length > 0;
  const showNoResults = query.length >= 2 && !isSearching && searchResults.length === 0;
  const showRecentAvatars = recentPlayers.length > 0 && query.length < 2;
  const showContactsList = query.length < 2 && searchResults.length > 0;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[60] flex items-stretch sm:items-center justify-center bg-black/60"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-sm flex flex-col bg-card shadow-sm sm:rounded-xl sm:border sm:border-border sm:max-h-[90dvh] h-[100dvh] sm:h-auto"
      >
        {/* Header — sticky top */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
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

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {isUserSlot && !canEdit ? (
            /* Confirmed user slot — read-only display */
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <PlayerAvatar
                  name={slot.player.displayName}
                  image={slot.player.image ?? undefined}
                  size={40}
                  className="rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-primary truncate">
                    {slot.player.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">Jugador verificado</p>
                </div>
                <Check className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs font-medium text-muted-foreground/60 leading-relaxed px-1">
                Este cupo está ocupado por un perfil verificado. Si querés cambiarlo, debés "Quitar" al jugador primero.
              </p>
            </div>
          ) : (
            <>
              {/* Recent players — one-tap avatar quick add */}
              {showRecentAvatars && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 px-1">
                    <Clock className="h-3 w-3" />
                    Jugadores recientes
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                    {recentPlayers.map((player) => (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => handleSelectRecentPlayer(player)}
                        aria-label={`Agregar a ${player.displayName}`}
                        className="flex flex-col items-center gap-1 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-lg"
                      >
                        <PlayerAvatar
                          name={player.displayName}
                          image={player.image ?? undefined}
                          size={48}
                          className="rounded-full ring-2 ring-border group-hover:ring-primary group-active:ring-primary transition-all"
                        />
                        <span className="text-[10px] font-medium text-muted-foreground max-w-[56px] truncate">
                          {player.displayName.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Single input — search + manual name */}
              <div className="space-y-3">
                <div className="sr-only" aria-live="polite">
                  {isSearching
                    ? "Buscando jugadores..."
                    : showNoResults
                      ? "No se encontraron jugadores"
                      : searchResults.length > 0
                        ? `${searchResults.length} jugadores encontrados`
                        : ""}
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input
                    ref={inputRef}
                    id="player-input"
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSave();
                      }
                    }}
                    placeholder="Buscar jugador o escribir nombre..."
                    autoCapitalize="words"
                    className="h-12 pl-11 pr-11 rounded-lg bg-background border-border text-sm font-medium"
                  />
                  {isSearching && (
                    <Loader2 className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin right-4" />
                  )}
                  {inputValue && !isSearching && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputValue("");
                        setSearchResults([]);
                        inputRef.current?.focus();
                      }}
                      aria-label="Limpiar"
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground/40 hover:text-foreground transition-all rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Search results */}
                {showResults && (
                  <div className="rounded-lg border border-border bg-muted p-2 space-y-1">
                    {searchResults.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handleSelectPlayer(player)}
                        aria-label={`Seleccionar a ${player.displayName}`}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                      >
                        <PlayerAvatar name={player.displayName} image={player.image ?? undefined} size={32} className="rounded-lg shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold truncate">{player.displayName}</p>
                            {player.isContact && (
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                          </div>
                          {player.email && (
                            <p className="text-xs font-medium text-muted-foreground truncate opacity-60">{player.email}</p>
                          )}
                        </div>
                        <UserPlus className="h-4 w-4 text-primary" />
                      </button>
                    ))}
                  </div>
                )}

                {/* No results hint */}
                {showNoResults && (
                  <p className="text-xs font-medium text-muted-foreground italic px-1">
                    No hay jugadores con ese nombre. Tocá "Guardar" para registrarlo igual.
                  </p>
                )}

                {/* Contacts list when input is empty */}
                {showContactsList && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground px-1">
                      Contactos recientes
                    </span>
                    <div className="rounded-lg border border-border bg-muted p-2 space-y-1">
                      {searchResults.map((player) => (
                        <button
                          key={player.id}
                          onClick={() => handleSelectPlayer(player)}
                          aria-label={`Seleccionar a ${player.displayName}`}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                        >
                          <PlayerAvatar name={player.displayName} image={player.image ?? undefined} size={32} className="rounded-lg shadow-sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold truncate">{player.displayName}</p>
                              {player.isContact && (
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              )}
                            </div>
                          </div>
                          <UserPlus className="h-4 w-4 text-primary" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {error ? <p className="text-xs font-semibold text-destructive px-1">{error}</p> : null}
              </div>
            </>
          )}
        </div>

        {/* Footer — sticky bottom, above safe area */}
        <div
          className="flex flex-col gap-3 px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-border/50 shrink-0"
        >
          {canEdit && (
            <div className="flex gap-2">
              <Button
                type="button"
                className="flex-1 h-12 rounded-lg font-bold text-base"
                onClick={handleSave}
              >
                Guardar
              </Button>
              {onShare && (
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
          )}
          <Button
            type="button"
            variant="ghost"
            className="w-full h-10 rounded-lg font-medium text-muted-foreground text-sm"
            onClick={onClose}
          >
            {isUserSlot && !canEdit ? "Cerrar" : "Cancelar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
