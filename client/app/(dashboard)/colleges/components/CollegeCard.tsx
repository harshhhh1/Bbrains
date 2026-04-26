"use client";

import React from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CollegeCardProps {
  college: {
    id: number | string;
    name: string;
    regNo: string;
    email: string;
    createdAt: string;
    features?: {
      isPaused?: boolean;
    };
  };
}

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

export function CollegeCard({ college }: CollegeCardProps) {
  return (
    <Link href={`/colleges/${college.id}`}>
      <Card className="border-border/60 shadow-sm transition-all hover:shadow-md hover:bg-muted/50 h-full group">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Building2 className="size-5" />
            </div>
            <span className="truncate">{college.name}</span>
          </CardTitle>
          <CardDescription className="font-mono text-[10px] uppercase tracking-wider">
            Reg No: {college.regNo}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Institution Email</span>
              <span className="font-bold truncate text-foreground/80">{college.email}</span>
            </div>
            
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Onboarding Date</span>
              <span className="font-bold text-foreground/80">{formatDate(college.createdAt)}</span>
            </div>

            {college.features?.isPaused && (
              <div className="mt-2 inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-[10px] font-black uppercase tracking-tighter text-destructive border border-destructive/20">
                Service Suspended
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
