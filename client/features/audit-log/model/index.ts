import { getInitials as sharedGetInitials } from "@/lib/format-utils"

export function getInitials(username: string) {
    return sharedGetInitials(username)
}

export function fmtDate(value: string) {
    return new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

export function formatChange(change?: Record<string, unknown>) {
    if (!change) return null

    if ("before" in change || "after" in change) {
        const before = change.before ?? null
        const after = change.after ?? null
        if (before == null && after == null) return null
        return { before, after }
    }

    if ("oldLevel" in change || "newLevel" in change) {
        return { before: change.oldLevel ?? null, after: change.newLevel ?? null }
    }

    const keys = Object.keys(change)
    if (keys.length === 1 && "changes" in change) {
        return { before: null, after: change.changes }
    }

    return { before: null, after: change }
}
