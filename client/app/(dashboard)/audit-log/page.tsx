import { AuditLogClient } from "@/features/audit-log/ui/AuditLogClient"
import { fetchAuditLogs } from "@/features/audit-log/model/api"

export default async function AuditLogPage() {
    const initialLogs = await fetchAuditLogs()

    return <AuditLogClient initialLogs={initialLogs} />
}
