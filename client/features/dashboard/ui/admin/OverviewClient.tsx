"use client"

import { useUser } from "@/context/user-context"
import { Grid, PageContainer, PageHeader } from "@/components/layout/page-primitives"
import type { OverviewStats } from "@/features/dashboard/types/admin"
import { DailyRewardCard } from "@/features/dashboard/ui/DailyRewardCard"
import { AdminRevenueChart } from "./components/AdminRevenueChart"
import { AdminUserDistribution } from "./components/AdminUserDistribution"
import { AdminQuickActions } from "./components/AdminQuickActions"
import { AdminAnnouncements } from "./components/AdminAnnouncements"
import { AdminRecentActivity } from "./components/AdminRecentActivity"
import { AdminProfileCard } from "./components/AdminProfileCard"
import { getFullName } from "./components/utils"

interface OverviewClientProps {
    stats: OverviewStats
}

export function OverviewClient({ stats }: OverviewClientProps) {
    const { user } = useUser()
    const fullName = getFullName(stats.admin.displayName, stats.admin.firstName, stats.admin.lastName, stats.admin.username || "Administrator")
    const greetingName = user?.displayName || user?.firstName || stats.admin.displayName || stats.admin.firstName || "Administrator"
    const currentDate = new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date())

    return (
        <PageContainer width="2xl">
            <PageHeader title={`Welcome back, ${greetingName}`} description={currentDate} />

            <Grid className="lg:grid-cols-3">
                <AdminRevenueChart finance={stats.finance} />
                <AdminUserDistribution people={stats.people} />
                <DailyRewardCard />
            </Grid>

            <Grid className="items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <AdminQuickActions />
                <AdminAnnouncements announcements={stats.announcements} />
            </Grid>

            <Grid className="items-start lg:grid-cols-2">
                <AdminRecentActivity auditLogs={stats.auditLogs} />
                <AdminProfileCard admin={stats.admin} finance={stats.finance} />
            </Grid>
        </PageContainer>
    )
}
