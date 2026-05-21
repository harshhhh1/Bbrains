"use client"

import Link from "next/link"
import { Plus, GraduationCap, Activity } from "lucide-react"
import { Grid } from "@/components/layout/page-primitives"
import { BaseCard } from "@/components/ui/base-card"
import { Button } from "@/components/ui/button"

function QuickActionButton({
    icon: Icon,
    label,
    href,
}: {
    icon: React.ElementType
    label: string
    href?: string
}) {
    const button = (
        <Button
            variant="outline"
            className="h-auto w-full flex-col gap-3 py-4 px-4 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all hover:-translate-y-0.5 hover:shadow-sm"
        >
            <div className="rounded-xl bg-primary/10 p-2.5">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold">{label}</span>
        </Button>
    )

    if (href) {
        return <Link href={href} className="block w-full">{button}</Link>
    }
    return button
}

export function AdminQuickActions() {
    return (
        <BaseCard
            title="Quick Actions"
            description="Manage your institution"
            className="h-full"
            contentClassName="space-y-4"
        >
            <Grid className="grid-cols-2 sm:grid-cols-3" gap="sm">
                <QuickActionButton icon={Plus} label="Add User" href="/users/new" />
                <QuickActionButton icon={GraduationCap} label="Add Class" href="/courses/new" />
                <QuickActionButton icon={Activity} label="Audit Logs" href="/audit-log" />
            </Grid>
        </BaseCard>
    )
}
