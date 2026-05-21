"use client";

import dynamic from "next/dynamic";

import { useUser } from "@/context/user-context";
import { AttendanceCard } from "@/features/dashboard/ui/AttendanceCard";
import { DailyRewardCard } from "@/features/dashboard/ui/DailyRewardCard";
import { LevelWidget, CurrentDate } from "@/features/dashboard/ui/DashboardWidgets";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletMiniCard } from "@/features/dashboard/ui/WalletMiniCard";
import { DashboardGrid, Grid, PageContainer, PageHeader } from "@/components/layout/page-primitives";

const LeaderboardCard = dynamic(
  () => import("@/features/dashboard/ui/LeaderboardCard").then((mod) => mod.LeaderboardCard),
  {
    loading: () => <Skeleton className="h-[400px] w-full rounded-2xl" />,
    ssr: true,
  }
);

const MyTasksCard = dynamic(
  () => import("@/features/dashboard/ui/MyTasksCard").then((mod) => mod.MyTasksCard),
  {
    loading: () => <Skeleton className="h-[400px] w-full rounded-2xl" />,
    ssr: true,
  }
);

const AnnouncementsCard = dynamic(
  () => import("@/features/dashboard/ui/AnnouncementsCard").then((mod) => mod.AnnouncementsCard),
  {
    loading: () => <Skeleton className="h-[300px] w-full rounded-2xl" />,
    ssr: true,
  }
);

const UpcomingEventsCard = dynamic(
  () => import("@/features/dashboard/ui/UpcomingEventsCard").then((mod) => mod.UpcomingEventsCard),
  {
    loading: () => <Skeleton className="h-[300px] w-full rounded-2xl" />,
    ssr: true,
  }
);

interface StudentDashboardProps {
  username: string;
  resolvedLevel: number;
  resolvedXp: number;
  dashboardData: any;
  transformedLeaderboard: any[];
}

export function StudentDashboard({
  username,
  resolvedLevel,
  resolvedXp,
  dashboardData,
  transformedLeaderboard,
}: StudentDashboardProps) {
  const { user } = useUser();
  const greetingName = user?.displayName || user?.firstName || username || "Student";

  const initialMyPosition = dashboardData?.stats?.leaderboardRank
    ? {
        id: dashboardData?.user?.id || "",
        rank: dashboardData?.stats?.leaderboardRank,
        xp: dashboardData?.stats?.xp || 0,
        points: typeof dashboardData?.wallet?.balance === "number" ? dashboardData.wallet.balance : 0,
        username: dashboardData?.user?.username || "",
        firstName: dashboardData?.user?.firstName || "",
        lastName: dashboardData?.user?.lastName || "",
        avatar: dashboardData?.user?.avatar || "",
      }
    : null;

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${greetingName}!`}
        description="Here's what's happening with your studies today."
        actions={<CurrentDate />}
      />

      <DashboardGrid>
        <LevelWidget
          level={resolvedLevel}
          xp={resolvedXp}
          nextLevelXp={dashboardData?.stats?.nextLevelRequiredXp}
          currentLevelXp={dashboardData?.stats?.currentLevelRequiredXp}
        />
        <DailyRewardCard initialStreak={dashboardData?.streak} />
        <WalletMiniCard initialWallet={dashboardData?.wallet} />
        <AttendanceCard initialAttendance={dashboardData?.attendance} />
      </DashboardGrid>

      <Grid className="lg:grid-cols-2">
        <LeaderboardCard
          initialLeaderboard={transformedLeaderboard}
          initialMyPosition={initialMyPosition}
        />
        <MyTasksCard />
      </Grid>

      <Grid className="lg:grid-cols-2">
        <AnnouncementsCard initialAnnouncements={dashboardData?.announcements?.slice(0, 5)} />
        <UpcomingEventsCard initialEvents={dashboardData?.events?.slice(0, 5)} />
      </Grid>
    </PageContainer>
  );
}
