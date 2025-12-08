"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ManageSlotModal } from "@/components/matches/manage-slot-modal";
import { PairPreview, PlayerPreviewProps } from "@/components/players/player-cards";
import { useToast } from "@/components/toast/use-toast";
import { renamePlaceholderAction } from "@/app/(app)/match/actions";

export interface MatchTeamPlayer {
  matchPlayerId: string;
  name: string;
  image?: string;
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
    name: string;
  }>({
    open: false,
    playerId: null,
    name: "",
  });

  function openManageModal(player: MatchTeamPlayer) {
    setManageModal({
      open: true,
      playerId: player.matchPlayerId,
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

  function handleShareIntent(nameToShare: string) {
    // Placeholder: implement invite/share per specs (/j/:playerId)
    showToast(`Link de invitación para "${nameToShare}" estará disponible pronto.`);
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
            image: player.image,
            isConfirmed: player.isConfirmed,
            onManageClick: () => openManageModal(player),
            manageAriaLabel: "Gestionar jugador",
          }))}
        />
      ))}

      <ManageSlotModal
        open={manageModal.open}
        slot={null}
        placeholderName={manageModal.name || "Jugador"}
        onSave={handleSave}
        onShare={handleShareIntent}
        onClose={closeManageModal}
      />
    </>
  );
}
