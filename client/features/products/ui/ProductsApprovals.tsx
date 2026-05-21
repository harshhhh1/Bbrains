"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/services/api/client"
import { Loader2, CheckCircle, XCircle, Package, ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/ui/loading-state"
import { Stack } from "@/components/layout/page-primitives"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"
import { SectionHeader } from "@/features/admin/ui/SectionHeader"
import Image from "next/image"
import type { ApiProduct } from "@/lib/types/api"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useNotifications } from "@/components/providers/notification-provider"

function fmtCurrency(n: number | string) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n))
}

export function ProductsApprovals() {
    const [products, setProducts] = useState<ApiProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState("")
    const { registerIncomingProductNotification } = useNotifications()

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient()
            const res = await c.get<{ success: boolean; data: ApiProduct[] }>("/market/pending")
            setProducts(res.data.data)
        } catch (e) { 
            console.error(e) 
            toast.error("Failed to load products")
        } finally { 
            setLoading(false) 
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleViewDetails = (product: ApiProduct) => {
        setSelectedProduct(product)
        setIsDrawerOpen(true)
    }

    const handleApprove = async () => {
        if (!selectedProduct) return
        const id = selectedProduct.id
        try {
            setActionLoading(id)
            const c = await getAuthedClient()
            await c.patch(`/market/products/${id}/approval`, { status: "approved" })
            registerIncomingProductNotification(id, "approval")
            setProducts((prev) => prev.filter((p) => p.id !== id))
            toast.success("Product approved successfully")
            setIsDrawerOpen(false)
            setSelectedProduct(null)
        } catch (e) { 
            console.error(e)
            toast.error("Failed to approve product")
        } finally { 
            setActionLoading(null) 
        }
    }

    const handleRejectClick = () => {
        setRejectReason("")
        setIsRejectDialogOpen(true)
    }

    const confirmReject = async () => {
        if (!selectedProduct) return
        const id = selectedProduct.id
        try {
            setActionLoading(id)
            const c = await getAuthedClient()
            await c.patch(`/market/products/${id}/approval`, { 
                status: "rejected", 
                reason: rejectReason.trim() || undefined 
            })
            registerIncomingProductNotification(id, "rejection")
            setProducts((prev) => prev.filter((p) => p.id !== id))
            toast.success("Product rejected")
            setIsRejectDialogOpen(false)
            setIsDrawerOpen(false)
            setSelectedProduct(null)
        } catch (e) { 
            console.error(e) 
            toast.error("Failed to reject product")
        } finally { 
            setActionLoading(null) 
        }
    }

    return (
        <Stack gap="lg">
            <SectionHeader title="Product Approvals" subtitle={`${products.length} pending review`} />
            
            {loading ? (
                <LoadingState label="Loading products..." className="py-20" iconClassName="size-10 text-brand-purple" />
            ) : products.length === 0 ? (
                <EmptyState
                    icon={<CheckCircle className="size-8" />}
                    title="All Caught Up!"
                    description="There are no products pending approval at the moment."
                    className="rounded-[2rem] border-2 border-border/50 py-20"
                />
            ) : (
                <Stack>
                    {products.map((product) => {
                        const productType = product.metadata?.productType || product.productType || "physical";

                        return (
                            <Card key={product.id} className="group overflow-hidden rounded-2xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row h-auto md:h-40">
                                        {/* Product Image */}
                                        <div className="relative w-full md:w-56 h-40 bg-muted/20 flex flex-col items-center justify-center overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-border/20">
                                            {product.image ? (
                                                <Image 
                                                    src={product.image} 
                                                    alt={product.name} 
                                                    fill 
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <Package className="size-10 text-muted-foreground/30" />
                                            )}
                                            <Badge className="absolute top-2 left-2 font-bold text-[10px] uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border-none">
                                                {productType}
                                            </Badge>
                                        </div>

                                        {/* Content Area */}
                                        <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="space-y-1.5 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-xl leading-tight truncate group-hover:text-brand-purple transition-colors">
                                                            {product.name}
                                                        </h3>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground font-medium">
                                                        by <span className="text-foreground/70">@{product.creator?.username || "unknown"}</span>
                                                    </p>
                                                    <p className="text-sm text-foreground/80 line-clamp-1">
                                                        {product.description || <span className="italic opacity-50 text-xs">No description provided.</span>}
                                                    </p>
                                                </div>

                                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:gap-1 shrink-0 bg-muted/30 md:bg-transparent p-3 md:p-0 rounded-xl border border-border/30 md:border-none">
                                                    <div className="flex flex-col md:items-end">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:hidden">Price</span>
                                                        <span className="font-black text-brand-orange text-lg">{fmtCurrency(product.price)}</span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:hidden">Stock</span>
                                                        <span className="text-xs font-bold text-muted-foreground">Stock: {product.stock}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-border/20">
                                                <div className="flex items-center gap-2">
                                                    {product.metadata?.editStatus === 'pending' ? (
                                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-bold uppercase tracking-wider font-mono">
                                                            Edit Request
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                                                            Pending Review
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Button 
                                                    onClick={() => handleViewDetails(product)}
                                                    size="sm"
                                                    className="bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 font-bold px-6 h-9 rounded-xl transition-all group-hover:bg-brand-purple group-hover:text-white"
                                                >
                                                    View Details <ArrowRight className="ml-2 size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </Stack>
            )}

            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetContent className="w-full sm:max-w-md border-l-0 shadow-2xl p-0 flex flex-col h-full overflow-hidden bg-background">
                    <SheetTitle>
                      <VisuallyHidden>Product Details</VisuallyHidden>
                    </SheetTitle>
                    {selectedProduct && (() => {
                        const metadata = (selectedProduct.metadata || {}) as { productType?: string; category?: string; [key: string]: unknown };
                        const productType: string = metadata.productType || selectedProduct.productType || "physical";
                        
                        return (
                            <>
                                <div className="relative h-64 bg-muted/20 border-b border-border/20 flex-shrink-0 flex items-center justify-center p-6 overflow-hidden">
                                    {selectedProduct.image ? (
                                        <Image 
                                            src={selectedProduct.image} 
                                            alt={selectedProduct.name} 
                                            fill 
                                            className="object-contain p-4"
                                        />
                                    ) : (
                                        <Package className="size-24 text-muted-foreground/20" />
                                    )}
                                    <Badge className={cn("absolute top-4 left-4 font-bold uppercase tracking-wider text-[10px] border",
                                        metadata.editStatus === 'pending' 
                                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20" 
                                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    )}>
                                        {metadata.editStatus === 'pending' ? "Edit Request" : "Pending Review"}
                                    </Badge>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">
                                                {productType}
                                            </Badge>
                                            {metadata.category && (
                                                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest bg-muted/50">
                                                    {metadata.category}
                                                </Badge>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-black text-foreground mb-1">{selectedProduct.name}</h2>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Created by <span className="text-brand-purple font-bold">@{selectedProduct.creator?.username}</span>
                                        </p>
                                    </div>

                                    {metadata.editStatus === 'pending' && (
                                        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 p-4 rounded-2xl text-xs space-y-1">
                                            <span className="font-bold block uppercase tracking-wider">Proposed Changes</span>
                                            <span>The creator has requested to update this approved product. Approving this request will overwrite the live product with these new details.</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Price</span>
                                            <span className="block text-xl font-black text-brand-orange">{fmtCurrency(selectedProduct.price)}</span>
                                        </div>
                                        <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
                                            <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Stock</span>
                                            <span className="block text-xl font-black text-foreground">{selectedProduct.stock}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Description</h3>
                                        <p className="text-sm text-foreground/80 leading-relaxed bg-muted/10 p-4 rounded-2xl border border-border/20 whitespace-pre-wrap">
                                            {selectedProduct.description || <span className="italic opacity-50">No description provided by the creator.</span>}
                                        </p>
                                    </div>

                                    {productType === "digital" && !!metadata.fileUrl && (
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Digital Asset</h3>
                                            <a 
                                                href={metadata.fileUrl as string} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-bold text-brand-purple hover:underline bg-brand-purple/5 px-4 py-2 rounded-xl border border-brand-purple/10"
                                            >
                                                View Attached File <ArrowRight className="ml-2 size-3" />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-background border-t border-border/40 flex items-center gap-3">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 rounded-xl font-bold"
                                        onClick={handleRejectClick}
                                        disabled={actionLoading === selectedProduct.id}
                                    >
                                        <XCircle className="mr-2 size-4" /> Reject
                                    </Button>
                                    <Button 
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-green-600/20"
                                        onClick={handleApprove}
                                        disabled={actionLoading === selectedProduct.id}
                                    >
                                        {actionLoading === selectedProduct.id ? (
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="mr-2 size-4" />
                                        )}
                                        Approve Product
                                    </Button>
                                </div>
                            </>
                        )
                    })()}
                </SheetContent>
            </Sheet>

            <Drawer open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen} direction="right">
                <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem] z-[100]">
                    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
                        <DrawerHeader className="border-b border-border/60 p-6 text-left">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <DrawerTitle className="text-xl font-black text-red-600">Reject Product</DrawerTitle>
                                    <DrawerDescription className="font-medium">
                                        Are you sure you want to reject <span className="font-bold text-foreground">&quot;{selectedProduct?.name}&quot;</span>?
                                    </DrawerDescription>
                                </div>
                                <DrawerClose asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </DrawerClose>
                            </div>
                        </DrawerHeader>
                        
                        <div className="flex-1 p-6">
                            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                                Reason for Rejection (Optional)
                            </label>
                            <Textarea 
                                placeholder="Explain why this product is being rejected to help the creator fix issues..."
                                className="min-h-[200px] resize-none rounded-xl bg-muted/20 border-border/50 focus:border-red-500/50 focus:ring-red-500/20"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </div>

                        <DrawerFooter className="border-t border-border/60 p-6 sm:flex-row sm:justify-end gap-3">
                            <DrawerClose asChild>
                                <Button 
                                    variant="ghost" 
                                    className="rounded-xl font-bold"
                                >
                                    Cancel
                                </Button>
                            </DrawerClose>
                            <Button 
                                variant="destructive" 
                                onClick={confirmReject}
                                className="rounded-xl font-bold"
                                disabled={actionLoading === selectedProduct?.id}
                            >
                                {actionLoading === selectedProduct?.id ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    "Confirm Rejection"
                                )}
                            </Button>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </Stack>
    )
}
