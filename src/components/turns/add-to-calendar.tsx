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

    showToast("Abriendo Google Calendar...");
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
    link.setAttribute("download", `partido-padel-${turnId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Archivo de calendario descargado.");
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
        className={cn(
          "w-full h-10 font-bold active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
          open && "border-primary text-primary bg-muted",
        )}
        aria-label="Agregar el partido a mi calendario"
        aria-expanded={open}
        aria-controls={`calendar-options-${turnId}`}
      >
        <CalendarPlus className="mr-2 h-4 w-4" aria-hidden="true" />
        Agregar al calendario
      </Button>

      {open && (
        <div
          id={`calendar-options-${turnId}`}
          role="region"
          aria-label={getCalendarOptionsAriaLabel(club)}
          className="mt-2 p-3 bg-muted border border-border rounded-lg flex flex-col gap-2 transition-all duration-150 shadow-xs"
        >
          <p className="text-xs font-semibold text-muted-foreground text-center">
            Elegí tu calendario:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleGoogleCalendar}
              variant="secondary"
              size="sm"
              className="h-9 font-bold bg-card border border-border hover:bg-muted active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              aria-label="Agregar a Google Calendar"
            >
              <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>Google</span>
            </Button>
            <Button
              onClick={handleIcsDownload}
              variant="secondary"
              size="sm"
              className="h-9 font-bold bg-card border border-border hover:bg-muted active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              aria-label="Descargar archivo iCal"
            >
              <Download className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>Apple / Outlook</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
