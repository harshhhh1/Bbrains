"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

import { DashboardGrid, Grid, PageContainer, PageHeader } from "@/components/layout/page-primitives"
import { useUser } from "@/context/user-context"
import { DailyRewardCard } from "@/features/dashboard/ui/DailyRewardCard"
import { MetricCard } from "@/features/manager/dashboard/components/MetricCard"
import { QuickActions } from "@/features/manager/dashboard/components/QuickActions"
import { StudentDistribution } from "@/features/manager/dashboard/components/StudentDistribution"
import { FinanceSnapshot } from "@/features/manager/dashboard/components/FinanceSnapshot"
import { AcademicOverview } from "@/features/manager/dashboard/components/AcademicOverview"
import type { ManagerOverviewStats } from "@/features/manager/dashboard/types/manager"


function getFullName(
    displayName: string | undefined,
    firstName: string | undefined,
    lastName: string | undefined,
    fallback: string,
) {
    if (displayName) return displayName
    const fullName = `${firstName || ""} ${lastName || ""}`.trim()
    return fullName || fallback
}

export function ManagerDashboardClient({ stats }: { stats: ManagerOverviewStats }) {
    const { user } = useUser()
    const fullName = getFullName(
        stats.manager.displayName,
        stats.manager.firstName,
        stats.manager.lastName,
        stats.manager.username || "Manager",
    )
    const greetingName = user?.displayName || user?.firstName || fullName
    const currentDate = new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date())

    return (
        <PageContainer>
            <PageHeader
                eyebrow={stats.institution?.name || "Institution Workspace"}
                title={` Welcome ${greetingName}`}
                description="This is manager's dashboard"
                actions={
                    <div className="grid gap-3 sm:min-w-65">
                        <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur">
                            {currentDate}
                        </div>
                    </div>
                }
            />

            <DashboardGrid>
                <DailyRewardCard />
                <MetricCard
                    label="Total Staff"
                    value={stats.people.totalStaff}
                    sub={`${stats.people.teachers} teachers + ${stats.people.otherStaff} other staff`}
                    tone="bg-amber-500/10"
                />
                <MetricCard
                    label="Classes / Courses"
                    value={stats.people.classes}
                    sub="Current classes or courses in the system"
                    tone="bg-blue-500/10"
                />
                <MetricCard
                    label="Students"
                    value={stats.people.students}
                    sub={`${stats.people.boys} boys, ${stats.people.girls} girls`}
                    tone="bg-primary/10"
                />
            </DashboardGrid>

            <Grid className="lg:grid-cols-2">
                <StudentDistribution stats={stats} />
                <FinanceSnapshot stats={stats} />
            </Grid>

            <Grid className="lg:grid-cols-2">
                <AcademicOverview stats={stats} />
                <QuickActions />
            </Grid>
        </PageContainer>
    )
}
