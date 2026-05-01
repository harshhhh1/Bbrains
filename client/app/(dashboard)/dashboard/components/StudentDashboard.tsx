"use client";

import { DailyRewardCard } from "@/features/dashboard/components/DailyRewardCard";
import { WalletMiniCard } from "@/features/dashboard/components/WalletMiniCard";
import { AttendanceCard } from "@/features/dashboard/components/AttendanceCard";
import { DashboardContent } from "@/components/dashboard-content";
import { LevelWidget } from "@/features/dashboard/components/LevelWidget";
import { CurrentDate } from "@/features/dashboard/components/CurrentDate";
import { UpcomingExamsAlert } from "@/features/dashboard/components/UpcomingExamsAlert";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";


// Lazy load heavy cards
const LeaderboardCard = dynamic(() => import("@/features/dashboard/components/LeaderboardCard").then(mod => mod.LeaderboardCard), {
  loading: () => <Skeleton className="h-[400px] w-full rounded-2xl" />,
  ssr: true
});

const MyTasksCard = dynamic(() => import("@/features/dashboard/components/MyTasksCard").then(mod => mod.MyTasksCard), {
  loading: () => <Skeleton className="h-[400px] w-full rounded-2xl" />,
  ssr: true
});

const AnnouncementsCard = dynamic(() => import("@/features/dashboard/components/AnnouncementsCard").then(mod => mod.AnnouncementsCard), {
  loading: () => <Skeleton className="h-[300px] w-full rounded-2xl" />,
  ssr: true
});

const UpcomingEventsCard = dynamic(() => import("@/features/dashboard/components/UpcomingEventsCard").then(mod => mod.UpcomingEventsCard), {
  loading: () => <Skeleton className="h-[300px] w-full rounded-2xl" />,
  ssr: true
});

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
  transformedLeaderboard 
}: StudentDashboardProps) {
  const initialMyPosition = dashboardData?.stats?.leaderboardRank ? {
    id: dashboardData?.user?.id || '',
    rank: dashboardData?.stats?.leaderboardRank,
    xp: dashboardData?.stats?.xp || 0,
    points: typeof dashboardData?.wallet?.balance === 'number' ? dashboardData.wallet.balance : 0,
    username: dashboardData?.user?.username || '',
    firstName: dashboardData?.user?.firstName || '',
    lastName: dashboardData?.user?.lastName || '',
    avatar: dashboardData?.user?.avatar || '',
  } : null;

  return (
    <DashboardContent className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {username}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s what&apos;s happening with your studies today.
          </p>
        </div>
        <CurrentDate />
      </div>

      {/* Upcoming Exam Alert — auto-hides when no exams within 7 days */}
      <UpcomingExamsAlert />

      {/* Top row cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <LevelWidget 
          level={resolvedLevel} 
          xp={resolvedXp} 
          nextLevelXp={dashboardData?.stats?.nextLevelRequiredXp}
          currentLevelXp={dashboardData?.stats?.currentLevelRequiredXp}
        />
        <DailyRewardCard initialStreak={dashboardData?.streak} />
        <WalletMiniCard initialWallet={dashboardData?.wallet} />
        <AttendanceCard initialAttendance={dashboardData?.attendance} />
      </div>

      {/* Mid row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeaderboardCard 
          initialLeaderboard={transformedLeaderboard} 
          initialMyPosition={initialMyPosition}
        />
        <MyTasksCard />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnnouncementsCard initialAnnouncements={dashboardData?.announcements?.slice(0, 5)} />
        <UpcomingEventsCard initialEvents={dashboardData?.events?.slice(0, 5)} />
      </div>
    </DashboardContent>
  );
}
