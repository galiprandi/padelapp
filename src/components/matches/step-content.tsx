"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SlotDisplay } from "./slot-display";
import { MatchNavigation } from "./match-navigation";
import type { TeamState, MatchTypeValue, TeamKey } from "@/lib/match-types";
import { cn } from "@/lib/utils";
import { Check, ArrowUpDown, MapPin } from "lucide-react";

interface StepContentProps {
  currentStep: 0 | 1 | 2 | 3;
  teamState: TeamState;
  activeSlot: { team: TeamKey; index: 0 | 1 };
  userDisplayName: string;
  currentUserId?: string;
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
  onSwapSides: (team: TeamKey) => void;
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
  onValueChange,
}: {
  setIndex: number;
  teamIndex: number;
  teamLabel: string;
  players: string;
  currentValue: number;
  onValueChange: (val: number) => void;
}) {
  const groupLabelId = `score-label-${setIndex}-${teamIndex}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span id={groupLabelId} className="text-xs text-muted-foreground">
            {teamLabel}: {players}
          </span>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg text-xl font-bold shrink-0",
            currentValue > 0
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
          aria-hidden="true"
        >
          {currentValue}
        </div>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={groupLabelId}
        className="grid grid-cols-4 gap-2"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => {
          const isSelected = currentValue === num;
          return (
            <button
              key={num}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onValueChange(num)}
              className={cn(
                "h-12 rounded-lg border text-lg font-bold transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                isSelected
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-card border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {num}
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

function RecentClubs({
  currentClub,
  currentCourt,
  onClubChange,
  onCourtChange,
}: {
  currentClub: string;
  currentCourt: string;
  onClubChange: (value: string) => void;
  onCourtChange: (value: string) => void;
}) {
  const [recentClubs, setRecentClubs] = useState<{ club: string; courtNumber: string | null }[]>([]);

  useEffect(() => {
    fetch("/api/recent")
      .then((res) => res.json())
      .then((data) => {
        if (data.recentClubs) setRecentClubs(data.recentClubs);
      })
      .catch(() => {});
  }, []);

  if (recentClubs.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
        <MapPin className="h-3 w-3" />
        Clubes recientes
      </Label>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {recentClubs.map((item) => {
          const label = item.courtNumber
            ? `${item.club} · ${item.courtNumber}`
            : item.club;
          const isSelected =
            currentClub === item.club &&
            (!item.courtNumber || currentCourt === item.courtNumber);
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onClubChange("");
                  onCourtChange("");
                } else {
                  onClubChange(item.club);
                  onCourtChange(item.courtNumber ?? "");
                }
              }}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
                isSelected
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-card border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StepContent({
  currentStep,
  teamState,
  activeSlot,
  userDisplayName,
  currentUserId,
  matchType,
  sets,
  setsValid,
  countsForRanking,
  club,
  courtNumber,
  isSubmitting,
  onSlotClick,
  onManageClick,
  onSwapSides,
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
  const baseClass =
    "flex min-h-[calc(100dvh-160px)] flex-col justify-between gap-6";

  if (currentStep === 0) {
    return (
      <section className={baseClass}>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Nuevo Partido</h1>
            <p className="text-sm text-muted-foreground">
              Armá tu partido seleccionando las parejas. Tocá un jugador para
              gestionarlo. Usá el botón de intercambio para cambiar derecha/revés.
            </p>
          </div>

          <div className="space-y-6">
            {(["A", "B"] as const).map((team) => (
              <div key={team} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">Pareja {team}</h2>
                  <button
                    type="button"
                    onClick={() => onSwapSides(team)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors rounded-lg px-2 py-1 hover:bg-primary/5"
                    aria-label={`Intercambiar derecha y revés de Pareja ${team}`}
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Cambiar lados
                  </button>
                </div>
                <div className="grid gap-2">
                  {([0, 1] as const).map((index) => (
                    <SlotDisplay
                      key={`${team}-${index}`}
                      team={team}
                      index={index}
                      slot={teamState[team][index]}
                      userDisplayName={userDisplayName}
                      currentUserId={currentUserId}
                      isActive={
                        activeSlot.team === team && activeSlot.index === index
                      }
                      onSlotClick={onSlotClick}
                      onManageClick={onManageClick}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <MatchNavigation
          primaryButtonText="Siguiente"
          onPrimaryClick={onNextStep}
          secondaryButtonText="Cancelar"
          onSecondaryClick={() => {}}
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
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Tipo de Partido
            </h1>
            <p className="text-sm text-muted-foreground">
              Elegí el formato del partido y configurá cuántos sets se jugarán.
              Activá el ranking si querés que cuente para las posiciones.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
              <div className="space-y-1">
                <Label htmlFor="record-score" className="text-sm font-semibold">
                  Cargar resultado ahora
                </Label>
                <p className="text-xs text-muted-foreground">
                  Si el partido ya terminó, cargá el marcador para cerrarlo
                  inmediatamente.
                </p>
              </div>
              <Switch
                id="record-score"
                checked={recordScore}
                onCheckedChange={onRecordScoreChange}
              />
            </div>

            <div className="space-y-2">
              <Label id="match-type-label" className="text-sm font-semibold">
                Tipo de formato
              </Label>
              <div
                role="radiogroup"
                aria-labelledby="match-type-label"
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                {MATCH_TYPE_OPTIONS.map((option) => {
                  const isSelected = matchType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onMatchTypeChange(option.value)}
                      className={cn(
                        "flex items-center justify-between h-12 px-4 rounded-lg border text-sm font-semibold text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-card border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label id="sets-count-label" className="text-sm font-semibold">
                Cantidad de sets
              </Label>
              <div
                role="radiogroup"
                aria-labelledby="sets-count-label"
                className="grid grid-cols-3 gap-2"
              >
                {["1", "3", "5"].map((option) => {
                  const isSelected = sets === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onSetsChange(option)}
                      className={cn(
                        "flex items-center justify-center h-12 rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-card border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {option} {parseInt(option) === 1 ? "Set" : "Sets"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
              <div className="space-y-1">
                <Label
                  htmlFor="counts-ranking"
                  className="text-sm font-semibold"
                >
                  Ranking competitivo
                </Label>
                <p className="text-xs text-muted-foreground">
                  Si está activo, el resultado impactará en tu posición y delta
                  del ranking global.
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

  if (currentStep === 2) {
    return (
      <section className={baseClass}>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Detalles del Partido
            </h1>
            <p className="text-sm text-muted-foreground">
              Agregá información opcional como el club y la cancha. Estos datos
              ayudan a organizar mejor el partido.
            </p>
          </div>

          <div className="space-y-4">
            <RecentClubs
              currentClub={club}
              currentCourt={courtNumber}
              onClubChange={onClubChange}
              onCourtChange={onCourtNumberChange}
            />
            <div className="space-y-2">
              <Label htmlFor="club" className="text-sm font-semibold">
                Club (opcional)
              </Label>
              <Input
                id="club"
                placeholder="Ej: Padel City, Tie Break"
                value={club}
                onChange={(event) => onClubChange(event.target.value)}
                autoSelect
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="court" className="text-sm font-semibold">
                Número de cancha (opcional)
              </Label>
              <Input
                id="court"
                placeholder="Ej: 3, Central"
                value={courtNumber}
                onChange={(event) => onCourtNumberChange(event.target.value)}
                autoSelect
              />
            </div>
          </div>
        </div>

        <MatchNavigation
          primaryButtonText={
            recordScore
              ? "Continuar"
              : isSubmitting
                ? "Creando..."
                : "Crear partido"
          }
          onPrimaryClick={recordScore ? onNextStep : onCreateMatch}
          primaryDisabled={isSubmitting}
          primaryLoading={!recordScore && isSubmitting}
          secondaryButtonText="Atrás"
          onSecondaryClick={onPreviousStep}
        />
      </section>
    );
  }

  // Final Step: Score Entry (Only if recordScore is true)
  const setsCount = parseInt(sets) || 1;
  const teamAPlayers = teamState.A.map((s) =>
    s?.kind === "user" ? s.player.displayName : s?.displayName || "Jugador A",
  ).join(" & ");
  const teamBPlayers = teamState.B.map((s) =>
    s?.kind === "user" ? s.player.displayName : s?.displayName || "Jugador B",
  ).join(" & ");

  return (
    <section className={baseClass}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Marcador Final</h1>
          <p className="text-sm text-muted-foreground">
            Completá los sets jugados para finalizar el registro del partido.
          </p>
        </div>

        <div className="space-y-6">
          {Array.from({ length: setsCount }, (_, setIndex) => (
            <div
              key={setIndex}
              className="space-y-4 rounded-xl border border-border bg-card p-4"
            >
              <h2 className="text-sm font-bold text-foreground">
                Set {setIndex + 1}
              </h2>

              <div className="grid gap-4">
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

      <MatchNavigation
        primaryButtonText={isSubmitting ? "Creando..." : "Crear y finalizar"}
        onPrimaryClick={onCreateMatch}
        primaryDisabled={isSubmitting}
        primaryLoading={isSubmitting}
        secondaryButtonText="Atrás"
        onSecondaryClick={onPreviousStep}
      />
    </section>
  );
}
