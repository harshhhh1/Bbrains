"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { OverviewClient } from "@/features/dashboard/ui/admin/OverviewClient";
import { fetchOverviewStats } from "@/features/dashboard/api/admin-overview";
import { emptyStats } from "@/features/dashboard/types/admin";

export function AdminDashboard() {
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchOverviewStats();
        if (mounted) setStats(data);
      } catch (error) {
        console.error("Failed to fetch overview stats:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return <OverviewClient stats={stats} />;
}
