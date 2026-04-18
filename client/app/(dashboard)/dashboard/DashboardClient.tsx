"use client";

import React from "react";
import { StudentDashboard } from "./components/StudentDashboard";
import { StudentDashboardNewView } from "@/features/dashboard/components/StudentDashboardNewView";
import { AdminDashboard } from "./components/AdminDashboard";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { ManagerDashboard } from "./components/ManagerDashboard";
import { SuperadminDashboard } from "./components/SuperadminDashboard";

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
