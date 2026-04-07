"use client"

import React from "react"
import { CalendarIcon, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog"
import { 
    Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { StatCard } from "@/features/admin/components/StatCard"

import { useAttendance } from "./hooks/useAttendance"
import { StudentAttendanceRow } from "./components"

export default function AttendancePage() {
    const {
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
    } = useAttendance();

    const markAllPresent = async () => {
        const unmarked = students.filter(s => !s.currentStatus);
        for (const student of unmarked) {
            await handleMarkAttendance(student.id, "present");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <SectionHeader 
                    title="Attendance Management" 
                    subtitle="Manage daily attendance for your students"
                />
                
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("justify-start text-left font-normal w-full sm:w-[240px]", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={markAllPresent} disabled={loading || stats.unmarked === 0} className="w-full sm:w-auto">
                        Mark All Present
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Total" value={stats.total} />
                <StatCard label="Present" value={stats.present} />
                <StatCard label="Absent" value={stats.absent} />
                <StatCard label="Late" value={stats.late} />
                <StatCard label="Unmarked" value={stats.unmarked} />
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Class Roster</CardTitle>
                            <CardDescription>
                                Mark attendance for {format(date, "PPP")}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                            <p>Loading roster...</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No students found matching your search.
                        </div>
                    ) : (
                        <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2">
                            {filteredStudents.map((student) => (
                                <StudentAttendanceRow
                                    key={student.id}
                                    student={student}
                                    onMarkAttendance={handleMarkAttendance}
                                    onViewHistory={handleViewHistory}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            Attendance History: {selectedStudent?.userDetails?.firstName} {selectedStudent?.userDetails?.lastName}
                        </DialogTitle>
                        <DialogDescription>
                            Recent attendance records for this student.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
                        {historyLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : historyRecords.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No attendance history found for this student.
                            </div>
                        ) : (
                            <div className="border rounded-md divide-y">
                                {historyRecords.map(record => (
                                    <div key={record.id} className="flex items-center justify-between p-4">
                                        <div>
                                            <p className="font-medium">{format(new Date(record.date), "PPP")}</p>
                                            {record.notes && <p className="text-sm text-muted-foreground">{record.notes}</p>}
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium capitalize",
                                            record.status === "present" && "bg-green-100 text-green-700",
                                            record.status === "absent" && "bg-red-100 text-red-700",
                                            record.status === "late" && "bg-yellow-100 text-yellow-700",
                                        )}>
                                            {record.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
