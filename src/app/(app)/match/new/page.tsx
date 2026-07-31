"use client";

import { useState, Suspense, useTransition } from "react";
import { ManageSlotModal } from "@/components/matches/manage-slot-modal";
import { StepContent } from "@/components/matches/step-content";
import { useTeamManagement } from "@/hooks/use-team-management";
import { useMatchForm } from "@/hooks/use-match-form";
import { positionFromTeam, createPlaceholderSlot } from "@/lib/match-utils";
import type { TeamKey, SlotValue, PlayerOption } from "@/lib/match-types";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { suggestMatchPartnersAction } from "@/app/(app)/match/actions";

function RegisterMatchInner() {
  const searchParams = useSearchParams();
  const turnId = searchParams.get("turnId");

  const [activeSlot] = useState<{ team: TeamKey; index: 0 | 1 }>(
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

  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSuggestPairings = async () => {
    const currentUserIds: string[] = [];
    const userOptionsMap = new Map<string, PlayerOption>();

    (["A", "B"] as const).forEach((team) => {
      teamState[team].forEach((slot) => {
        if (slot?.kind === "user") {
          currentUserIds.push(slot.player.id);
          userOptionsMap.set(slot.player.id, slot.player);
        }
      });
    });

    if (currentUserIds.length !== 4) return;

    setIsSuggesting(true);
    try {
      const res = await suggestMatchPartnersAction({ userIds: currentUserIds });
      if (res.status === "ok" && res.suggestedPairings) {
        const { teamA, teamB } = res.suggestedPairings;
        const slotA0 = userOptionsMap.get(teamA.derecha);
        const slotA1 = userOptionsMap.get(teamA.reves);
        const slotB0 = userOptionsMap.get(teamB.derecha);
        const slotB1 = userOptionsMap.get(teamB.reves);

        if (slotA0 && slotA1 && slotB0 && slotB1) {
          setWholeState({
            A: [
              { kind: "user", player: slotA0 },
              { kind: "user", player: slotA1 },
            ],
            B: [
              { kind: "user", player: slotB0 },
              { kind: "user", player: slotB1 },
            ],
          });
        }
      }
    } catch (err) {
      console.error("Failed to suggest pairings:", err);
    } finally {
      setIsSuggesting(false);
    }
  };
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

  function handleSwapSides(team: TeamKey) {
    const a = teamState[team][0];
    const b = teamState[team][1];
    updateSlot(team, 0, b);
    updateSlot(team, 1, a);
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
        isSuggesting={isSuggesting}
        onSuggestPairings={handleSuggestPairings}
        onSlotClick={(team, index) =>
          setManageModal({ open: true, team, index })
        }
        onManageClick={(team, index) =>
          setManageModal({ open: true, team, index })
        }
        onSwapSides={handleSwapSides}
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
