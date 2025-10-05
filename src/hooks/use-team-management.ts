"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { buildInitialState, PLACEHOLDER_SLOTS, createPlaceholderSlot, positionFromTeam } from "@/lib/match-utils";
import type { TeamState, SlotValue, PlayerOption, TeamKey } from "@/lib/match-types";

export function useTeamManagement() {
  const { data: session } = useSession();
  const [teamState, setTeamState] = useState<TeamState>(() => buildInitialState());

  const userId = session?.user?.id;
  const userDisplayName = session?.user?.displayName ?? session?.user?.name ?? "Jugador";
  const userEmail = session?.user?.email ?? "";
  const userImage = session?.user?.image ?? null;

  useEffect(() => {
    if (!userId) {
      return;
    }

    const option: PlayerOption = {
      id: userId,
      displayName: userDisplayName,
      email: userEmail,
      image: userImage,
    };

    setTeamState((previous) => {
      const next: TeamState = {
        A: [...previous.A] as [SlotValue | null, SlotValue | null],
        B: [...previous.B] as [SlotValue | null, SlotValue | null],
      };

      // Remove the user from any other slot.
      (["A", "B"] as const).forEach((team) => {
        ([0, 1] as const).forEach((index) => {
          if (team === "A" && index === 0) {
            return;
          }

          const slot = next[team][index];
          if (slot?.kind === "user" && slot.player.id === option.id) {
            const placeholderName =
              PLACEHOLDER_SLOTS.find((candidate) => candidate.team === team && candidate.index === index)?.name ??
              `Jugador ${positionFromTeam(team, index) + 1}`;
            next[team][index] = createPlaceholderSlot(placeholderName);
          }
        });
      });

      next.A[0] = { kind: "user", player: option };

      // Ensure placeholders remain for empty slots.
      PLACEHOLDER_SLOTS.forEach(({ team, index, name }) => {
        if (!next[team][index]) {
          next[team][index] = createPlaceholderSlot(name);
        }
      });

      return next;
    });
  }, [userId, userDisplayName, userEmail, userImage]);

  function updateSlot(team: TeamKey, index: 0 | 1, value: SlotValue | null) {
    setTeamState((previous) => {
      const next: TeamState = {
        A: [...previous.A] as [SlotValue | null, SlotValue | null],
        B: [...previous.B] as [SlotValue | null, SlotValue | null],
      };
      next[team][index] = value;
      return next;
    });
  }

  return {
    teamState,
    updateSlot,
  };
}
