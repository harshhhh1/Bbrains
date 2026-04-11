"use client"

import React from "react"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { CategoryFilter } from "./components/CategoryFilter"
import { AuditLogList } from "./components/AuditLogList"
import { useAuditLogs } from "./hooks/use-audit-logs"
import type { ApiAuditLog } from "./types"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface AuditLogClientProps {
    initialLogs: ApiAuditLog[]
}

export function AuditLogClient({ initialLogs }: AuditLogClientProps) {
    const {
        category,
        setCategory,
        searchQuery,
        setSearchQuery,
        filteredLogs
    } = useAuditLogs(initialLogs)

    return (
        <div className="space-y-4">
            <SectionHeader title="Audit Log" subtitle="System-wide activity history" />

            <CategoryFilter
                selectedCategory={category}
                onCategoryChange={setCategory}
            />

            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="rounded-xl pl-9"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <AuditLogList logs={filteredLogs} searchQuery={searchQuery} />
        </div>
    )
}
