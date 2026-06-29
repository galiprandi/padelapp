"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/page-header";
import { SlotDisplay } from "./slot-display";
import { MatchNavigation } from "./match-navigation";
import type { TeamState, MatchTypeValue, TeamKey } from "@/lib/match-types";
import { cn } from "@/lib/utils";
import { Check, Trophy, LayoutGrid, Settings2, Info, PlusCircle } from "lucide-react";

interface StepContentProps {
  currentStep: 0 | 1 | 2 | 3;
  teamState: TeamState;
  activeSlot: { team: TeamKey; index: 0 | 1 };
  userDisplayName: string;
  matchType: MatchTypeValue;
  sets: string;
  setsValid: boolean;
  countsForRanking: boolean;
  club: string;
  courtNumber: string;
  recordScore: boolean;
  scores: number[][];
  isSubmitting: boolean;
  onSlotClick: (team: TeamKey, index: 0 | 1) => void;
  onManageClick: (team: TeamKey, index: 0 | 1) => void;
  onMatchTypeChange: (value: MatchTypeValue) => void;
  onSetsChange: (value: string) => void;
  onCountsForRankingChange: (checked: boolean) => void;
  onClubChange: (value: string) => void;
  onCourtNumberChange: (value: string) => void;
  onRecordScoreChange: (checked: boolean) => void;
  onScoresChange: (scores: number[][]) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onCreateMatch: () => void;
}

function ScoreSelector({
  setIndex,
  teamIndex,
  teamLabel,
  players,
  currentValue,
  onValueChange
}: {
  setIndex: number;
  teamIndex: number;
  teamLabel: string;
  players: string;
  currentValue: number;
  onValueChange: (val: number) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">{teamLabel}</span>
          <span className="text-base font-black text-foreground truncate leading-none">
            {players}
          </span>
        </div>
        <div className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-3xl font-black text-primary-foreground border-4 border-background shadow-xl ring-1 ring-primary/20 scale-110 transition-all duration-300",
          currentValue > 0 ? "bg-primary" : "bg-muted text-muted-foreground/40 border-muted/20 shadow-none ring-0 scale-100"
        )}>
          {currentValue}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => {
          const isSelected = currentValue === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onValueChange(num)}
              className={cn(
                "h-14 rounded-2xl border text-xl font-black transition-all active:scale-[0.95] relative overflow-hidden",
                isSelected
                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 z-10 scale-105"
                  : "bg-background/40 border-border/40 text-muted-foreground/70 hover:bg-background/60 hover:border-primary/20 hover:text-primary"
              )}
            >
              {num}
              {isSelected && (
                <div className="absolute top-1 right-1">
                  <Check className="h-3 w-3 opacity-50" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const MATCH_TYPE_OPTIONS = [
  { value: "FRIENDLY", label: "Amistoso" },
  { value: "LOCAL_TOURNAMENT", label: "Torneo local" },
] as const;

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
  onRecordScoreChange,
  onScoresChange,
  onNextStep,
  onPreviousStep,
  onCreateMatch,
  recordScore,
  scores,
}: StepContentProps) {
  const baseClass = "relative flex min-h-[calc(100dvh-160px)] flex-col justify-between gap-12 animate-in fade-in slide-in-from-bottom-6 duration-1000";

  if (currentStep === 0) {
    return (
      <section className={baseClass}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-primary/10 blur-[100px] -z-10" />

        <div className="space-y-8">
          <PageHeader
            title="Nuevo Partido"
            description="Armá tu partido seleccionando las parejas. Tocá el botón de cada jugador para gestionar nombres y enlaces de invitación."
            descriptionClassName="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50"
          />

          <div className="grid gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
            <div className="space-y-5">
              <div className="flex items-center gap-2 px-1">
                <LayoutGrid className="h-3.5 w-3.5 text-primary/40" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Pareja A</p>
              </div>
              <div className="grid gap-3">
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
            <div className="space-y-5">
              <div className="flex items-center gap-2 px-1">
                <LayoutGrid className="h-3.5 w-3.5 text-primary/40" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Pareja B</p>
              </div>
              <div className="grid gap-3">
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

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
          <MatchNavigation
            primaryButtonText="Siguiente"
            onPrimaryClick={onNextStep}
            secondaryButtonText="Cancelar"
            onSecondaryClick={() => { }}
            secondaryIsLink={true}
            secondaryHref="/match"
          />
        </div>
      </section>
    );
  }

  if (currentStep === 1) {
    return (
      <section className={baseClass}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-primary/10 blur-[100px] -z-10" />

        <div className="space-y-10">
          <PageHeader
            title="Tipo de Partido"
            description="Elegí el formato del partido y configurá cuántos sets se jugarán. Activá el ranking si querés que cuente para las posiciones."
            descriptionClassName="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50"
            size="md"
          />

          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
            <div className="space-y-3 rounded-[2.5rem] border border-primary/20 bg-primary/5 p-8 shadow-xl shadow-primary/5 backdrop-blur-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy className="h-24 w-24 text-primary" />
              </div>
              <div className="flex items-center justify-between gap-4 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-primary/20 flex items-center justify-center">
                       <Check className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <Label htmlFor="record-score" className="text-base font-black tracking-tight">Cargar resultado ahora</Label>
                  </div>
                  <p className="text-xs text-primary/60 font-medium leading-relaxed max-w-[200px]">
                    Si el partido ya terminó, cargá el marcador para cerrarlo inmediatamente.
                  </p>
                </div>
                <Switch
                  id="record-score"
                  checked={recordScore}
                  onCheckedChange={onRecordScoreChange}
                  className="scale-125 data-[state=checked]:bg-primary"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-2 px-1">
                <Settings2 className="h-3.5 w-3.5 text-primary/40" />
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Tipo de Formato</Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MATCH_TYPE_OPTIONS.map((option) => {
                  const isSelected = matchType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onMatchTypeChange(option.value)}
                      className={cn(
                        "flex items-center justify-between px-6 py-5 rounded-[1.5rem] border transition-all text-base font-black text-left active:scale-[0.98] shadow-sm",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                          : "bg-card/40 border-border/40 text-muted-foreground hover:bg-card/60 backdrop-blur-md"
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="h-5 w-5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-2 px-1">
                <LayoutGrid className="h-3.5 w-3.5 text-primary/40" />
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Cantidad de sets</Label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["1", "3", "5"].map((option) => {
                  const isSelected = sets === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onSetsChange(option)}
                      className={cn(
                        "flex items-center justify-center py-5 rounded-[1.5rem] border transition-all text-base font-black active:scale-[0.98] shadow-sm",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                          : "bg-card/40 border-border/40 text-muted-foreground hover:bg-card/60 backdrop-blur-md"
                      )}
                    >
                      {option} {parseInt(option) === 1 ? 'Set' : 'Sets'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 rounded-[2.5rem] border border-border/40 bg-card/40 p-8 shadow-xl backdrop-blur-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy className="h-24 w-24 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between gap-4 relative z-10">
                <div className="space-y-2">
                   <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                       <Trophy className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <Label htmlFor="counts-ranking" className="text-base font-black tracking-tight">Ranking competitivo</Label>
                  </div>
                  <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed max-w-[200px]">
                    Si está activo, el resultado impactará en tu posición y delta del ranking global.
                  </p>
                </div>
                <Switch
                  id="counts-ranking"
                  checked={countsForRanking}
                  onCheckedChange={onCountsForRankingChange}
                  className="scale-125 data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
          <MatchNavigation
            primaryButtonText="Continuar"
            onPrimaryClick={onNextStep}
            primaryDisabled={!setsValid}
            secondaryButtonText="Atrás"
            onSecondaryClick={onPreviousStep}
          />
        </div>
      </section>
    );
  }

  if (currentStep === 2) {
    return (
      <section className={baseClass}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-primary/10 blur-[100px] -z-10" />

        <div className="space-y-10">
          <PageHeader
            title="Detalles del Partido"
            description="Agregá información opcional como el club y la cancha. Estos datos ayudan a organizar mejor el partido."
            descriptionClassName="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50"
            size="md"
          />

          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
            <div className="space-y-5">
              <div className="flex items-center gap-2 px-1">
                <Info className="h-3.5 w-3.5 text-primary/40" />
                <Label htmlFor="club" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Club (opcional)</Label>
              </div>
              <Input
                id="club"
                placeholder="Ej: Padel City, Tie Break"
                value={club}
                onChange={(event) => onClubChange(event.target.value)}
                autoSelect
                className="h-16 rounded-[1.5rem] bg-card/40 border-border/40 focus:bg-card transition-all text-base font-medium px-8 shadow-sm backdrop-blur-md"
              />
            </div>
            <div className="space-y-5">
              <div className="flex items-center gap-2 px-1">
                <Info className="h-3.5 w-3.5 text-primary/40" />
                <Label htmlFor="court" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Número de cancha (opcional)</Label>
              </div>
              <Input
                id="court"
                placeholder="Ej: 3, Central"
                value={courtNumber}
                onChange={(event) => onCourtNumberChange(event.target.value)}
                autoSelect
                className="h-16 rounded-[1.5rem] bg-card/40 border-border/40 focus:bg-card transition-all text-base font-medium px-8 shadow-sm backdrop-blur-md"
              />
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
          <MatchNavigation
            primaryButtonText={recordScore ? "Continuar" : (isSubmitting ? "Creando..." : "Crear partido")}
            onPrimaryClick={recordScore ? onNextStep : onCreateMatch}
            primaryDisabled={isSubmitting}
            primaryLoading={!recordScore && isSubmitting}
            secondaryButtonText="Atrás"
            onSecondaryClick={onPreviousStep}
          />
        </div>
      </section>
    );
  }

  // Final Step: Score Entry (Only if recordScore is true)
  const setsCount = parseInt(sets) || 1;
  const teamAPlayers = teamState.A.map(s => s?.kind === "user" ? s.player.displayName : s?.displayName || "Jugador A").join(" & ");
  const teamBPlayers = teamState.B.map(s => s?.kind === "user" ? s.player.displayName : s?.displayName || "Jugador B").join(" & ");

  return (
    <section className={baseClass}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-primary/10 blur-[100px] -z-10" />

      <div className="space-y-10">
        <PageHeader
          title="Marcador Final"
          description="Completá los sets jugados para finalizar el registro del partido."
          descriptionClassName="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50"
          size="md"
        />

        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
          {Array.from({ length: setsCount }, (_, setIndex) => (
            <div key={setIndex} className="space-y-10 p-10 rounded-[3rem] bg-card/40 border border-border/40 backdrop-blur-2xl shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <PlusCircle className="h-40 w-40 text-primary" />
              </div>

              <div className="flex items-center justify-between px-1 relative z-10">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Set {setIndex + 1}</h2>
                  <div className="h-1 w-8 rounded-full bg-primary/20" />
                </div>
              </div>

              <div className="grid gap-12 relative z-10">
                <ScoreSelector
                  setIndex={setIndex}
                  teamIndex={0}
                  teamLabel="Pareja A"
                  players={teamAPlayers}
                  currentValue={scores[setIndex]?.[0] ?? 0}
                  onValueChange={(val) => {
                    const newScores = [...scores];
                    if (!newScores[setIndex]) newScores[setIndex] = [0, 0];
                    newScores[setIndex][0] = val;
                    onScoresChange(newScores);
                  }}
                />
                <ScoreSelector
                  setIndex={setIndex}
                  teamIndex={1}
                  teamLabel="Pareja B"
                  players={teamBPlayers}
                  currentValue={scores[setIndex]?.[1] ?? 0}
                  onValueChange={(val) => {
                    const newScores = [...scores];
                    if (!newScores[setIndex]) newScores[setIndex] = [0, 0];
                    newScores[setIndex][1] = val;
                    onScoresChange(newScores);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both pb-10">
        <MatchNavigation
          primaryButtonText={isSubmitting ? "Creando..." : "Crear y finalizar"}
          onPrimaryClick={onCreateMatch}
          primaryDisabled={isSubmitting}
          primaryLoading={isSubmitting}
          secondaryButtonText="Atrás"
          onSecondaryClick={onPreviousStep}
        />
      </div>
    </section>
  );
}
