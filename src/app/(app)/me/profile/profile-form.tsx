"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateUserProfileAction } from "@/app/(app)/me/actions";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/toast/use-toast";
import { levelOptions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { getPlayerInitials } from "@/components/players/player-avatar";

const MIN_ALIAS_LENGTH = 2;
const MAX_ALIAS_LENGTH = 30;

const AVATAR_PRESETS = [
  { name: "Pala", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Pala" },
  { name: "Smash", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Smash" },
  { name: "Volea", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Volea" },
  { name: "Globo", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Globo" },
  { name: "Efecto", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Efecto" },
];

interface ProfileFormProps {
  initialAlias: string;
  initialLevel: number;
  initialImage: string | null;
}

export function ProfileForm({ initialAlias, initialLevel, initialImage }: ProfileFormProps) {
  const { showToast } = useToast();
  const [alias, setAlias] = useState(initialAlias);
  const [level, setLevel] = useState(initialLevel);
  const [image, setImage] = useState<string | null>(initialImage);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  function validateAlias(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    if (
      trimmed.length < MIN_ALIAS_LENGTH ||
      trimmed.length > MAX_ALIAS_LENGTH
    ) {
      return `Usá entre ${MIN_ALIAS_LENGTH} y ${MAX_ALIAS_LENGTH} caracteres.`;
    }
    return null;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateAlias(alias);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    startSaving(async () => {
      const response = await updateUserProfileAction(alias, level, image);
      if (response.status === "ok") {
        showToast("Perfil actualizado");
      } else {
        setError("No pudimos guardar los cambios. Probá de nuevo.");
      }
    });
  }

  const aliasError = error ?? undefined;

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Avatar Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          Foto de perfil
        </Label>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="relative shrink-0">
            {image ? (
              <img
                src={image}
                alt="Vista previa"
                className="w-16 h-16 rounded-xl object-cover border border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center border border-border text-lg font-bold text-primary">
                {getPlayerInitials(alias || "Jugador")}
              </div>
            )}
            {image && (
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-1 border border-border shadow-sm hover:bg-destructive/90"
                title="Quitar imagen"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-xs text-muted-foreground">
              Elegí uno de nuestros avatares deportivos o usá las iniciales de tu nombre.
            </p>
            <div className="flex flex-wrap gap-2">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = image === preset.url;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={cn(
                      "w-10 h-10 rounded-lg overflow-hidden border transition-all active:scale-[0.98]",
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-muted-foreground",
                    )}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="image-url" className="text-xs text-muted-foreground font-semibold">
            O pegá un link de imagen personalizado
          </Label>
          <Input
            id="image-url"
            name="imageUrl"
            placeholder="https://ejemplo.com/mi-foto.jpg"
            value={image && !AVATAR_PRESETS.some(p => p.url === image) ? image : ""}
            onChange={(event) => setImage(event.target.value || null)}
            disabled={isSaving}
            className="h-10 text-xs"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="alias"
          className="text-sm font-semibold text-foreground"
        >
          Alias en la cancha
        </Label>
        <Input
          id="alias"
          name="alias"
          placeholder="Ej: El Muro, Gero..."
          value={alias}
          onChange={(event) => setAlias(event.target.value)}
          disabled={isSaving}
          autoSelect
          className="h-12"
          aria-invalid={Boolean(aliasError)}
          aria-describedby={aliasError ? "alias-error" : undefined}
        />
        <p className="text-xs text-muted-foreground">
          Este nombre verán tus rivales en partidos y ranking.
        </p>
        {aliasError ? (
          <p id="alias-error" className="text-sm text-destructive">
            {aliasError}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label id="level-label" className="text-sm font-semibold text-foreground">
          Tu nivel de juego
        </Label>
        <div
          role="radiogroup"
          aria-labelledby="level-label"
          className="grid grid-cols-1 gap-2"
        >
          {levelOptions.map((option) => {
            const isSelected = level === parseInt(option.value);
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setLevel(parseInt(option.value))}
                disabled={isSaving}
                className={cn(
                  "flex flex-col gap-1 p-3 rounded-lg border text-left transition-colors",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={cn("text-sm font-semibold", isSelected ? "text-primary-foreground" : "text-foreground")}>
                    {option.label}
                  </span>
                  {isSelected && <Check className="h-4 w-4 shrink-0" />}
                </div>
                {option.description && (
                  <p className={cn("text-xs leading-normal", isSelected ? "text-primary-foreground/90" : "text-muted-foreground")}>
                    {option.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={isSaving} className="w-full h-12">
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Guardar cambios"
          )}
        </Button>
        <Button type="button" variant="ghost" asChild className="w-full">
          <Link href="/me">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
