"use client";

import { useState } from "react";
import { CalendarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { TurnCard } from "./turn-card";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TurnsFilterProps {
  turns: any[];
  userId: string | null;
}

export function TurnsFilter({ turns, userId }: TurnsFilterProps) {
  const [activeTab, setActiveTab] = useState<"todos" | "mis-turnos">("todos");

  // Helper values for determining relationships
  const filteredTurns = turns.filter((turn) => {
    if (activeTab === "todos") return true;

    // For "mis-turnos", the viewer must be creator, player, or substitute
    if (!userId) return false;
    const isCreator = turn.creatorId === userId;
    const isJoined = turn.players?.some((p: any) => p.userId === userId);
    const isSubstitute = turn.substitutes?.some((s: any) => s.userId === userId);

    return isCreator || isJoined || isSubstitute;
  });

  const totalAllCount = turns.length;
  const totalMyCount = userId
    ? turns.filter((turn) => {
        const isCreator = turn.creatorId === userId;
        const isJoined = turn.players?.some((p: any) => p.userId === userId);
        const isSubstitute = turn.substitutes?.some((s: any) => s.userId === userId);
        return isCreator || isJoined || isSubstitute;
      }).length
    : 0;

  return (
    <section className="flex flex-col gap-4">
      {userId && (
        <div className="flex flex-col gap-1.5">
          <span id="turns-tabs-label" className="sr-only">
            Filtrar turnos
          </span>
          <div
            role="radiogroup"
            aria-labelledby="turns-tabs-label"
            className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl"
          >
            <button
              type="button"
              role="radio"
              aria-checked={activeTab === "todos"}
              onClick={() => setActiveTab("todos")}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                activeTab === "todos"
                  ? "bg-card border border-border text-foreground shadow-sm"
                  : "border-transparent text-muted-foreground hover:bg-card/40 hover:text-foreground",
              )}
              aria-label="Mostrar todos los turnos disponibles"
            >
              Todos ({totalAllCount})
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={activeTab === "mis-turnos"}
              onClick={() => setActiveTab("mis-turnos")}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                activeTab === "mis-turnos"
                  ? "bg-card border border-border text-foreground shadow-sm"
                  : "border-transparent text-muted-foreground hover:bg-card/40 hover:text-foreground",
              )}
              aria-label="Mostrar mis turnos únicamente"
            >
              Mis turnos ({totalMyCount})
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">
          {activeTab === "todos" ? "Próximos turnos" : "Mis partidos programados"}
        </h2>
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
          {filteredTurns.length} {filteredTurns.length === 1 ? "disponible" : "disponibles"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {filteredTurns.length > 0 ? (
          filteredTurns.map((turn) => {
            const isJoined = turn.players?.some((p: any) => p.userId === userId);
            const isSubstitute = turn.substitutes?.some((s: any) => s.userId === userId);
            const isCreator = turn.creatorId === userId;
            return (
              <TurnCard
                key={turn.id}
                turn={turn}
                isJoined={isJoined}
                isSubstitute={isSubstitute}
                isCreator={isCreator}
              />
            );
          })
        ) : activeTab === "todos" ? (
          <EmptyState
            title="Sin turnos abiertos"
            description="No hay turnos disponibles. ¡Sé el primero en crear uno!"
            icon={CalendarOff}
            action={
              <Button asChild className="w-full h-12 rounded-lg font-bold">
                <Link href="/turnos/nuevo">Crear turno</Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="No estás anotado en ningún turno"
            description="Explorá los turnos abiertos para sumarte a un partido o creá tu propio turno."
            icon={CalendarOff}
            action={
              <div className="flex flex-col gap-2 w-full">
                <Button
                  onClick={() => setActiveTab("todos")}
                  className="w-full h-12 rounded-lg font-bold"
                >
                  Explorar turnos abiertos
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-lg font-bold"
                  asChild
                >
                  <Link href="/turnos/nuevo">Crear un turno</Link>
                </Button>
              </div>
            }
          />
        )}
      </div>
    </section>
  );
}
