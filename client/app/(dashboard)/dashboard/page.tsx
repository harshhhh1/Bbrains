import { cookies } from "next/headers";
import { getDashboardOverviewData } from "@/features/dashboard/data";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardOverview() {
  const cookieStore = await cookies();
  const uiMode = cookieStore.get("ui-mode")?.value === "new" ? "new" : "classic";
  
  const { 
    dashboardData, 
    transformedLeaderboard, 
    username, 
    userType, 
    isManager 
  } = await getDashboardOverviewData();

  const resolvedLevel = dashboardData?.stats?.level ?? dashboardData?.user?.xp?.level ?? 1;
  const resolvedXp = dashboardData?.stats?.xp ?? dashboardData?.user?.xp?.xp ?? 0;

  return (
    <DashboardClient 
      userType={userType}
      isManager={isManager}
      uiMode={uiMode}
      username={username}
      resolvedLevel={resolvedLevel}
      resolvedXp={resolvedXp}
      dashboardData={dashboardData}
      transformedLeaderboard={transformedLeaderboard}
    />
  );
}
