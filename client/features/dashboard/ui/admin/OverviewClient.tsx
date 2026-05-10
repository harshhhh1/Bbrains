"use client"

import { useUser } from "@/context/user-context"
import { DashboardContent } from "@/components/dashboard-content"
import type { OverviewStats } from "@/features/dashboard/types/admin"
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
        <DashboardContent maxWidth="max-w-[96rem]" className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Welcome back, {greetingName}
                    </h1>
                    <p className="text-sm text-muted-foreground">{currentDate}</p>
                </div>
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <AdminRevenueChart finance={stats.finance} />
                <AdminUserDistribution people={stats.people} />
            </div>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <AdminQuickActions />
                <AdminAnnouncements announcements={stats.announcements} />
            </div>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                <AdminRecentActivity auditLogs={stats.auditLogs} />
                <AdminProfileCard admin={stats.admin} finance={stats.finance} />
            </div>
        </DashboardContent>
    )
}