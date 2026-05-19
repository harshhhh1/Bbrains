"use client";

import React from "react";
import { StudentDashboard } from "@/features/dashboard/ui/StudentDashboard";
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
