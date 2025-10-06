"use client";

import { useState } from "react";
import { ManageSlotModal } from "@/components/matches/manage-slot-modal";
import { StepContent } from "@/components/matches/step-content";
import { useTeamManagement } from "@/hooks/use-team-management";
import { useMatchForm } from "@/hooks/use-match-form";
import { positionFromTeam } from "@/lib/match-utils";
import type { TeamKey } from "@/lib/match-types";
import appSettings from "@/config/app-settings.json";

export default function RegisterMatchPage() {
  const [activeSlot, setActiveSlot] = useState<{ team: TeamKey; index: 0 | 1 }>({ team: "A", index: 1 });
  const [manageModal, setManageModal] = useState<{ open: boolean; team: TeamKey; index: 0 | 1 }>({
    open: false,
    team: "A",
    index: 1,
  });

  const { teamState } = useTeamManagement();
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
    formError,
    success,
    isSubmitting,
    goToNextStep,
    goToPreviousStep,
    handleCreateMatch,
  } = useMatchForm(teamState);

  function handleCloseManageModal() {
    setManageModal((previous) => ({ ...previous, open: false }));
  }

  function handleSaveSlotName(nameToSave: string) {
    const trimmed = nameToSave.trim();
    if (trimmed.length === 0) {
      handleCloseManageModal();
      return;
    }

    if (manageModal.team === "A" && manageModal.index === 0) {
      handleCloseManageModal();
      return;
    }

    // For now, just close the modal since slot management is handled by hooks
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
        isSubmitting={isSubmitting}
        onSlotClick={(team, index) => setActiveSlot({ team, index })}
        onManageClick={(team, index) => setManageModal({ open: true, team, index })}
        onMatchTypeChange={setMatchType}
        onSetsChange={setSets}
        onCountsForRankingChange={setCountsForRanking}
        onClubChange={setClub}
        onCourtNumberChange={setCourtNumber}
        onNextStep={goToNextStep}
        onPreviousStep={goToPreviousStep}
        onCreateMatch={handleCreateMatch}
      />

      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      <ManageSlotModal
        open={manageModal.open}
        slot={modalSlot}
        placeholderName={`Jugador ${positionFromTeam(manageModal.team, manageModal.index) + 1}`}
        onSave={handleSaveSlotName}
        onShare={handleShareIntent}
        onClose={handleCloseManageModal}
      />
    </>
  );
}
