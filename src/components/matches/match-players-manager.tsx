"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ManageSlotModal } from "@/components/matches/manage-slot-modal";
import type { SlotValue } from "@/lib/match-types";
import { PairPreview, PlayerPreviewProps } from "@/components/players/player-cards";
import { useToast } from "@/components/toast/use-toast";
import { renamePlaceholderAction, releaseMatchSlotAction, swapMatchPlayersAction } from "@/app/(app)/match/actions";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { X, ArrowUpDown } from "lucide-react";
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
  matchId: string;
  creatorId: string;
  teams: MatchTeamView[];
}

export function MatchPlayersManager({ matchId, creatorId, teams }: MatchPlayersManagerProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
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

  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);

  const isOrganizer = session?.user?.id === creatorId;

  function openManageModal(player: MatchTeamPlayer) {
    if (!isOrganizer) return;

    if (swapSourceId) {
      handleSwap(player.matchPlayerId);
      return;
    }

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

  async function handleSave(value: SlotValue) {
    if (!manageModal.playerId) {
      closeManageModal();
      return;
    }

    if (value.kind === "user") {
       showToast("Asignación de jugadores existentes no permitida en esta vista todavía.");
       closeManageModal();
       return;
    }

    startTransition(async () => {
      const response = await renamePlaceholderAction({
        playerId: manageModal.playerId!,
        displayName: value.displayName,
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

  function initiateSwap() {
    if (!manageModal.playerId) return;
    setSwapSourceId(manageModal.playerId);
    closeManageModal();
    showToast("Seleccioná el otro jugador para intercambiar");
  }

  async function handleSwap(targetId: string) {
    if (!swapSourceId || swapSourceId === targetId) {
      setSwapSourceId(null);
      return;
    }

    startTransition(async () => {
      const response = await swapMatchPlayersAction({
        matchId,
        player1Id: swapSourceId,
        player2Id: targetId,
      });

      if (response.status === "ok") {
        showToast("Posiciones intercambiadas");
        setSwapSourceId(null);
        router.refresh();
      } else {
        showToast(response.message ?? "No pudimos realizar el cambio");
        setSwapSourceId(null);
      }
    });
  }

  return (
    <>
      {swapSourceId && (
        <div className="fixed inset-x-0 top-20 z-50 flex justify-center px-5">
          <div className="flex items-center gap-3 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-sm">
            <ArrowUpDown className="h-4 w-4" />
            <span className="text-xs font-bold">Modo intercambio activo</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded-lg hover:bg-white/20 text-primary-foreground"
              aria-label="Cancelar intercambio"
              onClick={() => setSwapSourceId(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {teams.map((team) => (
          <PairPreview
            key={team.id}
            label={team.label}
            players={team.players.map<PlayerPreviewProps>((player) => ({
              id: player.matchPlayerId,
              name: player.name,
              image: player.image || undefined,
              isConfirmed: player.isConfirmed,
              onManageClick: isOrganizer ? () => openManageModal(player) : undefined,
              manageAriaLabel: isOrganizer ? "Gestionar jugador" : undefined,
            }))}
          />
        ))}
      </div>

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
        onSwap={initiateSwap}
        onClose={closeManageModal}
      />
    </>
  );
}
