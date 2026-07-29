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
  if (hour < 6) return "¡Buenas noches!";
  if (hour < 12) return "¡Buen día!";
  if (hour < 19) return "¡Buenas tardes!";
  return "¡Buenas noches!";
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
  const day = d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });
  const time = d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${club} · ${day} ${time}hs`;
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
    return `Turno de pádel disponible en ${club} ${dayStr} ${timeStr}`;
  }

  if (type === "match-invite") {
    return `Partido de pádel disponible en ${club} ${dayStr} ${timeStr}`;
  }

  if (type === "match-result") {
    const scoreStr = score ? ` Marcador: ${score}` : "";
    return `¡Mirá el resultado de nuestro partido de pádel!${scoreStr}`;
  }

  return "";
}
