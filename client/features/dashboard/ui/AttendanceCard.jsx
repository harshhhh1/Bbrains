"use client";

import { useEffect, useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { attendanceApi } from "@/services/api/client";
import { cn } from "@/lib/utils";

export const AttendanceCard = memo(function AttendanceCard({
  initialAttendance,
}) {
  const [attendance, setAttendance] = useState(initialAttendance || null);
  const [loading, setLoading] = useState(!initialAttendance);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialAttendance) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        ).toISOString();
        const endDate = now.toISOString();

        const response = await attendanceApi.getMyAttendance({
          startDate,
          endDate,
        });
        if (response.success && response.data) {
          const records = response.data;
          const present = records.filter((r) => r.status === "present").length;
          const total = records.length;
          const percentage =
            total > 0 ? Math.round((present / total) * 100) : 0;
          setAttendance({
            present,
            total,
            absent: records.filter((r) => r.status === "absent").length,
            percentage,
            records,
          });
        } else {
          setError(response.message || "Failed to load attendance");
        }
      } catch (err) {
        setError("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [initialAttendance]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-orange" />
            Monthly Attendance
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-3 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : !attendance ? (
          <div className="p-3 text-sm text-muted-foreground">
            No attendance data
          </div>
        ) : (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-3xl font-bold">{attendance.percentage}%</p>
                <p className="text-xs text-muted-foreground">
                  Monthly Presence
                </p>
              </div>
              <div
                className={cn(
                  "h-16 w-16 rounded-full border-4 flex items-center justify-center",
                  attendance.percentage >= 75
                    ? "border-green-500 text-green-500"
                    : "border-red-600 text-red-600",
                )}
              >
                <span className="text-lg font-bold">
                  {attendance.present}/{attendance.total}
                </span>
              </div>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">
                  {attendance.present} Present
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-red-500" />
                <span className="font-medium">{attendance.absent} Absent</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
