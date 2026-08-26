import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Capitalize each word of a name: "diego morales" → "Diego Morales".
 *  Trims leading/trailing whitespace and collapses multiple spaces. */
export function capitalizeName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Buenas noches";
  if (hour < 12) return "Buen día";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

/**
 * Determines whether a navigation link is currently active based on the pathname.
 * Handles exact matching for dashboard root ("/me"), special profile subroutes ("/me/profile", "/me/security"),
 * and standard prefix matching for section roots like "/turnos" or "/ranking".
 */
export function isNavItemActive(itemHref: string, pathname: string | null): boolean {
  if (!pathname) return false;

  // Exact match always takes precedence
  if (pathname === itemHref) return true;

  // Dashboard home tab ("/me") should only match exact "/me"
  // so sub-routes like "/me/profile" or "/me/security" don't double-highlight "Inicio"
  if (itemHref === "/me") {
    return false;
  }

  // Profile tab (" /me/profile ") should also match "/me/security" and sub-paths of profile
  if (itemHref === "/me/profile") {
    return (
      pathname.startsWith("/me/profile/") ||
      pathname === "/me/security" ||
      pathname.startsWith("/me/security/")
    );
  }

  // Generic prefix matching for other routes (e.g., "/turnos/nuevo" matches "/turnos", "/ranking/..." matches "/ranking")
  if (itemHref !== "/") {
    return pathname.startsWith(itemHref + "/");
  }

  return false;
}

/** Map player category level integer (1-8) to Argentine Padel category label: 1 -> "1ª Cat.", 6 -> "6ª Cat.", etc. Defaults to "6ª Cat.". */
export function getLevelBadgeLabel(level?: number | null): string {
  if (!level || level < 1 || level > 8) return "6ª Cat.";
  return `${level}ª Cat.`;
}

export function calculateWinRate(wins: number, matchesPlayed: number): number {
  if (!matchesPlayed || matchesPlayed === 0) return 0;
  return Math.round((wins / matchesPlayed) * 100);
}

export function getMatchWinner(score: string | null): "A" | "B" | null {
  if (!score) return null;

  const sets = score.split(",").map((s) => s.trim());
  let winsA = 0;
  let winsB = 0;

  for (const set of sets) {
    const match = set.match(/(\d+)[^\d]+(\d+)/);
    if (match) {
      const scoreA = parseInt(match[1], 10);
      const scoreB = parseInt(match[2], 10);
      if (scoreA > scoreB) winsA++;
      else if (scoreB > scoreA) winsB++;
    }
  }

  if (winsA > winsB) return "A";
  if (winsB > winsA) return "B";
  return null;
}

export function getTurnLabel(club: string, date: Date | string): string {
  const d = new Date(date);
  const hour = d.getHours();
  const minutes = d.getMinutes();
  const timeStr = minutes === 0 ? `${hour}hs` : `${hour}:${minutes.toString().padStart(2, "0")}hs`;
  return `${club} · ${timeStr}`;
}

export function getTurnLabelWithDate(club: string, date: Date | string): string {
  const d = new Date(date);
  const hour = d.getHours();
  const minutes = d.getMinutes();
  const timeStr = minutes === 0 ? `${hour}hs` : `${hour}:${minutes.toString().padStart(2, "0")}hs`;

  let dayStr = "";
  if (isToday(d)) {
    dayStr = "hoy";
  } else if (isTomorrow(d)) {
    dayStr = "mañana";
  } else {
    const weekday = d.toLocaleDateString("es-AR", { weekday: "long" });
    const dayNumeric = d.getDate();
    const monthNumeric = d.getMonth() + 1;
    dayStr = `${weekday} ${dayNumeric}/${monthNumeric}`;
  }

  return `${club} · ${dayStr} ${timeStr}`;
}

/** Calendar event title: "Pádel · Club · hora" (matches getTurnLabel format). */
export function getCalendarTitle(club: string, date: Date | string): string {
  return `Pádel · ${getTurnLabel(club, date)}`;
}

export interface ShareDataPayload {
  type: "turn" | "match-invite" | "match-result";
  club: string;
  date: Date | string;
  score?: string | null;
}

export function getNaturalShareText({
  type,
  club,
  date,
  score,
}: ShareDataPayload): string {
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
  const timeStr = minutes === 0 ? `${hour}hs` : `${hour}:${minutes.toString().padStart(2, "0")}hs`;

  if (type === "turn") {
    return `Turno de pádel en ${club} ${dayStr} ${timeStr}`;
  }

  if (type === "match-invite") {
    return `Partido de pádel en ${club} ${dayStr} ${timeStr}`;
  }

  if (type === "match-result") {
    const scoreStr = score ? `: ${score}` : "";
    return `Mirá el marcador de nuestro partido de pádel${scoreStr}`;
  }

  return "";
}
