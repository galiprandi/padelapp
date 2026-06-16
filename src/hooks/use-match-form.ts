"use client";

import { useState, useTransition, useCallback } from "react";
import { redirect } from "next/navigation";
import { createMatchAction, type CreateMatchInput, type SlotPayload } from "@/app/(app)/match/actions";
import { getTurnByIdAction } from "@/app/(app)/turnos/actions";
import type { TeamState, MatchTypeValue, StepIndex, SlotValue } from "@/lib/match-types";

const MIN_SETS = 1;
const MAX_SETS = 5;

export function useMatchForm(teamState: TeamState, onTeamStateChange?: (state: TeamState) => void) {
  const [currentStep, setCurrentStep] = useState<StepIndex>(0);
  const [matchType, setMatchType] = useState<MatchTypeValue>("FRIENDLY");
  const [sets, setSets] = useState<string>("3");
  const [countsForRanking, setCountsForRanking] = useState<boolean>(true);
  const [club, setClub] = useState("");
  const [courtNumber, setCourtNumber] = useState("");
  const [recordScore, setRecordScore] = useState<boolean>(false);
  const [scores, setScores] = useState<number[][]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();
  const [prefilledTurnId, setPrefilledTurnId] = useState<string | null>(null);

  const initializeWithTurn = useCallback(async (turnId: string) => {
    const response = await getTurnByIdAction(turnId);
    if (response.status === "ok" && response.turn) {
      const turn = response.turn;
      setClub(turn.club);
      setPrefilledTurnId(turnId);

      if (onTeamStateChange) {
        const newState: TeamState = {
          A: [null, null],
          B: [null, null],
        };

        turn.players.slice(0, 4).forEach((p, index) => {
          const team: "A" | "B" = index < 2 ? "A" : "B";
          const teamIndex: 0 | 1 = (index % 2) as 0 | 1;

          newState[team][teamIndex] = {
            kind: "user",
            player: {
              id: p.userId,
              displayName: p.user.alias ?? p.user.displayName,
              email: "", // Not available in public action
              image: p.user.image,
            }
          };
        });

        onTeamStateChange(newState);
      }
    }
  }, [onTeamStateChange]);

  const setsValue = Number.parseInt(sets, 10);
  const setsValid = !Number.isNaN(setsValue) && setsValue >= MIN_SETS && setsValue <= MAX_SETS;

  function goToNextStep() {
    setFormError(null);

    if (currentStep === 0) {
      const allFilled = (["A", "B"] as const).every((team) =>
        ([0, 1] as const).every((index) => Boolean(teamState[team][index])),
      );
      if (!allFilled) {
        setFormError("Completá los cuatro jugadores antes de continuar.");
        return;
      }
    }

    if (currentStep === 1 && !setsValid) {
      setFormError(`Ingresá una cantidad de sets entre ${MIN_SETS} y ${MAX_SETS}.`);
      return;
    }

    const nextLimit = recordScore ? 3 : 2;
    setCurrentStep((prev) => (prev + 1 > nextLimit ? prev : ((prev + 1) as StepIndex)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToPreviousStep() {
    setFormError(null);
    setCurrentStep((prev) => (prev - 1 < 0 ? prev : ((prev - 1) as StepIndex)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCreateMatch() {
    if (!setsValid) {
      setFormError(`Ingresá una cantidad de sets entre ${MIN_SETS} y ${MAX_SETS}.`);
      setCurrentStep(1);
      return;
    }

    const slotsPayload: SlotPayload[] = [];

    (["A", "B"] as const).forEach((team) => {
      ([0, 1] as const).forEach((index) => {
        const slot = teamState[team][index];
        if (!slot) {
          return;
        }

        const position = team === "A" ? index : index + 2;
        if (slot.kind === "user") {
          slotsPayload.push({ kind: "user", position, team, userId: slot.player.id });
        } else {
          slotsPayload.push({
            kind: "placeholder",
            position,
            team,
            displayName: slot.displayName,
          });
        }
      });
    });

    setFormError(null);

    let scoreStr: string | null = null;
    if (recordScore) {
      scoreStr = scores
        .slice(0, setsValue)
        .map(set => {
          const s = set || [0, 0];
          return `${s[0]}-${s[1]}`;
        })
        .join(', ');
    }

    startSubmit(async () => {
      const payload: CreateMatchInput = {
        sets: setsValue,
        matchType,
        countsForRanking,
        format: "DOUBLES",
        teamLabels: {
          A: "Pareja A",
          B: "Pareja B",
        },
        club: club.trim().length > 0 ? club.trim() : null,
        courtNumber: courtNumber.trim().length > 0 ? courtNumber.trim() : null,
        score: scoreStr,
        notes: null,
        turnId: prefilledTurnId,
        slots: slotsPayload,
      };

      const response = await createMatchAction(payload);

      if (response.status === "ok") {
        redirect(`/match/${response.matchId}`);
      } else {
        setFormError(response.message ?? "No pudimos crear el partido.");
      }
    });
  }

  return {
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
  };
}
