"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ClubInput } from "@/components/club-input";
import { SlotDisplay } from "./slot-display";
import { MatchNavigation } from "./match-navigation";
import type { TeamState, MatchTypeValue, TeamKey } from "@/lib/match-types";
import { cn } from "@/lib/utils";
import { getNextRadioIndex } from "@/lib/match-helpers";
import {
  extractUniqueUserIds,
  canSuggestPairings,
  getStepRegionAriaLabel,
  getScoreOptionAriaLabel,
  getSuggestPairingsButtonText,
  getSuggestPairingsHelpText,
  getSwapSidesButtonAriaLabel,
  getSetOptionLabel,
  getRecentClubLabel,
  isRecentClubSelected,
  getRecentClubRadioAriaLabel,
  getNewMatchPrimaryButtonText,
  getStepHeadingTitle,
  getStepHeadingDescription,
  getPairingSuggestionTitle,
  getPairingSuggestionDescription,
  getRecordScoreNowLabel,
  getRecordScoreNowDescription,
  getRankingToggleLabel,
  getRankingToggleDescription,
  getRecentClubsHeaderLabel,
  getScoreSelectorGroupLabel,
  getScoreSelectorDisplayClasses,
  getScoreOptionButtonClasses,
  getSuggestPairingsCardClasses,
  getSuggestPairingsButtonClasses,
  getRecentClubOptionClasses,
  getMatchTypeOptionClasses,
  getSetOptionButtonClasses,
  getStepBaseContainerClasses,
  getStepContentStackClasses,
  getStepHeadingTitleClasses,
  getStepHeadingDescriptionClasses,
  getScoreSelectorContainerClasses,
  getScoreSelectorHeaderClasses,
  getScoreSelectorLabelGroupClasses,
  getScoreSelectorLabelClasses,
  getScoreSelectorRadiogroupClasses,
  getRecentClubsContainerClasses,
  getRecentClubsLabelClasses,
  getRecentClubsRadiogroupClasses,
  getSuggestPairingsTitleClasses,
  getSuggestPairingsDescriptionClasses,
  getSuggestPairingsHelpClasses,
  getTeamSectionContainerClasses,
  getTeamSectionHeaderClasses,
  getTeamSectionTitleClasses,
  getTeamSectionSwapButtonClasses,
  getTeamSectionSlotsGridClasses,
  getFormatStepCardClasses,
  getFormatStepOptionCardClasses,
  getFormatStepOptionTextClasses,
  getFormatStepOptionTitleClasses,
  getFormatStepOptionDescClasses,
  getFormatStepRadiogroupClasses,
  getSetsCountRadiogroupClasses,
  getScoreStepSelectorsGridClasses,
  getMatchDetailsFormClasses,
  getMatchDetailsInputGroupClasses,
  getMatchDetailsLabelClasses,
  getScoresStepSetsContainerClasses,
} from "@/app/(app)/match/new/new-match-utils";
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
  isSuggesting?: boolean;
  onSuggestPairings?: () => void;
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
  const options = [0, 1, 2, 3, 4, 5, 6, 7];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      const currentIndex = options.indexOf(currentValue);
      let nextIndex = currentIndex >= 0 ? currentIndex : 0;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        nextIndex = (nextIndex + 1) % options.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        nextIndex = (nextIndex - 1 + options.length) % options.length;
      }
      const nextValue = options[nextIndex];
      onValueChange(nextValue);
      const container = e.currentTarget;
      const buttons = container.querySelectorAll<HTMLButtonElement>("button[role='radio']");
      buttons[nextIndex]?.focus();
    }
  };

  return (
    <div className={getScoreSelectorContainerClasses()}>
      <div className={getScoreSelectorHeaderClasses()}>
        <div className={getScoreSelectorLabelGroupClasses()}>
          <span id={groupLabelId} className={getScoreSelectorLabelClasses()}>
            {getScoreSelectorGroupLabel(teamLabel, players)}
          </span>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg text-xl font-bold shrink-0 shadow-xs",
            getScoreSelectorDisplayClasses(currentValue)
          )}
          aria-hidden="true"
        >
          {currentValue}
        </div>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={groupLabelId}
        onKeyDown={handleKeyDown}
        className={getScoreSelectorRadiogroupClasses()}
      >
        {options.map((num) => {
          const isSelected = currentValue === num;
          return (
            <button
              key={num}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              aria-label={getScoreOptionAriaLabel(num)}
              onClick={() => onValueChange(num)}
              className={cn(
                "h-12 rounded-lg border text-lg font-bold transition-all active:scale-[0.98] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background shadow-xs",
                getScoreOptionButtonClasses(isSelected)
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

const SETS_OPTIONS = ["1", "3", "5"] as const;

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      const container = e.currentTarget;
      const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>("button[role='radio']"));
      if (buttons.length === 0) return;

      const activeElement = document.activeElement as HTMLButtonElement;
      const currentIndex = buttons.indexOf(activeElement);
      let nextIndex = currentIndex >= 0 ? currentIndex : 0;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        nextIndex = (nextIndex + 1) % buttons.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        nextIndex = (nextIndex - 1 + buttons.length) % buttons.length;
      }

      buttons[nextIndex]?.focus();
    }
  };

  return (
    <div className={getRecentClubsContainerClasses()}>
      <Label id="recent-clubs-label" className={getRecentClubsLabelClasses()}>
        <MapPin className="h-3 w-3" />
        {getRecentClubsHeaderLabel()}
      </Label>
      <div
        role="radiogroup"
        aria-labelledby="recent-clubs-label"
        onKeyDown={handleKeyDown}
        className={getRecentClubsRadiogroupClasses()}
      >
        {recentClubs.map((item) => {
          const label = getRecentClubLabel(item.club, item.courtNumber);
          const isSelected = isRecentClubSelected(
            currentClub,
            currentCourt,
            item.club,
            item.courtNumber
          );
          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={getRecentClubRadioAriaLabel(
                item.club,
                item.courtNumber,
                isSelected
              )}
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
                "shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background shadow-xs",
                getRecentClubOptionClasses(isSelected)
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
  isSuggesting = false,
  onSuggestPairings,
}: StepContentProps) {
  const baseClass = getStepBaseContainerClasses();
  const stepAriaLabel = getStepRegionAriaLabel(currentStep);

  if (currentStep === 0) {
    const uniqueUserIds = extractUniqueUserIds(teamState);
    const canSuggest = canSuggestPairings(teamState);

    return (
      <section
        role="region"
        aria-label={stepAriaLabel}
        className={baseClass}
      >
        <div className={getStepContentStackClasses()}>
          <div>
            <h1 className={getStepHeadingTitleClasses()}>{getStepHeadingTitle(0)}</h1>
            <p className={getStepHeadingDescriptionClasses()}>
              {getStepHeadingDescription(0)}
            </p>
          </div>

          <div className={getSuggestPairingsCardClasses()}>
            <div className={getFormatStepOptionTextClasses()}>
              <h3 className={getSuggestPairingsTitleClasses()}>
                <span>{getPairingSuggestionTitle()}</span>
              </h3>
              <p className={getSuggestPairingsDescriptionClasses()}>
                {getPairingSuggestionDescription()}
              </p>
            </div>
            <button
              type="button"
              disabled={!canSuggest || isSuggesting}
              aria-busy={isSuggesting}
              onClick={onSuggestPairings}
              className={getSuggestPairingsButtonClasses(canSuggest, isSuggesting)}
            >
              {getSuggestPairingsButtonText(isSuggesting)}
            </button>
            {!canSuggest && (
              <p className={getSuggestPairingsHelpClasses()}>
                {getSuggestPairingsHelpText(uniqueUserIds.length)}
              </p>
            )}
          </div>

          <div className={getStepContentStackClasses()}>
            {(["A", "B"] as const).map((team) => (
              <div key={team} className={getTeamSectionContainerClasses()}>
                <div className={getTeamSectionHeaderClasses()}>
                  <h2 className={getTeamSectionTitleClasses()}>Pareja {team}</h2>
                  <button
                    type="button"
                    onClick={() => onSwapSides(team)}
                    className={getTeamSectionSwapButtonClasses()}
                    aria-label={getSwapSidesButtonAriaLabel(team)}
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Cambiar lados
                  </button>
                </div>
                <div className={getTeamSectionSlotsGridClasses()}>
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
          primaryButtonText={getNewMatchPrimaryButtonText({ currentStep: 0 })}
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
    const handleMatchTypeKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        const currentIndex = MATCH_TYPE_OPTIONS.findIndex(
          (opt) => opt.value === matchType,
        );
        const nextIndex = getNextRadioIndex(
          currentIndex >= 0 ? currentIndex : 0,
          MATCH_TYPE_OPTIONS.length,
          e.key as "ArrowRight" | "ArrowLeft" | "ArrowDown" | "ArrowUp",
        );
        const nextOption = MATCH_TYPE_OPTIONS[nextIndex];
        if (nextOption) {
          onMatchTypeChange(nextOption.value);
          const container = e.currentTarget;
          const buttons =
            container.querySelectorAll<HTMLButtonElement>("button[role='radio']");
          buttons[nextIndex]?.focus();
        }
      }
    };

    const handleSetsKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        const currentIndex = (SETS_OPTIONS as readonly string[]).indexOf(sets);
        const nextIndex = getNextRadioIndex(
          currentIndex >= 0 ? currentIndex : 0,
          SETS_OPTIONS.length,
          e.key as "ArrowRight" | "ArrowLeft" | "ArrowDown" | "ArrowUp",
        );
        const nextOption = SETS_OPTIONS[nextIndex];
        if (nextOption) {
          onSetsChange(nextOption);
          const container = e.currentTarget;
          const buttons =
            container.querySelectorAll<HTMLButtonElement>("button[role='radio']");
          buttons[nextIndex]?.focus();
        }
      }
    };

    return (
      <section
        role="region"
        aria-label={stepAriaLabel}
        className={baseClass}
      >
        <div className={getStepContentStackClasses()}>
          <div>
            <h1 className={getStepHeadingTitleClasses()}>
              {getStepHeadingTitle(1)}
            </h1>
            <p className={getStepHeadingDescriptionClasses()}>
              {getStepHeadingDescription(1)}
            </p>
          </div>

          <div className={getStepContentStackClasses()}>
            <div className={getFormatStepCardClasses()}>
              <div className={getFormatStepOptionTextClasses()}>
                <Label htmlFor="record-score" className={getFormatStepOptionTitleClasses()}>
                  {getRecordScoreNowLabel()}
                </Label>
                <p className={getFormatStepOptionDescClasses()}>
                  {getRecordScoreNowDescription()}
                </p>
              </div>
              <Switch
                id="record-score"
                checked={recordScore}
                onCheckedChange={onRecordScoreChange}
              />
            </div>

            <div className={getFormatStepOptionCardClasses()}>
              <Label id="match-type-label" className={getFormatStepOptionTitleClasses()}>
                Tipo de formato
              </Label>
              <div
                role="radiogroup"
                aria-labelledby="match-type-label"
                onKeyDown={handleMatchTypeKeyDown}
                className={getFormatStepRadiogroupClasses()}
              >
                {MATCH_TYPE_OPTIONS.map((option) => {
                  const isSelected = matchType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => onMatchTypeChange(option.value)}
                      className={cn(
                        "flex items-center justify-between h-12 px-4 rounded-lg border text-sm font-semibold text-left transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background shadow-xs",
                        getMatchTypeOptionClasses(isSelected)
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={getFormatStepOptionCardClasses()}>
              <Label id="sets-count-label" className={getFormatStepOptionTitleClasses()}>
                Cantidad de sets
              </Label>
              <div
                role="radiogroup"
                aria-labelledby="sets-count-label"
                onKeyDown={handleSetsKeyDown}
                className={getSetsCountRadiogroupClasses()}
              >
                {SETS_OPTIONS.map((option) => {
                  const isSelected = sets === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => onSetsChange(option)}
                      className={cn(
                        "flex items-center justify-center h-12 rounded-lg border text-sm font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background shadow-xs",
                        getSetOptionButtonClasses(isSelected)
                      )}
                    >
                      {getSetOptionLabel(option)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={getFormatStepCardClasses()}>
              <div className={getFormatStepOptionTextClasses()}>
                <Label
                  htmlFor="counts-ranking"
                  className={getFormatStepOptionTitleClasses()}
                >
                  {getRankingToggleLabel()}
                </Label>
                <p className={getFormatStepOptionDescClasses()}>
                  {getRankingToggleDescription()}
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
          primaryButtonText={getNewMatchPrimaryButtonText({ currentStep: 1 })}
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
      <section
        role="region"
        aria-label={stepAriaLabel}
        className={baseClass}
      >
        <div className={getStepContentStackClasses()}>
          <div>
            <h1 className={getStepHeadingTitleClasses()}>
              {getStepHeadingTitle(2)}
            </h1>
            <p className={getStepHeadingDescriptionClasses()}>
              {getStepHeadingDescription(2)}
            </p>
          </div>

          <div className={getMatchDetailsFormClasses()}>
            <RecentClubs
              currentClub={club}
              currentCourt={courtNumber}
              onClubChange={onClubChange}
              onCourtChange={onCourtNumberChange}
            />
            <div className={getMatchDetailsInputGroupClasses()}>
              <Label htmlFor="club" className={getMatchDetailsLabelClasses()}>
                Club (opcional)
              </Label>
              <ClubInput
                id="club"
                placeholder="Ej: Padel City, Tie Break"
                value={club}
                onChange={onClubChange}
                onCourtChange={onCourtNumberChange}
              />
            </div>
            <div className={getMatchDetailsInputGroupClasses()}>
              <Label htmlFor="court" className={getMatchDetailsLabelClasses()}>
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
          primaryButtonText={getNewMatchPrimaryButtonText({
            currentStep: 2,
            recordScore,
            isSubmitting,
          })}
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
    <section
      role="region"
      aria-label={stepAriaLabel}
      className={baseClass}
    >
      <div className={getStepContentStackClasses()}>
        <div>
          <h1 className={getStepHeadingTitleClasses()}>{getStepHeadingTitle(3)}</h1>
          <p className={getStepHeadingDescriptionClasses()}>
            {getStepHeadingDescription(3)}
          </p>
        </div>

        <div className={getStepContentStackClasses()}>
          {Array.from({ length: setsCount }, (_, setIndex) => (
            <div
              key={setIndex}
              className={getScoresStepSetsContainerClasses()}
            >
              <h2 className={getTeamSectionTitleClasses()}>
                Set {setIndex + 1}
              </h2>

              <div className={getScoreStepSelectorsGridClasses()}>
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
        primaryButtonText={getNewMatchPrimaryButtonText({
          currentStep: 3,
          isSubmitting,
        })}
        onPrimaryClick={onCreateMatch}
        primaryDisabled={isSubmitting}
        primaryLoading={isSubmitting}
        secondaryButtonText="Atrás"
        onSecondaryClick={onPreviousStep}
      />
    </section>
  );
}
