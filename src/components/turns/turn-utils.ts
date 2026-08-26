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

export interface SalvageShareMessageOptions {
  club: string;
  date: Date | string;
  openSlots: number;
}

/**
 * Format customized turn salvage share text payload for social/web sharing.
 * Follows Argentine Spanish voseo conventions without exclamation marks.
 */
export function getTurnSalvageShareMessage({
  club,
  date,
  openSlots,
}: SalvageShareMessageOptions): string {
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
    openSlots === 1 ? "Falta 1 jugador" : `Faltan ${openSlots} jugadores`;

  return `⚠️ ${slotsText} para el turno de pádel en ${club} ${dayStr} ${timeStr}. Ayudanos a completarlo o sumate acá:`;
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
 * Format turn salvage callout banner text in Argentine Spanish voseo copy without exclamation marks.
 */
export function getTurnSalvageBannerText(openSlots: number): string {
  if (openSlots <= 0) return "";
  if (openSlots === 1) {
    return "Falta 1 jugador para completar este turno. Sumate o compartilo con tu red para jugar.";
  }
  return `Faltan ${openSlots} jugadores para completar este turno. Sumate o compartilo con tu red para jugar.`;
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

/**
 * Calculate urgency badge text for an upcoming incomplete turn.
 * Returns "Urgente" if less than 1 hour away, "En Xh" if between 1 and 3 hours away,
 * or null if the turn is full, past, or more than 3 hours away.
 */
export function getTurnUrgencyBadgeText(
  date: Date | string,
  isFull: boolean,
  nowMs: number = Date.now()
): string | null {
  if (isFull) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const diffHours = (d.getTime() - nowMs) / (1000 * 60 * 60);
  if (diffHours >= 0 && diffHours < 3) {
    if (diffHours < 1) return "Urgente";
    return `En ${Math.round(diffHours)}h`;
  }
  return null;
}
