"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/page-header";
import { SlotDisplay } from "./slot-display";
import { MatchNavigation } from "./match-navigation";
import type { TeamState, MatchTypeValue, TeamKey } from "@/lib/match-types";
import { cn } from "@/lib/utils";
import { Check, Trophy } from "lucide-react";

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
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-3xl font-black text-primary-foreground border-4 border-background shadow-xl ring-1 ring-primary/20 scale-110">
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
                  : "bg-background/40 border-border/40 text-muted-foreground/70 hover:bg-background/60"
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
  const baseClass = "relative flex min-h-[calc(100dvh-160px)] flex-col justify-between gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700";

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

          <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 fill-mode-both">
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Pareja A</p>
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
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Pareja B</p>
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-primary/10 blur-[100px] -z-10" />

        <div className="space-y-10">
          <PageHeader
            title="Tipo de Partido"
            description="Elegí el formato del partido y configurá cuántos sets se jugarán. Activá el ranking si querés que cuente para las posiciones."
            descriptionClassName="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50"
            size="md"
          />

          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 fill-mode-both">
            <div className="space-y-3 rounded-[2rem] border border-primary/20 bg-primary/5 p-6 shadow-lg shadow-primary/5 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <Label htmlFor="record-score" className="text-sm font-black">Cargar resultado ahora</Label>
                  </div>
                  <p className="text-xs text-primary/70 leading-relaxed">
                    Si el partido ya terminó, cargá el marcador para cerrarlo inmediatamente.
                  </p>
                </div>
                <Switch
                  id="record-score"
                  checked={recordScore}
                  onCheckedChange={onRecordScoreChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Tipo de Formato</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MATCH_TYPE_OPTIONS.map((option) => {
                  const isSelected = matchType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onMatchTypeChange(option.value)}
                      className={cn(
                        "flex items-center justify-between px-6 py-4 rounded-2xl border transition-all text-base font-black text-left active:scale-[0.98] shadow-sm",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-background/40 border-border/40 text-muted-foreground hover:bg-background/60"
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="h-5 w-5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Cantidad de sets</Label>
              <div className="grid grid-cols-3 gap-2">
                {["1", "3", "5"].map((option) => {
                  const isSelected = sets === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onSetsChange(option)}
                      className={cn(
                        "flex items-center justify-center py-4 rounded-2xl border transition-all text-base font-black active:scale-[0.98] shadow-sm",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-background/40 border-border/40 text-muted-foreground hover:bg-background/60"
                      )}
                    >
                      {option} {parseInt(option) === 1 ? 'Set' : 'Sets'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 rounded-[2rem] border border-border/40 bg-card/40 p-6 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <Label htmlFor="counts-ranking" className="text-base font-black">Ranking competitivo</Label>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    Si está activo, el resultado impactará en tu posición y delta del ranking global.
                  </p>
                </div>
                <Switch
                  id="counts-ranking"
                  checked={countsForRanking}
                  onCheckedChange={onCountsForRankingChange}
                  className="scale-110"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
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

          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 fill-mode-both">
            <div className="space-y-4">
              <Label htmlFor="club" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Club (opcional)</Label>
              <Input
                id="club"
                placeholder="Ej: Padel City, Tie Break"
                value={club}
                onChange={(event) => onClubChange(event.target.value)}
                autoSelect
                className="h-14 rounded-2xl bg-background/50 border-border/40 focus:bg-background transition-all text-base font-medium px-6 shadow-sm"
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="court" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">Número de cancha (opcional)</Label>
              <Input
                id="court"
                placeholder="Ej: 3, Central"
                value={courtNumber}
                onChange={(event) => onCourtNumberChange(event.target.value)}
                autoSelect
                className="h-14 rounded-2xl bg-background/50 border-border/40 focus:bg-background transition-all text-base font-medium px-6 shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
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
  const teamAPlayers = teamState.A.map(s => s?.kind === "user" ? s.player.displayName : s?.displayName || "").join(" & ");
  const teamBPlayers = teamState.B.map(s => s?.kind === "user" ? s.player.displayName : s?.displayName || "").join(" & ");

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

        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 fill-mode-both">
          {Array.from({ length: setsCount }, (_, setIndex) => (
            <div key={setIndex} className="space-y-8 p-8 rounded-[2.5rem] bg-card/40 border border-border/40 backdrop-blur-md shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Trophy className="h-32 w-32 text-primary" />
              </div>

              <div className="flex items-center justify-between px-1 relative z-10">
                <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/40">Set {setIndex + 1}</h2>
                <div className="h-px flex-1 mx-6 bg-primary/10" />
              </div>

              <div className="grid gap-10 relative z-10">
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

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
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
