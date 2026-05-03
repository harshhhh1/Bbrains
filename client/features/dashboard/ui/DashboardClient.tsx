"use client";

import React from "react";
import { StudentDashboard } from "@/features/dashboard/ui/StudentDashboard";
import { StudentDashboardNewView } from "@/features/dashboard/ui/StudentDashboardNewView";
import { AdminDashboard } from "@/features/dashboard/ui/AdminDashboard";
import { TeacherDashboard } from "@/features/dashboard/ui/TeacherDashboard";
import { ManagerDashboard } from "@/features/dashboard/ui/ManagerDashboard";
import { SuperadminDashboard } from "@/features/dashboard/ui/SuperadminDashboard";

interface DashboardClientProps {
  userType: string | null;
  isManager: boolean;
  uiMode: string;
  username: string;
  resolvedLevel: number;
  resolvedXp: number;
  dashboardData: any;
  transformedLeaderboard: any[];
}

export function DashboardClient({
  userType,
  isManager,
  uiMode,
  username,
  resolvedLevel,
  resolvedXp,
  dashboardData,
  transformedLeaderboard,
}: DashboardClientProps) {
  
  if (userType === "superadmin") {
    return <SuperadminDashboard />;
  }

  if (userType === "admin") {
    return <AdminDashboard />;
  }

  if (isManager) {
    return <ManagerDashboard />;
  }

  if (userType === "teacher") {
    return <TeacherDashboard />;
  }

  // Default to Student View
  if (uiMode === "new") {
    return (
      <StudentDashboardNewView
        dashboardData={dashboardData}
        transformedLeaderboard={transformedLeaderboard}
        username={username}
        resolvedLevel={resolvedLevel}
        resolvedXp={resolvedXp}
      />
    );
  }

  return (
    <StudentDashboard
      username={username}
      resolvedLevel={resolvedLevel}
      resolvedXp={resolvedXp}
      dashboardData={dashboardData}
      transformedLeaderboard={transformedLeaderboard}
    />
  );
}
