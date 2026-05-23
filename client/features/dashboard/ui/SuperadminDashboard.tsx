import { Grid, PageContainer, PageHeader, Stack } from "@/components/layout/page-primitives";
import { useUser } from "@/context/user-context";
import { CollegesQuickList } from "@/features/superadmin/components/colleges-quick-list";
import { RecentAuditLogs } from "@/features/superadmin/components/recent-audit-logs";
import { SuperadminActions } from "@/features/superadmin/components/superadmin-actions";
import { SuperadminMetrics } from "@/features/superadmin/components/superadmin-metrics";

export function SuperadminDashboard() {
  const { user } = useUser();
  const greetingName = user?.displayName || user?.firstName || user?.username || "Superadmin";

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${greetingName}!`}
        description="Welcome to the Bbrains Officials control panel."
      />

      <SuperadminMetrics />

      <Grid gap="lg" className="md:grid-cols-2 lg:grid-cols-4">
        <Stack gap="lg" className="md:col-span-1 lg:col-span-1">
          <SuperadminActions />
        </Stack>

        <div className="md:col-span-1 lg:col-span-3">
          <CollegesQuickList />
        </div>
      </Grid>

      <Grid gap="lg">
        <RecentAuditLogs />
      </Grid>
    </PageContainer>
  );
}
