"use client"

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { BaseCard } from "@/components/ui/base-card"
import type { OverviewStats } from "@/features/dashboard/types/admin"

const COLORS = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
    "#6366f1", // indigo
]

export function AdminUserDistribution({ people }: { people: OverviewStats["people"] }) {
    const roleData = people.roleDistribution && people.roleDistribution.length > 0
        ? people.roleDistribution.filter(d => d.count > 0)
        : [
            { role: "Students", count: people.students },
            { role: "Teachers", count: people.teachers },
            { role: "Managers", count: people.managers },
            { role: "Staff", count: people.staff },
        ].filter(d => d.count > 0)

    return (
        <BaseCard
            title="User Distribution"
            description="By roles and types"
            headerClassName="[&>div]:justify-center [&>div>div]:text-center"
            titleClassName="text-center"
            descriptionClassName="text-center"
            contentClassName="flex flex-col items-center"
        >
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={roleData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="role"
                        >
                            {roleData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: "hsl(var(--background))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                            itemStyle={{ fontSize: "12px" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
                {roleData.map((entry, index) => (
                    <div key={entry.role} className="flex items-center gap-2">
                        <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="max-w-[100px] truncate text-xs font-medium text-muted-foreground">
                            {entry.role}: {entry.count}
                        </span>
                    </div>
                ))}
            </div>
        </BaseCard>
    )
}
