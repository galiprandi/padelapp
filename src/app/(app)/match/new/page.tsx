"use client";

import { useState, Suspense } from "react";
import { ManageSlotModal } from "@/components/matches/manage-slot-modal";
import { StepContent } from "@/components/matches/step-content";
import { useTeamManagement } from "@/hooks/use-team-management";
import { useMatchForm } from "@/hooks/use-match-form";
import { positionFromTeam, createPlaceholderSlot } from "@/lib/match-utils";
import type { TeamKey, SlotValue } from "@/lib/match-types";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import appSettings from "@/config/app-settings.json";

function RegisterMatchInner() {
  const searchParams = useSearchParams();
  const turnId = searchParams.get("turnId");

  const [activeSlot, setActiveSlot] = useState<{ team: TeamKey; index: 0 | 1 }>(
    { team: "A", index: 1 },
  );
  const [manageModal, setManageModal] = useState<{
    open: boolean;
    team: TeamKey;
    index: 0 | 1;
  }>({
    open: false,
    team: "A",
    index: 1,
  });
  const [swapSource, setSwapSource] = useState<{
    team: TeamKey;
    index: 0 | 1;
  } | null>(null);

  const { teamState, updateSlot, setWholeState, userDisplayName } =
    useTeamManagement();
  const {
    currentStep,
    matchType,
    setMatchType,
    sets,
    setSets,
    setsValid,
    countsForRanking,
    setCountsForRanking,
    club,
    setClub,
    courtNumber,
    setCourtNumber,
    recordScore,
    setRecordScore,
    scores,
    setScores,
    formError,
    isSubmitting,
    goToNextStep,
    goToPreviousStep,
    handleCreateMatch,
    initializeWithTurn,
  } = useMatchForm(teamState, setWholeState);

  useEffect(() => {
    if (turnId) {
      initializeWithTurn(turnId);
    }
  }, [turnId, initializeWithTurn]);

  function handleCloseManageModal() {
    setManageModal((previous) => ({ ...previous, open: false }));
  }

  function handleSlotClick(team: TeamKey, index: 0 | 1) {
    if (swapSource) {
      if (swapSource.team === team && swapSource.index === index) {
        setSwapSource(null);
        return;
      }

      // Cannot move anyone to A0 (fixed owner)
      if (team === "A" && index === 0) {
        return;
      }

      const sourceValue = teamState[swapSource.team][swapSource.index];
      const targetValue = teamState[team][index];

      const nextState = {
        A: [...teamState.A] as [SlotValue | null, SlotValue | null],
        B: [...teamState.B] as [SlotValue | null, SlotValue | null],
      };

      nextState[swapSource.team][swapSource.index] = targetValue;
      nextState[team][index] = sourceValue;

      setWholeState(nextState);
      setSwapSource(null);
      setActiveSlot({ team, index });
      return;
    }

    setActiveSlot({ team, index });
    if (!(team === "A" && index === 0)) {
      setManageModal({ open: true, team, index });
    }
  }

  function handleStartSwap() {
    setSwapSource({ team: manageModal.team, index: manageModal.index });
    handleCloseManageModal();
  }

  function handleSaveSlot(value: SlotValue) {
    if (manageModal.team === "A" && manageModal.index === 0) {
      handleCloseManageModal();
      return;
    }

    updateSlot(manageModal.team, manageModal.index, value);
    handleCloseManageModal();
  }

  function handleReleaseSlot() {
    const placeholderName = `Jugador ${positionFromTeam(manageModal.team, manageModal.index) + 1}`;
    updateSlot(
      manageModal.team,
      manageModal.index,
      createPlaceholderSlot(placeholderName),
    );
    handleCloseManageModal();
  }

  async function handleShareIntent(nameToShare: string) {
    const trimmed = nameToShare.trim();
    if (trimmed.length === 0) {
      return;
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: appSettings.share.inviteTitle,
          text: `Sumate al partido como ${trimmed}`,
          url: appSettings.baseUrl,
        });
        return;
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("navigator.share failed", error);
        }
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(
          `${appSettings.share.inviteTitle}\nSumate al partido como ${trimmed}\n${appSettings.baseUrl}`,
        );
      } catch (error) {
        console.error("navigator.clipboard.writeText failed", error);
      }
    }
  }

  const modalSlot = manageModal.open
    ? teamState[manageModal.team][manageModal.index]
    : null;

  return (
    <>
      <StepContent
        currentStep={currentStep}
        teamState={teamState}
        activeSlot={activeSlot}
        swapSource={swapSource}
        userDisplayName={userDisplayName}
        matchType={matchType}
        sets={sets}
        setsValid={setsValid}
        countsForRanking={countsForRanking}
        club={club}
        courtNumber={courtNumber}
        recordScore={recordScore}
        scores={scores}
        isSubmitting={isSubmitting}
        onSlotClick={handleSlotClick}
        onManageClick={handleSlotClick}
        onMatchTypeChange={setMatchType}
        onSetsChange={setSets}
        onCountsForRankingChange={setCountsForRanking}
        onClubChange={setClub}
        onCourtNumberChange={setCourtNumber}
        onRecordScoreChange={setRecordScore}
        onScoresChange={setScores}
        onNextStep={goToNextStep}
        onPreviousStep={goToPreviousStep}
        onCreateMatch={handleCreateMatch}
      />

      {formError ? (
        <div className="fixed bottom-32 left-0 right-0 px-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 bg-card">
            <p className="text-sm font-bold text-destructive text-center">
              {formError}
            </p>
          </div>
        </div>
      ) : null}

      <ManageSlotModal
        open={manageModal.open}
        slot={modalSlot}
        placeholderName={`Jugador ${positionFromTeam(manageModal.team, manageModal.index) + 1}`}
        onSave={handleSaveSlot}
        onShare={handleShareIntent}
        onRelease={handleReleaseSlot}
        onSwap={handleStartSwap}
        onClose={handleCloseManageModal}
      />
    </>
  );
}

export default function RegisterMatchPage() {
  return (
    <Suspense fallback={null}>
      <RegisterMatchInner />
    </Suspense>
  );
}
