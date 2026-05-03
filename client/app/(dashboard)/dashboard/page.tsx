'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardClient } from '@/features/dashboard/ui/DashboardClient'

import type { DashboardData } from '@/services/api/server-api'
import { LeaderboardLikeEntry, RoleRow } from '@/features/dashboard/types'
import { transformLeaderboard } from '@/features/dashboard/model/utils'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function DashboardOverview() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    dashboardData: DashboardData | null
    transformedLeaderboard: any[]
    username: string
    userType: string | null
    isManager: boolean
  } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    const fetchData = async () => {
      try {
        const [userData, dashboardResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include'
          }).then(r => r.json()),
          fetch(`${API_BASE_URL}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include'
          }).then(r => r.json())
        ])

        let dbUserType: string | null = null
        let roleNames: string[] = []
        let username = 'User'

        if (userData.success && userData.data) {
          dbUserType = userData.data.type
          username = userData.data.firstName || userData.data.username || 'User'
          const roles = userData.data.roles || []
          roleNames = roles.flatMap((row: RoleRow) => {
            if (Array.isArray(row?.role)) {
              return row.role.map((role) => role?.name).filter(Boolean)
            }
            return row?.role?.name ? [row.role.name] : []
          })
        }

        const isManager = roleNames.some((name: string) =>
          name.toLowerCase().includes('manager')
        )

        let dashboardData: DashboardData | null = null
        if (dashboardResponse.success && dashboardResponse.data) {
          dashboardData = dashboardResponse.data
        } else if (dashboardResponse.data) {
          dashboardData = dashboardResponse.data
        }

        const transformedLeaderboard = dashboardData?.leaderboard
          ? transformLeaderboard(dashboardData.leaderboard as LeaderboardLikeEntry[])
          : []

        setData({
          dashboardData,
          transformedLeaderboard,
          username,
          userType: dbUserType,
          isManager
        })
      } catch (error) {
        console.error('Dashboard fetch error:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!data) {
    return null
  }

  const uiMode = localStorage.getItem('ui-mode') === 'new' ? 'new' : 'classic'
  const resolvedLevel = data.dashboardData?.stats?.level ?? data.dashboardData?.user?.xp?.level ?? 1
  const resolvedXp = data.dashboardData?.stats?.xp ?? data.dashboardData?.user?.xp?.xp ?? 0

  return (
    <DashboardClient
      userType={data.userType}
      isManager={data.isManager}
      uiMode={uiMode}
      username={data.username}
      resolvedLevel={resolvedLevel}
      resolvedXp={resolvedXp}
      dashboardData={data.dashboardData}
      transformedLeaderboard={data.transformedLeaderboard}
    />
  )
}