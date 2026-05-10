import { AuditLogClient } from "@/features/admin/audit-log/ui/AuditLogClient"
import { fetchAuditLogs } from "@/features/admin/audit-log/model/api"

export default async function AuditLogPage() {
    const initialLogs = await fetchAuditLogs()

    return <AuditLogClient initialLogs={initialLogs} />
}
