export function formatCurrency(amount: number, currency: string) {
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

export function formatDate(value: string) {
    if (!value) return "Not available"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "Not available"
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date)
}

export function formatDateTime(value: string) {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date)
}

export function getFullName(displayName: string | undefined, firstName: string | undefined, lastName: string | undefined, fallback: string) {
    if (displayName) return displayName
    const fullName = `${firstName || ""} ${lastName || ""}`.trim()
    return fullName || fallback
}

export function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-1 border-b border-border/50 py-3 last:border-b-0 last:pb-0 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-start">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground sm:text-right">{value || "Not available"}</span>
        </div>
    )
}
