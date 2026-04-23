"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import {
    ArrowUpRight,
    BadgeIndianRupee,
    CalendarDays,
    Landmark,
    Mail,
} from "lucide-react"
import { DashboardContent } from "@/components/dashboard-content"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import type { OverviewStats } from "./_types"

interface OverviewClientProps {
    stats: OverviewStats
}

function formatCurrency(amount: number, currency: string) {
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

function formatDate(value: string) {
    if (!value) return "Not available"

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "Not available"

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date)
}

function getFullName(firstName: string, lastName: string, fallback: string) {
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName || fallback
}

function PercentageBar({
    label,
    value,
    total,
    tone,
}: {
    label: string
    value: number
    total: number
    tone: string
}) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">{label}</span>
                <span className="text-muted-foreground">
                    {value} ({percentage}%)
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${tone}`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}

function OverviewLinkCard({
    href,
    className = "",
    children,
}: {
    href: string
    className?: string
    children: ReactNode
}) {
    return (
        <Link href={href} className="block min-w-0">
            <Card className={`min-w-0 border-border/60 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md ${className}`}>
                {children}
            </Card>
        </Link>
    )
}

function CompactStat({
    label,
    value,
    tone,
}: {
    label: string
    value: string | number
    tone: string
}) {
    return (
        <div className={`rounded-2xl border px-4 py-3 ${tone}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-1 border-b border-border/50 py-3 last:border-b-0 last:pb-0 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-start">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground sm:text-right">{value || "Not available"}</span>
        </div>
    )
}

function TransactionRow({
    note,
    date,
    amount,
    currency,
    type,
}: {
    note: string
    date: string
    amount: number
    currency: string
    type: "credit" | "debit"
}) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-border/50 bg-background/70 px-4 py-3">
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{note || "Transaction entry"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(date)}</p>
            </div>
            <span className={type === "credit" ? "text-sm font-semibold text-emerald-600" : "text-sm font-semibold text-rose-600"}>
                {type === "credit" ? "+" : "-"}
                {formatCurrency(amount, currency)}
            </span>
        </div>
    )
}

export function OverviewClient({ stats }: OverviewClientProps) {
    const fullName = getFullName(stats.admin.firstName, stats.admin.lastName, stats.admin.username || "Administrator")
    const currentDate = new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date())

    const totalStudents = stats.students.total

    return (
        <DashboardContent maxWidth="max-w-[96rem]" className="space-y-4">
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,8fr)_minmax(20rem,4fr)]">
                <div className="min-w-0 md:col-span-2 xl:col-span-1">
                    <Card className="h-full overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
                        <CardContent className="p-5 sm:p-6">
                            <div className="flex flex-col gap-6">
                                <SectionHeader
                                    title="Admin Dashboard"
                                    subtitle="A compact view of people, finance, profile, and institution health."
                                />

                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                                            {stats.institution?.name || "Institution Workspace"}
                                        </span>
                                        <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                            {stats.people.studentToTeacherRatio ? `${stats.people.studentToTeacherRatio}:1 student-teacher ratio` : "Ratio unavailable"}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-[2.5rem]">
                                            Leadership snapshot for {fullName}
                                        </h1>
                                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                                            All the useful admin information stays on one screen now, grouped into denser cards so staffing, revenue, and institution details are easy to scan without the page feeling empty.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="min-w-0 md:col-span-2 xl:col-span-1">
                    <Card className="h-full border-border/60 bg-card/95 shadow-sm">
                        <CardContent className="grid h-full gap-3 p-4 sm:grid-cols-2 xl:grid-cols-1">
                            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Today</p>
                                <p className="mt-2 text-base font-semibold text-foreground">{currentDate}</p>
                                <p className="mt-1 text-sm text-muted-foreground">Keep tabs on operations without opening extra pages.</p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                                <CompactStat label="Teachers" value={stats.people.teachers} tone="border-blue-200/60 bg-blue-500/5" />
                                <CompactStat label="Managers" value={stats.people.managers} tone="border-amber-200/60 bg-amber-500/5" />
                                <CompactStat label="Staff" value={stats.people.staff} tone="border-emerald-200/60 bg-emerald-500/5" />
                                <CompactStat label="Students" value={stats.people.students} tone="border-primary/20 bg-primary/5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
                <div className="grid min-w-0 content-start gap-4">
                    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                        <OverviewLinkCard href="/admin/stats">
                            <CardHeader className="space-y-1 pb-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <CardTitle>Student Distribution</CardTitle>
                                        <CardDescription>Gender mix and enrollment balance at a glance.</CardDescription>
                                    </div>
                                    <ArrowUpRight className="size-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-0">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <CompactStat label="Boys" value={stats.students.boys} tone="border-blue-200/60 bg-blue-500/10" />
                                    <CompactStat label="Girls" value={stats.students.girls} tone="border-pink-200/60 bg-pink-500/10" />
                                    <CompactStat label="Other" value={stats.students.others} tone="border-slate-200/70 bg-muted/60" />
                                </div>

                                <div className="space-y-4 rounded-[1.25rem] border border-border/60 bg-muted/30 p-4">
                                    <PercentageBar
                                        label="Boys"
                                        value={stats.students.boys}
                                        total={totalStudents}
                                        tone="bg-blue-600"
                                    />
                                    <PercentageBar
                                        label="Girls"
                                        value={stats.students.girls}
                                        total={totalStudents}
                                        tone="bg-pink-600"
                                    />
                                    {stats.students.others > 0 && (
                                        <PercentageBar
                                            label="Other / Unspecified"
                                            value={stats.students.others}
                                            total={totalStudents}
                                            tone="bg-slate-600"
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </OverviewLinkCard>

                        <OverviewLinkCard href="/admin/finance">
                            <CardHeader className="space-y-1 pb-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <CardTitle>Finance Visibility</CardTitle>
                                        <CardDescription>Received, accrued, receivable, and fee base in one card.</CardDescription>
                                    </div>
                                    <ArrowUpRight className="size-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-0">
                                <div className="rounded-[1.25rem] bg-emerald-500/10 p-4">
                                    <div className="flex items-center gap-2 text-emerald-700">
                                        <BadgeIndianRupee className="size-4" />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Income Received</span>
                                    </div>
                                    <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                                        {formatCurrency(stats.finance.receivedIncome, stats.finance.currency)}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {stats.finance.receivedSource === "config" ? "Using configured totals" : "Using fee-tagged successful transactions"}
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <CompactStat
                                        label="Accrued Income"
                                        value={formatCurrency(stats.finance.accruedIncome, stats.finance.currency)}
                                        tone="border-border/60 bg-background/75"
                                    />
                                    <CompactStat
                                        label="Receivable"
                                        value={formatCurrency(stats.finance.receivableIncome, stats.finance.currency)}
                                        tone="border-border/60 bg-background/75"
                                    />
                                </div>

                                <div className="rounded-[1.25rem] border border-dashed border-border/70 px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Fee Base</p>
                                            <p className="mt-1 text-lg font-semibold text-foreground">
                                                {formatCurrency(stats.finance.feePerStudent, stats.finance.currency)}
                                            </p>
                                        </div>
                                        <p className="max-w-[16rem] text-right text-xs leading-5 text-muted-foreground">
                                            {stats.finance.accruedSource === "classes"
                                                ? "Accrual uses class fee x enrolled students."
                                                : "Class fee data is still incomplete."}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </OverviewLinkCard>
                    </div>

                    <OverviewLinkCard href="/admin/finance">
                        <CardHeader className="space-y-1 pb-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <CardTitle>Latest Successful Transactions</CardTitle>
                                    <CardDescription>Recent entries stay visible here so finance movement is always close by.</CardDescription>
                                </div>
                                <ArrowUpRight className="size-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                            {stats.finance.latestTransactions.length > 0 ? (
                                stats.finance.latestTransactions.slice(0, 4).map((transaction, index) => (
                                    <TransactionRow
                                        key={`${transaction.transactionDate}-${index}`}
                                        note={transaction.note}
                                        date={transaction.transactionDate}
                                        amount={transaction.amount}
                                        currency={stats.finance.currency}
                                        type={transaction.type}
                                    />
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
                                    No recent successful transactions found.
                                </div>
                            )}
                        </CardContent>
                    </OverviewLinkCard>
                </div>

                <div className="grid min-w-0 content-start gap-4">
                    <OverviewLinkCard href="/settings">
                        <CardHeader className="space-y-1 pb-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <CardTitle>Admin Settings</CardTitle>
                                    <CardDescription>Identity, contact details, wallet context, and account controls for current admin.</CardDescription>
                                </div>
                                <ArrowUpRight className="size-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="flex items-start gap-4 rounded-[1.25rem] border border-border/60 bg-muted/20 p-4">
                                <Avatar className="size-14 border border-border">
                                    <AvatarImage src={stats.admin.avatar || undefined} />
                                    <AvatarFallback className="text-base font-bold">
                                        {fullName
                                            .split(" ")
                                            .filter(Boolean)
                                            .slice(0, 2)
                                            .map((part) => part[0])
                                            .join("") || "AD"}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                    <p className="text-lg font-bold text-foreground">{fullName}</p>
                                    <p className="text-sm text-muted-foreground">@{stats.admin.username}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                            {stats.admin.type}
                                        </span>
                                        {stats.admin.roles.map((role) => (
                                            <span key={role} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[1.25rem] border border-border/60 px-4 py-1">
                                <InfoRow label="Email" value={stats.admin.email} />
                                <InfoRow label="Phone" value={stats.admin.phone || "Not provided"} />
                                <InfoRow label="Wallet" value={formatCurrency(stats.admin.walletBalance, stats.finance.currency)} />
                                <InfoRow label="Joined" value={formatDate(stats.admin.createdAt)} />
                                <InfoRow label="Bio" value={stats.admin.bio || "No bio added yet"} />
                            </div>
                        </CardContent>
                    </OverviewLinkCard>

                    <OverviewLinkCard href="/admin/institution">
                        <CardHeader className="space-y-1 pb-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <CardTitle>Institution</CardTitle>
                                    <CardDescription>Linked organization details without needing a separate page open.</CardDescription>
                                </div>
                                <ArrowUpRight className="size-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            {stats.institution ? (
                                <>
                                    <div className="rounded-[1.25rem] bg-primary/10 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-2xl bg-primary/15 p-3 text-primary">
                                                <Landmark className="size-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-lg font-bold text-foreground">{stats.institution.name}</p>
                                                <p className="text-sm text-muted-foreground">Registration No. {stats.institution.regNo}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-border/60 bg-background/75 p-4">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="size-4" />
                                                <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Institution Email</span>
                                            </div>
                                            <p className="mt-2 break-all text-sm font-medium text-foreground">{stats.institution.email}</p>
                                        </div>
                                        <div className="rounded-2xl border border-border/60 bg-background/75 p-4">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <CalendarDays className="size-4" />
                                                <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Registered On</span>
                                            </div>
                                            <p className="mt-2 text-sm font-medium text-foreground">{formatDate(stats.institution.createdAt)}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-[1.25rem] border border-border/60 px-4 py-1">
                                        <InfoRow label="Institution" value={stats.institution.name} />
                                        <InfoRow label="Registration" value={stats.institution.regNo} />
                                        <InfoRow label="Address" value={stats.institution.address || "No address on record"} />
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-[1.25rem] border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
                                    No university or college profile is linked to this admin account yet.
                                </div>
                            )}
                        </CardContent>
                    </OverviewLinkCard>
                </div>
            </div>
        </DashboardContent>
    )
}
