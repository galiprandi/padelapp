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
          <Label htmlFor="alias" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Tu Alias Público
          </Label>
          <Input
            id="alias"
            name="alias"
            placeholder="Ej: Gero, La Muralla"
            value={alias}
            onChange={(event) => setAlias(event.target.value)}
            autoSelect
            disabled={isSaving}
            className="h-14 rounded-2xl bg-background/40 border-border/40 focus:bg-background/80 focus:ring-primary/20 transition-all font-black text-base px-6 shadow-inner"
            aria-invalid={Boolean(aliasError)}
            aria-describedby={aliasError ? "alias-error" : undefined}
          />
        </div>
        <p className="text-[11px] font-medium leading-relaxed text-muted-foreground/40 px-1 italic">
          Este es el nombre que verán tus rivales en los partidos y el ranking global.
        </p>
        {aliasError ? (
          <p id="alias-error" className="text-sm text-destructive font-bold px-1 animate-in fade-in slide-in-from-left-2">
            {aliasError}
          </p>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">
            Nivel de Juego
          </Label>
          <p className="text-[11px] font-medium leading-relaxed text-muted-foreground/40 px-1 italic">
            Seleccioná tu nivel actual. Esto ayuda a equilibrar los partidos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {levelOptions.map((option) => {
            const isSelected = level === parseInt(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setLevel(parseInt(option.value))}
                disabled={isSaving}
                className={cn(
                  "group flex items-center justify-between px-6 py-4 rounded-2xl border transition-all text-sm font-black text-left active:scale-[0.98]",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-background/20 border-border/20 text-muted-foreground/60 hover:bg-background/40 hover:border-border/40"
                )}
              >
                <span className="tracking-tight">{option.label}</span>
                <div className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300",
                  isSelected
                    ? "bg-primary-foreground/20 text-primary-foreground scale-110"
                    : "bg-muted/20 text-transparent scale-75 group-hover:bg-muted/40"
                )}>
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4">
        <Button
          type="submit"
          size="lg"
          className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Check className="mr-2 h-5 w-5" />
          )}
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
          asChild
        >
          <Link href="/me">Descartar cambios</Link>
        </Button>
      </div>
    </form>
  );
}
