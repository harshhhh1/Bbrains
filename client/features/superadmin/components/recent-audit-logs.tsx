"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { superadminService, AuditLog } from "@/services/api/superadmin.service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/date-utils";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await superadminService.getRecentAuditLogs(10);
        if (response.success && response.data) {
          setLogs(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>System Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-[10px]">
                    {log.user?.username?.substring(0, 2).toUpperCase() || "SY"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="font-medium leading-none">
                    {log.user?.username || "System"}{" "}
                    <span className="font-normal text-muted-foreground">
                      {log.action.toLowerCase()} {log.entity}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-center py-4 text-muted-foreground text-sm">
                No recent activity.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
