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

/**
 * Format participant role badge text in Argentine Spanish voseo copy.
 */
export function getTurnRoleBadgeText({
  isCreator,
  isJoined,
  isSubstitute,
}: {
  isCreator?: boolean;
  isJoined?: boolean;
  isSubstitute?: boolean;
}): string | null {
  if (isCreator) return "Organizador";
  if (isSubstitute) return "Suplente";
  if (isJoined) return "Inscripto";
  return null;
}

/**
 * Calculate remaining cooldown minutes for turn network notifications (1 hour cooldown).
 * Returns 0 if no notification was sent or if the 1-hour window has elapsed.
 */
export function getCooldownRemainingMinutes(
  lastNotificationAt: Date | string | null | undefined,
  nowMs: number = Date.now()
): number {
  if (!lastNotificationAt) return 0;
  const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
  const notifiedTime = new Date(lastNotificationAt).getTime();
  const diff = nowMs - notifiedTime;
  if (diff < COOLDOWN_MS && diff >= 0) {
    return Math.ceil((COOLDOWN_MS - diff) / (60 * 1000));
  }
  return 0;
}
