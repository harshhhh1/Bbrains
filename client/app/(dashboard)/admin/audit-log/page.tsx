import { AuditLogClient } from "./AuditLogClient"
import { fetchAuditLogs } from "./lib/api"

export default async function AuditLogPage() {
    const initialLogs = await fetchAuditLogs()

    return <AuditLogClient initialLogs={initialLogs} />
}
