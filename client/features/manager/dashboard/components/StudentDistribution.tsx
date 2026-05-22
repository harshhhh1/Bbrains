import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ManagerOverviewStats } from "@/features/manager/dashboard/types/manager"

export function StudentDistribution({ stats }: { stats: ManagerOverviewStats }) {
    const { boys, girls, others, classes } = stats.people

    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader>
                <CardTitle>Student Distribution</CardTitle>
                <CardDescription>
                    Boys and girls counts are taken from the existing student records. Unspecified entries stay separate.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-blue-500/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Boys</p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{boys}</p>
                    </div>
                    <div className="rounded-2xl bg-pink-500/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-700">Girls</p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{girls}</p>
                    </div>
                    <div className="rounded-2xl bg-muted p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Other / Unspecified
                        </p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{others}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
