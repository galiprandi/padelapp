"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share/share-button";
import { PageHeader } from "@/components/page-header";
import { ManageSlotModal } from "@/components/matches/manage-slot-modal";
import { StepContent } from "@/components/matches/step-content";
import { useTeamManagement } from "@/hooks/use-team-management";
import { useMatchForm } from "@/hooks/use-match-form";
import { positionFromTeam } from "@/lib/match-utils";
import type { TeamKey } from "@/lib/match-types";
import { Share2 } from "lucide-react";
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
      navigator.clipboard.writeText(appSettings.share.clipboardCopy).catch(() => undefined);
    }
  }

  const modalSlot = manageModal.open ? teamState[manageModal.team][manageModal.index] : null;

  if (success?.status === "ok") {
    return (
      <div className="flex min-h-[calc(100dvh-140px)] flex-col justify-center gap-8 px-5">
        <div className="space-y-6">
          <PageHeader
            title="Partido creado"
            description="Compartí el enlace para que los demás confirmen asistencia."
            className="text-center"
          />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Link principal</p>
            <div className="rounded-lg border border-border/70 bg-background p-3">
              <p className="break-words text-sm text-foreground">{success.shareUrl}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ShareButton
                  url={success.shareUrl ?? ""}
                  size="sm"
                  variant="secondary"
                  copyMessage="Link principal copiado"
                  successMessage="Link compartido"
                >
                  <span className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    <span>Compartir</span>
                  </span>
                </ShareButton>
                <Button type="button" size="sm" variant="secondary" asChild>
                  <Link href={`https://wa.me/?text=${encodeURIComponent(success.shareUrl ?? "")}`} target="_blank">
                    Compartir por WhatsApp
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {success.slots && success.slots.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Links por cupo</p>
              <div className="space-y-2">
                {success.slots.map((slot) => (
                  <div
                    key={slot.playerId}
                    className="space-y-1 rounded-lg border border-dashed border-border/70 bg-muted/20 p-3 text-sm"
                  >
                    <p className="font-medium text-foreground">{slot.teamLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {slot.occupied
                        ? slot.displayName ?? "Ocupado"
                        : slot.displayName ?? "Pendiente de confirmar"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <ShareButton
                        url={slot.link}
                        size="sm"
                        variant="secondary"
                        copyMessage="Link copiado"
                        successMessage="Invitación compartida"
                      />
                      <Button type="button" size="sm" variant="secondary" asChild>
                        <Link
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `¡Sumate al partido desde este enlace: ${slot.link}`,
                          )}`}
                          target="_blank"
                        >
                          Enviar por WhatsApp
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <Button asChild variant="outline">
            <Link href={`/match/${success.matchId}`}>Ver partido</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-5 pb-12">
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
    </div>
  );
}
