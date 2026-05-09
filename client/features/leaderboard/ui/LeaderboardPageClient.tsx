"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeaderboardEntryRow, TopThreePodium } from "@/features/leaderboard/ui/LeaderboardEntry"
import { useLeaderboard } from "@/features/leaderboard/model/use-leaderboard"
import { LeaderboardRewardsBanner, LeaderboardRewardsBannerSkeleton } from "@/features/leaderboard/ui/LeaderboardRewardsBanner"
import { api } from "@/services/api/base"
import { useUser } from "@/hooks/use-user"
import type { LeaderboardCategory, LeaderboardSort, RewardTier, LeaderboardEntry, LeaderboardRewardPreview } from "@/lib/types/api"

const CATEGORIES: { value: LeaderboardCategory; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "allTime", label: "All Time" },
  { value: "course", label: "Course" },
]

const DEFAULT_WEEKLY_REWARDS: RewardTier[] = [
  { rank: 1, xp: 500, coins: 300 },
  { rank: 2, xp: 300, coins: 200 },
  { rank: 3, xp: 200, coins: 100 },
]

const DEFAULT_MONTHLY_REWARDS: RewardTier[] = [
  { rank: 1, xp: 2000, coins: 1500 },
  { rank: 2, xp: 1200, coins: 900 },
  { rank: 3, xp: 800, coins: 500 },
]

export default function LeaderboardPage() {
  const [category, setCategory] = useState<LeaderboardCategory>("allTime")
  const [sortBy, setSortBy] = useState<LeaderboardSort>("xp")
  const [rewardPreview, setRewardPreview] = useState<LeaderboardRewardPreview | null>(null)
  const [loadingRewards, setLoadingRewards] = useState(false)
  
  const { entries, myPosition, loading, currentUserId } = useLeaderboard({ category, sortBy })
  const { user } = useUser()

  useEffect(() => {
    if (category === "weekly" || category === "monthly") {
      fetchRewardPreview(category)
    } else {
      setRewardPreview(null)
    }
  }, [category])

  const fetchRewardPreview = async (cat: LeaderboardCategory) => {
    setLoadingRewards(true)
    try {
      const configKey = cat === "weekly" ? "leaderboard_weekly_rewards" : "leaderboard_monthly_rewards"
      const response = await api.get<any>(`/config/${configKey}`)
      
      if (response.success && response.data) {
        let rewards: RewardTier[]
        try {
          rewards = JSON.parse(response.data.value)
        } catch {
          rewards = cat === "weekly" ? DEFAULT_WEEKLY_REWARDS : DEFAULT_MONTHLY_REWARDS
        }

        setRewardPreview({
          category: cat as 'weekly' | 'monthly',
          rewards,
          topUsers: entries.slice(0, 3),
          periodEndsAt: getPeriodEndDate(cat),
        })
      }
    } catch (error) {
      console.error("Failed to fetch reward preview:", error)
      setRewardPreview({
        category: cat as 'weekly' | 'monthly',
        rewards: cat === "weekly" ? DEFAULT_WEEKLY_REWARDS : DEFAULT_MONTHLY_REWARDS,
        topUsers: entries.slice(0, 3),
        periodEndsAt: getPeriodEndDate(cat),
      })
    } finally {
      setLoadingRewards(false)
    }
  }

  const getPeriodEndDate = (cat: LeaderboardCategory): string => {
    const now = new Date()
    if (cat === "weekly") {
      const daysUntilSunday = 7 - now.getDay()
      const periodEnd = new Date(now)
      periodEnd.setDate(now.getDate() + (daysUntilSunday === 7 ? 0 : daysUntilSunday))
      periodEnd.setHours(23, 59, 59, 999)
      return periodEnd.toISOString()
    } else {
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      lastDayOfMonth.setHours(23, 59, 59, 999)
      return lastDayOfMonth.toISOString()
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl md:p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">
          See how you rank against other learners
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={category} onValueChange={(v) => setCategory(v as LeaderboardCategory)}>
          <TabsList>
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex rounded-lg border p-1">
          <button
            onClick={() => setSortBy("xp")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              sortBy === "xp" 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            XP
          </button>
          <button
            onClick={() => setSortBy("points")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              sortBy === "points" 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Points
          </button>
        </div>
      </div>

      {loadingRewards ? (
        <LeaderboardRewardsBannerSkeleton />
      ) : rewardPreview && (category === "weekly" || category === "monthly") ? (
        <LeaderboardRewardsBanner
          category={category}
          rewards={rewardPreview.rewards}
          topUsers={entries.slice(0, 3)}
          periodEndsAt={rewardPreview.periodEndsAt}
          currentUserId={user?.id}
        />
      ) : null}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading leaderboard...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-lg border">
          <p className="text-muted-foreground">No rankings yet for this category</p>
        </div>
      ) : (
        <>
          {entries.length >= 3 && (
            <TopThreePodium 
              entries={entries} 
              currentUserId={currentUserId} 
              sortBy={sortBy} 
            />
          )}

          <div className="space-y-2">
            {entries.map((entry) => (
              <LeaderboardEntryRow
                key={entry.userId}
                entry={entry}
                isCurrentUser={entry.userId === currentUserId}
                sortBy={sortBy}
              />
            ))}
          </div>

          {myPosition && !entries.find(e => e.userId === currentUserId) && (
            <div className="mt-6 rounded-lg border border-primary bg-primary/5 p-4 dark:bg-primary/10">
              <p className="text-center text-sm text-muted-foreground">
                Your rank: <span className="font-bold text-primary">#{myPosition.rank}</span>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}