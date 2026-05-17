"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ManageSlotModal } from "@/components/matches/manage-slot-modal";
import { PairPreview, PlayerPreviewProps } from "@/components/players/player-cards";
import { useToast } from "@/components/toast/use-toast";
import { renamePlaceholderAction, releaseMatchSlotAction } from "@/app/(app)/match/actions";
import appSettings from "@/config/app-settings.json";

export interface MatchTeamPlayer {
  matchPlayerId: string;
  userId?: string | null;
  name: string;
  image?: string | null;
  isConfirmed?: boolean;
  placeholderName: string;
}

export interface MatchTeamView {
  id: string;
  label: string;
  players: MatchTeamPlayer[];
}

interface MatchPlayersManagerProps {
  teams: MatchTeamView[];
}

export function MatchPlayersManager({ teams }: MatchPlayersManagerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startTransition] = useTransition();
  const [manageModal, setManageModal] = useState<{
    open: boolean;
    playerId: string | null;
    userId: string | null;
    name: string;
  }>({
    open: false,
    playerId: null,
    userId: null,
    name: "",
  });

  function openManageModal(player: MatchTeamPlayer) {
    setManageModal({
      open: true,
      playerId: player.matchPlayerId,
      userId: player.userId || null,
      name: player.placeholderName || player.name,
    });
  }

  function closeManageModal() {
    setManageModal((prev) => ({ ...prev, open: false }));
  }

  async function handleSave(nameToSave: string) {
    if (!manageModal.playerId) {
      closeManageModal();
      return;
    }

    startTransition(async () => {
      const response = await renamePlaceholderAction({
        playerId: manageModal.playerId!,
        displayName: nameToSave,
      });

      if (response.status === "ok") {
        showToast("Jugador actualizado");
        closeManageModal();
        router.refresh();
      } else {
        showToast(response.message ?? "No pudimos actualizar el jugador");
      }
    });
  }

  async function handleShareIntent(nameToShare: string) {
    if (!manageModal.playerId) return;

    const shareUrl = `${window.location.origin}/j/${manageModal.playerId}`;
    const shareText = `Sumate al partido como ${nameToShare}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: appSettings.share.inviteTitle,
          text: shareText,
          url: shareUrl,
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
        await navigator.clipboard.writeText(`${appSettings.share.inviteTitle}\n${shareText}\n${shareUrl}`);
        showToast("¡Enlace copiado!");
      } catch (error) {
        console.error("navigator.clipboard.writeText failed", error);
        showToast("No se pudo copiar el enlace");
      }
    }
  }

  async function handleRelease() {
    if (!manageModal.playerId) return;

    startTransition(async () => {
      const response = await releaseMatchSlotAction({ playerId: manageModal.playerId! });

      if (response.status === "ok") {
        showToast("Cupo liberado");
        closeManageModal();
        router.refresh();
      } else {
        showToast(response.message ?? "No pudimos liberar el cupo");
      }
    });
  }

  return (
    <>
      {teams.map((team) => (
        <PairPreview
          key={team.id}
          label={team.label}
          players={team.players.map<PlayerPreviewProps>((player) => ({
            id: player.matchPlayerId,
            name: player.name,
            image: player.image || undefined,
            isConfirmed: player.isConfirmed,
            onManageClick: () => openManageModal(player),
            manageAriaLabel: "Gestionar jugador",
          }))}
        />
      ))}

      <ManageSlotModal
        open={manageModal.open}
        slot={
          manageModal.userId
            ? { kind: "user", player: { id: manageModal.userId, displayName: manageModal.name, email: "", image: null } }
            : { kind: "placeholder", displayName: manageModal.name }
        }
        placeholderName={manageModal.name || "Jugador"}
        onSave={handleSave}
        onShare={handleShareIntent}
        onRelease={manageModal.userId ? handleRelease : undefined}
        onClose={closeManageModal}
      />
    </>
  );
}
