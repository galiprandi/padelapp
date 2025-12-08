"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateUserAliasAction } from "@/app/(app)/me/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/toast/use-toast";

const MIN_ALIAS_LENGTH = 2;
const MAX_ALIAS_LENGTH = 30;

interface ProfileFormProps {
  initialAlias: string;
}

export function ProfileForm({ initialAlias }: ProfileFormProps) {
  const { showToast } = useToast();
  const [alias, setAlias] = useState(initialAlias);
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
      const response = await updateUserAliasAction(alias);
      if (response.status === "ok") {
        showToast("Alias actualizado");
      } else {
        setError("No pudimos guardar tu alias. Probá de nuevo.");
      }
    });
  }

  const aliasError = error ?? undefined;

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="alias">Alias</Label>
        <Input
          id="alias"
          name="alias"
          placeholder="Ej: Gero, La Muralla"
          value={alias}
          onChange={(event) => setAlias(event.target.value)}
          disabled={isSaving}
          aria-invalid={Boolean(aliasError)}
          aria-describedby={aliasError ? "alias-error" : undefined}
        />
        <p className="text-xs text-muted-foreground">
          Usaremos tu alias para identificarte en partidos, rankings y listados. Este será el nombre que tus rivales verán.
        </p>
        {aliasError ? (
          <p id="alias-error" className="text-sm text-destructive">
            {aliasError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
        <Button type="button" variant="ghost" className="w-full" asChild>
          <Link href="/me">Volver</Link>
        </Button>
      </div>
    </form>
  );
}
