"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AttendanceStatCard({ label, value, color }) {
  return (
    <Card className="overflow-hidden border-none shadow-sm rounded-2xl group">
      <div
        className={cn(
          "px-5 py-5 transition-all group-hover:scale-[1.02]",
          color,
        )}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-0.5">
          {label}
        </p>
        <p className="text-4xl font-black mt-1 tabular-nums tracking-tighter">
          {value}
        </p>
      </div>
    </Card>
  );
}
