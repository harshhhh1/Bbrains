export { ManagerDashboardClient } from "@/features/manager/dashboard/ui/ManagerDashboardClient"
export { useManagerDashboard } from "@/features/manager/dashboard/hooks/use-manager-dashboard"
export { fetchManagerOverviewStats } from "@/features/manager/dashboard/api/manager-overview"
export {
    emptyManagerStats,
} from "@/features/manager/dashboard/types/manager"
export type {
    ManagerOverviewStats,
    ManagerOverviewPeopleStats,
    ManagerOverviewFinanceStats,
    ManagerOverviewAttendanceStats,
} from "@/features/manager/dashboard/types/manager"
