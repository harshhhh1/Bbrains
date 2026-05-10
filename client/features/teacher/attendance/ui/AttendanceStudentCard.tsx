"use client";

import React from "react";
import { Check, X, Clock, History, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AttendanceStatus = "present" | "absent" | "late";

interface AttendanceStudentCardProps {
  student: {
    id: string;
    username: string;
    userDetails?: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    currentStatus?: AttendanceStatus;
    currentNotes?: string;
    isUpdating?: boolean;
  };
  onMark: (status: AttendanceStatus, notes?: string) => void;
  onNotesChange: (val: string) => void;
  onViewHistory: () => void;
}

export function AttendanceStudentCard({ student, onMark, onNotesChange, onViewHistory }: AttendanceStudentCardProps) {
  const firstName = student.userDetails?.firstName || "";
  const lastName = student.userDetails?.lastName || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-border/40",
      student.currentStatus === "present" && "border-emerald-500/20 bg-emerald-500/[0.02]",
      student.currentStatus === "absent" && "border-rose-500/20 bg-rose-500/[0.02]",
      student.currentStatus === "late" && "border-amber-500/20 bg-amber-500/[0.02]"
    )}>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
          {/* Student Info Section */}
          <div className="flex items-center gap-4 lg:w-1/4 shrink-0">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              <AvatarImage src={student.userDetails?.avatar} />
              <AvatarFallback className="bg-primary/5 text-primary font-bold">
                {initials || <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-bold text-sm truncate">
                {firstName} {lastName}
              </h3>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">@{student.username}</p>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow">
            <div className="flex items-center gap-2 p-1 bg-muted/40 rounded-xl border border-border/40 w-full sm:w-auto">
              <AttendanceOption 
                status="present" 
                active={student.currentStatus === "present"} 
                onClick={() => onMark("present", student.currentNotes)}
                disabled={student.isUpdating}
              />
              <AttendanceOption 
                status="absent" 
                active={student.currentStatus === "absent"} 
                onClick={() => onMark("absent", student.currentNotes)}
                disabled={student.isUpdating}
              />
              <AttendanceOption 
                status="late" 
                active={student.currentStatus === "late"} 
                onClick={() => onMark("late", student.currentNotes)}
                disabled={student.isUpdating}
              />
            </div>

            <div className="relative flex-grow w-full">
              <Input 
                placeholder="Append brief note..." 
                className="h-10 text-[11px] rounded-xl bg-background border-border/40 focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                value={student.currentNotes || ""}
                onChange={(e) => onNotesChange(e.target.value)}
                onBlur={() => {
                  if (student.currentStatus) {
                    onMark(student.currentStatus, student.currentNotes);
                  }
                }}
              />
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center justify-end gap-2 lg:w-32 shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onViewHistory}
              className="rounded-xl h-10 px-4 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors font-bold text-xs gap-2"
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AttendanceOption({ status, active, onClick, disabled }: { 
    status: AttendanceStatus, 
    active: boolean, 
    onClick: () => void,
    disabled?: boolean
}) {
    const config = {
        present: { 
          icon: Check, 
          label: "Present",
          activeClass: "bg-green-500 text-white shadow-lg shadow-green-500/30 border-green-500 dark:bg-green-600", 
          inactiveClass: "text-green-600 dark:text-green-400 hover:bg-green-500/10 border-transparent"
        },
        absent: { 
          icon: X, 
          label: "Absent",
          activeClass: "bg-red-500 text-white shadow-lg shadow-red-500/30 border-red-500 dark:bg-red-600", 
          inactiveClass: "text-red-600 dark:text-red-400 hover:bg-red-500/10 border-transparent"
        },
        late: { 
          icon: Clock, 
          label: "Late",
          activeClass: "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30 border-yellow-500 dark:bg-yellow-600", 
          inactiveClass: "text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 border-transparent"
        }
    }
    
    const { icon: Icon, label, activeClass, inactiveClass } = config[status]

    return (
        <Button
            variant="outline"
            className={cn(
                "flex-1 h-10 rounded-xl transition-all duration-300 font-bold text-[10px] uppercase tracking-wider border-2 gap-2",
                active ? activeClass : cn("bg-transparent", inactiveClass)
            )}
            onClick={onClick}
            disabled={disabled}
        >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
        </Button>
    )
}
