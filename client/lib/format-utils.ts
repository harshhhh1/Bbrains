/**
 * Formats a number as currency (defaults to INR)
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency = "INR",
  options: Intl.NumberFormatOptions = {}
): string {
  const value = Number(amount || 0);
  
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      ...options,
    }).format(value);
  } catch (error) {
    // Fallback if currency code is invalid or formatting fails
    return `${currency} ${value.toLocaleString("en-IN")}`;
  }
}

/**
 * Extracts initials from a name, display name, or username
 */
export function getInitials(
  name?: string | null,
  fallback = "U"
): string {
  if (!name) return fallback;

  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return fallback;

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const first = parts[0][0] || "";
  const last = parts[parts.length - 1][0] || "";
  return (first + last).toUpperCase();
}

/**
 * Converts a string to Title Case (e.g., "hello-world" -> "Hello World")
 */
export function toTitleCase(value: string): string {
  if (!value) return "";
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Returns the ordinal suffix for a rank (1 -> "st", 2 -> "nd", etc.)
 */
export function getRankSuffix(rank: number): string {
  if (rank >= 11 && rank <= 13) return "th";
  switch (rank % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

/**
 * Formats a rank with its suffix (1 -> "1st")
 */
export function formatRank(rank: number): string {
  return `${rank}${getRankSuffix(rank)}`;
}
