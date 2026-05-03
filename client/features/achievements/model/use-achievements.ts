import { useEffect, useState } from "react"
import { useUser } from "@/hooks/use-user"
import { achievementApi } from "@/services/api/client"
import type { UserAchievement } from "@/services/api/client"

export function useAchievements() {
  const { user, loading: userLoading } = useUser()
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchAchievements = async () => {
      if (userLoading) return

      if (!user) {
        if (isMounted) {
          setAchievements([])
          setLoading(false)
        }
        return
      }

      setLoading(true)

      try {
        const response = await achievementApi.getMyAchievements()

        if (response.success && Array.isArray(response.data) && isMounted) {
          setAchievements(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch achievements:", error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAchievements()

    return () => {
      isMounted = false
    }
  }, [user, userLoading])

  return { achievements, loading, userLoading, user }
}
