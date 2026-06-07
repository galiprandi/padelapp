"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/page-header";
import { SlotDisplay } from "./slot-display";
import { MatchNavigation } from "./match-navigation";
import type { TeamState, MatchTypeValue, TeamKey } from "@/lib/match-types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
        <div className="space-y-8">
          <PageHeader
            title="Nuevo Partido"
            description="Armá tu partido seleccionando las parejas. Tocá el botón de cada jugador para gestionar nombres y enlaces de invitación."
          />

          <div className="grid gap-6">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 px-1">Pareja A</p>
              <div className="grid gap-2">
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
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 px-1">Pareja B</p>
              <div className="grid gap-2">
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
        <div className="space-y-8">
          <PageHeader
            title="Tipo de Partido"
            description="Elegí el formato del partido y configurá cuántos sets se jugarán. Activá el ranking si querés que cuente para las posiciones."
            size="md"
          />

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 px-1">Tipo de Formato</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MATCH_TYPE_OPTIONS.map((option) => {
                  const isSelected = matchType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onMatchTypeChange(option.value)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-sm font-medium text-left active:scale-[0.98]",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "bg-background/40 border-border/40 text-muted-foreground hover:bg-background/60"
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="sets" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 px-1">Cantidad de sets</Label>
              <Input
                id="sets"
                inputMode="numeric"
                type="number"
                min={MIN_SETS}
                max={MAX_SETS}
                value={sets}
                onChange={(event) => onSetsChange(event.target.value)}
                autoSelect
                className="rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all h-12"
              />
            </div>

            <div className="space-y-3 rounded-3xl border border-border/40 bg-card/40 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <Label htmlFor="counts-ranking" className="text-sm font-black">Sumar puntos para el Ranking</Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Si está activo, el resultado impactará en tu posición y delta del ranking global.
                  </p>
                </div>
                <Switch
                  id="counts-ranking"
                  checked={countsForRanking}
                  onCheckedChange={onCountsForRankingChange}
                />
              </div>
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
      <div className="space-y-8">
        <PageHeader
          title="Detalles del Partido"
          description="Agregá información opcional como el club y la cancha. Estos datos ayudan a organizar mejor el partido."
          size="md"
        />

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="club" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 px-1">Club (opcional)</Label>
            <Input
              id="club"
              placeholder="Ej: Padel City, Tie Break"
              value={club}
              onChange={(event) => onClubChange(event.target.value)}
              autoSelect
              className="rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all h-12"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="court" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 px-1">Número de cancha (opcional)</Label>
            <Input
              id="court"
              placeholder="Ej: 3, Central"
              value={courtNumber}
              onChange={(event) => onCourtNumberChange(event.target.value)}
              autoSelect
              className="rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all h-12"
            />
          </div>
        </div>
      </div>

      <MatchNavigation
        primaryButtonText={isSubmitting ? "Creando..." : "Crear partido"}
        onPrimaryClick={onCreateMatch}
        primaryDisabled={isSubmitting}
        primaryLoading={isSubmitting}
        secondaryButtonText="Atrás"
        onSecondaryClick={onPreviousStep}
      />
    </section>
  );
}
