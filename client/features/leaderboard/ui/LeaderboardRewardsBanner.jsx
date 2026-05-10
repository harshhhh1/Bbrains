"use client";

import { useState, useEffect } from "react";
import { Trophy, Zap, Coins, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function getRankEmoji(rank) {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return `#${rank}`;
  }
}

function getRankColor(rank) {
  switch (rank) {
    case 1:
      return "text-yellow-500";
    case 2:
      return "text-slate-400";
    case 3:
      return "text-amber-600";
    default:
      return "text-muted-foreground";
  }
}

function getTimeRemaining(periodEndsAt) {
  const end = new Date(periodEndsAt);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Period ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

export function LeaderboardRewardsBanner({
  category,
  rewards,
  topUsers,
  periodEndsAt,
  currentUserId,
}) {
  const [timeRemaining, setTimeRemaining] = useState(
    getTimeRemaining(periodEndsAt),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(periodEndsAt));
    }, 60000);
    return () => clearInterval(interval);
  }, [periodEndsAt]);

  const currentUserInTop = topUsers.some((u) => u.userId === currentUserId);
  const currentUserEntry = topUsers.find((u) => u.userId === currentUserId);
  const currentUserReward = currentUserEntry
    ? rewards.find((r) => r.rank === currentUserEntry.rank)
    : null;

  const isPeriodEnded = new Date(periodEndsAt) < new Date();

  return (
    <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">
              {category === "weekly" ? "Weekly" : "Monthly"} Leaderboard Rewards
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          >
            <Clock className="h-3 w-3" />
            {timeRemaining}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {rewards.map((reward) => (
            <div
              key={reward.rank}
              className={`flex items-center gap-3 rounded-lg border bg-background/50 p-3 ${
                reward.rank === 1
                  ? "border-yellow-300 dark:border-yellow-700"
                  : ""
              }`}
            >
              <span className="text-2xl">{getRankEmoji(reward.rank)}</span>
              <div className="flex-1">
                <p className={`text-sm font-bold ${getRankColor(reward.rank)}`}>
                  {reward.rank === 1
                    ? "1st"
                    : reward.rank === 2
                      ? "2nd"
                      : "3rd"}{" "}
                  Place
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Zap className="h-3 w-3" />
                    {reward.xp.toLocaleString()} XP
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <Coins className="h-3 w-3" />
                    {reward.coins.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {currentUserInTop && currentUserReward && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 dark:bg-primary/10">
            <p className="text-sm font-medium">
              <span className="text-primary">Your Position:</span>{" "}
              {getRankEmoji(currentUserEntry.rank)}{" "}
              {currentUserEntry.rank === 1
                ? "1st"
                : currentUserEntry.rank === 2
                  ? "2nd"
                  : "3rd"}{" "}
              Place
              {!isPeriodEnded && (
                <>
                  {" "}
                  <span className="text-muted-foreground">
                    (Potential reward: {currentUserReward.xp} XP +{" "}
                    {currentUserReward.coins} coins)
                  </span>
                </>
              )}
            </p>
          </div>
        )}

        {!currentUserInTop && !isPeriodEnded && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Keep climbing the ranks to win rewards at the end of this period!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function LeaderboardRewardsBannerSkeleton() {
  return (
    <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-6 w-28" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
