"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PendingTasksWidgetProps {
  pendingAssignments: number;
  pendingAttendance: number;
  unreadMessages?: number;
}

export function PendingTasksWidget({
  pendingAssignments,
  pendingAttendance,
  unreadMessages = 0,
}: PendingTasksWidgetProps) {
  const tasks = [
    {
      label: "Ungraded Assignments",
      count: pendingAssignments,
      icon: FileText,
      href: "/assignments",
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Pending Attendance",
      count: pendingAttendance,
      icon: Clock,
      href: "/teacher/attendance",
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Unread Messages",
      count: unreadMessages,
      icon: MessageSquare,
      href: "/chat",
      color: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
  ];

  const totalTasks = tasks.reduce((sum, t) => sum + t.count, 0);

  if (totalTasks === 0) {
    return (
      <Card className="border-border/60 bg-card/95">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No pending tasks at the moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/95">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Pending Tasks</CardTitle>
        {totalTasks > 0 && (
          <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
            {totalTasks} pending
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task, index) => (
          task.count > 0 && (
            <Link key={index} href={task.href} className="block">
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:bg-muted/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${task.bgColor} ${task.borderColor} border`}>
                    <task.icon className={`h-4 w-4 ${task.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{task.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.count} {task.count === 1 ? "item" : "items"} pending
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          )
        ))}
        <Button variant="outline" className="w-full mt-2" asChild>
          <Link href="/tasks">
            View All Tasks <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}