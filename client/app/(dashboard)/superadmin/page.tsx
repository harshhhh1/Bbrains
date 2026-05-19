import { SuperadminMetrics } from "@/features/superadmin/components/superadmin-metrics";
import { SuperadminActions } from "@/features/superadmin/components/superadmin-actions";
import { CollegesQuickList } from "@/features/superadmin/components/colleges-quick-list";
import { RecentAuditLogs } from "@/features/superadmin/components/recent-audit-logs";
import { PendingActions } from "@/features/superadmin/components/pending-actions";

export default function SuperadminDashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Superadmin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform-wide overview and management.
        </p>
      </div>

      <SuperadminMetrics />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-6">
          <SuperadminActions />
          <PendingActions />
        </div>
        
        <div className="md:col-span-1 lg:col-span-3">
          <CollegesQuickList />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        <RecentAuditLogs />
      </div>
    </div>
  );
}
