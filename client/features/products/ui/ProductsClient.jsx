"use client";

import React from "react";
import { useUser } from "@/hooks/use-user";
import { useHasPermission } from "@/components/providers/permissions-provider";
import { ProductsCreator } from "@/features/products/ui/ProductsCreator";
import { ProductsManager } from "@/features/products/ui/ProductsManager";
import { ProductsApprovals } from "@/features/products/ui/ProductsApprovals";
import { DashboardContent } from "@/components/dashboard-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShoppingBag, ShieldCheck, ListChecks } from "lucide-react";

export function ProductsClient({ initialProducts }) {
  const { user, loading: userLoading } = useUser();
  // Fallback role check if specific permissions aren't set
  const userRole = user?.type || "student";
  // Check permissions
  const hasManagePerm = useHasPermission("manage_products");
  const canManageProducts = hasManagePerm && userRole !== "admin"; // Hide for admin as requested
  const canApproveProducts =
    useHasPermission("approve_products") ||
    hasManagePerm ||
    userRole === "teacher" ||
    userRole === "manager"; // Allow teachers & managers to approve

  const isManagerial = ["admin", "superadmin", "teacher", "manager"].includes(
    userRole,
  );

  if (userLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Students only see "My Products" (Creator view)
  if (!isManagerial) {
    return (
      <DashboardContent>
        <ProductsCreator />
      </DashboardContent>
    );
  }

  // Staff/Admin see tabs to switch between views
  return (
    <DashboardContent>
      <Tabs defaultValue="my-products" className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Marketplace Hub
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your listings, approvals
              {canManageProducts ? ", and the global catalog." : "."}
            </p>
          </div>
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="my-products" className="gap-2">
              <ShoppingBag className="size-3.5" />
              My Products
            </TabsTrigger>
            {canApproveProducts && (
              <TabsTrigger value="approvals" className="gap-2">
                <ListChecks className="size-3.5" />
                Approvals
              </TabsTrigger>
            )}
            {canManageProducts && (
              <TabsTrigger value="catalog" className="gap-2">
                <ShieldCheck className="size-3.5" />
                Global Catalog
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent
          value="my-products"
          className="mt-0 border-none p-0 outline-none"
        >
          <ProductsCreator />
        </TabsContent>

        {canApproveProducts && (
          <TabsContent
            value="approvals"
            className="mt-0 border-none p-0 outline-none"
          >
            <ProductsApprovals />
          </TabsContent>
        )}

        {canManageProducts && (
          <TabsContent
            value="catalog"
            className="mt-0 border-none p-0 outline-none"
          >
            <ProductsManager initialProducts={initialProducts} />
          </TabsContent>
        )}
      </Tabs>
    </DashboardContent>
  );
}
