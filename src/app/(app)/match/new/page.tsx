"use client";

import { useState } from "react";
import { ManageSlotModal } from "@/components/matches/manage-slot-modal";
import { StepContent } from "@/components/matches/step-content";
import { useTeamManagement } from "@/hooks/use-team-management";
import { useMatchForm } from "@/hooks/use-match-form";
import { positionFromTeam, createPlaceholderSlot } from "@/lib/match-utils";
import type { TeamKey, SlotValue } from "@/lib/match-types";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import appSettings from "@/config/app-settings.json";

export default function RegisterMatchPage() {
  const searchParams = useSearchParams();
  const turnId = searchParams.get("turnId");

  const [activeSlot, setActiveSlot] = useState<{ team: TeamKey; index: 0 | 1 }>({ team: "A", index: 1 });
  const [manageModal, setManageModal] = useState<{ open: boolean; team: TeamKey; index: 0 | 1 }>({
    open: false,
    team: "A",
    index: 1,
  });

  const { teamState, updateSlot, setWholeState } = useTeamManagement();
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
    if (manageModal.team === "A" && manageModal.index === 0) {
      handleCloseManageModal();
      return;
    }

    updateSlot(manageModal.team, manageModal.index, value);
    handleCloseManageModal();
  }

  function handleReleaseSlot() {
     const placeholderName = `Jugador ${positionFromTeam(manageModal.team, manageModal.index) + 1}`;
     updateSlot(manageModal.team, manageModal.index, createPlaceholderSlot(placeholderName));
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
        await navigator.clipboard.writeText(`${appSettings.share.inviteTitle}\nSumate al partido como ${trimmed}\n${appSettings.baseUrl}`);
      } catch (error) {
        console.error("navigator.clipboard.writeText failed", error);
      }
    }
  }

  const modalSlot = manageModal.open ? teamState[manageModal.team][manageModal.index] : null;

  return (
    <>
      <StepContent
        currentStep={currentStep}
        teamState={teamState}
        activeSlot={activeSlot}
        userDisplayName="Usuario" // This should come from session
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
        onManageClick={(team, index) => setManageModal({ open: true, team, index })}
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
        <div className="fixed bottom-32 left-0 right-0 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 backdrop-blur-md">
            <p className="text-sm font-black text-destructive text-center uppercase tracking-widest">{formError}</p>
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
        onClose={handleCloseManageModal}
      />
    </>
  );
}
