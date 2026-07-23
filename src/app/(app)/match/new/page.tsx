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

  const { teamState, updateSlot, setWholeState, currentUser, userDisplayName } =
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

  function handleSaveSlot(value: SlotValue) {
    updateSlot(manageModal.team, manageModal.index, value);
    handleCloseManageModal();
  }

  function handleReleaseSlot() {
    // The first slot of Team A defaults to the organizer. Releasing it
    // restores the organizer rather than leaving an anonymous placeholder,
    // so they can undo replacing themselves.
    if (manageModal.team === "A" && manageModal.index === 0 && currentUser) {
      updateSlot("A", 0, { kind: "user", player: currentUser });
      handleCloseManageModal();
      return;
    }

    const placeholderName = `Jugador ${positionFromTeam(manageModal.team, manageModal.index) + 1}`;
    updateSlot(
      manageModal.team,
      manageModal.index,
      createPlaceholderSlot(placeholderName),
    );
    handleCloseManageModal();
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
        userDisplayName={userDisplayName}
        currentUserId={currentUser?.id}
        matchType={matchType}
        sets={sets}
        setsValid={setsValid}
        countsForRanking={countsForRanking}
        club={club}
        courtNumber={courtNumber}
        recordScore={recordScore}
        scores={scores}
        isSubmitting={isSubmitting}
        onSlotClick={(team, index) => setActiveSlot({ team, index })}
        onManageClick={(team, index) =>
          setManageModal({ open: true, team, index })
        }
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
        allowReplaceUser
        onSave={handleSaveSlot}
        onRelease={handleReleaseSlot}
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
