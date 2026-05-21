"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/page-primitives";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { ManagerOverviewClient } from "@/features/dashboard/ui/manager/ManagerOverviewClient";
import { fetchManagerOverviewStats } from "@/features/dashboard/api/manager-overview";
import { emptyManagerStats, type ManagerOverviewStats } from "@/features/dashboard/types/manager";

export function ManagerDashboard() {
    const [stats, setStats] = useState<ManagerOverviewStats>(emptyManagerStats);
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
                    setError(loadError instanceof Error ? loadError.message : "Failed to load manager overview");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    if (loading) {
        return <LoadingState label="Loading manager dashboard..." className="min-h-[400px]" />;
    }

    if (error) {
        return (
            <PageContainer>
                <EmptyState title="Manager overview unavailable" description={error} />
            </PageContainer>
        );
    }

    return <ManagerOverviewClient stats={stats} />;
}
