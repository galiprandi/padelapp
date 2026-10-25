"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClubInput } from "@/components/club-input";
import { createTurnAction } from "../actions";
import { useToast } from "@/components/toast/use-toast";
import { Loader2, Check, ChevronLeft, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getNextRadioValue,
  validateTurnFormData,
  getNewTurnWhatsAppShareUrl,
  getCreateTurnSuccessToast,
  getTurnFormRegionAriaLabel,
  getTurnFormSubmitButtonAriaLabel,
  getNewTurnHeadingTitle,
  getNewTurnHeadingDescription,
  getTurnFormDetailsHeaderTitle,
  getTurnFormClubLabel,
  getTurnFormClubPlaceholder,
  getTurnFormDateLabel,
  getTurnFormTimeLabel,
  getTurnFormDurationLabel,
  getTurnFormPlayersLabel,
  getTurnFormNotesLabel,
  getTurnFormNotesPlaceholder,
  getTurnFormSubmitButtonText,
  getTurnBackButtonAriaLabel,
  formatDurationOptionLabel,
  formatPlayerOptionLabel,
  getTurnFormContainerClasses,
  getTurnFormHeaderBackLinkClasses,
  getTurnFormHeaderTitleClasses,
  getTurnFormHeaderDescriptionClasses,
  getTurnFormCardClasses,
  getTurnFormCardHeaderClasses,
  getTurnFormCardHeaderTitleClasses,
  getTurnFormCardContentClasses,
  getTurnFormGroupClasses,
  getTurnFormLabelClasses,
  getTurnFormDurationRadioClasses,
  getTurnFormPlayerRadioClasses,
  getTurnFormTextareaClasses,
  getTurnFormSubmitButtonClasses,
} from "@/components/turns/turn-utils";
import Link from "next/link";

const DURATION_OPTIONS = [
  { value: "60", label: formatDurationOptionLabel(60) },
  { value: "90", label: formatDurationOptionLabel(90) },
  { value: "120", label: formatDurationOptionLabel(120) },
] as const;

const PLAYER_OPTIONS = [
  { value: "4", label: formatPlayerOptionLabel(4) },
  { value: "6", label: formatPlayerOptionLabel(6) },
  { value: "8", label: formatPlayerOptionLabel(8) },
  { value: "10", label: formatPlayerOptionLabel(10) },
] as const;

export default function NewTurnPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    club: "",
    date: "",
    time: "",
    duration: "90",
    maxPlayers: "4",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateTurnFormData(formData);
    if (!validation.valid || !validation.combinedDate) {
      showToast(validation.error ?? "Completá club, fecha y hora", {
        type: validation.error?.includes("pasado") ? "error" : undefined,
      });
      return;
    }

    const combinedDate = validation.combinedDate;

    startTransition(async () => {
      const response = await createTurnAction({
        club: formData.club,
        date: combinedDate.toISOString(),
        duration: parseInt(formData.duration),
        maxPlayers: parseInt(formData.maxPlayers),
        notes: formData.notes,
      });

      if (response.status === "ok" && response.turnId) {
        const whatsappUrl = getNewTurnWhatsAppShareUrl({
          club: formData.club,
          date: combinedDate,
          turnId: response.turnId,
          origin: window.location.origin,
        });
        showToast(getCreateTurnSuccessToast(), {
          action: {
            label: "WhatsApp",
            onClick: () => window.open(whatsappUrl, "_blank"),
          },
        });
        router.push(`/t/${response.turnId}`);
      } else {
        showToast(response.message || "No se pudo crear el turno.");
      }
    });
  };

  return (
    <div className={getTurnFormContainerClasses()}>
      <div className="flex items-center gap-4">
        <Link
          href="/turnos"
          prefetch={true}
          className={getTurnFormHeaderBackLinkClasses()}
          aria-label={getTurnBackButtonAriaLabel()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className={getTurnFormHeaderTitleClasses()}>
            {getNewTurnHeadingTitle()}
          </h1>
          <p className={getTurnFormHeaderDescriptionClasses()}>
            {getNewTurnHeadingDescription()}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={getTurnFormContainerClasses()}>
        <div
          role="region"
          aria-label={getTurnFormRegionAriaLabel("create")}
          className={getTurnFormCardClasses()}
        >
          <div className={getTurnFormCardHeaderClasses()}>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h2 className={getTurnFormCardHeaderTitleClasses()}>
                {getTurnFormDetailsHeaderTitle()}
              </h2>
            </div>
          </div>
          <div className={getTurnFormCardContentClasses()}>
            <div className={getTurnFormGroupClasses()}>
              <Label
                htmlFor="club"
                requiredIndicator="*"
                className={getTurnFormLabelClasses()}
              >
                {getTurnFormClubLabel()}
              </Label>
              <ClubInput
                id="club"
                placeholder={getTurnFormClubPlaceholder()}
                value={formData.club}
                onChange={(value) => setFormData({ ...formData, club: value })}
                required
                aria-required="true"
                className="h-12 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={getTurnFormGroupClasses()}>
                <Label
                  htmlFor="date"
                  requiredIndicator="*"
                  className={getTurnFormLabelClasses()}
                >
                  {getTurnFormDateLabel()}
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  aria-required="true"
                  className="h-12 rounded-lg"
                />
              </div>
              <div className={getTurnFormGroupClasses()}>
                <Label
                  htmlFor="time"
                  requiredIndicator="*"
                  className={getTurnFormLabelClasses()}
                >
                  {getTurnFormTimeLabel()}
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                  aria-required="true"
                  className="h-12 rounded-lg"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label id="duration-label" className={getTurnFormLabelClasses()}>
                {getTurnFormDurationLabel()}
              </Label>
              <div
                role="radiogroup"
                aria-labelledby="duration-label"
                className="grid grid-cols-3 gap-2"
                onKeyDown={(e) => {
                  const durationValues = DURATION_OPTIONS.map((o) => o.value);
                  const nextVal = getNextRadioValue(durationValues, formData.duration, e.key);
                  if (nextVal) {
                    e.preventDefault();
                    setFormData((prev) => ({ ...prev, duration: nextVal }));
                    const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
                    const targetIdx = durationValues.indexOf(nextVal);
                    buttons[targetIdx]?.focus();
                  }
                }}
              >
                {DURATION_OPTIONS.map((option) => {
                  const isSelected = formData.duration === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() =>
                        setFormData({ ...formData, duration: option.value })
                      }
                      className={getTurnFormDurationRadioClasses(isSelected)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label id="players-label" className={getTurnFormLabelClasses()}>
                {getTurnFormPlayersLabel()}
              </Label>
              <div
                role="radiogroup"
                aria-labelledby="players-label"
                className="grid grid-cols-2 gap-2"
                onKeyDown={(e) => {
                  const playerValues = PLAYER_OPTIONS.map((o) => o.value);
                  const nextVal = getNextRadioValue(playerValues, formData.maxPlayers, e.key);
                  if (nextVal) {
                    e.preventDefault();
                    setFormData((prev) => ({ ...prev, maxPlayers: nextVal }));
                    const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
                    const targetIdx = playerValues.indexOf(nextVal);
                    buttons[targetIdx]?.focus();
                  }
                }}
              >
                {PLAYER_OPTIONS.map((option) => {
                  const isSelected = formData.maxPlayers === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() =>
                        setFormData({ ...formData, maxPlayers: option.value })
                      }
                      className={getTurnFormPlayerRadioClasses(isSelected)}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={getTurnFormGroupClasses()}>
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="notes"
                  className={getTurnFormLabelClasses()}
                >
                  {getTurnFormNotesLabel()}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {(formData.notes ?? "").length}/200
                </span>
              </div>
              <Textarea
                id="notes"
                maxLength={200}
                placeholder={getTurnFormNotesPlaceholder("create")}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className={getTurnFormTextareaClasses()}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className={getTurnFormSubmitButtonClasses()}
          disabled={isPending}
          aria-busy={isPending}
          aria-label={getTurnFormSubmitButtonAriaLabel({ mode: "create", isPending })}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getTurnFormSubmitButtonText("create", isPending)}
        </Button>
      </form>
    </div>
  );
}