"use client";

import { useState, useTransition } from "react";
import { updateTeamLabelAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast/use-toast";

interface RenameTeamFormProps {
  teamId: string;
  matchId: string;
  initialLabel: string;
}

export function RenameTeamForm({ teamId, matchId, initialLabel }: RenameTeamFormProps) {
  const [label, setLabel] = useState(initialLabel);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = label.trim();
    if (trimmed.length === 0) {
      showToast("Ingresá un nombre válido para el equipo.");
      return;
    }

    startTransition(async () => {
      const response = await updateTeamLabelAction({ teamId, matchId, label: trimmed });
      if (response.status === "ok") {
        showToast("Nombre del equipo actualizado.");
      } else {
        showToast(response.message ?? "No pudimos actualizar el equipo.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 text-xs">
      <Input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="Nombre del equipo"
        className="h-8"
        disabled={isPending}
      />
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
