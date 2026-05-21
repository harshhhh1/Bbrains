"use client"

import { useAchievements } from "@/features/achievements/model/use-achievements"
import { AchievementCard } from "@/features/achievements/ui/achievement-card"
import { AchievementsEmptyState } from "@/features/achievements/ui/achievements-empty-state"
import { AchievementsLoadingState } from "@/features/achievements/ui/achievements-loading-state"
import { DashboardGrid, PageContainer, PageHeader } from "@/components/layout/page-primitives"

export default function AchievementsPage() {
  const { achievements, loading, userLoading } = useAchievements()

  if (loading || userLoading) {
    return <AchievementsLoadingState />
  }

  if (achievements.length === 0) {
    return <AchievementsEmptyState />
  }

  return (
    <PageContainer>
      <PageHeader
        title="My Achievements"
        description="View the milestones you've unlocked on your learning journey."
      />

      <DashboardGrid className="lg:grid-cols-3 xl:grid-cols-4">
        {achievements.map((item) => (
          <AchievementCard key={item.achievement.id} item={item} />
        ))}
      </DashboardGrid>
    </PageContainer>
  )
}
