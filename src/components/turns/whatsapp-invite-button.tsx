"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { isToday, isTomorrow } from "@/lib/utils";

interface WhatsAppInviteButtonProps {
  club: string;
  date: Date | string;
  contactName: string;
  openSlots: number;
  shareUrl: string;
}

export function WhatsAppInviteButton({
  club,
  date,
  contactName,
  openSlots,
  shareUrl,
}: WhatsAppInviteButtonProps) {
  const [whatsappUrl, setWhatsappUrl] = useState("");

  useEffect(() => {
    const d = new Date(date);

    // Dynamic day formatting
    let dayStr = "";
    if (isToday(d)) {
      dayStr = "hoy";
    } else if (isTomorrow(d)) {
      dayStr = "mañana";
    } else {
      const weekday = d.toLocaleDateString("es-AR", { weekday: "long" });
      const dayNumeric = d.getDate();
      const monthNumeric = d.getMonth() + 1;
      dayStr = `el ${weekday} ${dayNumeric}/${monthNumeric}`;
    }

    // Time formatting: 19hs or 19:30hs (strip :00)
    const hour = d.getHours();
    const minutes = d.getMinutes();
    const timeStr =
      minutes === 0
        ? `${hour}hs`
        : `${hour}:${minutes.toString().padStart(2, "0")}hs`;

    // Argentine Spanish copy standards
    const slotsText =
      openSlots === 1 ? "falta 1 jugador" : `faltan ${openSlots} jugadores`;
    const message = `¡Hola ${contactName}! ¿Te sumás al turno de pádel en ${club} ${dayStr} ${timeStr}? ${slotsText} para completarlo. Anotate acá: ${shareUrl}`;

    setWhatsappUrl(`https://wa.me/?text=${encodeURIComponent(message)}`);
  }, [date, contactName, club, openSlots, shareUrl]);

  return (
    <a
      href={whatsappUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white transition-all hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] gap-1.5 shrink-0"
      aria-label={`Invitar a ${contactName} por WhatsApp`}
      onClick={(e) => {
        if (!whatsappUrl) {
          e.preventDefault();
        }
      }}
    >
      <MessageSquare className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
      <span>Invitar</span>
    </a>
  );
}
