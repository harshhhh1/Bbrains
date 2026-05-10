"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getAuthedClient } from "@/services/api/client";
import { Loader2, Search, FileText } from "lucide-react";
import { SectionHeader } from "@/features/admin/ui/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuditLogCard } from "@/features/teacher/audit-log/ui/AuditLogCard";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const c = await getAuthedClient();
        const res = await c.get("/logs/me?limit=100");
        setLogs(res.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter(
      (log) =>
        log.action.toLowerCase().includes(query) ||
        log.entity.toLowerCase().includes(query) ||
        log.entityId?.toLowerCase().includes(query),
    );
  }, [logs, searchQuery]);

  if (loading && logs.length === 0) {
    return (
      <div className="py-40 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
          Syncing Records...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-6 md:p-12 space-y-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title="Personal Audit Log"
          subtitle="Chronological record of your administrative and academic operations."
        />

        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input
            className="h-14 rounded-2xl pl-12 pr-4 bg-muted/20 border-border/40 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg placeholder:text-muted-foreground/30"
            placeholder="Search action or entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {filteredLogs.length === 0 ? (
        <Card className="border-2 border-dashed border-border/40 bg-muted/10 rounded-[2.5rem] py-24">
          <CardContent className="flex flex-col items-center justify-center text-center px-6">
            <FileText className="size-16 mb-6 text-muted-foreground/20" />
            <h3 className="text-xl font-bold tracking-tight">
              No Activity Logged
            </h3>
            <p className="text-muted-foreground mt-2 max-w-xs font-medium">
              {searchQuery
                ? "No records match your search criteria."
                : "Your operational history will appear here once interactions are recorded."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-700">
          {filteredLogs.map((log) => (
            <AuditLogCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
