import { BadgeIndianRupee, Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ManagerOverviewStats } from "@/features/manager/dashboard/types/manager"

function formatCurrency(amount: number | null, currency: string) {
    if (amount === null) return "Non existent"
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

export function FinanceSnapshot({ stats }: { stats: ManagerOverviewStats }) {
    const { feesReceived, feesReceivedSource, salaryPaid, salaryPaidSource, currency } = stats.finance

    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader>
                <CardTitle>Finance Snapshot</CardTitle>
                <CardDescription>
                    Fees received are pulled from the existing fee configs or fee-tagged transactions. Salary paid is shown
                    only when salary-like data exists.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-[1.5rem] p-5">
                    <div className="flex items-center gap-2 text-emerald-700">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em]">Fees Received</span>
                    </div>
                    <p className="mt-3 text-3xl font-bold text-foreground">
                        {formatCurrency(feesReceived, currency)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {feesReceivedSource === "unavailable"
                            ? "No fee totals exist in configs or tagged transactions yet."
                            : `Source: ${feesReceivedSource}`}
                    </p>
                </div>

                <div className="rounded-[1.5rem] border border-border/60 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Wallet className="size-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.14em]">Salary Paid</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                        {formatCurrency(salaryPaid, currency)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {salaryPaidSource === "unavailable"
                            ? "Non existent in the current project data."
                            : `Source: ${salaryPaidSource}`}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
