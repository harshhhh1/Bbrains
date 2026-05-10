"use client"

import { useState, useMemo } from "react"

import {
    Area,
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OverviewStats } from "@/features/dashboard/types/admin"

export function AdminRevenueChart({ finance }: { finance: OverviewStats["finance"] }) {
    const [timeFilter, setTimeFilter] = useState<string>("monthly")

    const chartData = useMemo(() => {
        const baseTrend = finance.revenueTrend || [];
        const baseSalary = finance.salaryTrend || [];
        
        // Merge revenue and salary trends
        const monthlyData = baseTrend.map((t: any) => {
            const s = baseSalary.find((s: any) => s.date === t.date);
            return {
                date: t.date,
                amount: t.amount,
                salary: s?.amount || 0
            };
        });

        if (timeFilter === "monthly") {
            return monthlyData;
        }

        if (timeFilter === "quarterly") {
            const quarters: Record<string, { amount: number, salary: number }> = {};
            monthlyData.forEach((item, index) => {
                // Approximate quarters based on index if we don't have month numbers
                // Since backend returns last 12 months in order
                const qIndex = Math.floor(index / 3);
                const qName = `Q${qIndex + 1}`;
                if (!quarters[qName]) quarters[qName] = { amount: 0, salary: 0 };
                quarters[qName].amount += item.amount;
                quarters[qName].salary += item.salary;
            });
            return Object.entries(quarters).map(([date, vals]) => ({ date, ...vals }));
        }

        if (timeFilter === "yearly") {
            // Since we only have 12 months, "yearly" is just the total for the year
            const total = monthlyData.reduce((acc, curr) => ({
                amount: acc.amount + curr.amount,
                salary: acc.salary + curr.salary
            }), { amount: 0, salary: 0 });
            
            return [{
                date: new Date().getFullYear().toString(),
                ...total
            }];
        }
        
        return monthlyData;
    }, [timeFilter, finance])

    return (
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg">Revenue Trend</CardTitle>
                    <CardDescription>Income over the last {timeFilter === "monthly" ? "12 months" : timeFilter === "quarterly" ? "4 quarters" : "5 years"}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
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
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                                                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label} Revenue</p>
                                                <div className="space-y-2">
                                                    {payload.map((entry: any) => (
                                                        <div key={entry.name} className="flex items-center gap-4 justify-between min-w-[140px]">
                                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                                                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                                <span className="text-foreground/60">{entry.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-sm font-black text-foreground tabular-nums">
                                                                    ₹{entry.value?.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" animationDuration={1500} />
                            <Area type="monotone" dataKey="salary" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSalary)" name="Salary Paid" animationDuration={2000} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-2 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#3b82f6]" />
                        <span className="text-xs text-muted-foreground">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#ef4444]" />
                        <span className="text-xs text-muted-foreground">Salary Paid</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
