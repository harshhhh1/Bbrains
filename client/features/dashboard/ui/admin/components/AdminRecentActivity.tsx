"use client"

import { Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { OverviewStats } from "@/features/dashboard/types/admin"
import { formatDateTime } from "./utils"

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
