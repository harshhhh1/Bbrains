"use client";

import { useState, useEffect, useMemo } from "react";
import { getAuthedClient } from "@/services/api/client";
import { FileText } from "lucide-react";
import { SectionHeader } from "@/features/admin/ui/SectionHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer, Stack } from "@/components/layout/page-primitives";
import { LoadingState } from "@/components/ui/loading-state";
import { SearchField } from "@/components/ui/toolbar";
import type { ApiAuditLog } from "@/lib/types/api";
import { AuditLogCard } from "@/features/audit-log/ui/AuditLogCard";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<ApiAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const c = await getAuthedClient();
        const res = await c.get<{ success: boolean; data: ApiAuditLog[]; pagination: unknown }>("/logs/me?limit=100");
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
        log.entityId?.toLowerCase().includes(query)
    );
  }, [logs, searchQuery]);

  if (loading && logs.length === 0) {
    return <LoadingState label="Syncing Records..." className="py-40" iconClassName="size-10" />;
  }

  return (
    <PageContainer width="md" padding="spacious" gap="xl">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeader 
          title="Personal Audit Log" 
          subtitle="Chronological record of your administrative and academic operations." 
        />
        
        <SearchField
            wrapperClassName="group max-w-md"
            iconClassName="left-4 size-5 text-muted-foreground/50 transition-colors group-focus-within:text-primary"
            className="h-14 rounded-2xl pl-12 pr-4 bg-muted/20 border-border/40 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg placeholder:text-muted-foreground/30"
            placeholder="Search action or entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
      </header>

      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-16" />}
          title="No Activity Logged"
          description={searchQuery ? "No records match your search criteria." : "Your operational history will appear here once interactions are recorded."}
          className="rounded-[2.5rem] border-2 border-border/40 py-24"
        />
      ) : (
        <Stack className="animate-in fade-in duration-700">
          {filteredLogs.map((log) => (
            <AuditLogCard key={log.id} log={log} />
          ))}
        </Stack>
      )}
    </PageContainer>
  );
}
