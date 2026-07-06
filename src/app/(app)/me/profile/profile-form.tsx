"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateUserProfileAction } from "@/app/(app)/me/actions";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/toast/use-toast";
import { levelOptions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const MIN_ALIAS_LENGTH = 2;
const MAX_ALIAS_LENGTH = 30;

interface ProfileFormProps {
  initialAlias: string;
  initialLevel: number;
}

export function ProfileForm({ initialAlias, initialLevel }: ProfileFormProps) {
  const { showToast } = useToast();
  const [alias, setAlias] = useState(initialAlias);
  const [level, setLevel] = useState(initialLevel);
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
      const response = await updateUserProfileAction(alias, level);
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
          className="grid grid-cols-1 gap-1.5"
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
                  "flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-colors",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0" />}
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
