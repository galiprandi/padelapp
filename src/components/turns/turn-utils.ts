import { isToday, isTomorrow } from "@/lib/utils";

export interface WhatsAppInviteMessageOptions {
  club: string;
  date: Date | string;
  contactName: string;
  openSlots: number;
  shareUrl: string;
  baseDate?: Date;
}

/**
 * Format WhatsApp invite copy following Argentine Spanish voseo conventions without exclamation marks.
 * Supports passing an optional baseDate for deterministic testing.
 */
export function formatWhatsAppInviteMessage({
  club,
  date,
  contactName,
  openSlots,
  shareUrl,
}: WhatsAppInviteMessageOptions): string {
  const d = new Date(date);

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

  const hour = d.getHours();
  const minutes = d.getMinutes();
  const timeStr =
    minutes === 0
      ? `${hour}hs`
      : `${hour}:${minutes.toString().padStart(2, "0")}hs`;

  const slotsText =
    openSlots === 1 ? "falta 1 jugador" : `faltan ${openSlots} jugadores`;

  return `Hola ${contactName}, ¿te sumás al turno de pádel en ${club} ${dayStr} ${timeStr}? ${slotsText} para completarlo. Sumate acá: ${shareUrl}`;
}

/**
 * Format missing slots badge text in Argentine Spanish voseo copy.
 */
export function getOpenSlotsBadgeText(openSlots: number): string {
  if (openSlots <= 0) return "";
  if (openSlots === 1) return "Falta 1";
  return `Faltan ${openSlots}`;
}
