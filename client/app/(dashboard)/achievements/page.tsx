"use client"

import { useAchievements } from "./hooks/use-achievements"
import { AchievementCard } from "./components/achievement-card"
import { AchievementsEmptyState } from "./components/achievements-empty-state"
import { AchievementsLoadingState } from "./components/achievements-loading-state"
import { UnauthenticatedState } from "./components/unauthenticated-state"

export default function AchievementsPage() {
  const { achievements, loading, userLoading, user } = useAchievements()

  if (loading || userLoading) {
    return <AchievementsLoadingState />
  }

  if (!user) {
    return <UnauthenticatedState />
  }

  if (achievements.length === 0) {
    return <AchievementsEmptyState />
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
  )
}
