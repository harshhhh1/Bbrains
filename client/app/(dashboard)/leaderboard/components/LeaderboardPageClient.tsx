"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeaderboardEntryRow, TopThreePodium } from "./components/LeaderboardEntry"
import { useLeaderboard } from "./hooks/use-leaderboard"
import type { LeaderboardCategory, LeaderboardSort } from "@/lib/types/api"

const CATEGORIES: { value: LeaderboardCategory; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "allTime", label: "All Time" },
  { value: "course", label: "Course" },
]

export default function LeaderboardPage() {
  const [category, setCategory] = useState<LeaderboardCategory>("allTime")
  const [sortBy, setSortBy] = useState<LeaderboardSort>("xp")
  
  const { entries, myPosition, loading, currentUserId } = useLeaderboard({ category, sortBy })

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