"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { OverviewClient } from "./admin/OverviewClient";
import { fetchOverviewStats } from "./admin/data";
import { emptyStats, type OverviewStats } from "./admin/_types";

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
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return <OverviewClient stats={stats} />;
}
