"use client";

import React from "react";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Loader2, Calendar as CalendarIcon, History } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "@/services/api/client";

interface AttendanceHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  records: AttendanceRecord[];
  studentName: string;
}

export function AttendanceHistoryDrawer({
  open,
  onOpenChange,
  loading,
  records,
  studentName
}: AttendanceHistoryDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle className="text-xl font-black flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Attendance Registry
                </DrawerTitle>
                <DrawerDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Recent performance logs for {studentName}.
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-muted/30 hover:bg-muted">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <p className="text-sm font-black uppercase tracking-widest animate-pulse">Syncing Archives...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border/50 rounded-[2rem] bg-muted/10">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="text-sm font-bold tracking-tight">No historical records found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                        record.status === "present" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                        record.status === "absent" ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      )}>
                        {record.status === "present" ? <Check className="h-6 w-6" /> :
                          record.status === "absent" ? <X className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-foreground text-sm">{format(new Date(record.date), "PPP")}</p>
                        <p className={cn(
                          "text-[9px] font-black uppercase tracking-[0.2em] mt-0.5",
                          record.status === "present" ? "text-emerald-600" :
                          record.status === "absent" ? "text-rose-600" : "text-amber-600"
                        )}>{record.status}</p>
                        {record.notes && (
                          <p className="text-[11px] text-muted-foreground mt-2 px-3 py-1.5 bg-muted/40 rounded-lg italic border-l-2 border-primary/30 max-w-[240px]">
                            &ldquo;{record.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DrawerFooter className="border-t border-border/60 p-6 bg-muted/5">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">Dismiss Registry</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
