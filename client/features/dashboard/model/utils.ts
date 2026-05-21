import { formatRelativeTime } from "@/lib/date-utils";
import { LeaderboardLikeEntry, TransformedLeaderboardEntry } from "@/features/dashboard/types";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)
}

export function timeAgo(dateStr: string) {
  return formatRelativeTime(dateStr);
}

export function transformLeaderboard(leaderboard: LeaderboardLikeEntry[]): TransformedLeaderboardEntry[] {
  return leaderboard.map((entry, index) => ({
    id: entry.userId || entry.id || "",
    rank: entry.rank ?? index + 1,
    xp: entry.totalXp ?? entry.score ?? entry.xp ?? 0,
    points: entry.totalPoints ?? 0,
    username: entry.user?.username || entry.username || "Unknown",
    firstName: entry.user?.userDetails?.firstName || entry.firstName || "",
    lastName: entry.user?.userDetails?.lastName || entry.lastName || "",
    avatar: entry.user?.userDetails?.avatar || entry.avatar || "",
  }));
}
