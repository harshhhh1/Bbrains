import { formatDistanceToNow, isToday, isYesterday, format as formatDateFns } from "date-fns";

/**
 * Formats a date as a relative time string (e.g., "Just now", "2 minutes ago", "Yesterday")
 */
export function formatRelativeTime(date: string | Date | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unknown time";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  // If less than a minute, return "Just now"
  if (diffInSeconds < 60) {
    return "Just now";
  }

  // If yesterday, return "Yesterday"
  if (isYesterday(d)) {
    return "Yesterday";
  }

  // If today but more than a minute ago, use formatDistanceToNow
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Returns a label like "Today", "Yesterday", or a formatted date
 */
export function getDateLabel(date: string | Date | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unknown date";

  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";

  return formatDateFns(d, "MMMM d, yyyy");
}

/**
 * Formats a date with time (e.g., "Today, 02:30 PM" or "Jan 21, 2026 • 02:30 PM")
 */
export function formatDateTime(date: string | Date | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unknown date";

  const timeStr = formatDateFns(d, "hh:mm a");

  if (isToday(d)) return `Today, ${timeStr}`;
  if (isYesterday(d)) return `Yesterday, ${timeStr}`;

  return `${formatDateFns(d, "MMM dd, yyyy")} • ${timeStr}`;
}
