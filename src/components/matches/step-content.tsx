"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/page-header";
import { SlotDisplay } from "./slot-display";
import { MatchNavigation } from "./match-navigation";
import type { TeamState, MatchTypeValue, TeamKey } from "@/lib/match-types";

interface StepContentProps {
  currentStep: 0 | 1 | 2;
  teamState: TeamState;
  activeSlot: { team: TeamKey; index: 0 | 1 };
  userDisplayName: string;
  matchType: MatchTypeValue;
  sets: string;
  setsValid: boolean;
  countsForRanking: boolean;
  club: string;
  courtNumber: string;
  isSubmitting: boolean;
  onSlotClick: (team: TeamKey, index: 0 | 1) => void;
  onManageClick: (team: TeamKey, index: 0 | 1) => void;
  onMatchTypeChange: (value: MatchTypeValue) => void;
  onSetsChange: (value: string) => void;
  onCountsForRankingChange: (checked: boolean) => void;
  onClubChange: (value: string) => void;
  onCourtNumberChange: (value: string) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onCreateMatch: () => void;
}

const MATCH_TYPE_OPTIONS = [
  { value: "FRIENDLY", label: "Amistoso" },
  { value: "LOCAL_TOURNAMENT", label: "Torneo local" },
] as const;

const MIN_SETS = 1;
const MAX_SETS = 5;

export function StepContent({
  currentStep,
  teamState,
  activeSlot,
  userDisplayName,
  matchType,
  sets,
  setsValid,
  countsForRanking,
  club,
  courtNumber,
  isSubmitting,
  onSlotClick,
  onManageClick,
  onMatchTypeChange,
  onSetsChange,
  onCountsForRankingChange,
  onClubChange,
  onCourtNumberChange,
  onNextStep,
  onPreviousStep,
  onCreateMatch,
}: StepContentProps) {
  const baseClass = "flex min-h-[calc(100dvh-160px)] flex-col justify-between gap-8";

  if (currentStep === 0) {
    return (
      <section className={baseClass}>
        <PageHeader
          title="Nuevo Partido"
          description="Armá tu partido seleccionando las parejas. Tocá el botón de cada jugador para gestionar nombres y enlaces de invitación."
          className="mb-6"
        />

        <div className="grid gap-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Pareja A</p>
            {([0, 1] as const).map((index) => (
              <SlotDisplay
                key={`A-${index}`}
                team="A"
                index={index}
                slot={teamState.A[index]}
                userDisplayName={userDisplayName}
                isActive={activeSlot.team === "A" && activeSlot.index === index}
                onSlotClick={onSlotClick}
                onManageClick={onManageClick}
              />
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Pareja B</p>
            {([0, 1] as const).map((index) => (
              <SlotDisplay
                key={`B-${index}`}
                team="B"
                index={index}
                slot={teamState.B[index]}
                userDisplayName={userDisplayName}
                isActive={activeSlot.team === "B" && activeSlot.index === index}
                onSlotClick={onSlotClick}
                onManageClick={onManageClick}
              />
            ))}
          </div>
        </div>

        <MatchNavigation
          primaryButtonText="Siguiente"
          onPrimaryClick={onNextStep}
          secondaryButtonText="Cancelar"
          onSecondaryClick={() => { }}
          secondaryIsLink={true}
          secondaryHref="/match"
        />
      </section>
    );
  }

  if (currentStep === 1) {
    return (
      <section className={baseClass}>
        <div className="space-y-6">
          <PageHeader
            title="Tipo de Partido"
            description="Elegí el formato del partido y configurá cuántos sets se jugarán. Activá el ranking si querés que cuente para las posiciones."
            size="md"
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="match-type">Tipo</Label>
              <select
                id="match-type"
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm"
                value={matchType}
                onChange={(event) => onMatchTypeChange(event.target.value as MatchTypeValue)}
              >
                {MATCH_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sets">Cantidad de sets</Label>
              <Input
                id="sets"
                inputMode="numeric"
                type="number"
                min={MIN_SETS}
                max={MAX_SETS}
                value={sets}
                onChange={(event) => onSetsChange(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="counts-ranking">Ranking</Label>
              <div className="flex items-center gap-3">
                <Switch
                  id="counts-ranking"
                  checked={countsForRanking}
                  onCheckedChange={onCountsForRankingChange}
                />
                <span className="text-sm text-foreground">Acumula ranking</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Si está activo, el resultado impactará en tu posición del ranking.
              </p>
            </div>
          </div>
        </div>

        <MatchNavigation
          primaryButtonText="Continuar"
          onPrimaryClick={onNextStep}
          primaryDisabled={!setsValid}
          secondaryButtonText="Atrás"
          onSecondaryClick={onPreviousStep}
        />
      </section>
    );
  }

  return (
    <section className={baseClass}>
      <div className="space-y-6">
        <PageHeader
          title="Detalles del Partido"
          description="Agregá información opcional como el club y la cancha. Estos datos ayudan a organizar mejor el partido."
          size="md"
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="club">Club (opcional)</Label>
            <Input
              id="club"
              placeholder="Ej: Padel City"
              value={club}
              onChange={(event) => onClubChange(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="court">Número de cancha (opcional)</Label>
            <Input
              id="court"
              placeholder="Ej: 3"
              value={courtNumber}
              onChange={(event) => onCourtNumberChange(event.target.value)}
            />
          </div>
        </div>
      </div>

      <MatchNavigation
        primaryButtonText={isSubmitting ? "Creando..." : "Crear partido"}
        onPrimaryClick={onCreateMatch}
        primaryDisabled={isSubmitting}
        secondaryButtonText="Atrás"
        onSecondaryClick={onPreviousStep}
      />
    </section>
  );
}
