"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function ResultsStats({
  totalCount,
  subjectCount,
  overallAverage,
  filteredAverage,
  filteredCount,
  loading,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[2rem] border-border/60 bg-card/50 shadow-sm overflow-hidden group">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Records Evaluated
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tabular-nums">
                {loading ? "--" : totalCount}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Publishings
              </span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -translate-x-4 -translate-y-4 group-hover:bg-primary/10 transition-colors" />
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/60 bg-card/50 shadow-sm overflow-hidden group">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Academic Breadth
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tabular-nums">
                {loading ? "--" : subjectCount}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Unique Subjects
              </span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl -translate-x-4 -translate-y-4 group-hover:bg-blue-500/10 transition-colors" />
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/60 bg-primary/5 shadow-sm overflow-hidden group border-primary/20">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
              Aggregate Proficiency
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tabular-nums text-primary">
                {loading ? "--" : overallAverage}
              </span>
              <span className="text-xs font-black text-primary/60">
                % Overall
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {filteredCount !== totalCount && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rounded-2xl border-border/60 bg-muted/20 border-dashed">
            <CardContent className="p-4 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Filter Matches
              </span>
              <span className="text-xl font-black tabular-nums">
                {filteredCount}{" "}
                <span className="text-[9px] text-muted-foreground">Items</span>
              </span>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-primary/20 bg-primary/5 border-dashed">
            <CardContent className="p-4 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Selection Average
              </span>
              <span className="text-xl font-black tabular-nums text-primary">
                {filteredAverage}%
              </span>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
