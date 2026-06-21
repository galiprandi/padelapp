import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
