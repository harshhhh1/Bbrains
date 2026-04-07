"use client";

import React, { useState } from "react";
import { Check, X, Clock, Loader2, Save, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StudentAttendance, AttendanceStatus } from "../types";

interface StudentAttendanceRowProps {
    student: StudentAttendance;
    onMarkAttendance: (id: string, status: AttendanceStatus, notes?: string) => void;
    onViewHistory: (student: StudentAttendance) => void;
}

export function StudentAttendanceRow({ student, onMarkAttendance, onViewHistory }: StudentAttendanceRowProps) {
    const [notes, setNotes] = useState(student.currentNotes || "");
    const [isEditingNotes, setIsEditingNotes] = useState(false);

    const name = student.userDetails?.firstName
        ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
        : student.username;

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-card rounded-lg border shadow-sm gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">@{student.username}</p>
                </div>
                <div className="sm:hidden">
                    <Badge variant="outline" className={cn(
                        "ml-auto",
                        student.currentStatus === "present" && "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30",
                        student.currentStatus === "absent" && "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30",
                        student.currentStatus === "late" && "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30"
                    )}>
                        {student.currentStatus || "Unmarked"}
                    </Badge>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                {/* Notes Input */}
                <div className="flex items-center gap-2">
                    {isEditingNotes ? (
                        <div className="flex items-center gap-2 w-full sm:w-48">
                            <Input
                                size={1}
                                className="h-8 text-xs"
                                placeholder="Add note..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-green-600"
                                onClick={() => {
                                    setIsEditingNotes(false);
                                    if (student.currentStatus) {
                                        onMarkAttendance(student.id, student.currentStatus, notes);
                                    }
                                }}
                            >
                                <Save className="h-4 w-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={() => {
                                    setNotes(student.currentNotes || "");
                                    setIsEditingNotes(false);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div
                            className="text-xs text-muted-foreground truncate max-w-[150px] cursor-pointer hover:text-foreground"
                            onClick={() => setIsEditingNotes(true)}
                        >
                            {student.currentNotes ? `📝 ${student.currentNotes}` : "Add note..."}
                        </div>
                    )}
                </div>

                {/* Status Buttons */}
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md">
                    <Button
                        size="sm"
                        variant={student.currentStatus === "present" ? "default" : "ghost"}
                        className={cn(
                            "h-8 px-3 text-xs",
                            student.currentStatus === "present" && "bg-green-600 hover:bg-green-700 text-white"
                        )}
                        onClick={() => onMarkAttendance(student.id, "present", notes)}
                        disabled={student.isUpdating}
                    >
                        {student.isUpdating && student.currentStatus === "present" ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                            <Check className="h-3 w-3 mr-1" />
                        )}
                        Present
                    </Button>
                    <Button
                        size="sm"
                        variant={student.currentStatus === "absent" ? "default" : "ghost"}
                        className={cn(
                            "h-8 px-3 text-xs",
                            student.currentStatus === "absent" && "bg-red-600 hover:bg-red-700 text-white"
                        )}
                        onClick={() => onMarkAttendance(student.id, "absent", notes)}
                        disabled={student.isUpdating}
                    >
                        {student.isUpdating && student.currentStatus === "absent" ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                            <X className="h-3 w-3 mr-1" />
                        )}
                        Absent
                    </Button>
                    <Button
                        size="sm"
                        variant={student.currentStatus === "late" ? "default" : "ghost"}
                        className={cn(
                            "h-8 px-3 text-xs",
                            student.currentStatus === "late" && "bg-yellow-600 hover:bg-yellow-700 text-white"
                        )}
                        onClick={() => onMarkAttendance(student.id, "late", notes)}
                        disabled={student.isUpdating}
                    >
                        {student.isUpdating && student.currentStatus === "late" ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                            <Clock className="h-3 w-3 mr-1" />
                        )}
                        Late
                    </Button>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 ml-2 hidden sm:flex"
                    title="View History"
                    onClick={() => onViewHistory(student)}
                >
                    <History className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
