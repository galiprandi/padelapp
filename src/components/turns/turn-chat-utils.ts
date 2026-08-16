/**
 * Localized chat message timestamp formatting helper.
 * Formats:
 * - Today: "19:30"
 * - Yesterday: "Ayer, 19:30"
 * - Older: "D/M, 19:30"
 */
export function formatChatTime(ts: number, baseDate?: Date): string {
  const d = new Date(ts * 1000);
  const now = baseDate || new Date();

  const hour = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const timeStr = `${hour}:${minutes}`;

  // Check if today
  const isTodayDate =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isTodayDate) {
    return timeStr;
  }

  // Check if yesterday
  const yesterday = new Date(now.getTime());
  yesterday.setDate(now.getDate() - 1);
  const isYesterdayDate =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterdayDate) {
    return `Ayer, ${timeStr}`;
  }

  // Older: show day and month
  const day = d.getDate();
  const month = d.getMonth() + 1;
  return `${day}/${month}, ${timeStr}`;
}
