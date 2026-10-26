"use client";

import { useState } from "react";
import { CalendarPlus, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import { cn } from "@/lib/utils";
import {
  getGoogleCalendarUrl,
  getIcsCalendarContent,
  getCalendarOptionsAriaLabel,
  getGoogleCalendarToast,
  getIcsCalendarToast,
  getCalendarButtonText,
  getCalendarButtonAriaLabel,
  getCalendarHeaderPromptText,
  getGoogleButtonText,
  getGoogleButtonAriaLabel,
  getIcsButtonText,
  getIcsButtonAriaLabel,
  getIcsDownloadFilename,
  getCalendarTriggerButtonClasses,
  getCalendarOptionsContainerClasses,
  getCalendarOptionButtonClasses,
} from "./turn-utils";

interface AddToCalendarButtonProps {
  turnId: string;
  club: string;
  date: Date | string;
  duration: number; // in minutes
  notes?: string | null;
}

export function AddToCalendarButton({
  turnId,
  club,
  date,
  duration,
  notes,
}: AddToCalendarButtonProps) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);

  const handleGoogleCalendar = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const googleUrl = getGoogleCalendarUrl({
      turnId,
      club,
      date,
      duration,
      notes,
      origin,
    });

    if (!googleUrl) return;

    showToast(getGoogleCalendarToast());
    window.open(googleUrl, "_blank");
  };

  const handleIcsDownload = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const icsContent = getIcsCalendarContent({
      turnId,
      club,
      date,
      duration,
      origin,
    });

    if (!icsContent) return;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", getIcsDownloadFilename(turnId));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(getIcsCalendarToast());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col w-full" onKeyDown={handleKeyDown}>
      <Button
        onClick={() => setOpen(!open)}
        variant="outline"
        size="sm"
        className={getCalendarTriggerButtonClasses(open)}
        aria-label={getCalendarButtonAriaLabel()}
        aria-expanded={open}
        aria-controls={`calendar-options-${turnId}`}
      >
        <CalendarPlus className="mr-2 h-4 w-4" aria-hidden="true" />
        {getCalendarButtonText()}
      </Button>

      {open && (
        <div
          id={`calendar-options-${turnId}`}
          role="region"
          aria-label={getCalendarOptionsAriaLabel(club)}
          className={getCalendarOptionsContainerClasses()}
        >
          <p className="text-xs font-semibold text-muted-foreground text-center">
            {getCalendarHeaderPromptText()}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleGoogleCalendar}
              variant="secondary"
              size="sm"
              className={getCalendarOptionButtonClasses()}
              aria-label={getGoogleButtonAriaLabel()}
            >
              <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{getGoogleButtonText()}</span>
            </Button>
            <Button
              onClick={handleIcsDownload}
              variant="secondary"
              size="sm"
              className={getCalendarOptionButtonClasses()}
              aria-label={getIcsButtonAriaLabel()}
            >
              <Download className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{getIcsButtonText()}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
