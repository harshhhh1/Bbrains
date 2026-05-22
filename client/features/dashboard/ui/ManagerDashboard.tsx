"use client"

import { PageContainer } from "@/components/layout/page-primitives"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/ui/loading-state"
import { useManagerDashboard } from "@/features/manager/dashboard/hooks/use-manager-dashboard"
import { ManagerDashboardClient } from "@/features/manager/dashboard/ui/ManagerDashboardClient"

export function ManagerDashboard() {
    const { stats, loading, error } = useManagerDashboard()

    if (loading) {
        return <LoadingState label="Loading manager dashboard..." className="min-h-[400px]" />
    }

    if (error) {
        return (
            <PageContainer>
                <EmptyState title="Manager overview unavailable" description={error} />
            </PageContainer>
        )
    }

    return <ManagerDashboardClient stats={stats} />
}
