"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Calendar, BadgeIndianRupee } from "lucide-react";
import { useRouter } from "next/navigation";

interface TeacherStatsCardsProps {
  totalStudents: number;
  pendingAssignments: number;
  todayClasses: number;
  monthlyIncome: number;
}

export function TeacherStatsCards({
  totalStudents,
  pendingAssignments,
  todayClasses,
  monthlyIncome,
}: TeacherStatsCardsProps) {
  const router = useRouter();

  const stats = [
    {
      label: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      action: () => router.push("/students"),
    },
    {
      label: "Pending Tasks",
      value: pendingAssignments,
      icon: FileText,
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      action: () => router.push("/assignments"),
    },
    {
      label: "Today's Classes",
      value: todayClasses,
      icon: Calendar,
      color: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      action: () => router.push("/schedule"),
    },
    {
      label: "Monthly Income",
      value: `₹${monthlyIncome.toLocaleString()}`,
      icon: BadgeIndianRupee,
      color: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      action: () => router.push("/transactions"),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="border-border/60 bg-card/95 cursor-pointer hover:bg-muted/50 transition-all"
          onClick={stat.action}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-xl ${stat.bgColor} ${stat.borderColor} border`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-foreground tracking-tight">
                {stat.value}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">
                {stat.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}