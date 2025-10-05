"use client";

import { useState, useTransition } from "react";
import { renamePlaceholderAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast/use-toast";

interface RenamePlaceholderFormProps {
  playerId: string;
  initialDisplayName: string;
}

export function RenamePlaceholderForm({ playerId, initialDisplayName }: RenamePlaceholderFormProps) {
  const [value, setValue] = useState(initialDisplayName);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      showToast("Ingresá un nombre válido.");
      return;
    }

    startTransition(async () => {
      const response = await renamePlaceholderAction({ playerId, displayName: trimmed });
      if (response.status === "ok") {
        showToast("Nombre guardado.");
      } else {
        showToast(response.message ?? "No pudimos guardar el nombre.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 text-xs">
      <Input
        name="displayName"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Nombre recordatorio"
        className="h-8 flex-1"
        disabled={isPending}
      />
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar nombre"}
      </Button>
    </form>
  );
}
