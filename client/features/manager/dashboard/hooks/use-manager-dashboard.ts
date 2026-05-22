"use client"

import { useEffect, useState } from "react"
import { fetchManagerOverviewStats } from "@/features/manager/dashboard/api/manager-overview"
import { emptyManagerStats, type ManagerOverviewStats } from "@/features/manager/dashboard/types/manager"

export function useManagerDashboard() {
    const [stats, setStats] = useState<ManagerOverviewStats>(emptyManagerStats)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const data = await fetchManagerOverviewStats()
                if (mounted) {
                    setStats(data)
                    setError("")
                }
            } catch (loadError) {
                console.error("Failed to fetch manager overview stats:", loadError)
                if (mounted) {
                    setError(loadError instanceof Error ? loadError.message : "Failed to load manager overview")
                }
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    return { stats, loading, error }
}
