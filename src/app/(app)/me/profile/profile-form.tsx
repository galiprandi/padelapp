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
    <form className="space-y-10" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="alias" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">
            Alias en la cancha
          </Label>
          <Input
            id="alias"
            name="alias"
            placeholder="Ej: El Muro, Gero..."
            value={alias}
            onChange={(event) => setAlias(event.target.value)}
            disabled={isSaving}
            className="h-14 rounded-2xl bg-background/50 border-border/40 focus:bg-background transition-all font-medium px-6 text-base"
            aria-invalid={Boolean(aliasError)}
            aria-describedby={aliasError ? "alias-error" : undefined}
          />
        </div>
        <p className="text-xs text-muted-foreground/60 leading-relaxed px-1">
          Este es el nombre que verán tus rivales en los partidos y el ranking global.
        </p>
        {aliasError ? (
          <p id="alias-error" className="text-sm text-destructive font-bold px-1 animate-in fade-in slide-in-from-top-1">
            {aliasError}
          </p>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">
            Tu Nivel de Juego
          </Label>
          <p className="text-xs text-muted-foreground/60 leading-relaxed px-1">
            Seleccioná el nivel que mejor represente tu desempeño actual.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {levelOptions.map((option) => {
            const isSelected = level === parseInt(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setLevel(parseInt(option.value))}
                disabled={isSaving}
                className={cn(
                  "flex items-center justify-between px-6 py-4 rounded-2xl border transition-all text-sm font-black text-left active:scale-[0.98]",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-background/40 border-border/40 text-muted-foreground hover:bg-background/60"
                )}
              >
                <span>{option.label}</span>
                {isSelected ? (
                  <div className="h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center animate-in zoom-in duration-300">
                    <Check className="h-4 w-4 shrink-0" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full border border-border/40" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button
          type="submit"
          size="lg"
          className="w-full h-16 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/20"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          ) : (
            "Guardar cambios"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full h-12 rounded-xl text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]"
          asChild
        >
          <Link href="/me">Cancelar y volver</Link>
        </Button>
      </div>
    </form>
  );
}
