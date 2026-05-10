"use client"

import Link from "next/link"
import { Plus, GraduationCap, ShieldCheck, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
        <Card className="border-border/60 shadow-sm h-full">
            <CardHeader className="space-y-1 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                        <CardDescription>Manage your institution</CardDescription>
                    </div>
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <QuickActionButton icon={Plus} label="Add User" href="/users/new" />
                    <QuickActionButton icon={GraduationCap} label="Add Class" href="/courses/new" />
                    <QuickActionButton icon={Activity} label="Audit Logs" href="/audit-log" />
                </div>
            </CardContent>
        </Card>
    )
}
