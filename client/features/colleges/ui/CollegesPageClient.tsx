/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Grid, PageContainer } from "@/components/layout/page-primitives";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionHeader } from "@/features/admin/ui/SectionHeader";
import { api } from "@/services/api/client";
import { AddCollegeModal } from "@/features/colleges/ui/AddCollegeModal";
import { CollegeCard } from "@/features/colleges/ui/CollegeCard";

import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";

export default function CollegesPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!userLoading) {
      if (!user || user.type !== "superadmin") {
        router.replace("/dashboard");
      }
    }
  }, [user, userLoading, router]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const res = await api.get("/colleges");
      const data = res.data as any;
      setColleges(Array.isArray(data) ? data : data?.colleges || data?.data || []);
    } catch (error) {
      console.error("Failed to fetch colleges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      if (!user || user.type !== "superadmin") {
        router.replace("/dashboard");
      } else {
        fetchColleges();
      }
    }
  }, [user, userLoading, router]);

  if (userLoading || !user || user.type !== "superadmin") {
    return <LoadingState label="Verifying Authority..." className="min-h-[60vh]" iconClassName="size-10 text-brand-purple/40" />;
  }

  return (
    <PageContainer padding="spacious" gap="xl">
      <SectionHeader
        title="School Network"
        subtitle="Manage affiliated colleges and campus configurations."
        actionLabel="Onboard Institution"
        action={() => setIsModalOpen(true)}
      />

      {loading ? (
        <LoadingState label="Syncing Directory..." className="py-20" iconClassName="size-10" />
      ) : colleges.length === 0 ? (
        <EmptyState
          icon={<Building2 className="size-16" />}
          title="No Institutions Linked"
          description="Begin by adding your first affiliated campus to the digital ecosystem."
          className="rounded-3xl py-20"
        />
      ) : (
        <Grid gap="lg" className="sm:grid-cols-2 lg:grid-cols-3">
          {colleges.map((college) => (
            <CollegeCard key={college.id} college={college} />
          ))}
        </Grid>
      )}

      <AddCollegeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchColleges}
      />
    </PageContainer>
  );
}
