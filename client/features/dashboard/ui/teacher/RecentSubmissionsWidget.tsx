"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight, ClipboardCheck } from "lucide-react";
import Link from "next/link";

import { formatRelativeTime } from "@/lib/date-utils";

interface Submission {
  id: number;
  submittedAt: string;
  reviewStatus: string;
  user: {
    username: string;
  };
  assignment: {
    title: string;
  };
}

interface RecentSubmissionsWidgetProps {
  submissions: Submission[];
}

export function RecentSubmissionsWidget({ submissions }: RecentSubmissionsWidgetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateString: string) => {
    return formatRelativeTime(dateString);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "graded":
      case "reviewed":
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            Graded
          </Badge>
        );
      case "submitted":
      default:
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            Pending
          </Badge>
        );
    }
  };

  if (submissions.length === 0) {
    return (
      <Card className="border-border/60 bg-card/95">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
            Recent Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No recent submissions</p>
            <p className="text-xs text-muted-foreground mt-1">Students haven't turned in any assignments yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/95">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
          Recent Submissions
        </CardTitle>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          {submissions.length} new
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {submissions.map((submission) => (
            <Link key={submission.id} href="/assignments" className="block">
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:bg-muted/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {submission.user.username}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {submission.assignment.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                      {mounted ? formatDate(submission.submittedAt) : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(submission.reviewStatus)}
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
