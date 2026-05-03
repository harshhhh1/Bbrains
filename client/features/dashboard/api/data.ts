import { redirect } from "next/navigation";
import { type DashboardData } from "@/services/api/server-api";
import { serverApiGet } from "@/services/api/server-api";
import { cookies } from "next/headers";
import { LeaderboardLikeEntry, RoleRow } from "@/features/dashboard/types";
import { transformLeaderboard } from "@/features/dashboard/model/utils";

import { getCachedUser } from "@/services/shared-data";

export async function getDashboardOverviewData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  try {
    const [userData, dashboardResponse] = await Promise.all([
      getCachedUser(token),
      serverApiGet<DashboardData>("/dashboard")
    ]);

    let dbUserType: string | null = null;
    let roleNames: string[] = [];
    let username = "User";

    if (userData) {
      dbUserType = userData.type;
      username = userData.firstName || userData.username || "User";
      roleNames = (userData.roles || []).flatMap((row: RoleRow) => {
        if (Array.isArray(row?.role)) {
          return row.role.map((role) => role?.name).filter(Boolean) as string[];
        }
        return row?.role?.name ? [row.role.name] : [];
      });
    }

    const isManager = roleNames.some((name: string) =>
      name.toLowerCase().includes("manager")
    );

    let dashboardData: DashboardData | null = null;
    if (dashboardResponse.success && dashboardResponse.data) {
      dashboardData = dashboardResponse.data;
    }

    const transformedLeaderboard = dashboardData?.leaderboard
      ? transformLeaderboard(dashboardData.leaderboard as LeaderboardLikeEntry[])
      : [];

    return {
      dashboardData,
      transformedLeaderboard,
      username,
      userType: dbUserType,
      isManager
    };
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return {
      dashboardData: null,
      transformedLeaderboard: [],
      username: "User",
      userType: null,
      isManager: false
    };
  }
}
