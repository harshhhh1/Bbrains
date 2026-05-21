"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { ConfigClient } from "@/features/admin/config/ui/ConfigClient";
import { fetchConfigs } from "@/features/admin/config/api/data";
import type { SystemConfig } from "@/services/api/client";

export default function ConfigPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchConfigs();
        if (mounted) setConfigs(data);
      } catch (error) {
        console.error("Failed to fetch configs:", error);
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
    return <LoadingState label={null} className="py-8" iconClassName="size-6 text-muted-foreground/50" />;
  }

  return <ConfigClient initialConfigs={configs} />;
}
