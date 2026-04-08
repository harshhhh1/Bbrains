import React from "react"
import type { ApiAuditLog } from "../types"
import { AuditLogCard } from "./AuditLogCard"
import { AuditLogEmptyState } from "./AuditLogEmptyState"

interface AuditLogListProps {
    logs: ApiAuditLog[]
    searchQuery: string
}

export function AuditLogList({ logs, searchQuery }: AuditLogListProps) {
    if (logs.length === 0) {
        return <AuditLogEmptyState searchQuery={searchQuery} />
    }

    return (
        <div className="space-y-3">
            {logs.map((log) => (
                <AuditLogCard key={log.id} log={log} />
            ))}
        </div>
    )
}
