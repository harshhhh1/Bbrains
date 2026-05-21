"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { OverviewClient } from "@/features/dashboard/ui/admin/OverviewClient";
import { fetchOverviewStats } from "@/features/dashboard/api/admin-overview";
import { emptyStats, type OverviewStats } from "@/features/dashboard/types/admin";

export function AdminDashboard() {
  const [stats, setStats] = useState<OverviewStats>(emptyStats);
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
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <LoadingState label="Loading admin dashboard..." className="min-h-[400px]" />;
  }

  return <OverviewClient stats={stats} />;
}
