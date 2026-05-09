/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Loader2, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="size-10 animate-spin text-brand-purple/40" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Verifying Authority...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-12 space-y-10">
      <SectionHeader
        title="School Network"
        subtitle="Manage affiliated colleges and campus configurations."
        actionLabel="Onboard Institution"
        action={() => setIsModalOpen(true)}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-10 animate-spin text-primary/40" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Syncing Directory...</p>
        </div>
      ) : colleges.length === 0 ? (
        <Card className="border-dashed border-border/40 bg-muted/10 rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 className="mb-6 size-16 text-muted-foreground/30" />
            <h3 className="text-xl font-bold">No Institutions Linked</h3>
            <p className="text-muted-foreground mt-2 max-w-xs">Begin by adding your first affiliated campus to the digital ecosystem.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.map((college) => (
            <CollegeCard key={college.id} college={college} />
          ))}
        </div>
      )}

      <AddCollegeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchColleges}
      />
    </div>
  );
}
