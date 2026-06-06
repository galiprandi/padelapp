"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, UserMinus, ArrowLeftRight } from "lucide-react";

interface ManageSlotModalProps {
  open: boolean;
  slot: SlotValue | null;
  placeholderName: string;
  onSave: (name: string) => void;
  onShare: (name: string) => void;
  onRelease?: () => void;
  onSwap?: () => void;
  onClose: () => void;
}

type SlotValue =
  | { kind: "user"; player: PlayerOption }
  | { kind: "placeholder"; displayName: string };

type PlayerOption = {
  id: string;
  displayName: string;
  email: string;
  image: string | null;
};

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
      setError(null);
    }
  }, [open, slot, placeholderName]);

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
    onSave(trimmed);
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
        className="w-full max-w-sm space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-semibold text-foreground">
            Gestionar jugador
          </h2>
          <div className="flex gap-1">
            {onSwap && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10"
                onClick={onSwap}
                title="Cambiar equipo"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            )}
            {onRelease && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onRelease}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Liberar
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="slot-name">Nombre del jugador</Label>
          <div className="flex items-center gap-2">
            <Input
              id="slot-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Diego Morales"
              autoSelect
              disabled={isUserSlot}
            />
            {!isUserSlot && (
              <Button type="button" size="icon" variant="ghost" aria-label="Compartir enlace" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          {isUserSlot && (
            <p className="text-xs text-muted-foreground">
              El jugador ya se unió. Podés liberar el cupo para que otro se anote.
            </p>
          )}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleAccept}>
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}
