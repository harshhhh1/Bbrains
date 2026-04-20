/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Loader2, Building2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/features/admin/components/SectionHeader";
import { api } from "@/services/api/client";
import { AddCollegeModal } from "./components/AddCollegeModal";
import Link from "next/link";

function formatDate(value: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function CollegesPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    fetchColleges();
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Colleges"
        subtitle="Manage all affiliated colleges and institutions."
        actionLabel="Add College"
        action={() => setIsModalOpen(true)}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
        </div>
      ) : colleges.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="mb-4 size-12 text-muted-foreground/50" />
            <p className="text-lg font-medium">No colleges found</p>
            <p className="text-sm text-muted-foreground">Get started by adding a new college.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.map((college) => (
            <Link key={college.id} href={`/colleges/${college.id}`}>
              <Card className="border-border/60 shadow-sm transition-colors hover:bg-muted/50 h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Building2 className="size-4" />
                    </div>
                    {college.name}
                  </CardTitle>
                  <CardDescription>Reg No: {college.regNo}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{college.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined:</span>
                      <span className="font-medium">{formatDate(college.createdAt)}</span>
                    </div>
                    {college.features?.isPaused && (
                      <div className="mt-4 inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                        Suspended
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AddCollegeModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => fetchColleges()} 
        />
      )}
    </div>
  );
}
