import { isToday, isTomorrow, getNaturalShareText, getCalendarTitle } from "@/lib/utils";

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

export interface WhatsAppGroupInviteMessageOptions {
  club: string;
  date: Date | string;
  openSlots: number;
  shareUrl: string;
}

/**
 * Format WhatsApp group salvage invite copy following Argentine Spanish voseo conventions without exclamation marks.
 */
export function formatWhatsAppGroupInviteMessage({
  club,
  date,
  openSlots,
  shareUrl,
}: WhatsAppGroupInviteMessageOptions): string {
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

  return `⚠️ ${slotsText} para el turno de pádel en ${club} ${dayStr} ${timeStr}. ¿Quién se suma? Entren acá para anotarse: ${shareUrl}`;
}

/**
 * Generates full WhatsApp wa.me URL with encoded message payload for individual contact invites.
 */
export function getWhatsAppInviteUrl(options: WhatsAppInviteMessageOptions): string {
  const message = formatWhatsAppInviteMessage(options);
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Generates full WhatsApp wa.me URL with encoded message payload for group salvage invites.
 */
export function getWhatsAppGroupInviteUrl(options: WhatsAppGroupInviteMessageOptions): string {
  const message = formatWhatsAppGroupInviteMessage(options);
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
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

/**
 * Calculates the next selected value for a radiogroup when navigating using keyboard arrow keys.
 * Supports ArrowRight/ArrowDown (next) and ArrowLeft/ArrowUp (previous) with wrap-around.
 */
export function getNextRadioValue<T extends string>(
  options: readonly T[],
  currentValue: string,
  key: string
): T | null {
  if (options.length === 0) return null;
  const currentIndex = (options as readonly string[]).indexOf(currentValue);
  if (currentIndex === -1) return options[0] ?? null;

  if (key === "ArrowRight" || key === "ArrowDown") {
    const nextIndex = (currentIndex + 1) % options.length;
    return options[nextIndex] ?? null;
  }

  if (key === "ArrowLeft" || key === "ArrowUp") {
    const prevIndex = (currentIndex - 1 + options.length) % options.length;
    return options[prevIndex] ?? null;
  }

  return null;
}

export interface TurnFilterableItem {
  creatorId?: string | null;
  players: Array<{ userId?: string }>;
  substitutes?: Array<{ userId?: string }>;
}

/**
 * Filter turns list based on selected active tab ("todos" vs "mis-turnos") and current user id.
 */
export function filterTurnsByTab<T extends TurnFilterableItem>(
  turns: T[],
  activeTab: "todos" | "mis-turnos",
  userId: string | null
): T[] {
  if (activeTab === "todos") return turns;
  if (!userId) return [];

  return turns.filter((turn) => {
    const isCreator = turn.creatorId === userId;
    const isJoined = turn.players.some((p) => p.userId === userId);
    const isSubstitute = turn.substitutes?.some((s) => s.userId === userId);
    return isCreator || isJoined || isSubstitute;
  });
}

/**
 * Format a list of Spanish names nicely using commas and 'y'.
 */
export function formatSpanishNamesList(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} y ${names[1]}`;
  const firsts = names.slice(0, -1).join(", ");
  const last = names[names.length - 1];
  return `${firsts} y ${last}`;
}

/**
 * Format contact players summary text in Argentine Spanish voseo.
 */
export function formatContactPlayersSummary(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) {
    return `Juega tu contacto: ${names[0]}`;
  }
  return `Juegan tus contactos: ${formatSpanishNamesList(names)}`;
}

export interface TurnPublicSubtitleOptions {
  viewerId?: string | null;
  creatorName: string;
  compactDate: string;
  isJoined?: boolean;
  isSubstitute?: boolean;
  substituteIndex?: number;
  substitutesCount?: number;
  isCompleted?: boolean;
  isFull?: boolean;
}

/**
 * Format public turn header subtitle depending on user status, role, and turn state.
 */
export function getTurnPublicSubtitle({
  viewerId,
  creatorName,
  compactDate,
  isJoined = false,
  isSubstitute = false,
  substituteIndex = 0,
  substitutesCount = 0,
  isCompleted = false,
  isFull = false,
}: TurnPublicSubtitleOptions): string {
  if (!viewerId) {
    return `Te invita ${creatorName} · ${compactDate}`;
  }
  if (isSubstitute) {
    return `Suplente #${substituteIndex + 1} de ${substitutesCount}`;
  }
  if (isJoined) {
    if (isCompleted) {
      return "Turno finalizado";
    }
    return `Ya te sumaste · ${compactDate}`;
  }
  if (isFull) {
    const subLabel = substitutesCount === 1 ? "suplente" : "suplentes";
    return `Turno completo · ${substitutesCount} ${subLabel}`;
  }
  return `Sumate a este turno · ${compactDate}`;
}

export interface LateLeaveWarningOptions {
  date: Date | string;
  isCreator?: boolean;
  nowMs?: number;
}

/**
 * Checks whether a late leave warning is required for a player leaving a turn.
 * A late leave warning applies if the turn is in less than 2 hours (and in the future) and the player is not the turn creator.
 */
export function isLateLeaveWarningRequired({
  date,
  isCreator = false,
  nowMs = Date.now(),
}: LateLeaveWarningOptions): boolean {
  if (isCreator) return false;
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;

  const hoursUntilTurn = (d.getTime() - nowMs) / (1000 * 60 * 60);
  return hoursUntilTurn < 2 && hoursUntilTurn >= 0;
}

export interface PlayerOption {
  id: string;
  displayName: string;
  email?: string;
  image?: string | null;
  isContact?: boolean;
}

/**
 * Filter out players already enrolled in the turn and sort contact players to top.
 */
export function filterAndSortPlayerOptions(
  players: PlayerOption[],
  existingPlayerIds: string[]
): PlayerOption[] {
  const filtered = players.filter((p) => !existingPlayerIds.includes(p.id));
  return [...filtered].sort((a, b) => {
    if (a.isContact && !b.isContact) return -1;
    if (!a.isContact && b.isContact) return 1;
    return 0;
  });
}

/**
 * Format toast message when organizer manually adds a player to a turn.
 */
export function getAddPlayerSuccessToast(playerName: string): string {
  return `Agregaste a ${playerName} al turno.`;
}

/**
 * Format ARIA label for adding a player manually to a turn.
 */
export function getAddPlayerAriaLabel(playerName: string): string {
  return `Agregar a ${playerName} al turno`;
}

export interface TurnFormData {
  club: string;
  date: string;
  time: string;
  duration?: string;
  maxPlayers?: string;
  notes?: string;
}

export interface TurnFormValidationResult {
  valid: boolean;
  error?: string;
  combinedDate?: Date;
}

/**
 * Validate turn form data for creation or editing.
 * Ensures club, date, and time are provided, and that the combined datetime is not in the past.
 */
export function validateTurnFormData(
  formData: TurnFormData,
  nowMs: number = Date.now()
): TurnFormValidationResult {
  if (!formData.club.trim() || !formData.date || !formData.time) {
    return { valid: false, error: "Completá club, fecha y hora" };
  }

  const combinedDate = new Date(`${formData.date}T${formData.time}`);
  if (isNaN(combinedDate.getTime())) {
    return { valid: false, error: "Fecha u hora inválida" };
  }

  if (combinedDate.getTime() < nowMs) {
    return {
      valid: false,
      error: "No se puede guardar el turno en el pasado. Elegí una fecha y hora futura.",
      combinedDate,
    };
  }

  return { valid: true, combinedDate };
}

export interface NewTurnShareUrlOptions {
  club: string;
  date: Date;
  turnId: string;
  origin: string;
}

/**
 * Format WhatsApp share URL when creating a new turn.
 */
export function getNewTurnWhatsAppShareUrl({
  club,
  date,
  turnId,
  origin,
}: NewTurnShareUrlOptions): string {
  const turnUrl = `${origin}/t/${turnId}`;
  const shareText = getNaturalShareText({
    type: "turn",
    club,
    date,
  });
  return `https://wa.me/?text=${encodeURIComponent(`${shareText}. Sumate acá: ${turnUrl}`)}`;
}

/**
 * Format ARIA label for turn salvage warning callout banner in Argentine Spanish voseo.
 */
export function formatTurnSalvageCalloutAriaLabel({
  club,
  openSlots,
}: {
  club: string;
  openSlots: number;
}): string {
  if (openSlots <= 0) return "";
  const slotsText =
    openSlots === 1
      ? "Falta 1 jugador para completar este turno"
      : `Faltan ${openSlots} jugadores para completar este turno`;
  return `Aviso de salvataje: ${slotsText} en ${club}.`;
}

/**
 * Calculate turn progress percentage (bounded between 0% and 100%).
 */
export function formatTurnProgressPercentage(
  enrolledCount: number,
  maxPlayers: number
): number {
  if (maxPlayers <= 0) return 0;
  const percentage = (enrolledCount / maxPlayers) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage)));
}

/**
 * Format ARIA label for turn enrollment progress bar.
 */
export function formatTurnProgressAriaLabel(
  enrolledCount: number,
  maxPlayers: number
): string {
  const percentage = formatTurnProgressPercentage(enrolledCount, maxPlayers);
  return `Progreso de inscripción: ${enrolledCount} de ${maxPlayers} jugadores (${percentage}% completado)`;
}

/**
 * Format ARIA label for substitute list items in Argentine Spanish.
 */
export function formatSubstituteListAriaLabel(
  index: number,
  totalSubstitutes: number,
  name: string
): string {
  return `Suplente #${index + 1} de ${totalSubstitutes}: ${name}`;
}

export interface TurnConnectionParticipant {
  userId: string;
  joinedAt: Date | string;
  name: string;
}

export interface TurnConnectionEdge {
  playerAId: string;
  playerBId: string;
}

/**
 * Maps each participant to the name of an earlier-joined participant they
 * share a padel contact edge with ("Contacto de X").
 * joinedAt is coerced via new Date() because cached payloads may deliver
 * ISO strings instead of Date instances.
 */
export function buildTurnConnectionMap(
  participants: TurnConnectionParticipant[],
  edges: TurnConnectionEdge[],
): Record<string, string> {
  const sorted = [...participants].sort(
    (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
  );

  const connectionMap: Record<string, string> = {};
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const connectedTo = sorted
      .slice(0, i)
      .find((other) =>
        edges.some(
          (edge) =>
            (edge.playerAId === current.userId &&
              edge.playerBId === other.userId) ||
            (edge.playerAId === other.userId &&
              edge.playerBId === current.userId),
        ),
      );
    if (connectedTo?.name) {
      connectionMap[current.userId] = connectedTo.name;
    }
  }
  return connectionMap;
}

export interface CalendarEventOptions {
  turnId: string;
  club: string;
  date: Date | string;
  duration: number; // minutes
  notes?: string | null;
  origin?: string;
}

/**
 * Formats a Date object or string to UTC format YYYYMMDDTHHMMSSZ required by calendar providers.
 */
export function formatCalendarUTC(date: Date | string): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  } catch {
    return "";
  }
}

/**
 * Builds Google Calendar render URL template string for a turn.
 */
export function getGoogleCalendarUrl({
  turnId,
  club,
  date,
  duration,
  notes,
  origin = "",
}: CalendarEventOptions): string {
  const startDate = new Date(date);
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
  const startUTC = formatCalendarUTC(startDate);
  const endUTC = formatCalendarUTC(endDate);

  if (!startUTC || !endUTC) return "";

  const title = getCalendarTitle(club, startDate);
  const turnUrl = `${origin}/t/${turnId}`;
  const details = `Turno de pádel en ${club}. Confirmá asistencia: ${turnUrl}${notes ? `\n\nNotas: ${notes}` : ""}`;

  const googleUrl = new URL("https://calendar.google.com/calendar/render");
  googleUrl.searchParams.set("action", "TEMPLATE");
  googleUrl.searchParams.set("text", title);
  googleUrl.searchParams.set("dates", `${startUTC}/${endUTC}`);
  googleUrl.searchParams.set("details", details);
  googleUrl.searchParams.set("location", club);

  return googleUrl.toString();
}

/**
 * Builds iCalendar (.ics) file content lines string for a turn.
 */
export function getIcsCalendarContent({
  turnId,
  club,
  date,
  duration,
  origin = "",
  now = new Date(),
}: CalendarEventOptions & { now?: Date }): string {
  const startDate = new Date(date);
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
  const startUTC = formatCalendarUTC(startDate);
  const endUTC = formatCalendarUTC(endDate);
  const nowUTC = formatCalendarUTC(now);

  if (!startUTC || !endUTC) return "";

  const title = getCalendarTitle(club, startDate);
  const turnUrl = `${origin}/t/${turnId}`;
  const details = `Turno de pádel en ${club}. Ver más: ${turnUrl}`;

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PadelRed//NONSGML Event//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:turn-${turnId}@padelred.app`,
    `DTSTAMP:${nowUTC}`,
    `DTSTART:${startUTC}`,
    `DTEND:${endUTC}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    `LOCATION:${club}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return icsLines.join("\r\n");
}

/**
 * Format ARIA label for calendar options menu in Argentine Spanish.
 */
export function getCalendarOptionsAriaLabel(club: string): string {
  return `Opciones para agregar el partido en ${club} a tu calendario`;
}

/**
 * Format ARIA label for removing a player from a turn in Argentine Spanish.
 */
export function getRemovePlayerAriaLabel({
  playerName,
  isPending = false,
  isConfirming = false,
}: {
  playerName: string;
  isPending?: boolean;
  isConfirming?: boolean;
}): string {
  if (isPending) {
    return `Sacando a ${playerName}...`;
  }
  if (isConfirming) {
    return `Confirmar sacar a ${playerName} del turno`;
  }
  return `Sacar a ${playerName} del turno`;
}

/**
 * Format success toast message when an organizer removes a player from a turn.
 */
export function getRemovePlayerSuccessToast(playerName: string): string {
  return `Sacaste a ${playerName} del turno.`;
}

/**
 * Format ARIA label for assigning a substitute to a primary slot in Argentine Spanish.
 */
export function getAssignSubstituteAriaLabel({
  substituteName,
  isPending = false,
}: {
  substituteName: string;
  isPending?: boolean;
}): string {
  if (isPending) {
    return `Asignando a ${substituteName}...`;
  }
  return `Asignar a ${substituteName} como titular`;
}

/**
 * Format success toast message when an organizer promotes a substitute to a primary slot.
 */
export function getAssignSubstituteSuccessToast(substituteName: string): string {
  return `Promoviste a ${substituteName} a titular.`;
}

/**
 * Format accessible ARIA label for turn listing region depending on active filter tab.
 */
export function getTurnFilterAriaLabel({
  activeTab,
  count,
}: {
  activeTab: "todos" | "mis-turnos";
  count: number;
}): string {
  const quantityText = count === 1 ? "1 turno" : `${count} turnos`;
  if (activeTab === "mis-turnos") {
    return `Sección de tus partidos programados de pádel: mostrando ${quantityText}.`;
  }
  return `Sección de turnos abiertos de pádel: mostrando ${quantityText}.`;
}

/**
 * Format available turns status badge text in Argentine Spanish.
 */
export function formatTurnFilterBadgeText(count: number): string {
  if (count === 1) return "1 disponible";
  return `${count} disponibles`;
}

/**
 * Format accessible ARIA label for filter tab selection buttons.
 */
export function getTurnFilterTabAriaLabel({
  tab,
  count,
}: {
  tab: "todos" | "mis-turnos";
  count: number;
}): string {
  if (tab === "mis-turnos") {
    return `Mostrar mis turnos únicamente (${count})`;
  }
  return `Mostrar todos los turnos disponibles (${count})`;
}

export interface TurnCardAriaLabelOptions {
  club: string;
  enrolledCount: number;
  maxPlayers: number;
  isCreator?: boolean;
  isJoined?: boolean;
  isSubstitute?: boolean;
}

/**
 * Format accessible ARIA label for turn card region container in Argentine Spanish.
 */
export function getTurnCardAriaLabel({
  club,
  enrolledCount,
  maxPlayers,
  isCreator = false,
  isJoined = false,
  isSubstitute = false,
}: TurnCardAriaLabelOptions): string {
  const openSlots = Math.max(0, maxPlayers - enrolledCount);
  let statusText = "";
  if (isCreator) {
    statusText = "Organizador";
  } else if (isSubstitute) {
    statusText = "Suplente";
  } else if (isJoined) {
    statusText = "Inscripto";
  } else if (openSlots === 0) {
    statusText = "Completo";
  } else if (openSlots === 1) {
    statusText = "Falta 1 jugador";
  } else {
    statusText = `Faltan ${openSlots} jugadores`;
  }

  return `Tarjeta de turno en ${club}: ${enrolledCount} de ${maxPlayers} inscriptos (${statusText}).`;
}

export interface QuickJoinAriaLabelOptions {
  club: string;
  isSubstitute?: boolean;
  isPending?: boolean;
}

/**
 * Format dynamic ARIA label for quick-join action triggers during idle and pending server transition states.
 */
export function getQuickJoinAriaLabel({
  club,
  isSubstitute = false,
  isPending = false,
}: QuickJoinAriaLabelOptions): string {
  if (isPending) {
    return isSubstitute ? "Sumándome como suplente..." : "Sumándome al turno...";
  }
  return isSubstitute
    ? `Sumarse como suplente al turno en ${club}`
    : `Sumarse al turno en ${club}`;
}

export interface TurnStatusBadgeAriaLabelOptions {
  openSlots: number;
  isCreator?: boolean;
  isJoined?: boolean;
  isSubstitute?: boolean;
}

/**
 * Format accessible ARIA label for turn card status badges in Argentine Spanish.
 */
export function getTurnStatusBadgeAriaLabel({
  openSlots,
  isCreator = false,
  isJoined = false,
  isSubstitute = false,
}: TurnStatusBadgeAriaLabelOptions): string {
  if (isCreator) return "Rol: Organizador del turno";
  if (isSubstitute) return "Rol: Suplente en lista de espera";
  if (isJoined) return "Estado: Inscripto en el turno";
  if (openSlots <= 0) return "Estado: Turno completo";
  if (openSlots === 1) return "Cupos disponibles: Falta 1 jugador";
  return `Cupos disponibles: Faltan ${openSlots} jugadores`;
}

/**
 * Format accessible ARIA label for cancel turn form trigger/button.
 */
export function getCancelTurnAriaLabel({
  isPending = false,
  isConfirming = false,
}: {
  isPending?: boolean;
  isConfirming?: boolean;
}): string {
  if (isPending) return "Eliminando el turno...";
  if (isConfirming) return "Confirmar eliminación del turno";
  return "Cancelar y eliminar este turno";
}

/**
 * Format ARIA landmark label for turn cancellation confirmation region.
 */
export function getCancelTurnConfirmRegionAriaLabel(): string {
  return "Confirmación para cancelar y eliminar el turno";
}

/**
 * Format accessible ARIA label for starting a match from a turn.
 */
export function getStartMatchAriaLabel({
  isPending = false,
}: {
  isPending?: boolean;
}): string {
  return isPending ? "Iniciando partido..." : "Iniciar partido ahora";
}

/**
 * Format accessible ARIA label for joining a turn.
 */
export function getJoinTurnAriaLabel({
  isPending = false,
}: {
  isPending?: boolean;
}): string {
  return isPending ? "Sumándome al turno..." : "Sumarme al turno";
}

/**
 * Format accessible ARIA label for joining as a substitute.
 */
export function getJoinSubstituteAriaLabel({
  isPending = false,
}: {
  isPending?: boolean;
}): string {
  return isPending ? "Sumándome como suplente..." : "Sumarse como suplente";
}

/**
 * Format accessible ARIA label for leaving the substitute list.
 */
export function getLeaveSubstituteAriaLabel({
  isPending = false,
}: {
  isPending?: boolean;
}): string {
  return isPending
    ? "Saliendo de la lista de suplentes..."
    : "Salir de la lista de suplentes";
}

/**
 * Format accessible ARIA label for taking an open slot in a turn.
 */
export function getTakeOpenSlotAriaLabel({
  isPending = false,
}: {
  isPending?: boolean;
}): string {
  return isPending ? "Ocupando cupo disponible..." : "Ocupar el cupo libre disponible";
}

/**
 * Format accessible ARIA label for scheduling the next turn.
 */
export function getScheduleNextTurnAriaLabel({
  isPending = false,
}: {
  isPending?: boolean;
}): string {
  return isPending
    ? "Programando próximo turno..."
    : "Programar el próximo turno para la siguiente semana";
}

/**
 * Format accessible ARIA label for casual play action trigger/button.
 */
export function getPlayCasualAriaLabel({
  isPending = false,
  isConfirming = false,
}: {
  isPending?: boolean;
  isConfirming?: boolean;
}): string {
  if (isPending) return "Marcando turno como jugado...";
  if (isConfirming) return "Confirmar marcar como jugado";
  return "Marcar turno como jugado sin registrar partido";
}

/**
 * Format ARIA landmark label for casual play confirmation region.
 */
export function getPlayCasualConfirmRegionAriaLabel(): string {
  return "Confirmación para marcar el turno como jugado sin registrar partido";
}

/**
 * Format success toast message when user leaves a turn.
 */
export function getLeaveTurnSuccessToast(): string {
  return "Te bajaste del turno.";
}

/**
 * Format error toast message when user fails to leave a turn.
 */
export function getLeaveTurnErrorToast(message?: string): string {
  return message ?? "No se pudo bajar del turno.";
}

/**
 * Format accessible ARIA label for initial leave turn trigger button.
 */
export function getLeaveTurnTriggerAriaLabel(): string {
  return "Bajarme del turno";
}

/**
 * Format ARIA landmark label for leave turn confirmation region.
 */
export function getLeaveTurnRegionAriaLabel(): string {
  return "Baja del turno";
}

/**
 * Format accessible ARIA label for canceling leave turn confirmation.
 */
export function getCancelLeaveTurnAriaLabel(): string {
  return "Cancelar baja del turno";
}

/**
 * Format accessible ARIA label for confirming leave turn.
 */
export function getConfirmLeaveTurnAriaLabel({
  isPending = false,
}: {
  isPending?: boolean;
}): string {
  return isPending
    ? "Procesando baja del turno..."
    : "Confirmar baja del turno";
}

/**
 * Format success toast message when notifying network.
 */
export function getOpenToNetworkSuccessToast(notifiedCount: number): string {
  return notifiedCount > 0
    ? `Se notificó a ${notifiedCount} contacto${notifiedCount === 1 ? "" : "s"} de tu red.`
    : "Se avisó a tu red.";
}

/**
 * Format error toast message when failing to notify network.
 */
export function getOpenToNetworkErrorToast(message?: string): string {
  return message ?? "No se pudo notificar a tu red.";
}

/**
 * Format ARIA landmark label for network notification region.
 */
export function getOpenToNetworkRegionAriaLabel(): string {
  return "Notificación a red de contactos";
}

/**
 * Format result text when network is notified.
 */
export function getOpenToNetworkResultText(notified: number): string {
  return notified > 0
    ? `Se notificó a ${notified} contacto${notified === 1 ? "" : "s"}`
    : "Red notificada";
}

/**
 * Format dynamic ARIA label for OpenToNetwork button.
 */
export function getOpenToNetworkAriaLabel({
  isPending = false,
  isOnCooldown = false,
  minutesRemaining = 0,
  label = "Abrir a mi red",
}: {
  isPending?: boolean;
  isOnCooldown?: boolean;
  minutesRemaining?: number;
  label?: string;
}): string {
  if (isPending) {
    return "Notificando a tu red de pádel...";
  }
  if (isOnCooldown) {
    return `Notificado, en cooldown por ${minutesRemaining} minuto${minutesRemaining === 1 ? "" : "s"}`;
  }
  return label;
}

/**
 * Format toast message when opening WhatsApp to invite an individual contact.
 */
export function getWhatsAppInviteSuccessToast(contactName: string): string {
  return `Abriste WhatsApp para invitar a ${contactName}.`;
}

/**
 * Format toast message when opening WhatsApp to send a group invitation.
 */
export function getWhatsAppGroupInviteSuccessToast(): string {
  return "Abriste WhatsApp para enviar la invitación al grupo.";
}

/**
 * Format accessible ARIA label for individual WhatsApp invite button.
 */
export function getWhatsAppInviteAriaLabel(
  contactName: string,
  club: string
): string {
  return `Invitar a ${contactName} por WhatsApp para sumar al turno en ${club}`;
}

/**
 * Format accessible ARIA label for WhatsApp group invite button.
 */
export function getWhatsAppGroupInviteAriaLabel(
  openSlots: number,
  club: string
): string {
  const slotsText =
    openSlots === 1 ? "1 jugador" : `${openSlots} jugadores`;
  return `Invitar a grupo de WhatsApp para sumar ${slotsText} al turno en ${club}`;
}

/**
 * Format contact badge label text in Argentine Spanish.
 */
export function getContactBadgeText(isFrequent: boolean = false): string {
  return isFrequent ? "Contacto frecuente" : "Contacto";
}

/**
 * Format accessible ARIA label for suggested contacts section in Argentine Spanish.
 */
export function getSuggestedContactSectionAriaLabel({
  count,
  openSlots,
}: {
  count: number;
  openSlots: number;
}): string {
  const contactsText = count === 1 ? "1 contacto sugerido" : `${count} contactos sugeridos`;
  const slotsText = openSlots === 1 ? "1 cupo disponible" : `${openSlots} cupos disponibles`;
  return `Contactos sugeridos de tu red de pádel para invitar por WhatsApp: ${contactsText} para cubrir ${slotsText}.`;
}
