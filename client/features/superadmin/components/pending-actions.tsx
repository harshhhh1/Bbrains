"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { superadminService, PendingActions as PendingActionsType } from "@/services/api/superadmin.service";
import { AlertCircle, ShoppingBag, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function PendingActions() {
  const [pending, setPending] = useState<PendingActionsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await superadminService.getPendingActions();
        if (response.success && response.data) {
          setPending(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch pending actions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  if (loading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
        {pending && pending.totalPending > 0 && (
          <Badge variant="destructive">{pending.totalPending}</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <ShoppingBag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">Marketplace Products</p>
            <p className="text-xs text-muted-foreground">{pending?.pendingProducts || 0} items awaiting review</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">User Suggestions</p>
            <p className="text-xs text-muted-foreground">{pending?.pendingSuggestions || 0} suggestions to review</p>
          </div>
        </div>

        {pending && pending.totalPending === 0 && (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">All caught up!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
