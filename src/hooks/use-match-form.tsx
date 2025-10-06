"use client";

import { useState, useTransition } from "react";
import { redirect } from "next/navigation";
import { createMatchAction, type CreateMatchInput, type CreateMatchResponse, type SlotPayload } from "@/app/(app)/match/actions";
import type { TeamState, MatchTypeValue, StepIndex, TeamKey } from "@/lib/match-types";

const MIN_SETS = 1;
const MAX_SETS = 5;

export function useMatchForm(teamState: TeamState) {
  const [currentStep, setCurrentStep] = useState<StepIndex>(0);
  const [matchType, setMatchType] = useState<MatchTypeValue>("FRIENDLY");
  const [sets, setSets] = useState<string>("3");
  const [countsForRanking, setCountsForRanking] = useState<boolean>(true);
  const [club, setClub] = useState("");
  const [courtNumber, setCourtNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CreateMatchResponse | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

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

    setCurrentStep((prev) => (prev + 1 > 2 ? prev : ((prev + 1) as StepIndex)));
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
        score: null,
        notes: null,
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
    formError,
    success,
    isSubmitting,
    goToNextStep,
    goToPreviousStep,
    handleCreateMatch,
  };
}
