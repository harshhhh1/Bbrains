"use client"

import { useMemo, useState } from "react"
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import { BaseCard } from "@/components/ui/base-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OverviewStats } from "@/features/dashboard/types/admin"

type TrendPoint = {
    date: string
    amount: number
    salary: number
}

export function AdminRevenueChart({ finance }: { finance: OverviewStats["finance"] }) {
    const [timeFilter, setTimeFilter] = useState("monthly")

    const chartData = useMemo(() => {
        const monthlyData: TrendPoint[] = finance.revenueTrend.map((trend) => {
            const salary = finance.salaryTrend.find((item) => item.date === trend.date)

            return {
                date: trend.date,
                amount: trend.amount,
                salary: salary?.amount || 0,
            }
        })

        if (timeFilter === "monthly") {
            return monthlyData
        }

        if (timeFilter === "quarterly") {
            const quarters: Record<string, Omit<TrendPoint, "date">> = {}

            monthlyData.forEach((item, index) => {
                const quarter = `Q${Math.floor(index / 3) + 1}`
                quarters[quarter] ??= { amount: 0, salary: 0 }
                quarters[quarter].amount += item.amount
                quarters[quarter].salary += item.salary
            })

            return Object.entries(quarters).map(([date, values]) => ({ date, ...values }))
        }

        const total = monthlyData.reduce(
            (sum, item) => ({
                amount: sum.amount + item.amount,
                salary: sum.salary + item.salary,
            }),
            { amount: 0, salary: 0 }
        )

        return [{ date: new Date().getFullYear().toString(), ...total }]
    }, [timeFilter, finance])

    return (
        <BaseCard
            title="Revenue Trend"
            description={`Income over the last ${timeFilter === "monthly" ? "12 months" : timeFilter === "quarterly" ? "4 quarters" : "5 years"}`}
            className="lg:col-span-2"
            contentClassName="pt-4"
            action={
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="h-8 w-[120px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                </Select>
            }
        >
            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                        <XAxis
                            dataKey="date"
                            fontSize={10}
                            tick={{ fill: "#94a3b8", fontWeight: 700 }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            minTickGap={30}
                            tickFormatter={(value) => value}
                        />
                        <YAxis
                            fontSize={10}
                            tick={{ fill: "#94a3b8", fontWeight: 700 }}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip
                            cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null

                                return (
                                    <div className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                                        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                            {label} Revenue
                                        </p>
                                        <div className="space-y-2">
                                            {payload.map((entry) => (
                                                <div key={entry.name} className="flex min-w-[140px] items-center justify-between gap-4">
                                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                                        <div className="size-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                        <span className="text-foreground/60">{entry.name}</span>
                                                    </div>
                                                    <span className="text-sm font-black text-foreground tabular-nums">
                                                        ₹{Number(entry.value || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            }}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" animationDuration={1500} />
                        <Area type="monotone" dataKey="salary" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSalary)" name="Salary Paid" animationDuration={2000} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-[#3b82f6]" />
                    <span className="text-xs text-muted-foreground">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-[#ef4444]" />
                    <span className="text-xs text-muted-foreground">Salary Paid</span>
                </div>
            </div>
        </BaseCard>
    )
}
