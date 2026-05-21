"use client"

import { BaseCard } from "@/components/ui/base-card"
import { EmptyState } from "@/components/ui/empty-state"
import type { OverviewStats } from "@/features/dashboard/types/admin"
import { formatDateTime } from "./utils"

export function AdminRecentActivity({ auditLogs }: { auditLogs: OverviewStats["auditLogs"] }) {
    return (
        <BaseCard
            title="Recent Activity"
            description="System-wide actions"
            contentClassName="space-y-2"
        >
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
                                {log.user?.username || "System"} - {formatDateTime(log.createdAt)}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <EmptyState title="No recent activity" className="rounded-xl py-6" />
            )}
        </BaseCard>
    )
}
