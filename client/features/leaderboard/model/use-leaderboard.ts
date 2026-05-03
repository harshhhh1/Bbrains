"use client"

import { useEffect, useState, useCallback } from "react"
import { useUser } from "@/hooks/use-user"
import { leaderboardApi } from "@/services/api/client"
import type { LeaderboardEntry, LeaderboardCategory, LeaderboardSort } from "@/lib/types/api"

interface UseLeaderboardProps {
  category?: LeaderboardCategory
  sortBy?: LeaderboardSort
}

export function useLeaderboard({ category = "allTime", sortBy = "xp" }: UseLeaderboardProps = {}) {
  const { user } = useUser()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [myPosition, setMyPosition] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [entriesRes, myPosRes] = await Promise.all([
        leaderboardApi.getLeaderboard(category, sortBy, 20, 0),
        leaderboardApi.getMyPosition(category, sortBy)
      ])

      if (entriesRes.success && entriesRes.data) {
        setEntries(entriesRes.data)
      }

      if (myPosRes.success && myPosRes.data) {
        setMyPosition(myPosRes.data)
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err)
      setError("Failed to load leaderboard")
    } finally {
      setLoading(false)
    }
  }, [category, sortBy])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return {
    entries,
    myPosition,
    loading,
    error,
    refetch: fetchLeaderboard,
    currentUserId: user?.id
  }
}