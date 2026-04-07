import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { attendanceApi, AttendanceRecord, getAuthedClient } from "@/services/api/client";
import type { ApiUser } from "@/lib/types/api";
import { StudentAttendance, AttendanceStatus } from "../types";

export function useAttendance() {
    const [date, setDate] = useState<Date>(new Date());
    const [students, setStudents] = useState<StudentAttendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentAttendance | null>(null);
    const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const fetchStudentsAndAttendance = useCallback(async () => {
        try {
            setLoading(true);
            const client = await getAuthedClient();

            const studentsRes = await client.get<{ success: boolean; data: ApiUser[] }>("/user/students");
            const allStudents: StudentAttendance[] = studentsRes.data.data.map(s => ({ ...s }));

            const formattedDate = format(date, "yyyy-MM-dd");
            const attendanceRes = await attendanceApi.getAttendanceByDate(formattedDate);
            const attendanceMap = new Map(
                (attendanceRes.success && attendanceRes.data ? attendanceRes.data : []).map((record) => [
                    String((record as AttendanceRecord & { userId?: string }).userId ?? ""),
                    record,
                ])
            );

            allStudents.forEach(student => {
                const record = attendanceMap.get(student.id);
                if (record) {
                    student.currentStatus = record.status as AttendanceStatus;
                    student.currentNotes = record.notes;
                }
            });

            setStudents(allStudents);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load students and attendance data.");
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        fetchStudentsAndAttendance();
    }, [fetchStudentsAndAttendance]);

    const handleMarkAttendance = async (studentId: string, status: AttendanceStatus, notes?: string) => {
        try {
            setStudents(prev => prev.map(s =>
                s.id === studentId ? { ...s, isUpdating: true } : s
            ));

            const res = await attendanceApi.markAttendance({
                studentId,
                date: format(date, "yyyy-MM-dd"),
                status,
                notes
            });

            if (res.success) {
                toast.success(`Marked as ${status}`);
                setStudents(prev => prev.map(s =>
                    s.id === studentId ? { ...s, currentStatus: status, currentNotes: notes, isUpdating: false } : s
                ));
            } else {
                throw new Error(res.error || "Failed");
            }
        } catch (error) {
            toast.error("Failed to update attendance");
            setStudents(prev => prev.map(s =>
                s.id === studentId ? { ...s, isUpdating: false } : s
            ));
        }
    };

    const handleViewHistory = async (student: StudentAttendance) => {
        setSelectedStudent(student);
        setHistoryOpen(true);
        setHistoryLoading(true);
        try {
            const res = await attendanceApi.getStudentHistory(student.id);
            if (res.success && res.data) {
                setHistoryRecords(res.data);
            }
        } catch (error) {
            toast.error("Failed to load history");
        } finally {
            setHistoryLoading(false);
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const query = searchQuery.toLowerCase();
            const name = s.userDetails?.firstName ? `${s.userDetails.firstName} ${s.userDetails.lastName}`.toLowerCase() : s.username.toLowerCase();
            return name.includes(query) || s.username.toLowerCase().includes(query);
        });
    }, [students, searchQuery]);

    const stats = useMemo(() => {
        return {
            present: students.filter(s => s.currentStatus === "present").length,
            absent: students.filter(s => s.currentStatus === "absent").length,
            late: students.filter(s => s.currentStatus === "late").length,
            unmarked: students.filter(s => !s.currentStatus).length,
            total: students.length
        };
    }, [students]);

    return {
        date,
        setDate,
        students,
        loading,
        searchQuery,
        setSearchQuery,
        historyOpen,
        setHistoryOpen,
        selectedStudent,
        historyRecords,
        historyLoading,
        handleMarkAttendance,
        handleViewHistory,
        filteredStudents,
        stats
    };
}
