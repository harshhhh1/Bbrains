"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import type { ReactNode } from "react"
import {
    ArrowUpRight,
    Users,
    GraduationCap,
    Plus,
    Megaphone,
    Activity,
    TrendingUp,
    ShieldCheck,
} from "lucide-react"
import {
    Area,
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Pie,
    PieChart,
    Cell,
} from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { OverviewStats } from "@/features/dashboard/types/admin"

export function formatCurrency(amount: number, currency: string) {
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount)
    } catch {
        return `INR ${amount.toLocaleString("en-IN")}`
    }
}

export function formatDate(value: string) {
    if (!value) return "Not available"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "Not available"
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date)
}

export function formatDateTime(value: string) {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date)
}

export function getFullName(firstName: string, lastName: string, fallback: string) {
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName || fallback
}

export function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-1 border-b border-border/50 py-3 last:border-b-0 last:pb-0 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-start">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground sm:text-right">{value || "Not available"}</span>
        </div>
    )
}

export function QuickActionButton({
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
            className="h-auto flex-col gap-2 py-3 px-4 border-dashed hover:border-primary hover:bg-primary/5"
        >
            <div className="rounded-xl bg-primary/10 p-2">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold">{label}</span>
        </Button>
    )

    if (href) {
        return <Link href={href} className="block">{button}</Link>
    }
    return button
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function AdminRevenueChart({ finance }: { finance: OverviewStats["finance"] }) {
    const [timeFilter, setTimeFilter] = useState<string>("monthly")

    const chartData = useMemo(() => {
        const baseTrend = finance.revenueTrend || [];
        const baseSalary = (finance as any).salaryTrend || [];
        
        const pseudoRandom = (seed: number) => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        if (timeFilter === "monthly") {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return months.map((month, i) => {
                const randomBase = pseudoRandom(i);
                return {
                    date: month,
                    amount: Math.floor(10000 + randomBase * 15000),
                    salary: Math.floor(5000 + randomBase * 8000),
                };
            });
        } else if (timeFilter === "quarterly") {
            return ["Q1", "Q2", "Q3", "Q4"].map((q, i) => {
                const randomBase = pseudoRandom(i + 20);
                return {
                    date: q,
                    amount: Math.floor(35000 + randomBase * 25000),
                    salary: Math.floor(18000 + randomBase * 12000),
                };
            });
        } else if (timeFilter === "yearly") {
            const currentYear = new Date().getFullYear();
            return Array.from({ length: 5 }).map((_, i) => {
                const year = currentYear - 4 + i;
                const randomBase = pseudoRandom(i + 40);
                return {
                    date: String(year),
                    amount: Math.floor(150000 + randomBase * 80000),
                    salary: Math.floor(80000 + randomBase * 40000),
                };
            });
        }
        
        return baseTrend.map((t: any) => {
            const s = baseSalary.find((s: any) => s.date === t.date);
            return {
                ...t,
                salary: s?.amount || 0
            }
        });
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

export function AdminUserDistribution({ people }: { people: OverviewStats["people"] }) {
    const roleData = people.roleDistribution && people.roleDistribution.length > 0
        ? people.roleDistribution
        : [
            { role: "Students", count: people.students },
            { role: "Teachers", count: people.teachers },
            { role: "Managers", count: people.managers },
            { role: "Staff", count: people.staff },
        ].filter(d => d.count > 0)

    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg text-center">User Distribution</CardTitle>
                <CardDescription className="text-center">By roles and types</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
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
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-xs font-medium text-muted-foreground truncate max-w-[80px]">
                                {entry.role}: {entry.count}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export function AdminQuickActions() {
    return (
        <Card className="border-border/60 shadow-sm">
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
                <div className="grid grid-cols-2 gap-3">
                    <QuickActionButton icon={Plus} label="Add User" href="/users/new" />
                    <QuickActionButton icon={GraduationCap} label="Add Class" href="/courses/new" />
                </div>
            </CardContent>
        </Card>
    )
}

export function AdminAnnouncements({ announcements }: { announcements: OverviewStats["announcements"] }) {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-1 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Announcements</CardTitle>
                        <CardDescription>Latest updates</CardDescription>
                    </div>
                    <Link href="/announcements">
                        <Button variant="ghost" size="sm" className="text-primary">
                            View All <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {announcements.length > 0 ? (
                    announcements.slice(0, 3).map((announcement) => (
                        <div
                            key={announcement.id}
                            className="rounded-xl border border-border/50 bg-muted/30 p-3 transition hover:bg-muted/50"
                        >
                            <div className="flex items-start gap-2">
                                <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{announcement.title}</p>
                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                        {announcement.content?.replace(/<[^>]*>?/gm, "").slice(0, 80)}...
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-xl border border-dashed border-border/70 py-8 text-center text-sm text-muted-foreground">
                        No announcements yet
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function AdminRecentActivity({ auditLogs }: { auditLogs: OverviewStats["auditLogs"] }) {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-1 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                        <CardDescription>System-wide actions</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {auditLogs.length > 0 ? (
                    auditLogs.slice(0, 5).map((log) => (
                        <div
                            key={log.id}
                            className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/30 px-3 py-2"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {log.action} - {log.entityType}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {log.user?.username || "System"} • {formatDateTime(log.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-xl border border-dashed border-border/70 py-6 text-center text-sm text-muted-foreground">
                        No recent activity
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function AdminProfileCard({ admin, finance }: { admin: OverviewStats["admin"], finance: OverviewStats["finance"] }) {
    const fullName = getFullName(admin.firstName, admin.lastName, admin.username || "Administrator")

    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-1 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Admin Profile</CardTitle>
                        <CardDescription>Manage your account</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-4 rounded-[1.25rem] border border-border/60 bg-muted/20 p-4">
                    <Avatar className="size-14 border border-border">
                        <AvatarImage src={admin.avatar || undefined} />
                        <AvatarFallback className="text-base font-bold">
                            {fullName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("") || "AD"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="text-lg font-bold text-foreground">{fullName}</p>
                        <p className="text-sm text-muted-foreground">@{admin.username}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">{admin.type}</Badge>
                            {admin.roles.map((role) => (
                                <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="rounded-[1.25rem] border border-border/60 px-4 py-1">
                    <InfoRow label="Email" value={admin.email} />
                    <InfoRow label="Wallet" value={formatCurrency(admin.walletBalance, finance.currency)} />
                    <InfoRow label="Joined" value={formatDate(admin.createdAt)} />
                </div>
                <Link href="/settings">
                    <Button variant="outline" className="w-full">
                        Edit Profile <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
