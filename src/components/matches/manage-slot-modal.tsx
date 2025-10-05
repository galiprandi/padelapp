"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2 } from "lucide-react";

interface ManageSlotModalProps {
  open: boolean;
  slot: SlotValue | null;
  placeholderName: string;
  onSave: (name: string) => void;
  onShare: (name: string) => void;
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

export function ManageSlotModal({ open, slot, placeholderName, onSave, onShare, onClose }: ManageSlotModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-foreground">Gestionar jugador</h2>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              id="slot-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Diego Morales"
            />
            <Button type="button" size="icon" variant="ghost" aria-label="Compartir enlace" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
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
