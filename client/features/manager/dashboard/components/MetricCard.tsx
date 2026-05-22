import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

export function MetricCard({
    label,
    value,
    sub,
    tone,
}: {
    label: string
    value: string | number
    sub: string
    tone: string
}) {
    return (
        <Card className="border-border/60 bg-card/90 shadow-sm">
            <CardContent className="flex items-start justify-between p-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
                </div>
            </CardContent>
        </Card>
    )
}
