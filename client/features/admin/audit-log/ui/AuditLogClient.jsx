"use client";

import React from "react";
import { CategoryFilter } from "@/features/admin/audit-log/ui/CategoryFilter";
import { AuditLogList } from "@/features/admin/audit-log/ui/AuditLogList";
import { useAuditLogs } from "@/features/admin/audit-log/model/use-audit-logs";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

export function AuditLogClient({ initialLogs }) {
  const { category, setCategory, searchQuery, setSearchQuery, filteredLogs } =
    useAuditLogs(initialLogs);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
          <p className="text-sm text-muted-foreground">
            Track and monitor system-wide activities and changes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              className="h-9 rounded-lg pl-9 bg-muted/50 border-border/40 focus:bg-background transition-all"
              placeholder="Search actions or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="h-9 w-[1px] bg-border/40 mx-1 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 px-1">
              <Filter className="size-3" />
              Filter by
            </span>
            <CategoryFilter
              selectedCategory={category}
              onCategoryChange={setCategory}
            />
          </div>
        </div>
      </div>

      <AuditLogList logs={filteredLogs} searchQuery={searchQuery} />
    </div>
  );
}
