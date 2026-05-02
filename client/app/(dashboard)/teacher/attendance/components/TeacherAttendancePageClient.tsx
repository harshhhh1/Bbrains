"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Calendar as CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { attendanceApi, AttendanceRecord } from "@/services/api/client";
import { getAuthedClient } from "@/services/api/client";
import { SectionHeader } from "@/features/admin/components/SectionHeader";
import type { ApiUser } from "@/lib/types/api";
import { toast } from "sonner";
import { AttendanceStatCard } from "./components/AttendanceStatCard";
import { AttendanceRow } from "./components/AttendanceRow";
import { AttendanceHistoryDrawer } from "./components/AttendanceHistoryDrawer";

type AttendanceStatus = "present" | "absent" | "late";

interface StudentAttendance extends ApiUser {
  currentStatus?: AttendanceStatus;
  currentNotes?: string;
  isUpdating?: boolean;
}

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignedCourse, setAssignedCourse] = useState<ApiUser["classTeacherCourse"]>(null);
  
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentAttendance | null>(null);
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchStudentsAndAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const client = await getAuthedClient();
      const profileRes = await client.get<{ success: boolean; data: ApiUser }>("/user/me");
      const classTeacherCourse = profileRes.data.data?.classTeacherCourse ?? null;
      setAssignedCourse(classTeacherCourse);

      if (!classTeacherCourse?.id) {
        setStudents([]);
        return;
      }
      
      const formattedDate = format(date, "yyyy-MM-dd");
      const [studentsRes, attendanceRes] = await Promise.all([
        client.get<{ success: boolean; data: { user: ApiUser }[] }>(`/courses/${classTeacherCourse.id}/students`),
        attendanceApi.getAttendanceByDate(formattedDate),
      ]);

      const allStudents: StudentAttendance[] = (studentsRes.data.data || []).map(({ user }) => ({ ...user }));
      const attendanceMap = new Map(
        (attendanceRes.success && attendanceRes.data ? attendanceRes.data : []).map((record) => [
          String((record as AttendanceRecord & { userId?: string }).userId ?? ""),
          record,
        ])
      );

      allStudents.forEach(student => {
        const record = attendanceMap.get(student.id);
        if (record) {
          student.currentStatus = record.status;
          student.currentNotes = record.notes;
        }
      });
      
      setStudents(allStudents);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load attendance list");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchStudentsAndAttendance();
  }, [fetchStudentsAndAttendance]);

  const handleMarkAttendance = async (studentId: string, status: AttendanceStatus, notes?: string) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, currentStatus: status, currentNotes: notes, isUpdating: true } : s
    ));

    try {
      const res = await attendanceApi.markAttendance({
        studentId,
        date: format(date, "yyyy-MM-dd"),
        status,
        notes
      });

      if (!res.success) throw new Error(res.message);
      toast.success("Attendance updated");
    } catch (error) {
      toast.error("Failed to save record");
      void fetchStudentsAndAttendance();
    } finally {
      setStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, isUpdating: false } : s
      ));
    }
  };

  const markAllPresent = async () => {
    if (students.length === 0) return;

    const request = attendanceApi.markAttendanceBulk({
      studentIds: students.map((student) => student.id),
      date: format(date, "yyyy-MM-dd"),
      status: "present",
    }).then((response) => {
      if (!response.success) throw new Error(response.message);
      void fetchStudentsAndAttendance();
      return response;
    });

    toast.promise(request, {
      loading: 'Updating list...',
      success: 'All marked present',
      error: 'Batch operation failed',
    });
  };

  const viewHistory = async (student: StudentAttendance) => {
    setSelectedStudent(student);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const res = await attendanceApi.getStudentHistory(student.id);
      if (res.success && res.data) setHistoryRecords(res.data);
    } catch (error) {
      toast.error("History sync failed");
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${s.userDetails?.firstName} ${s.userDetails?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: students.length,
    present: students.filter(s => s.currentStatus === "present").length,
    absent: students.filter(s => s.currentStatus === "absent").length,
    late: students.filter(s => s.currentStatus === "late").length,
    unmarked: students.filter(s => !s.currentStatus).length
  };

  const hasAssignedClass = Boolean(assignedCourse?.id);

  if (loading && students.length === 0) {
    return (
      <div className="py-40 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Syncing List...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <SectionHeader 
          title="Attendance Portal" 
          subtitle={hasAssignedClass ? `Daily records for ${assignedCourse?.name}.` : "Attendance list (Awaiting assignment)."}
        />
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("h-14 min-w-[240px] rounded-2xl font-bold justify-start", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                {date ? format(date, "PPPP") : <span>Select cycle date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-border/60 shadow-2xl" align="end">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
            </PopoverContent>
          </Popover>
          <Button onClick={markAllPresent} disabled={loading || !hasAssignedClass || students.length === 0} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
            Batch Present
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <AttendanceStatCard label="Total" value={stats.total} color="bg-blue-500/10 text-blue-600" />
        <AttendanceStatCard label="Present" value={stats.present} color="bg-emerald-500/10 text-emerald-600" />
        <AttendanceStatCard label="Absent" value={stats.absent} color="bg-rose-500/10 text-rose-600" />
        <AttendanceStatCard label="Late" value={stats.late} color="bg-amber-500/10 text-amber-600" />
        <AttendanceStatCard label="Pending" value={stats.unmarked} color="bg-muted text-muted-foreground" />
      </div>

      <Card className="rounded-[2.5rem] border-border/60 overflow-hidden bg-card/50 shadow-sm">
        <CardHeader className="p-8 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight">Enrolled Students</CardTitle>
              <CardDescription className="font-medium">Student list for current academic cycle.</CardDescription>
            </div>
            <div className="relative w-full md:max-w-xs group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search students..."
                className="pl-10 h-11 rounded-xl bg-muted/20 border-border/40 focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                disabled={!hasAssignedClass}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="text-left">
                  <th className="py-4 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Student</th>
                  <th className="py-4 px-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-center">Attendance Status</th>
                  <th className="py-4 px-4 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Notes</th>
                  <th className="py-4 px-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-muted-foreground font-bold italic opacity-40">
                      No matching records in list.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <AttendanceRow 
                      key={student.id} 
                      student={student}
                      onMark={(status, notes) => handleMarkAttendance(student.id, status, notes)}
                      onNotesChange={(val) => setStudents(prev => prev.map(s => s.id === student.id ? { ...s, currentNotes: val } : s))}
                      onViewHistory={() => viewHistory(student)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AttendanceHistoryDrawer 
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        loading={historyLoading}
        records={historyRecords}
        studentName={`${selectedStudent?.userDetails?.firstName} ${selectedStudent?.userDetails?.lastName}`}
      />
    </div>
  );
}
