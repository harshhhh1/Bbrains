export function getInitials(username: string) {
    if (!username) return "?"
    return username.slice(0, 2).toUpperCase()
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
    const before = change.before
    const after = change.after
    if (!before && !after) return null
    return { before, after }
}
