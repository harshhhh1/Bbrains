import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAuditLogs } from "../lib/api";
import type { ApiAuditLog } from "../lib/types";

export function useAuditLogs(initialLogs: ApiAuditLog[]) {
    const [logs, setLogs] = useState<ApiAuditLog[]>(initialLogs)
    const [loading, setLoading] = useState(false)
    const [category, setCategory] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    const load = useCallback(async (cat: string) => {
        try {
            setLoading(true)
            const data = await fetchAuditLogs({ category: cat || undefined })
            setLogs(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load(category)
    }, [load, category])

    const filteredLogs = useMemo(() => {
        if (!searchQuery.trim()) return logs
        const query = searchQuery.toLowerCase()
        return logs.filter(
            (log) =>
                log.action.toLowerCase().includes(query) ||
                log.entity.toLowerCase().includes(query) ||
                log.entityId?.toLowerCase().includes(query) ||
                log.user?.username?.toLowerCase().includes(query)
        )
    }, [logs, searchQuery])

    return {
        logs,
        loading,
        category,
        setCategory,
        searchQuery,
        setSearchQuery,
        filteredLogs
    }
}
