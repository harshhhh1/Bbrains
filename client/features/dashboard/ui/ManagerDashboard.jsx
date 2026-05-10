"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ManagerOverviewClient } from "@/features/dashboard/ui/manager/ManagerOverviewClient";
import { fetchManagerOverviewStats } from "@/features/dashboard/api/manager-overview";
import { emptyManagerStats } from "@/features/dashboard/types/manager";

export function ManagerDashboard() {
  const [stats, setStats] = useState(emptyManagerStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchManagerOverviewStats();
        if (mounted) {
          setStats(data);
          setError("");
        }
      } catch (loadError) {
        console.error("Failed to fetch manager overview stats:", loadError);
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load manager overview",
          );
        }
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

  if (error) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-border/70 p-6 text-sm text-muted-foreground m-6">
        {error}
      </div>
    );
  }

  return <ManagerOverviewClient stats={stats} />;
}
