"use client";

import { useEffect, useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ClubSuggestion {
  club: string;
  courtNumber: string | null;
}

interface ClubInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  /** Optional: callback fired when a suggestion with a court is picked. */
  onCourtChange?: (court: string) => void;
}

/**
 * Text input for the `club` field with native `<datalist>` autocomplete.
 *
 * Suggestions are sourced from `/api/recent`, which returns clubs ordered
 * by proximity: own recent → network contacts → global fallback. This
 * reduces name variation ("Padel City" vs "padel city" vs "Padel City ·
 * Cancha 3") by encouraging users to pick an existing spelling.
 *
 * Uses native `<datalist>` for accessibility and zero dependencies.
 * The user can still type freely — suggestions are non-blocking.
 */
export function ClubInput({
  value,
  onChange,
  onCourtChange,
  id,
  className,
  ...rest
}: ClubInputProps) {
  const [suggestions, setSuggestions] = useState<ClubSuggestion[]>([]);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-list`;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/recent")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.recentClubs) return;
        setSuggestions(data.recentClubs as ClubSuggestion[]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.value;
    onChange(picked);
    // If the picked value matches a suggestion with a court, propagate it.
    const match = suggestions.find(
      (s) => s.club === picked && s.courtNumber,
    );
    if (match && onCourtChange) {
      onCourtChange(match.courtNumber as string);
    }
  };

  return (
    <>
      <Input
        id={inputId}
        list={listId}
        value={value}
        onChange={handleSelect}
        className={cn(className)}
        autoComplete="off"
        {...rest}
      />
      <datalist id={listId}>
        {suggestions.map((s) => {
          const label = s.courtNumber
            ? `${s.club} · ${s.courtNumber}`
            : s.club;
          return <option key={label} value={s.club} label={label} />;
        })}
      </datalist>
    </>
  );
}
