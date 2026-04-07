"use client";

import React from "react";
import { BookOpen, GraduationCap, School, BadgeIndianRupee } from "lucide-react";
import { StatCard } from "@/features/admin/components/StatCard";

interface StatsOverviewProps {
  activeCoursesCount: number;
  totalStudentsEnrolled: number;
  incomeReceived: number;
}

export function StatsOverview({ activeCoursesCount, totalStudentsEnrolled, incomeReceived }: StatsOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Active Classes"
        value={activeCoursesCount}
        icon={<BookOpen className="h-4 w-4" />}
        sub="Assigned courses"
      />
      <StatCard
        label="Total Students"
        value={totalStudentsEnrolled}
        icon={<GraduationCap className="h-4 w-4" />}
        sub="Across all classes"
      />
      <StatCard
        label="Avg. Attendance"
        value="--%"
        icon={<School className="h-4 w-4" />}
        sub="Current semester"
      />
      <StatCard
        label="Income Received"
        value={formatCurrency(incomeReceived)}
        icon={<BadgeIndianRupee className="h-4 w-4" />}
        sub="This academic year"
      />
    </div>
  );
}
