"use client"

import { useUser } from "@/hooks/use-user"
import { useHasPermission } from "@/components/providers/permissions-provider"
import { ProductsCreator } from "@/features/products/ui/ProductsCreator"
import { ProductsManager } from "@/features/products/ui/ProductsManager"
import { ProductsApprovals } from "@/features/products/ui/ProductsApprovals"
import { PageContainer, PageHeader } from "@/components/layout/page-primitives"
import { LoadingState } from "@/components/ui/loading-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingBag, ShieldCheck, ListChecks } from "lucide-react"
import type { ApiProduct } from "@/features/products/types"

interface ProductsClientProps {
    initialProducts: ApiProduct[]
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
    const { user, loading: userLoading } = useUser()
    
    // Fallback role check if specific permissions aren't set
    const userRole = user?.type || "student"
    
    // Check permissions
    const hasManagePerm = useHasPermission("manage_product")
    const canManageProducts = hasManagePerm && userRole !== "admin" // Hide for admin as requested
    const canApproveProducts = hasManagePerm;

    const isManagerial = ["admin", "superadmin", "teacher", "manager"].includes(userRole)

    if (userLoading) {
        return <LoadingState label="Loading marketplace hub..." className="min-h-100" />
    }

    // Students only see "My Products" (Creator view)
    if (!isManagerial) {
        return (
            <PageContainer>
                <ProductsCreator />
            </PageContainer>
        )
    }

    // Staff/Admin see tabs to switch between views
    return (
        <PageContainer>
            <Tabs defaultValue="my-products" className="space-y-6">
                <PageHeader
                    className="border-b pb-4"
                    title="Marketplace Hub"
                    description={`Manage your listings, approvals${canManageProducts ? ", and the global catalog." : "."}`}
                    actions={
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
                    }
                />

                <TabsContent value="my-products" className="mt-0 border-none p-0 outline-none">
                    <ProductsCreator />
                </TabsContent>

                {canApproveProducts && (
                    <TabsContent value="approvals" className="mt-0 border-none p-0 outline-none">
                        <ProductsApprovals />
                    </TabsContent>
                )}

                {canManageProducts && (
                    <TabsContent value="catalog" className="mt-0 border-none p-0 outline-none">
                        <ProductsManager initialProducts={initialProducts} />
                    </TabsContent>
                )}
            </Tabs>
        </PageContainer>
    )
}
