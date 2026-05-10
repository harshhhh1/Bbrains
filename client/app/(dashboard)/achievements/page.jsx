"use client";

import { useAchievements } from "@/features/achievements/model/use-achievements";
import { AchievementCard } from "@/features/achievements/ui/achievement-card";
import { AchievementsEmptyState } from "@/features/achievements/ui/achievements-empty-state";
import { AchievementsLoadingState } from "@/features/achievements/ui/achievements-loading-state";

export default function AchievementsPage() {
  const { achievements, loading, userLoading, user } = useAchievements();

  if (loading || userLoading) {
    return <AchievementsLoadingState />;
  }

  if (achievements.length === 0) {
    return <AchievementsEmptyState />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          My Achievements
        </h1>
        <p className="text-muted-foreground">
          View the milestones you&apos;ve unlocked on your learning journey.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {achievements.map((item) => (
          <AchievementCard key={item.achievement.id} item={item} />
        ))}
      </div>
    </div>
  );
}
