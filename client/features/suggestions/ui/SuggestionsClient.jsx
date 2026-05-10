"use client";

import React from "react";
import { useUser } from "@/hooks/use-user";
import { useHasPermission } from "@/components/providers/permissions-provider";
import { SuggestionsPortal } from "@/features/suggestions/ui/SuggestionsPortal";
import { SuggestionsManager } from "@/features/suggestions/ui/SuggestionsManager";
import { DashboardContent } from "@/components/dashboard-content";
import { Loader2 } from "lucide-react";

export function SuggestionsClient() {
  const { user, loading: userLoading } = useUser();
  const canManage = useHasPermission("manage_suggestions");

  if (userLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (canManage) {
    return (
      <DashboardContent>
        <SuggestionsManager />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <SuggestionsPortal />
    </DashboardContent>
  );
}
