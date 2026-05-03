"use client";

import React from "react";
import { Check, X, Clock, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AttendanceStatus = "present" | "absent" | "late";

interface AttendanceRowProps {
  student: {
    id: string;
    username: string;
    userDetails?: {
      firstName: string;
      lastName: string;
    };
    currentStatus?: AttendanceStatus;
    currentNotes?: string;
    isUpdating?: boolean;
  };
  onMark: (status: AttendanceStatus, notes?: string) => void;
  onNotesChange: (val: string) => void;
  onViewHistory: () => void;
}

export function AttendanceRow({ student, onMark, onNotesChange, onViewHistory }: AttendanceRowProps) {
  return (
    <tr className="group hover:bg-muted/30 transition-colors">
      <td className="py-4 px-4">
        <div>
          <p className="font-bold text-sm">
            {student.userDetails?.firstName} {student.userDetails?.lastName}
          </p>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">@{student.username}</p>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center justify-center gap-1.5">
          <AttendanceToggle 
            status="present" 
            active={student.currentStatus === "present"} 
            onClick={() => onMark("present", student.currentNotes)}
            disabled={student.isUpdating}
          />
          <AttendanceToggle 
            status="absent" 
            active={student.currentStatus === "absent"} 
            onClick={() => onMark("absent", student.currentNotes)}
            disabled={student.isUpdating}
          />
          <AttendanceToggle 
            status="late" 
            active={student.currentStatus === "late"} 
            onClick={() => onMark("late", student.currentNotes)}
            disabled={student.isUpdating}
          />
        </div>
      </td>
      <td className="py-4 px-4">
        <Input 
          placeholder="Append brief note..." 
          className="h-9 text-[11px] min-w-[160px] rounded-xl bg-muted/20 border-border/40 font-medium"
          value={student.currentNotes || ""}
          onChange={(e) => onNotesChange(e.target.value)}
          onBlur={() => {
            if (student.currentStatus) {
              onMark(student.currentStatus, student.currentNotes);
            }
          }}
        />
      </td>
      <td className="py-4 px-4 text-right">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onViewHistory}
          className="rounded-xl h-9 px-4 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all font-bold text-xs"
        >
          <History className="h-3.5 w-3.5 mr-2" />
          Archives
        </Button>
      </td>
    </tr>
  );
}

function AttendanceToggle({ status, active, onClick, disabled }: { 
    status: AttendanceStatus, 
    active: boolean, 
    onClick: () => void,
    disabled?: boolean
}) {
    const config = {
        present: { icon: Check, activeClass: "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20", hoverClass: "hover:border-emerald-500/50 hover:bg-emerald-500/10" },
        absent: { icon: X, activeClass: "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20", hoverClass: "hover:border-rose-500/50 hover:bg-rose-500/10" },
        late: { icon: Clock, activeClass: "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20", hoverClass: "hover:border-amber-500/50 hover:bg-amber-500/10" }
    }
    
    const { icon: Icon, activeClass, hoverClass } = config[status]

    return (
        <Button
            size="icon"
            variant="outline"
            className={cn(
                "h-9 w-9 rounded-full transition-all shrink-0 border-2",
                active ? activeClass : "bg-transparent text-muted-foreground border-border/60",
                !active && hoverClass
            )}
            onClick={onClick}
            disabled={disabled}
        >
            <Icon className="h-4 w-4" />
        </Button>
    )
}
