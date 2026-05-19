import { SuperadminMetrics } from "@/features/superadmin/components/superadmin-metrics";
import { SuperadminActions } from "@/features/superadmin/components/superadmin-actions";
import { CollegesQuickList } from "@/features/superadmin/components/colleges-quick-list";
import { RecentAuditLogs } from "@/features/superadmin/components/recent-audit-logs";
import { PendingActions } from "@/features/superadmin/components/pending-actions";
import { useUser } from "@/context/user-context";
import { DashboardContent } from "@/components/dashboard-content";

export function SuperadminDashboard() {
    const { user } = useUser();
    const greetingName = user?.displayName || user?.firstName || user?.username || "Superadmin";

    return (
        <DashboardContent className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {greetingName}! 👋</h1>
                <p className="text-muted-foreground">Welcome to the Bbrains Officials control panel.</p>
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
        </DashboardContent>
    );
}
