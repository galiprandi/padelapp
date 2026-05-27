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
    if (trimmed.length < MIN_ALIAS_LENGTH || trimmed.length > MAX_ALIAS_LENGTH) {
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
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="alias" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Alias
          </Label>
          <Input
            id="alias"
            name="alias"
            placeholder="Ej: Gero, La Muralla"
            value={alias}
            onChange={(event) => setAlias(event.target.value)}
            autoSelect
            disabled={isSaving}
            className="rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all"
            aria-invalid={Boolean(aliasError)}
            aria-describedby={aliasError ? "alias-error" : undefined}
          />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Usaremos tu alias para identificarte en partidos y rankings. Este será el nombre que tus rivales verán.
        </p>
        {aliasError ? (
          <p id="alias-error" className="text-sm text-destructive font-medium">
            {aliasError}
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Nivel de Juego
          </Label>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Seleccioná el nivel que mejor represente tu juego actual.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {levelOptions.map((option) => {
            const isSelected = level === parseInt(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setLevel(parseInt(option.value))}
                disabled={isSaving}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-sm font-medium text-left",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground shadow-sm"
                    : "bg-background/40 border-border/40 text-muted-foreground hover:bg-background/60 hover:border-border"
                )}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isSaving ? "Guardando..." : "Guardar perfil"}
        </Button>
        <Button type="button" variant="ghost" className="w-full rounded-xl text-muted-foreground" asChild>
          <Link href="/me">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
