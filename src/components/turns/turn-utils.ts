import { cn, isToday, isTomorrow, getNaturalShareText, getCalendarTitle } from "@/lib/utils";

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

export interface AddPlayerSearchStatusOptions {
  isSearching?: boolean;
  count?: number;
  query?: string;
}

/**
 * Format accessible ARIA screen reader status label for player search state in Argentine Spanish.
 */
export function getAddPlayerSearchStatusAriaLabel({
  isSearching = false,
  count = 0,
  query = "",
}: AddPlayerSearchStatusOptions): string {
  if (isSearching) {
    return "Buscando jugadores por nombre o email...";
  }
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return "Escribí al menos 2 caracteres para buscar jugadores.";
  }
  if (count === 0) {
    return "No se encontraron jugadores con ese nombre o email.";
  }
  return `Se encontraron ${count} jugador${count === 1 ? "" : "es"}.`;
}

/**
 * Format prompt text when user types less than 2 search characters.
 */
export function getAddPlayerPromptText(): string {
  return "Escribí al menos 2 caracteres para buscar.";
}

/**
 * Format message when no player matches search query.
 */
export function getAddPlayerEmptyResultsText(): string {
  return "No se encontraron jugadores con ese nombre.";
}

/**
 * Format ARIA label for clearing player search input.
 */
export function getAddPlayerClearSearchAriaLabel(): string {
  return "Limpiar búsqueda de jugador";
}

/**
 * Format ARIA label for canceling player search dialog.
 */
export function getAddPlayerCancelSearchAriaLabel(): string {
  return "Cancelar búsqueda de jugador";
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
 * Format ARIA label for canceling player removal in Argentine Spanish.
 */
export function getRemovePlayerCancelAriaLabel(playerName?: string): string {
  if (playerName) {
    return `Cancelar sacar a ${playerName} del turno`;
  }
  return "Cancelar sacar jugador";
}

/**
 * Format ARIA region label for player removal component in Argentine Spanish.
 */
export function getRemovePlayerRegionAriaLabel({
  playerName,
  isConfirming = false,
}: {
  playerName: string;
  isConfirming?: boolean;
}): string {
  if (isConfirming) {
    return `Confirmación para sacar a ${playerName}`;
  }
  return `Gestión de jugador ${playerName}`;
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
 * Format ARIA region label for substitute assignment component in Argentine Spanish.
 */
export function getAssignSubstituteRegionAriaLabel(substituteName: string): string {
  return `Asignación de suplente ${substituteName}`;
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
 * Format button label text for individual WhatsApp invite trigger.
 */
export function getWhatsAppInviteButtonText(): string {
  return "Invitar";
}

/**
 * Format button label text for WhatsApp group invite trigger.
 */
export function getWhatsAppGroupInviteButtonText(): string {
  return "Grupo WhatsApp";
}

/**
 * Format fallback anchor URL for WhatsApp sharing when no dynamic link is generated.
 */
export function getFallbackWhatsAppShareUrl(): string {
  return "https://wa.me/";
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

export interface TurnActionsRegionAriaLabelOptions {
  club: string;
  viewerId?: string;
  isSubstitute?: boolean;
  isJoined?: boolean;
  isCreator?: boolean;
  isFull?: boolean;
  isCompleted?: boolean;
  openSlots?: number;
}

/**
 * Format accessible ARIA label for turn actions bottom bar region in Argentine Spanish.
 */
export function getTurnActionsRegionAriaLabel({
  club,
  viewerId,
  isSubstitute = false,
  isJoined = false,
  isCreator = false,
  isFull = false,
  isCompleted = false,
  openSlots = 0,
}: TurnActionsRegionAriaLabelOptions): string {
  if (!viewerId) {
    return `Acciones del turno en ${club}: Iniciar sesión o compartir enlace`;
  }
  if (isCompleted) {
    return `Acciones del turno en ${club}: Turno finalizado`;
  }
  if (isSubstitute) {
    return openSlots > 0
      ? `Acciones del turno en ${club}: Ocupar cupo disponible o salir de suplentes`
      : `Acciones del turno en ${club}: Lista de espera de suplentes`;
  }
  if (isCreator) {
    return `Acciones de organización del turno en ${club}`;
  }
  if (isJoined) {
    return `Acciones del turno en ${club}: Bajarme del turno o compartir`;
  }
  if (isFull) {
    return `Acciones del turno en ${club}: Turno completo, sumarme como suplente`;
  }
  return `Acciones del turno en ${club}: Sumarme ahora o compartir`;
}

/**
 * Format waitlist explanation message for substitutes when turn is full.
 */
export function getSubstituteWaitlistMessage(): string {
  return "Estás en la lista de espera. Te avisaremos cuando se libere un cupo.";
}

/**
 * Format status text for substitutes when no slots are available.
 */
export function getSubstituteNoSlotsText(): string {
  return "No hay cupos libres todavía";
}

/**
 * Format button label when turn is completed.
 */
export function getTurnCompletedButtonLabel(): string {
  return "Turno finalizado";
}

/**
 * Format button label when user is already joined.
 */
export function getAlreadyJoinedButtonLabel(): string {
  return "Ya te sumaste";
}

/**
 * Format sign-in form prompt text with club name.
 */
export function getSignInPromptText(club: string): string {
  return `Iniciá sesión para sumarte a ${club}`;
}

/**
 * Format success toast message when a new turn is created.
 */
export function getCreateTurnSuccessToast(): string {
  return "Creaste el turno. Compartilo por WhatsApp.";
}

/**
 * Format success toast message when an existing turn is updated.
 */
export function getUpdateTurnSuccessToast(): string {
  return "Actualizaste el turno.";
}

/**
 * Format ARIA label for turn creation or edit form region landmark in Argentine Spanish.
 */
export function getTurnFormRegionAriaLabel(mode: "create" | "edit"): string {
  if (mode === "create") {
    return "Formulario para crear nuevo turno de pádel";
  }
  return "Formulario para editar turno de pádel";
}

/**
 * Format ARIA label for turn creation or edit form submit button in Argentine Spanish.
 */
export function getTurnFormSubmitButtonAriaLabel({
  mode,
  isPending = false,
}: {
  mode: "create" | "edit";
  isPending?: boolean;
}): string {
  if (mode === "create") {
    return isPending ? "Creando turno..." : "Crear turno y compartir link";
  }
  return isPending ? "Guardando cambios del turno..." : "Guardar cambios del turno";
}

/**
 * Format section heading title for turn list based on active filter tab.
 */
export function getTurnFilterHeadingTitle(
  activeTab: "todos" | "mis-turnos"
): string {
  if (activeTab === "mis-turnos") {
    return "Mis partidos programados";
  }
  return "Próximos turnos";
}

export interface TurnFilterEmptyStateProps {
  title: string;
  description: string;
  exploreButtonLabel?: string;
  createButtonLabel: string;
  exploreButtonAriaLabel?: string;
}

/**
 * Format title, description, and button properties for empty state in turn list based on active filter tab.
 */
export function getTurnFilterEmptyStateProps(
  activeTab: "todos" | "mis-turnos"
): TurnFilterEmptyStateProps {
  if (activeTab === "mis-turnos") {
    return {
      title: "No estás anotado en ningún turno",
      description:
        "Explorá los turnos abiertos para sumarte a un partido o creá tu propio turno.",
      exploreButtonLabel: "Explorar turnos abiertos",
      createButtonLabel: "Crear un turno",
      exploreButtonAriaLabel: "Explorar todos los turnos abiertos disponibles",
    };
  }
  return {
    title: "Sin turnos abiertos",
    description: "No hay turnos disponibles. Sé el primero en crear uno.",
    createButtonLabel: "Crear turno",
  };
}

/**
 * Format success toast message when an organizer cancels a turn.
 */
export function getCancelTurnSuccessToast(): string {
  return "Cancelaste el turno.";
}

/**
 * Format error toast message when canceling a turn fails.
 */
export function getCancelTurnErrorToast(message?: string): string {
  return message ?? "No se pudo cancelar el turno.";
}

/**
 * Format success toast message when a player joins a turn.
 */
export function getJoinTurnSuccessToast(): string {
  return "Te sumaste al turno.";
}

/**
 * Format error toast message when joining a turn fails.
 */
export function getJoinTurnErrorToast(message?: string): string {
  return message ?? "No se pudo sumar al turno.";
}

/**
 * Format success toast message when a player joins as a substitute.
 */
export function getJoinSubstituteSuccessToast(): string {
  return "Te sumaste como suplente. Te avisaremos cuando se libere un cupo.";
}

/**
 * Format success toast message when a substitute leaves the substitute list.
 */
export function getLeaveSubstituteSuccessToast(): string {
  return "Saliste de la lista de suplentes.";
}

/**
 * Format error toast message when leaving the substitute list fails.
 */
export function getLeaveSubstituteErrorToast(message?: string): string {
  return message ?? "No se pudo salir de suplentes.";
}

/**
 * Format success toast message when a player takes an open slot.
 */
export function getTakeOpenSlotSuccessToast(): string {
  return "Ocupaste el cupo.";
}

/**
 * Format success toast message when converting a turn to a match.
 */
export function getStartMatchSuccessToast(): string {
  return "Iniciaste el partido.";
}

/**
 * Format error toast message when converting a turn to a match fails.
 */
export function getStartMatchErrorToast(message?: string): string {
  return message ?? "No se pudo iniciar el partido.";
}

/**
 * Format success toast message when scheduling the next turn.
 */
export function getScheduleNextTurnSuccessToast(): string {
  return "Programaste el próximo turno.";
}

/**
 * Format error toast message when scheduling the next turn fails.
 */
export function getScheduleNextTurnErrorToast(message?: string): string {
  return message ?? "No se pudo programar el próximo turno.";
}

/**
 * Format success toast message when marking a turn as played casually.
 */
export function getPlayCasualSuccessToast(): string {
  return "Marcaste el turno como jugado.";
}

/**
 * Format error toast message when marking a turn as played casually fails.
 */
export function getPlayCasualErrorToast(message?: string): string {
  return message ?? "No se pudo marcar el turno como jugado.";
}

/**
 * Format substitute count indicator text for turn listing cards.
 */
export function getTurnCardSubstitutesText(count: number): string {
  if (count <= 0) return "";
  if (count === 1) return "(+1 supl)";
  return `(+${count} suples)`;
}

/**
 * Format ARIA label for enrolled contact players summary on turn listing cards in Argentine Spanish.
 */
export function getTurnCardContactPlayersAriaLabel(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) {
    return `Juega tu contacto: ${names[0]}`;
  }
  return `Juegan tus contactos: ${formatSpanishNamesList(names)}`;
}

/**
 * Format ARIA label for turn card detail overlay link in Argentine Spanish.
 */
export function getTurnCardDetailLinkAriaLabel(club: string): string {
  return `Ver detalles del turno de pádel en ${club}`;
}

/**
 * Format title for cancelled turn screen.
 */
export function getTurnCancelledTitle(): string {
  return "Turno cancelado";
}

/**
 * Format description text for cancelled turn screen.
 */
export function getTurnCancelledDescription(): string {
  return "Este turno ha sido cancelado por el organizador.";
}

/**
 * Format button label for navigating away from cancelled turn screen.
 */
export function getTurnCancelledButtonLabel(): string {
  return "Ver otros turnos";
}

/**
 * Format page heading title for turn details view.
 */
export function getTurnDetailsHeading(): string {
  return "Detalle del Turno";
}

/**
 * Format section title for turn information card.
 */
export function getTurnInfoSectionTitle(): string {
  return "Información del turno";
}

/**
 * Format accessible ARIA region label for turn information card.
 */
export function getTurnInfoRegionAriaLabel(): string {
  return "Información del turno de pádel";
}

/**
 * Format status badge label text for turn details.
 */
export function getTurnStatusBadgeText({
  isCompleted = false,
  isFull = false,
}: {
  isCompleted?: boolean;
  isFull?: boolean;
}): string {
  if (isCompleted) return "Finalizado";
  if (isFull) return "Completo";
  return "Abierto";
}

/**
 * Format solid MDS CSS classes for turn status badge.
 */
export function getTurnStatusBadgeClasses({
  isCompleted = false,
  isFull = false,
}: {
  isCompleted?: boolean;
  isFull?: boolean;
}): string {
  if (isCompleted) {
    return "bg-muted text-muted-foreground border-border";
  }
  if (isFull) {
    return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800";
  }
  return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800";
}

/**
 * Format section title for enrolled players list.
 */
export function getTurnEnrolledSectionTitle(): string {
  return "Lista de jugadores";
}

/**
 * Format accessible ARIA region label for enrolled players list.
 */
export function getTurnEnrolledRegionAriaLabel(): string {
  return "Lista de jugadores inscriptos";
}

/**
 * Format label for an empty player slot in turn details.
 */
export function getEmptySlotText(): string {
  return "Cupo disponible";
}

/**
 * Format section title for suggested contacts section.
 */
export function getTurnSuggestedContactsTitle(): string {
  return "Sugeridos para invitar 🧠";
}

/**
 * Format subtitle for suggested contacts section.
 */
export function getTurnSuggestedContactsSubtitle(): string {
  return "De tu red de contactos";
}

/**
 * Format section title for substitutes waitlist.
 */
export function getTurnSubstitutesSectionTitle(): string {
  return "Lista de suplentes";
}

/**
 * Format accessible ARIA region label for substitutes section.
 */
export function getTurnSubstitutesRegionAriaLabel(): string {
  return "Lista de suplentes en espera";
}

/**
 * Format count badge text for substitutes list.
 */
export function getTurnSubstitutesCountText(count: number): string {
  if (count === 1) return "1 suplente";
  return `${count} suplentes`;
}

/**
 * Format section title for turn chat coordination.
 */
export function getTurnChatSectionTitle(): string {
  return "Chat del turno 💬";
}

/**
 * Format accessible ARIA region label for turn chat section.
 */
export function getTurnChatRegionAriaLabel(): string {
  return "Chat de coordinación del turno";
}

/**
 * Format contact connection text.
 */
export function getTurnConnectionText(contactName: string): string {
  return `Contacto de ${contactName}`;
}

/**
 * Format accessible ARIA label for contact connection text.
 */
export function getTurnConnectionAriaLabel(contactName: string): string {
  return `Contacto de ${contactName}`;
}

/**
 * Format accessible ARIA label for back button.
 */
export function getTurnBackAriaLabel(): string {
  return "Volver";
}

/**
 * Format accessible ARIA label for turn public detail loading skeleton.
 */
export function getTurnSkeletonAriaLabel(): string {
  return "Cargando detalles del turno de pádel...";
}

/**
 * Format page heading title for turn list view.
 */
export function getTurnosHeadingTitle(): string {
  return "Turnos abiertos";
}

/**
 * Format page heading description for turn list view.
 */
export function getTurnosHeadingDescription(): string {
  return "Unite a partidos de tu nivel.";
}

/**
 * Format page heading title for new turn creation view.
 */
export function getNewTurnHeadingTitle(): string {
  return "Nuevo turno";
}

/**
 * Format page heading description for new turn creation view.
 */
export function getNewTurnHeadingDescription(): string {
  return "Configurá cancha y cupos.";
}

/**
 * Format page heading title for turn edit view.
 */
export function getEditTurnHeadingTitle(): string {
  return "Editar turno";
}

/**
 * Format page heading description for turn edit view.
 */
export function getEditTurnHeadingDescription(): string {
  return "Modificá los detalles de tu turno.";
}

/**
 * Format ARIA label for turn list loading skeleton region in Argentine Spanish.
 */
export function getTurnosLoadingAriaLabel(): string {
  return "Cargando lista de turnos abiertos de pádel...";
}

/**
 * Format ARIA label for new turn creation loading skeleton region in Argentine Spanish.
 */
export function getNewTurnLoadingAriaLabel(): string {
  return "Cargando formulario de nuevo turno de pádel...";
}

/**
 * Format ARIA label for turn edit loading skeleton region in Argentine Spanish.
 */
export function getEditTurnLoadingAriaLabel(): string {
  return "Cargando formulario de edición de turno de pádel...";
}

/**
 * Format button text when open-to-network action is on cooldown.
 */
export function getOpenToNetworkCooldownText(minutesRemaining: number): string {
  return `Red notificada (esperá ${minutesRemaining} min)`;
}

export interface OpenToNetworkButtonTextOptions {
  isPending?: boolean;
  isOnCooldown?: boolean;
  minutesRemaining?: number;
  label?: string;
}

/**
 * Format button label text for OpenToNetworkButton depending on pending or cooldown state.
 */
export function getOpenToNetworkButtonText({
  isPending = false,
  isOnCooldown = false,
  minutesRemaining = 0,
  label = "Abrir a mi red",
}: OpenToNetworkButtonTextOptions): string {
  if (isPending) return "Enviando...";
  if (isOnCooldown) return getOpenToNetworkCooldownText(minutesRemaining);
  return label;
}

/**
 * Format accessible screen reader ARIA label for OpenToNetwork result container.
 */
export function getOpenToNetworkResultAriaLabel(notified: number): string {
  if (notified > 0) {
    return `Notificación enviada: se notificó a ${notified} contacto${notified === 1 ? "" : "s"} de tu red.`;
  }
  return "Notificación enviada: no se encontraron contactos para notificar.";
}

/**
 * Format helper text shown below OpenToNetworkButton depending on cooldown state.
 */
export function getOpenToNetworkHelperText(
  isOnCooldown: boolean,
  minutesRemaining: number = 0
): string {
  if (isOnCooldown) {
    return `Ya se notificó a la red. Podés volver a enviar en ${minutesRemaining} min.`;
  }
  return "Notifica a contactos de los últimos 12 meses";
}

/**
 * Format result subtitle text when network notification is completed.
 */
export function getOpenToNetworkResultSubtitle(notified: number): string {
  if (notified > 0) {
    return `Se notificó a ${notified} contacto${notified === 1 ? "" : "s"}`;
  }
  return "Sin contactos";
}

/**
 * Format result description text when network notification is completed.
 */
export function getOpenToNetworkResultDescription(): string {
  return "Recibirán una push para sumarse.";
}

/**
 * Format title for late leave penalty warning.
 */
export function getLateLeaveWarningTitle(): string {
  return "Baja tardía detectada";
}

/**
 * Format description text for late leave penalty warning.
 */
export function getLateLeaveWarningDescription(): string {
  return "Falta menos de 2 horas para el turno. Si te bajás ahora, tu reputación de asistencia bajará un 5%.";
}

/**
 * Format prompt text for sharing link when leaving a full turn.
 */
export function getWasFullSharePromptText(): string {
  return "¿No podés venir? Compartí el link para que alguien ocupe tu lugar:";
}

/**
 * Format confirmation explanation text when marking a turn as casual/played.
 */
export function getPlayCasualConfirmText(): string {
  return "Se cerrará el turno sin registrar un partido ni resultados en el ranking.";
}

/**
 * Format ARIA label for dismissing cancel turn confirmation.
 */
export function getCancelTurnDismissAriaLabel(): string {
  return "Cancelar eliminación del turno";
}

/**
 * Format ARIA label for dismissing play casual confirmation.
 */
export function getPlayCasualDismissAriaLabel(): string {
  return "Cancelar confirmación de marcar como jugado";
}

/**
 * Format accessible ARIA label for quick join empty slot button.
 */
export function getQuickJoinEmptySlotAriaLabel(isPending: boolean = false): string {
  return isPending ? "Sumándome al turno..." : "Sumarse en este cupo disponible";
}

/**
 * Format button text for quick join empty slot button.
 */
export function getQuickJoinEmptySlotText(isPending: boolean = false): string {
  return isPending ? "Sumando..." : "Sumarme";
}

/**
 * Format calendar action button text.
 */
export function getCalendarButtonText(): string {
  return "Agregar al calendario";
}

/**
 * Format calendar action button ARIA label.
 */
export function getCalendarButtonAriaLabel(): string {
  return "Agregar el partido a mi calendario";
}

/**
 * Format calendar header prompt text.
 */
export function getCalendarHeaderPromptText(): string {
  return "Elegí tu calendario:";
}

/**
 * Format Google Calendar button text.
 */
export function getGoogleButtonText(): string {
  return "Google";
}

/**
 * Format Google Calendar button ARIA label.
 */
export function getGoogleButtonAriaLabel(): string {
  return "Agregar a Google Calendar";
}

/**
 * Format iCal / Apple / Outlook calendar button text.
 */
export function getIcsButtonText(): string {
  return "Apple / Outlook";
}

/**
 * Format iCal / Apple / Outlook calendar button ARIA label.
 */
export function getIcsButtonAriaLabel(): string {
  return "Descargar archivo iCal";
}

/**
 * Format Google Calendar toast feedback message.
 */
export function getGoogleCalendarToast(): string {
  return "Abriendo Google Calendar...";
}

/**
 * Format iCal calendar download toast feedback message.
 */
export function getIcsCalendarToast(): string {
  return "Archivo de calendario descargado.";
}

/**
 * Format error toast message when removing a player fails.
 */
export function getRemovePlayerErrorToast(message?: string | null): string {
  return message ?? "No se pudo sacar al jugador.";
}

/**
 * Format error toast message when assigning a substitute fails.
 */
export function getAssignSubstituteErrorToast(message?: string | null): string {
  return message ?? "No se pudo asignar al suplente.";
}

/**
 * Format error toast message when adding a player fails.
 */
export function getAddPlayerErrorToast(message?: string | null): string {
  return message ?? "No se pudo agregar al jugador.";
}

/**
 * Format error toast message when sending a chat message fails.
 */
export function getSendChatMessageErrorToast(message?: string | null): string {
  return message ?? "No se pudo enviar el mensaje.";
}

/**
 * Format badge label text for today's date.
 */
export function getTodayBadgeText(): string {
  return "Hoy";
}

/**
 * Format badge label text for tomorrow's date.
 */
export function getTomorrowBadgeText(): string {
  return "Mañana";
}

/**
 * Format share dialog title for TurnCard.
 */
export function getTurnCardShareTitle(): string {
  return "Sumate al Turno";
}

/**
 * Format button label for salvage action in TurnCard.
 */
export function getTurnCardSalvageLabel(): string {
  return "Salvar turno";
}

export interface QuickJoinTextOptions {
  isSubstitute?: boolean;
  isPending?: boolean;
}

/**
 * Format button text for quick-join trigger in TurnCard.
 */
export function getTurnCardQuickJoinText({
  isSubstitute = false,
  isPending = false,
}: QuickJoinTextOptions = {}): string {
  if (isPending) return "Sumando...";
  if (isSubstitute) return "Suplente";
  return "Sumarme";
}

export interface TurnCardStatusBadgeTextOptions {
  isCreator?: boolean;
  isSubstitute?: boolean;
  isJoined?: boolean;
  isFull?: boolean;
  openSlots?: number;
}

/**
 * Format status or role badge label text for TurnCard.
 */
export function getTurnCardStatusBadgeText({
  isCreator = false,
  isSubstitute = false,
  isJoined = false,
  isFull = false,
  openSlots = 0,
}: TurnCardStatusBadgeTextOptions): string | null {
  if (isCreator) return "Organizador";
  if (isSubstitute) return "Suplente";
  if (isJoined) return "Inscripto";
  if (isFull) return "Completo";
  if (openSlots > 0) return getOpenSlotsBadgeText(openSlots);
  return null;
}

export interface TurnCardContainerClassesOptions {
  isRecommended?: boolean;
  isPending?: boolean;
}

/**
 * Format CSS classes for TurnCard outer container.
 */
export function getTurnCardContainerClasses({
  isRecommended = false,
  isPending = false,
}: TurnCardContainerClassesOptions = {}): string {
  return cn(
    "relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:bg-muted active:scale-[0.98]",
    isRecommended && "border-primary font-semibold shadow-sm",
    isPending && "opacity-70 pointer-events-none"
  );
}

export interface LeaveSubstituteButtonTextOptions {
  isPending?: boolean;
  hasOpenSlot?: boolean;
}

/**
 * Format button label text for leaving substitute list depending on pending or open slot states.
 */
export function getLeaveSubstituteButtonText({
  isPending = false,
  hasOpenSlot = false,
}: LeaveSubstituteButtonTextOptions = {}): string {
  if (isPending) return "Saliendo...";
  if (hasOpenSlot) return "No puedo — salir de suplentes";
  return "Salir de suplentes";
}

/**
 * Format button label text for quick joining an empty slot depending on pending state.
 */
export function getQuickJoinEmptySlotButtonText(isPending: boolean = false): string {
  return isPending ? "Sumando..." : "Sumarme";
}

/**
 * Format button label text for initial cancel turn action trigger.
 */
export function getCancelTurnButtonText(): string {
  return "Eliminar";
}

/**
 * Format button label text for confirming cancel turn action depending on pending state.
 */
export function getCancelTurnConfirmButtonText(isPending: boolean = false): string {
  return isPending ? "Eliminando..." : "Confirmar";
}

/**
 * Format button label text for start match action trigger depending on pending state.
 */
export function getStartMatchButtonText(isPending: boolean = false): string {
  return isPending ? "Iniciando..." : "Iniciar partido";
}

/**
 * Format button label text for join turn action trigger depending on pending state.
 */
export function getJoinTurnButtonText(isPending: boolean = false): string {
  return isPending ? "Sumando..." : "Sumarme ahora";
}

/**
 * Format button label text for join substitute action trigger depending on pending state.
 */
export function getJoinSubstituteButtonText(isPending: boolean = false): string {
  return isPending ? "Sumando..." : "Sumarme como suplente";
}

/**
 * Format button label text for take open slot action trigger depending on pending state.
 */
export function getTakeOpenSlotButtonText(isPending: boolean = false): string {
  return isPending ? "Ocupando..." : "Ocupar cupo";
}

/**
 * Format button label text for schedule next turn action trigger depending on pending state.
 */
export function getScheduleNextTurnButtonText(isPending: boolean = false): string {
  return isPending ? "Programando..." : "Programar próximo turno";
}

/**
 * Format button label text for initial play casual action trigger.
 */
export function getPlayCasualButtonText(): string {
  return "Jugar igual";
}

/**
 * Format button label text for canceling play casual confirmation.
 */
export function getPlayCasualCancelButtonText(): string {
  return "Cancelar";
}

/**
 * Format button label text for confirming play casual action depending on pending state.
 */
export function getPlayCasualConfirmButtonText(isPending: boolean = false): string {
  return isPending ? "Marcando..." : "Confirmar";
}

/**
 * Format button label text for confirming player removal.
 */
export function getRemovePlayerConfirmText(): string {
  return "Sacar";
}

/**
 * Format button label text for assigning a substitute depending on pending state.
 */
export function getAssignSubstituteButtonText(isPending: boolean = false): string {
  return isPending ? "Asignando..." : "Asignar";
}

/**
 * Format title text for AddPlayerButton in closed state.
 */
export function getAddPlayerButtonTitle(): string {
  return "Agregar jugador";
}

/**
 * Format subtitle text for AddPlayerButton in closed state.
 */
export function getAddPlayerButtonSubtitle(): string {
  return "Para confirmaciones fuera de la app";
}

/**
 * Format placeholder text for player search input.
 */
export function getAddPlayerSearchPlaceholder(): string {
  return "Buscar jugador...";
}

/**
 * Format ARIA label for search results region.
 */
export function getAddPlayerSearchResultsRegionAriaLabel(): string {
  return "Resultados de búsqueda de jugadores";
}

/**
 * Format ARIA label for manual player addition region landmark.
 */
export function getAddPlayerRegionAriaLabel(): string {
  return "Agregar jugador al turno";
}

/**
 * Format header title for turn details section in creation/editing form.
 */
export function getTurnFormDetailsHeaderTitle(): string {
  return "Detalles del partido";
}

/**
 * Format label for club and court input in turn form.
 */
export function getTurnFormClubLabel(): string {
  return "Club y cancha";
}

/**
 * Format placeholder for club and court input in turn form.
 */
export function getTurnFormClubPlaceholder(): string {
  return "Ej: Padel City · Cancha 3";
}

/**
 * Format label for date input in turn form.
 */
export function getTurnFormDateLabel(): string {
  return "Fecha";
}

/**
 * Format label for time input in turn form.
 */
export function getTurnFormTimeLabel(): string {
  return "Hora";
}

/**
 * Format label for duration selection in turn form.
 */
export function getTurnFormDurationLabel(): string {
  return "Duración";
}

/**
 * Format label for duration selection in turn form (with 'del turno').
 */
export function getTurnFormDurationTurnLabel(): string {
  return "Duración del turno";
}

/**
 * Format label for max players selection in turn form.
 */
export function getTurnFormPlayersLabel(): string {
  return "Cupos totales";
}

/**
 * Format label for notes textarea in turn form.
 */
export function getTurnFormNotesLabel(): string {
  return "Notas adicionales";
}

/**
 * Format placeholder for notes textarea in turn form.
 */
export function getTurnFormNotesPlaceholder(mode: "create" | "edit"): string {
  return mode === "create"
    ? "Ej: Traer pelotas nuevas. Punto de encuentro en recepción."
    : "Ej: Traer pelotas nuevas...";
}

/**
 * Format submit button label text for turn creation or edit form depending on pending state.
 */
export function getTurnFormSubmitButtonText(
  mode: "create" | "edit",
  isPending: boolean = false
): string {
  if (mode === "create") {
    return isPending ? "Creando..." : "Crear turno y compartir link";
  }
  return isPending ? "Actualizando..." : "Guardar cambios";
}

/**
 * Format ARIA label for turn urgency badge.
 */
export function getTurnUrgencyBadgeAriaLabel(urgencyText: string): string {
  return `Urgencia: ${urgencyText}`;
}

/**
 * Format ARIA label for public profile link of a contact player.
 */
export function getTurnContactProfileLinkAriaLabel(contactName: string): string {
  return `Ver perfil público de ${contactName}`;
}

/**
 * Format ARIA label for turn contact compatibility badge.
 */
export function getTurnContactCompatibilityAriaLabel(
  contactName: string,
  tier: string,
  summary?: string | null
): string {
  return `Compatibilidad de ${contactName} con el turno: ${tier}.${summary ? ` ${summary}` : ""}`;
}

/**
 * Format ARIA label for contact badge.
 */
export function getTurnContactBadgeAriaLabel(text: string): string {
  return text;
}

/**
 * Format button label text for leave turn trigger.
 */
export function getLeaveTurnTriggerButtonText(): string {
  return "Bajarme del turno";
}

/**
 * Format button label text for confirming leave turn depending on pending state.
 */
export function getConfirmLeaveButtonText(isPending: boolean = false): string {
  return isPending ? "Bajando..." : "Confirmar baja";
}

/**
 * Format button label text for canceling leave turn dialog.
 */
export function getLeaveTurnCancelButtonText(): string {
  return "Cancelar";
}

/**
 * Format title for share prompt when leaving a full turn.
 */
export function getWasFullShareTitle(): string {
  return "Sumate al Turno";
}

/**
 * Format text payload for share prompt when leaving a full turn.
 */
export function getWasFullShareText(club: string): string {
  return `Se liberó un cupo en ${club}`;
}

/**
 * Format CSS classes for WhatsApp group invite button variants.
 */
export function getWhatsAppGroupInviteVariantClasses(
  variant: "default" | "outline" | "amber" = "default"
): string {
  if (variant === "amber") {
    return "bg-amber-600 text-white hover:bg-amber-700 border-transparent shadow-xs";
  }
  if (variant === "outline") {
    return "border border-border text-foreground bg-card hover:bg-muted shadow-xs";
  }
  return "bg-emerald-600 text-white hover:bg-emerald-700 border-transparent shadow-xs";
}

/**
 * Format CSS classes for turn filter tabs depending on selection state.
 */
export function getTurnFilterTabClasses(isSelected: boolean): string {
  return cn(
    "flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    isSelected
      ? "bg-card border border-border text-foreground shadow-xs font-bold"
      : "border-transparent text-muted-foreground hover:bg-card hover:text-foreground"
  );
}

/**
 * Format share dialog title for TurnShareButton.
 */
export function getTurnShareTitle(): string {
  return "Sumate al Turno";
}

/**
 * Format CSS classes for TurnShareButton depending on full or icon variant.
 */
export function getTurnShareButtonClasses(
  variant: "full" | "icon" = "full",
  className?: string
): string | undefined {
  if (variant === "full") {
    return "w-full h-12 rounded-lg text-base font-bold";
  }
  return className;
}

/**
 * Format upper-case badge text for salvage callout banner in turn public details.
 */
export function getTurnSalvageBannerBadgeText(): string {
  return "Salvataje de turno";
}

/**
 * Format label for turn time display.
 */
export function getTurnTimeLabel(): string {
  return "Horario";
}

/**
 * Format label for covered player slots in turn public details.
 */
export function getTurnCoveredSlotsLabel(): string {
  return "Cupos cubiertos";
}

/**
 * Format text string for covered player slots in turn public details.
 */
export function getTurnCoveredSlotsText(enrolledCount: number, maxPlayers: number): string {
  return `${enrolledCount} de ${maxPlayers}`;
}

/**
 * Format section title for organizer notes in turn public details.
 */
export function getTurnNotesTitle(): string {
  return "Notas del organizador";
}

/**
 * Format badge text for remaining open slots in enrolled players header.
 */
export function getTurnOpenSlotsBadgeText(openSlots: number): string {
  if (openSlots === 1) return "1 cupo libre";
  return `${openSlots} cupos libres`;
}

/**
 * Format organizer role badge text for creator in enrolled players list.
 */
export function getTurnOrganizerBadgeText(): string {
  return "Organizador";
}

/**
 * Format self role badge text for viewer in substitute list.
 */
export function getTurnYouBadgeText(): string {
  return "Vos";
}

/**
 * Format accessible ARIA label for back button navigation in turn pages.
 */
export function getTurnBackButtonAriaLabel(): string {
  return "Volver";
}

/**
 * Format button text for creating a new turn on turn listing page.
 */
export function getTurnCreateButtonText(): string {
  return "Crear";
}

/**
 * Format duration option label for turn creation/edit form.
 */
export function formatDurationOptionLabel(value: number | string): string {
  return `${value} min`;
}

/**
 * Format max players option label for turn creation/edit form.
 */
export function formatPlayerOptionLabel(value: number | string): string {
  const num = Number(value);
  return `${num} jugador${num === 1 ? "" : "es"}`;
}

/**
 * Format a turn date/time into a compact localized string in Argentine Spanish (e.g. "sáb, 25 jul · 19:00").
 */
export function formatTurnCompactDate(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const turnDateStr = d.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });
  const turnTimeStr = d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });

  return `${turnDateStr} · ${turnTimeStr}`;
}

/**
 * Format button text for editing turn details.
 */
export function getTurnEditButtonText(): string {
  return "Editar";
}

/**
 * Format accessible ARIA label for editing turn details in Argentine Spanish.
 */
export function getTurnEditButtonAriaLabel(club: string): string {
  return `Editar detalles del turno en ${club}`;
}

/**
 * Format CSS classes for turn edit action button.
 */
export function getTurnActionsEditButtonClasses(): string {
  return "flex-1 h-10 rounded-lg font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all shadow-xs";
}

/**
 * Format CSS classes for substitute notice container when no slots are available.
 */
export function getTurnActionsSubstituteNoSlotsClasses(): string {
  return "w-full h-12 rounded-lg flex items-center justify-center bg-muted text-muted-foreground font-bold border border-border shadow-xs text-sm";
}

/**
 * Format CSS classes for completed turn status button in action bar.
 */
export function getTurnActionsCompletedButtonClasses(): string {
  return "w-full h-12 rounded-lg font-bold bg-muted text-muted-foreground border border-border shadow-xs";
}

/**
 * Format CSS classes for already joined status button in action bar.
 */
export function getTurnActionsAlreadyJoinedButtonClasses(): string {
  return "w-full h-12 rounded-lg font-bold bg-muted text-muted-foreground border border-border shadow-xs";
}

/**
 * Format CSS classes for fixed bottom action bar container.
 */
export function getTurnActionsContainerClasses(): string {
  return "fixed bottom-0 left-0 right-0 p-6 pb-safe bg-background border-t border-border z-50 shadow-xs";
}

export interface TurnCancelledHeaderProps {
  title: string;
  description: string;
  buttonLabel: string;
}

/**
 * Format title, description, and button label props for cancelled turn screen.
 */
export function getTurnCancelledHeaderProps(): TurnCancelledHeaderProps {
  return {
    title: getTurnCancelledTitle(),
    description: getTurnCancelledDescription(),
    buttonLabel: getTurnCancelledButtonLabel(),
  };
}

export interface TurnSuggestedContactsHeaderProps {
  title: string;
  subtitle: string;
}

/**
 * Format title and subtitle props for suggested contacts section in turn details.
 */
export function getTurnSuggestedContactsHeaderProps(): TurnSuggestedContactsHeaderProps {
  return {
    title: getTurnSuggestedContactsTitle(),
    subtitle: getTurnSuggestedContactsSubtitle(),
  };
}

/**
 * Format iCal (.ics) download filename.
 */
export function getIcsDownloadFilename(turnId: string): string {
  return `partido-padel-${turnId}.ics`;
}

/**
 * Format search input label text for manual player addition.
 */
export function getAddPlayerInputLabelText(): string {
  return "Buscar jugador por nombre o email";
}

/**
 * Format CSS classes for TurnCard date container badge.
 */
export function getTurnCardDateContainerClasses(): string {
  return "flex flex-col items-center justify-center rounded-lg bg-muted px-2.5 py-1.5 min-w-[56px] h-14";
}

/**
 * Format CSS classes for TurnCard contact players summary label.
 */
export function getTurnCardContactPlayersClasses(): string {
  return "mt-1.5 text-xs text-amber-600 dark:text-amber-500 font-semibold flex items-center gap-1.5 leading-none";
}

/**
 * Format CSS classes for TurnCard open slots badge depending on remaining open slots count.
 */
export function getTurnCardOpenSlotsBadgeClasses(openSlots: number): string {
  return cn(
    openSlots === 1
      ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800 font-bold"
      : "bg-muted text-foreground border-border"
  );
}

/**
 * Format CSS classes for TurnCard quick-join button trigger.
 */
export function getTurnCardQuickJoinButtonClasses(): string {
  return "h-8 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for individual contact WhatsApp invite button.
 */
export function getWhatsAppInviteButtonClasses(): string {
  return "inline-flex h-9 items-center justify-center rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white transition-all hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] gap-1.5 shrink-0 shadow-xs";
}

/**
 * Format CSS classes for WhatsApp group salvage invite button combining variant styles and custom className.
 */
export function getWhatsAppGroupInviteButtonClasses(
  variantStyles: string,
  className?: string
): string {
  return cn(
    "inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] gap-1.5 shrink-0",
    variantStyles,
    className
  );
}

/**
 * Format aria-label for share button in turn public details view.
 */
export function getTurnPublicDetailsShareButtonAriaLabel(
  openSlots?: number,
  club?: string
): string {
  if (openSlots && openSlots > 0 && club) {
    return `Compartir invitación para salvar turno en ${club} (${openSlots} ${
      openSlots === 1 ? "cupo libre" : "cupos libres"
    })`;
  }
  if (club) {
    return `Compartir detalles del turno en ${club}`;
  }
  return "Compartir turno";
}

/**
 * Interface for turn error fallback properties.
 */
export interface TurnErrorFallbackProps {
  regionAriaLabel: string;
  title: string;
  message: string;
  retryAriaLabel: string;
  homeAriaLabel: string;
  homeDestinationLabel: string;
  homeHref: string;
}

/**
 * Format error fallback properties for Turnos and TurnPublic error boundaries.
 */
export function getTurnPublicDetailsErrorFallbackProps(
  section: "los turnos" | "el turno" = "los turnos"
): TurnErrorFallbackProps {
  const isSingle = section === "el turno";
  return {
    regionAriaLabel: `Error al cargar ${section}`,
    title: `No pudimos cargar ${section}`,
    message: isSingle
      ? "Es posible que el turno haya sido eliminado o que haya un problema de conexión."
      : "Ocurrió un problema al obtener los turnos. Podés reintentar o volver al inicio.",
    retryAriaLabel: `Reintentar cargar ${section}`,
    homeAriaLabel: isSingle
      ? "Volver a explorar turnos"
      : "Volver a la página principal",
    homeDestinationLabel: isSingle ? "explorar turnos" : "inicio",
    homeHref: isSingle ? "/turnos" : "/me",
  };
}

/**
 * Interface for empty slot details properties.
 */
export interface TurnEmptySlotProps {
  text: string;
  ariaLabel: string;
  keyPrefix: string;
}

/**
 * Format empty slots properties for turn enrollment list.
 */
export function getTurnPublicDetailsEmptySlotsProps(
  openSlots: number
): TurnEmptySlotProps {
  const text = getEmptySlotText();
  const ariaLabel =
    openSlots === 1
      ? "Cupo libre disponible para unirse"
      : `${openSlots} cupos libres disponibles para unirse`;
  return {
    text,
    ariaLabel,
    keyPrefix: "empty-slot",
  };
}

/**
 * Format CSS classes for turn public details back navigation link.
 */
export function getTurnPublicDetailsHeaderBackLinkClasses(): string {
  return "flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for salvage warning callout banner container.
 */
export function getTurnPublicDetailsBannerContainerClasses(): string {
  return "flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-100 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 shadow-xs";
}

/**
 * Format CSS classes for salvage warning callout share icon button.
 */
export function getTurnPublicDetailsBannerShareButtonClasses(): string {
  return "h-9 w-9 rounded-lg shrink-0 border-amber-300 dark:border-amber-700 bg-amber-200/50 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900";
}

/**
 * Format CSS classes for turn information card container.
 */
export function getTurnPublicDetailsInfoCardClasses(): string {
  return "rounded-xl border border-border bg-card overflow-hidden shadow-xs";
}

/**
 * Format CSS classes for turn information card header bar.
 */
export function getTurnPublicDetailsInfoCardHeaderClasses(): string {
  return "bg-muted border-b border-border px-4 py-3 flex items-center justify-between";
}

/**
 * Format CSS classes for turn information card organizer notes section.
 */
export function getTurnPublicDetailsInfoCardNotesClasses(): string {
  return "p-4 bg-muted border-t border-border text-sm text-muted-foreground italic leading-relaxed";
}

/**
 * Format CSS classes for enrolled player item container in turn public details.
 */
export function getTurnPublicDetailsPlayerItemClasses(): string {
  return "flex items-center gap-3 rounded-xl bg-card px-4 py-3 border border-border transition-all active:scale-[0.98] hover:bg-muted group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Format CSS classes for empty slot item container in turn public details.
 */
export function getTurnPublicDetailsEmptySlotClasses(): string {
  return "flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted px-4 py-3 text-muted-foreground shadow-xs";
}

/**
 * Format CSS classes for suggested contact item container in turn public details.
 */
export function getTurnPublicDetailsSuggestedContactItemClasses(): string {
  return "flex items-center gap-3 rounded-xl bg-card px-4 py-3 border border-border shadow-xs transition-all hover:bg-muted/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background";
}

/**
 * Format CSS classes for substitute player item container in turn public details.
 */
export function getTurnPublicDetailsSubstituteItemClasses(): string {
  return "flex items-center gap-3 rounded-xl bg-card px-4 py-3 border border-border transition-all active:scale-[0.98] hover:bg-muted group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Format share data object for turn public details ShareButton depending on remaining open slots.
 */
export function getTurnShareData({
  club,
  date,
  openSlots,
}: {
  club: string;
  date: Date | string;
  openSlots: number;
}) {
  if (openSlots <= 0) {
    return { type: "turn" as const, club, date: new Date(date) };
  }
  return undefined;
}

/**
 * Format CSS classes for WhatsApp invite button icon.
 */
export function getWhatsAppInviteIconClasses(): string {
  return "h-3.5 w-3.5 fill-current";
}

/**
 * Format CSS classes for TurnsPage outer container layout.
 */
export function getTurnsPageContainerClasses(): string {
  return "flex flex-col gap-6";
}

/**
 * Format CSS classes for TurnsPage header flex bar.
 */
export function getTurnsPageHeaderClasses(): string {
  return "flex items-center justify-between";
}

/**
 * Format CSS classes for TurnsListSkeleton container layout.
 */
export function getTurnsListSkeletonContainerClasses(): string {
  return "flex flex-col gap-3";
}

/**
 * Format CSS classes for TurnsListSkeleton tab filter bar grid.
 */
export function getTurnsListSkeletonTabGridClasses(): string {
  return "grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl";
}

/**
 * Format CSS classes for TurnsListSkeleton count and status header row.
 */
export function getTurnsListSkeletonHeaderClasses(): string {
  return "flex items-center justify-between";
}

/**
 * Format CSS classes for TurnsListSkeleton card listing flex container.
 */
export function getTurnsListSkeletonCardListClasses(): string {
  return "flex flex-col gap-2";
}

/**
 * Format CSS classes for TurnosLoading route loading container.
 */
export function getTurnosLoadingContainerClasses(): string {
  return "flex flex-col gap-6";
}

/**
 * Format CSS classes for EditTurnPage outer container.
 */
export function getTurnEditPageContainerClasses(): string {
  return "flex flex-col gap-6 pb-20";
}

/**
 * Format CSS classes for TurnEditSkeleton container layout.
 */
export function getTurnEditSkeletonContainerClasses(): string {
  return "flex flex-col gap-6";
}

/**
 * Format CSS classes for TurnEditSkeleton header row.
 */
export function getTurnEditSkeletonHeaderClasses(): string {
  return "flex items-center gap-4";
}

/**
 * Format CSS classes for TurnEditSkeleton card layout.
 */
export function getTurnEditSkeletonCardClasses(): string {
  return "rounded-xl border border-border bg-card";
}

/**
 * Format CSS classes for TurnEditSkeleton card header bar.
 */
export function getTurnEditSkeletonCardHeaderClasses(): string {
  return "p-4 border-b border-border";
}

/**
 * Format CSS classes for TurnEditSkeleton card body container.
 */
export function getTurnEditSkeletonCardBodyClasses(): string {
  return "p-6 flex flex-col gap-6";
}

/**
 * Format CSS classes for TurnPublicPage main container.
 */
export function getTurnPublicPageMainClasses(): string {
  return "mx-auto min-h-screen w-full max-w-md flex flex-col gap-6 px-6 py-10 pb-40";
}

/**
 * Format CSS classes for TurnSkeleton outer container layout.
 */
export function getTurnSkeletonContainerClasses(): string {
  return "flex flex-col gap-6";
}

/**
 * Format CSS classes for TurnSkeleton header flex row.
 */
export function getTurnSkeletonHeaderClasses(): string {
  return "flex items-center gap-4";
}

/**
 * Format CSS classes for TurnSkeleton information card container.
 */
export function getTurnSkeletonCardClasses(): string {
  return "rounded-xl border border-border bg-card overflow-hidden";
}

/**
 * Format CSS classes for TurnSkeleton information card header bar.
 */
export function getTurnSkeletonCardHeaderClasses(): string {
  return "bg-muted border-b border-border px-4 py-3";
}

/**
 * Format CSS classes for TurnSkeleton information grid container.
 */
export function getTurnSkeletonGridClasses(): string {
  return "grid grid-cols-1 gap-px bg-border";
}

/**
 * Format CSS classes for TurnSkeleton fixed bottom action bar container.
 */
export function getTurnSkeletonBottomBarClasses(): string {
  return "fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border z-50";
}

/**
 * Format CSS classes for turn public details outer container layout.
 */
export function getTurnPublicDetailsContainerClasses(): string {
  return "flex flex-col gap-6";
}

/**
 * Format CSS classes for turn public details header container layout.
 */
export function getTurnPublicDetailsHeaderContainerClasses(): string {
  return "flex flex-col gap-4";
}

/**
 * Format CSS classes for turn public details info grid layout.
 */
export function getTurnPublicDetailsGridDividerClasses(): string {
  return "grid grid-cols-1 gap-px bg-border";
}

/**
 * Format CSS classes for turn public details time info card item.
 */
export function getTurnPublicDetailsTimeCardClasses(): string {
  return "bg-card p-4 flex flex-col gap-1";
}

/**
 * Format CSS classes for turn public details location info card item.
 */
export function getTurnPublicDetailsLocationCardClasses(): string {
  return "bg-card p-4 flex items-center gap-4 border-t border-border";
}

/**
 * Format CSS classes for turn public details location icon badge container.
 */
export function getTurnPublicDetailsLocationIconBadgeClasses(): string {
  return "flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary shrink-0";
}

/**
 * Format CSS classes for turn public details slots progress card item.
 */
export function getTurnPublicDetailsSlotsProgressCardClasses(): string {
  return "bg-card p-4 border-t border-border flex flex-col gap-2";
}

/**
 * Format CSS classes for turn public details add to calendar card container.
 */
export function getTurnPublicDetailsCalendarContainerClasses(): string {
  return "p-4 border-t border-border bg-card";
}

/**
 * Format CSS classes for turn public details enrolled players section layout.
 */
export function getTurnPublicDetailsEnrolledSectionClasses(): string {
  return "space-y-4";
}

/**
 * Format CSS classes for turn public details enrolled players section header.
 */
export function getTurnPublicDetailsEnrolledHeaderClasses(): string {
  return "flex items-center justify-between";
}

/**
 * Format CSS classes for turn public details suggested contacts section layout.
 */
export function getTurnPublicDetailsSuggestedSectionClasses(): string {
  return "space-y-4";
}

/**
 * Format CSS classes for turn public details suggested contacts section header.
 */
export function getTurnPublicDetailsSuggestedHeaderClasses(): string {
  return "flex items-center justify-between";
}

/**
 * Format CSS classes for remove player region wrapper in organizer actions.
 */
export function getRemovePlayerRegionContainerClasses(): string {
  return "inline-flex items-center";
}

/**
 * Format CSS classes for remove player confirm region wrapper in organizer actions.
 */
export function getRemovePlayerConfirmRegionClasses(): string {
  return "inline-flex items-center gap-1.5 focus-visible:outline-none";
}

/**
 * Format CSS classes for assign substitute region wrapper in organizer actions.
 */
export function getAssignSubstituteRegionContainerClasses(): string {
  return "inline-flex items-center";
}

/**
 * Format CSS classes for turn filter section container.
 */
export function getTurnFilterContainerClasses(): string {
  return "flex flex-col gap-4";
}

/**
 * Format CSS classes for turn filter radiogroup container.
 */
export function getTurnFilterRadiogroupClasses(): string {
  return "grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl shadow-xs border border-border";
}

/**
 * Format CSS classes for turn filter header container.
 */
export function getTurnFilterHeaderContainerClasses(): string {
  return "flex items-center justify-between";
}

/**
 * Format CSS classes for turn filter header title.
 */
export function getTurnFilterHeaderTitleClasses(): string {
  return "text-sm font-bold text-foreground";
}

/**
 * Format CSS classes for turn filter badge.
 */
export function getTurnFilterBadgeClasses(): string {
  return "rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground";
}

/**
 * Format CSS classes for turn filter primary action button in empty state.
 */
export function getTurnFilterPrimaryButtonClasses(): string {
  return "w-full h-12 rounded-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all";
}

/**
 * Format CSS classes for turn filter outline action button in empty state.
 */
export function getTurnFilterOutlineButtonClasses(): string {
  return "w-full h-12 rounded-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all";
}

/**
 * Format CSS classes for add-to-calendar trigger button.
 */
export function getCalendarTriggerButtonClasses(open: boolean): string {
  return cn(
    "w-full h-10 font-bold active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    open && "border-primary text-primary bg-muted"
  );
}

/**
 * Format CSS classes for add-to-calendar options container.
 */
export function getCalendarOptionsContainerClasses(): string {
  return "mt-2 p-3 bg-muted border border-border rounded-lg flex flex-col gap-2 transition-all duration-150 shadow-xs";
}

/**
 * Format CSS classes for add-to-calendar option button.
 */
export function getCalendarOptionButtonClasses(): string {
  return "h-9 font-bold bg-card border border-border hover:bg-muted active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Format CSS classes for share button in leave turn full slot card.
 */
export function getLeaveTurnWasFullShareButtonClasses(): string {
  return "w-full h-10 rounded-lg text-xs font-bold focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all";
}

/**
 * Format CSS classes for turn card action row container.
 */
export function getTurnCardActionsContainerClasses(): string {
  return "relative z-10 flex items-stretch gap-2";
}

/**
 * Format CSS classes for turn card header flex layout.
 */
export function getTurnCardHeaderContainerClasses(): string {
  return "flex items-center gap-3";
}

/**
 * Format CSS classes for turn card content flex item.
 */
export function getTurnCardContentContainerClasses(): string {
  return "flex-1 overflow-hidden";
}

/**
 * Format CSS classes for turn card club title container.
 */
export function getTurnCardTitleContainerClasses(): string {
  return "flex items-center gap-2";
}

/**
 * Format CSS classes for turn card club title text.
 */
export function getTurnCardClubTitleClasses(): string {
  return "truncate text-sm font-semibold text-foreground";
}

/**
 * Format CSS classes for turn card metadata row container.
 */
export function getTurnCardMetaContainerClasses(): string {
  return "mt-1 flex items-center gap-3 text-xs text-muted-foreground";
}

/**
 * Format CSS classes for turn card metadata item flex container.
 */
export function getTurnCardMetaItemClasses(): string {
  return "flex items-center gap-1";
}

/**
 * Format CSS classes for turn card substitutes count text.
 */
export function getTurnCardSubstitutesTextClasses(): string {
  return "text-muted-foreground/70";
}

/**
 * Format CSS classes for turn card contact player dot badge.
 */
export function getTurnCardContactDotClasses(): string {
  return "h-1.5 w-1.5 rounded-full bg-primary shrink-0";
}

/**
 * Format CSS classes for turn card status badge container.
 */
export function getTurnCardStatusBadgeContainerClasses(): string {
  return "shrink-0";
}

/**
 * Format CSS classes for turn card open-to-network salvage button wrapper.
 */
export function getTurnCardSalvageWrapperClasses(): string {
  return "flex-1";
}

/**
 * Format CSS classes for turn card share button wrapper.
 */
export function getTurnCardShareButtonClasses(): string {
  return "flex-1";
}

/**
 * Format CSS classes for turn form outer container layout.
 */
export function getTurnFormContainerClasses(): string {
  return "flex flex-col gap-6";
}

/**
 * Format CSS classes for turn form header back link.
 */
export function getTurnFormHeaderBackLinkClasses(): string {
  return "flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for turn form header title.
 */
export function getTurnFormHeaderTitleClasses(): string {
  return "text-xl font-bold text-foreground";
}

/**
 * Format CSS classes for turn form header description.
 */
export function getTurnFormHeaderDescriptionClasses(): string {
  return "text-sm text-muted-foreground";
}

/**
 * Format CSS classes for turn form card container.
 */
export function getTurnFormCardClasses(): string {
  return "rounded-xl border border-border bg-card shadow-xs";
}

/**
 * Format CSS classes for turn form card header bar.
 */
export function getTurnFormCardHeaderClasses(): string {
  return "p-4 border-b border-border";
}

/**
 * Format CSS classes for turn form card header title.
 */
export function getTurnFormCardHeaderTitleClasses(): string {
  return "text-sm font-bold text-foreground";
}

/**
 * Format CSS classes for turn form card body content container.
 */
export function getTurnFormCardContentClasses(): string {
  return "p-6 flex flex-col gap-6";
}

/**
 * Format CSS classes for turn form input group container.
 */
export function getTurnFormGroupClasses(): string {
  return "flex flex-col gap-1.5";
}

/**
 * Format CSS classes for turn form label element.
 */
export function getTurnFormLabelClasses(): string {
  return "text-sm font-semibold text-foreground";
}

/**
 * Format CSS classes for duration selection radio option button depending on selection state.
 */
export function getTurnFormDurationRadioClasses(isSelected: boolean): string {
  return cn(
    "flex h-12 items-center justify-center rounded-lg border text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    isSelected
      ? "bg-primary border-primary text-primary-foreground shadow-sm font-semibold"
      : "bg-card border-border text-muted-foreground hover:bg-muted"
  );
}

/**
 * Format CSS classes for max players selection radio option button depending on selection state.
 */
export function getTurnFormPlayerRadioClasses(isSelected: boolean): string {
  return cn(
    "flex h-12 items-center justify-between px-3 rounded-lg border text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    isSelected
      ? "bg-primary border-primary text-primary-foreground shadow-sm font-semibold"
      : "bg-card border-border text-muted-foreground hover:bg-muted"
  );
}

/**
 * Format CSS classes for notes textarea element in turn creation and edit forms.
 */
export function getTurnFormTextareaClasses(): string {
  return "min-h-[100px] rounded-lg resize-none";
}

/**
 * Format CSS classes for submit action button in turn creation and edit forms.
 */
export function getTurnFormSubmitButtonClasses(): string {
  return "w-full h-12 rounded-lg font-bold text-base shadow-xs transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Format CSS classes for OpenToNetworkButton icon result state container.
 */
export function getOpenToNetworkIconResultClasses(className?: string): string {
  return cn("flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs", className);
}

/**
 * Format CSS classes for OpenToNetworkButton compact result state container.
 */
export function getOpenToNetworkCompactResultClasses(className?: string): string {
  return cn(
    "flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-100 px-3 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 shadow-xs",
    className
  );
}

/**
 * Format CSS classes for OpenToNetworkButton default result state container.
 */
export function getOpenToNetworkDefaultResultClasses(className?: string): string {
  return cn("w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm shadow-xs", className);
}

/**
 * Format CSS classes for OpenToNetworkButton outer region container.
 */
export function getOpenToNetworkContainerClasses(
  showText?: boolean,
  isIconOnly?: boolean
): string {
  return cn("flex flex-col gap-2", !showText && "gap-0", isIconOnly && "gap-0");
}

export interface OpenToNetworkButtonClassesOptions {
  isIconOnly?: boolean;
  variant?: string;
  isOnCooldown?: boolean;
  className?: string;
}

/**
 * Format CSS classes for OpenToNetworkButton interactive button.
 */
export function getOpenToNetworkButtonClasses({
  isIconOnly = false,
  variant = "default",
  isOnCooldown = false,
  className,
}: OpenToNetworkButtonClassesOptions = {}): string {
  return cn(
    !isIconOnly && "w-full",
    variant === "default" && !isOnCooldown && "font-bold",
    isOnCooldown && "text-muted-foreground border-border bg-muted cursor-not-allowed",
    "transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    className
  );
}

/**
 * Format CSS classes for AddPlayerButton trigger button in closed state.
 */
export function getAddPlayerTriggerButtonClasses(): string {
  return "flex items-center gap-3 rounded-xl border border-dashed border-border bg-card px-4 py-3 text-foreground transition-all hover:bg-muted w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] shadow-xs";
}

/**
 * Format CSS classes for AddPlayerButton trigger icon badge container in closed state.
 */
export function getAddPlayerTriggerIconBadgeClasses(): string {
  return "flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary border border-border shadow-xs";
}

/**
 * Format CSS classes for AddPlayerButton expanded container card.
 */
export function getAddPlayerCardContainerClasses(): string {
  return "rounded-xl border border-border bg-card overflow-hidden shadow-xs";
}

/**
 * Format CSS classes for AddPlayerButton search header container.
 */
export function getAddPlayerSearchHeaderClasses(): string {
  return "flex items-center gap-2 p-3 border-b border-border";
}

/**
 * Format CSS classes for AddPlayerButton search input element.
 */
export function getAddPlayerSearchInputClasses(): string {
  return "h-10 w-full pl-9 pr-9 rounded-lg bg-background border border-border text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Format CSS classes for AddPlayerButton clear search button.
 */
export function getAddPlayerSearchClearButtonClasses(): string {
  return "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded active:scale-[0.95]";
}

/**
 * Format CSS classes for AddPlayerButton cancel/close search button.
 */
export function getAddPlayerSearchCancelButtonClasses(): string {
  return "rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for AddPlayerButton search result item button.
 */
export function getAddPlayerSearchResultItemClasses(): string {
  return "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted active:scale-[0.98] transition-all text-left disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Format CSS classes for leave turn trigger button.
 */
export function getLeaveTurnTriggerButtonClasses(): string {
  return "w-full h-10 rounded-lg text-xs font-bold text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all";
}

/**
 * Format CSS classes for late leave penalty warning card in leave turn view.
 */
export function getLeaveTurnLateLeaveCardClasses(): string {
  return "rounded-lg border border-destructive bg-card p-3 flex flex-col gap-1.5 text-left shadow-xs";
}

/**
 * Format CSS classes for full turn share prompt card in leave turn view.
 */
export function getLeaveTurnWasFullCardClasses(): string {
  return "rounded-lg border border-border bg-card p-3 flex flex-col gap-2 shadow-xs";
}

/**
 * Format CSS classes for leave turn cancel button.
 */
export function getLeaveTurnCancelButtonClasses(): string {
  return "flex-1 h-10 rounded-lg text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all";
}

/**
 * Format CSS classes for leave turn confirm button.
 */
export function getLeaveTurnConfirmButtonClasses(): string {
  return "flex-1 h-10 rounded-lg text-xs font-bold text-destructive bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all shadow-xs";
}

/**
 * Format CSS classes for remove player trigger button.
 */
export function getRemovePlayerTriggerButtonClasses(): string {
  return "rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted border border-transparent hover:border-border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] shadow-xs";
}

/**
 * Format CSS classes for remove player confirm button.
 */
export function getRemovePlayerConfirmButtonClasses(): string {
  return "rounded-md px-2 py-1 text-xs font-bold text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] flex items-center gap-1 shadow-xs";
}

/**
 * Format CSS classes for remove player dismiss button.
 */
export function getRemovePlayerDismissButtonClasses(): string {
  return "rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for assign substitute button.
 */
export function getAssignSubstituteButtonClasses(): string {
  return "rounded-md px-2.5 py-1 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] shadow-xs";
}

/**
 * Format CSS classes for cancel turn trigger button.
 */
export function getCancelTurnTriggerButtonClasses(): string {
  return "w-full h-10 rounded-lg text-xs font-bold text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for cancel turn confirmation region container.
 */
export function getCancelTurnConfirmContainerClasses(): string {
  return "flex-1 flex items-center gap-1.5 focus-visible:outline-none";
}

/**
 * Format CSS classes for cancel turn dismiss button.
 */
export function getCancelTurnDismissButtonClasses(): string {
  return "h-10 px-2 rounded-lg text-xs font-bold text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for cancel turn confirm button.
 */
export function getCancelTurnConfirmButtonClasses(): string {
  return "flex-1 h-10 rounded-lg text-xs font-bold text-destructive border border-destructive/20 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for start match button.
 */
export function getStartMatchButtonClasses(): string {
  return "w-full h-12 rounded-lg text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for join turn button.
 */
export function getJoinTurnButtonClasses(): string {
  return "w-full h-12 rounded-lg text-base font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for join substitute button.
 */
export function getJoinSubstituteButtonClasses(): string {
  return "w-full h-12 rounded-lg text-base font-bold border-primary text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for leave substitute trigger button.
 */
export function getLeaveSubstituteTriggerButtonClasses(): string {
  return "w-full h-10 rounded-lg text-xs font-bold text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for take open slot button.
 */
export function getTakeOpenSlotButtonClasses(): string {
  return "w-full h-12 rounded-lg text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for schedule next turn button.
 */
export function getScheduleNextTurnButtonClasses(): string {
  return "w-full h-10 rounded-lg text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for play casual trigger button.
 */
export function getPlayCasualTriggerButtonClasses(): string {
  return "w-full h-12 rounded-lg text-base font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for play casual confirmation container.
 */
export function getPlayCasualConfirmContainerClasses(): string {
  return "flex flex-col gap-2 rounded-lg border border-border bg-card shadow-xs p-3 focus-visible:outline-none";
}

/**
 * Format CSS classes for play casual cancel button.
 */
export function getPlayCasualCancelButtonClasses(): string {
  return "flex-1 h-10 rounded-lg text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for play casual confirm button.
 */
export function getPlayCasualConfirmButtonClasses(): string {
  return "flex-1 h-10 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Format CSS classes for quick join empty slot button in turn actions.
 */
export function getQuickJoinEmptySlotButtonClasses(): string {
  return "h-8 px-3 rounded-lg text-xs font-bold border-primary text-primary hover:bg-primary/10 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Format custom share text for turn public details ShareButton when open slots exist.
 */
export function getTurnShareText({
  club,
  date,
  openSlots,
}: {
  club: string;
  date: Date | string;
  openSlots: number;
}): string | undefined {
  if (openSlots > 0) {
    return getTurnSalvageShareMessage({ club, date, openSlots });
  }
  return undefined;
}
