"use client"

import Link from "next/link"
import { BookOpen, GraduationCap, CalendarRange, UserPlus } from "lucide-react"
import { Grid } from "@/components/layout/page-primitives"
import { BaseCard } from "@/components/ui/base-card"
import { Button } from "@/components/ui/button"

function ActionButton({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) {
    const button = (
        <Button
            variant="outline"
            className="h-auto w-full flex-col gap-3 border-2 border-dashed px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm"
        >
            <div className="rounded-xl bg-primary/10 p-2.5">
                <Icon className="size-5 text-primary" />
            </div>
            <span className="text-xs font-semibold">{label}</span>
        </Button>
    )
    return (
        <Link href={href} className="block w-full">
            {button}
        </Link>
    )
}

export function QuickActions() {
    return (
        <BaseCard
            title="Quick Actions"
            description="Manage academic structure and classes"
            className="h-full"
            contentClassName="space-y-4"
        >
            <Grid className="grid-cols-2 sm:grid-cols-4" gap="sm">
                <ActionButton icon={GraduationCap} label="Manage Classes" href="/classes" />
                <ActionButton icon={BookOpen} label="Manage courses" href="/academics" />
                <ActionButton icon={CalendarRange} label="Create Timetable" href="/classes" />
                <ActionButton icon={UserPlus} label="Bulk Enroll" href="/academics" />
            </Grid>
        </BaseCard>
    )
}
